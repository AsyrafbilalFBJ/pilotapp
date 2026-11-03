import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto.js';
import { BEARER_AUTH_NAME } from '../../swagger.js';

/** Documents a route that requires the bearer token issued by POST /auth/login. */
export function ApiAuthRequired(): ClassDecorator & MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(BEARER_AUTH_NAME),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid or expired bearer token.',
      type: ErrorResponseDto,
    }),
  );
}

/** Documents the 400 returned when query or body validation fails. */
export function ApiValidationError(): MethodDecorator {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Validation failed. `message` lists every problem.',
      type: ErrorResponseDto,
    }),
  );
}
