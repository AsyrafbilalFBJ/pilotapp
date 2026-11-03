import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

const CREDENTIALS = { username: 'johndoe', password: 'susiairtest' };

/** Checks the global error shape: { statusCode, message, error, timestamp, path }. */
function expectErrorShape(body: Record<string, unknown>, statusCode: number, path: string): void {
  expect(body).toEqual({
    statusCode,
    message: expect.anything(),
    error: expect.any(String),
    timestamp: expect.any(String),
    path,
  });
}

describe('Pilot App API (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer()).post('/auth/login').send(CREDENTIALS).expect(200);
    token = login.body.token as string;
  });

  afterAll(() => app.close());

  const authed = (path: string) =>
    request(app.getHttpServer()).get(path).set('Authorization', `Bearer ${token}`);

  describe('auth', () => {
    it('POST /auth/login returns a token for the hardcoded pilot', () => {
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('POST /auth/login returns 401 with the error shape for bad credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'johndoe', password: 'nope' })
        .expect(401);
      expectErrorShape(res.body, 401, '/auth/login');
      expect(res.body.message).toBe('Invalid username or password');
    });

    it('POST /auth/login returns 400 when fields are missing or unknown', async () => {
      const missing = await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
      expectErrorShape(missing.body, 400, '/auth/login');
      expect(missing.body.message).toEqual(expect.arrayContaining(['username is required', 'password is required']));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...CREDENTIALS, role: 'admin' })
        .expect(400);
    });

    it.each(['/pilot/me', '/flight-hours?from=2026-05-01&to=2026-05-02', '/flight-hours/summary', '/documents', '/schedules?year=2026&month=5'])(
      'GET %s returns 401 without a token',
      async (path) => {
        const res = await request(app.getHttpServer()).get(path).expect(401);
        expectErrorShape(res.body, 401, path);
      },
    );

    it('rejects a tampered or malformed token', async () => {
      await request(app.getHttpServer()).get('/pilot/me').set('Authorization', `Bearer ${token}x`).expect(401);
      await request(app.getHttpServer()).get('/pilot/me').set('Authorization', token).expect(401);
    });

    it('GET /health is public', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body).toEqual({ status: 'ok', today: '2026-05-15' });
    });
  });

  it('GET /pilot/me returns the profile', async () => {
    const res = await authed('/pilot/me').expect(200);
    expect(res.body).toEqual({
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: 'https://ui-avatars.com/api/?name=John%20Doe',
    });
  });

  describe('flight hours', () => {
    it('GET /flight-hours returns the 0-filled daily series', async () => {
      const res = await authed('/flight-hours?from=2026-05-01&to=2026-05-15').expect(200);
      expect(res.body.days).toHaveLength(15);
      expect(res.body.days[14]).toEqual({ date: '2026-05-15', formattedDate: 'Fri, 15 May', hours: 6.4, isFuture: false });
    });

    it.each([
      ['/flight-hours', 'missing params'],
      ['/flight-hours?from=2026-05-01', 'missing to'],
      ['/flight-hours?from=2026-02-30&to=2026-03-01', 'impossible date'],
      ['/flight-hours?from=15-05-2026&to=2026-05-20', 'wrong format'],
      ['/flight-hours?from=2026-05-20&to=2026-05-01', 'from after to'],
    ])('GET %s returns 400 (%s)', async (path) => {
      const res = await authed(path).expect(400);
      expectErrorShape(res.body, 400, path);
    });

    it('GET /flight-hours/summary defaults to 1w', async () => {
      const res = await authed('/flight-hours/summary').expect(200);
      expect(Object.keys(res.body)).toEqual(['today', 'selectedRange', 'cards', 'chart']);
      expect(res.body).toMatchObject({ today: '2026-05-15', selectedRange: '1w' });
      expect(res.body.chart).toMatchObject({ range: '1w', limitLine: 40, yAxisMax: 45, windowDays: 7, displayRangeDays: 7 });
      expect(res.body.chart.series).toHaveLength(15);
      expect(res.body.chart.series[7]).toMatchObject({ date: '2026-05-15', formattedDate: '15 May', rollingSum: 25.2, dailyHours: 6.4, isToday: true });
      expect(res.body.cards.map((c: { type: string; status: string }) => `${c.type}:${c.status}`)).toEqual([
        'daily:warning', 'weekly:safe', 'monthly:warning', 'annual:danger',
      ]);
    });

    it('GET /flight-hours/summary?range=1y uses the 1y bounds', async () => {
      const res = await authed('/flight-hours/summary?range=1y').expect(200);
      expect(res.body.selectedRange).toBe('1y');
      expect(res.body.chart).toMatchObject({ range: '1y', limitLine: 1050, yAxisMax: 1200, windowDays: 365 });
    });

    it('GET /flight-hours/summary rejects an unknown range', async () => {
      const res = await authed('/flight-hours/summary?range=2w').expect(400);
      expect(res.body.message).toEqual(['range must be one of: 1w, 1m, 3m, 6m, 1y']);
    });
  });

  it('GET /documents returns statuses computed from APP_TODAY', async () => {
    const res = await authed('/documents').expect(200);
    expect(res.body.documents.map((d: { status: string }) => d.status)).toEqual([
      'safe', 'safe', 'soon', 'soon', 'expired',
    ]);
    expect(res.body.documents[2]).toMatchObject({ id: 'doc_license', expiryDate: '2026-05-29', formattedExpiryDate: '29 May 2026' });
  });

  describe('schedules', () => {
    it('GET /schedules accepts month as MM or M', async () => {
      const padded = await authed('/schedules?year=2026&month=05').expect(200);
      const plain = await authed('/schedules?year=2026&month=5').expect(200);
      expect(padded.body.schedules).toHaveLength(21);
      expect(plain.body).toEqual(padded.body);
      expect(padded.body.legend).toHaveLength(10);
      expect(padded.body).toMatchObject({ monthLabel: 'May 2026', leadingBlankDays: 4 });
      expect(padded.body.days).toHaveLength(31);
      expect(padded.body.days[18]).toMatchObject({ date: '2026-05-19', day: 19, schedule: { id: '97028', remaining_duties: 2 } });
    });

    it.each(['/schedules', '/schedules?year=2026', '/schedules?year=2026&month=13', '/schedules?year=2026&month=0', '/schedules?year=abc&month=5'])(
      'GET %s returns 400',
      async (path) => {
        const res = await authed(path).expect(400);
        expectErrorShape(res.body, 400, path);
      },
    );
  });

  it('unknown routes return 404 with the error shape', async () => {
    const res = await authed('/nope').expect(404);
    expectErrorShape(res.body, 404, '/nope');
  });
});
