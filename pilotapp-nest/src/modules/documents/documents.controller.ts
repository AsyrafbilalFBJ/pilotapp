import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired } from '../../common/decorators/api-errors.decorator.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsResponseDto } from './dto/document-response.dto.js';

@ApiTags('documents')
@ApiAuthRequired()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /** The pilot's documents with days remaining and an urgency status. */
  @Get()
  @ApiOperation({
    summary: 'Get the pilot documents',
    description:
      '`daysRemaining = expiryDate − today`. Status: `expired` when <= 0, `soon` when 1..warningDays (30), otherwise `safe`.',
  })
  @ApiOkResponse({ type: DocumentsResponseDto })
  getDocuments(): DocumentsResponseDto {
    return this.documentsService.getDocuments();
  }
}
