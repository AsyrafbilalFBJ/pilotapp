import { ApiProperty } from '@nestjs/swagger';

/** expired: daysRemaining <= 0 · soon: 0 < daysRemaining <= warningDays · safe: otherwise. */
export type DocumentStatus = 'expired' | 'soon' | 'safe';

export const DOCUMENT_STATUSES: readonly DocumentStatus[] = ['expired', 'soon', 'safe'];

export class DocumentDto {
  @ApiProperty({ example: 'doc_license' })
  id: string;

  @ApiProperty({ example: 'Indonesian License Exp. Date' })
  label: string;

  @ApiProperty({ format: 'date', example: '2026-05-29' })
  expiryDate: string;

  @ApiProperty({ example: '29 May 2026', description: 'expiryDate for display: day without leading zero, short English month, year.' })
  formattedExpiryDate: string;

  @ApiProperty({ example: 14, description: 'expiryDate − today, in days. 0 or negative means expired.' })
  daysRemaining: number;

  @ApiProperty({
    enum: DOCUMENT_STATUSES,
    example: 'soon',
    description: 'Badge state. expired (red): daysRemaining <= 0. soon (amber): 1..warningDays. safe (green): otherwise.',
  })
  status: DocumentStatus;
}

export class DocumentsResponseDto {
  @ApiProperty({ format: 'date', example: '2026-05-15', description: 'Value of APP_TODAY.' })
  today: string;

  @ApiProperty({ example: 30, description: 'From thresholds.warningDays in mock-documents.json.' })
  warningDays: number;

  @ApiProperty({ type: () => [DocumentDto] })
  documents: DocumentDto[];
}
