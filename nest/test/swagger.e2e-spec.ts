import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { BEARER_AUTH_NAME, setupSwagger } from '../src/swagger.js';

interface Operation {
  tags?: string[];
  security?: Record<string, string[]>[];
  parameters?: { name: string; in: string; required?: boolean }[];
  responses: Record<string, { content?: Record<string, { schema?: { $ref?: string } }> }>;
}

interface Spec {
  openapi: string;
  paths: Record<string, Record<string, Operation>>;
  components: { securitySchemes: Record<string, { type: string; scheme: string }>; schemas: Record<string, unknown> };
}

const PROTECTED: [string, string][] = [
  ['/pilot/me', 'get'],
  ['/flight-hours', 'get'],
  ['/flight-hours/summary', 'get'],
  ['/documents', 'get'],
  ['/schedules', 'get'],
];

describe('Swagger docs (e2e)', () => {
  let app: INestApplication<App>;
  let spec: Spec;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupSwagger(app);
    await app.init();
    spec = (await request(app.getHttpServer()).get('/docs-json').expect(200)).body as Spec;
  });

  afterAll(() => app.close());

  it('serves Swagger UI at /docs without a token', async () => {
    const res = await request(app.getHttpServer()).get('/docs/').expect(200);
    expect(res.text).toContain('swagger-ui');
  });

  it('documents every endpoint', () => {
    expect(Object.keys(spec.paths).sort()).toEqual(
      ['/auth/login', '/documents', '/flight-hours', '/flight-hours/summary', '/health', '/pilot/me', '/schedules'],
    );
  });

  it('declares the bearer scheme and applies it to protected endpoints only', () => {
    expect(spec.components.securitySchemes[BEARER_AUTH_NAME]).toMatchObject({ type: 'http', scheme: 'bearer' });

    for (const [path, method] of PROTECTED) {
      const op = spec.paths[path][method];
      expect(op.security, path).toEqual([{ [BEARER_AUTH_NAME]: [] }]);
      expect(op.responses['401'], path).toBeDefined();
    }
    expect(spec.paths['/auth/login'].post.security).toBeUndefined();
    expect(spec.paths['/health'].get.security).toBeUndefined();
  });

  it('describes query parameters and their requirement', () => {
    const params = (path: string) =>
      Object.fromEntries((spec.paths[path].get.parameters ?? []).map((p) => [p.name, p.required ?? false]));

    expect(params('/flight-hours')).toEqual({ from: true, to: true });
    expect(params('/flight-hours/summary')).toEqual({ range: false });
    expect(params('/schedules')).toEqual({ year: true, month: true });
  });

  it('links success and error responses to schemas', () => {
    const okSchema = (path: string, method: string, status = '200') =>
      spec.paths[path][method].responses[status]?.content?.['application/json']?.schema?.$ref;

    expect(okSchema('/auth/login', 'post')).toBe('#/components/schemas/LoginResponseDto');
    expect(okSchema('/auth/login', 'post', '401')).toBe('#/components/schemas/ErrorResponseDto');
    expect(okSchema('/flight-hours/summary', 'get')).toBe('#/components/schemas/FlightHoursSummaryDto');
    expect(okSchema('/flight-hours/summary', 'get', '400')).toBe('#/components/schemas/ErrorResponseDto');

    for (const name of ['FlightHoursChartDto', 'ChartPointDto', 'LimitCardDto', 'DocumentDto', 'ScheduleEntryDto', 'CalendarDayDto', 'LegendEntryDto']) {
      expect(spec.components.schemas[name], name).toBeDefined();
    }
  });
});
