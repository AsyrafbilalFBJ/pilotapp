import type { TestingModule } from '@nestjs/testing';
import { createCoreTestingModule } from '../../../test/create-core-module.js';
import { DocumentsService } from './documents.service.js';

describe('DocumentsService', () => {
  let moduleRef: TestingModule;
  let service: DocumentsService;

  beforeAll(async () => {
    moduleRef = await createCoreTestingModule([DocumentsService]);
    service = moduleRef.get(DocumentsService);
  });

  afterAll(() => moduleRef.close());

  it('computes daysRemaining and status against APP_TODAY (2026-05-15)', () => {
    const result = service.getDocuments();
    expect(result.today).toBe('2026-05-15');
    expect(result.warningDays).toBe(30);

    const byId = Object.fromEntries(result.documents.map((doc) => [doc.id, doc]));
    expect(byId.doc_security).toMatchObject({ daysRemaining: -14, status: 'expired' });
    expect(byId.doc_license).toMatchObject({ daysRemaining: 14, status: 'soon' });
    expect(byId.doc_medical).toMatchObject({ daysRemaining: 27, status: 'soon' });
    expect(byId.doc_recurrent).toMatchObject({ daysRemaining: 152, status: 'safe' });
    expect(byId.doc_ppc).toMatchObject({ daysRemaining: 224, status: 'safe' });
  });

  it('adds a display version of every expiry date', () => {
    expect(service.getDocuments().documents.map((d) => d.formattedExpiryDate)).toEqual([
      '14 Oct 2026', '25 Dec 2026', '29 May 2026', '11 Jun 2026', '1 May 2026',
    ]);
  });

  it('applies the threshold boundaries', () => {
    expect(service.statusFor(-1, 30)).toBe('expired');
    expect(service.statusFor(0, 30)).toBe('expired');
    expect(service.statusFor(1, 30)).toBe('soon');
    expect(service.statusFor(30, 30)).toBe('soon');
    expect(service.statusFor(31, 30)).toBe('safe');
  });

  it('ignores the "today" stored in mock-documents.json', async () => {
    const other = await createCoreTestingModule([DocumentsService], '2026-05-31');
    try {
      const license = other.get(DocumentsService).getDocuments().documents.find((d) => d.id === 'doc_license');
      expect(license).toMatchObject({ daysRemaining: -2, status: 'expired' });
    } finally {
      await other.close();
    }
  });
});
