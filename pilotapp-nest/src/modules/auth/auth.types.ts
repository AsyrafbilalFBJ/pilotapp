import type { Request } from 'express';

/** Claims stored in the access token. */
export interface JwtPayload {
  sub: string;
  username: string;
}

/** The identity the guard attaches to the request after a token is verified. */
export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
