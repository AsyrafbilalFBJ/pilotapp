import { Injectable } from '@nestjs/common';
import { diffDays, formatLongDate } from '../../common/utils/date.util.js';
import { DataStoreService } from '../../core/data-store.service.js';
import { TimeService } from '../../core/time.service.js';
import type {
  DocumentDto,
  DocumentStatus,
  DocumentsResponseDto,
} from './dto/document-response.dto.js';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly time: TimeService,
  ) {}

  getDocuments(): DocumentsResponseDto {
    const today = this.time.getToday();
    const warningDays = this.dataStore.getWarningDays();

    const documents: DocumentDto[] = this.dataStore.getDocuments().map((doc) => {
      const daysRemaining = diffDays(doc.expiryDate, today);
      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        formattedExpiryDate: formatLongDate(doc.expiryDate),
        daysRemaining,
        status: this.statusFor(daysRemaining, warningDays),
      };
    });

    return { today, warningDays, documents };
  }

  /** Thresholds from mock-documents.json. */
  statusFor(daysRemaining: number, warningDays: number): DocumentStatus {
    if (daysRemaining <= 0) {
      return 'expired';
    }
    if (daysRemaining <= warningDays) {
      return 'soon';
    }
    return 'safe';
  }
}
