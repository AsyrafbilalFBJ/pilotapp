import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { LoginResponseDto } from './dto/login-response.dto.js';

/**
 * The single pilot account. The brief asks for one hardcoded account,
 * so the credentials live here instead of in a user store.
 */
const PILOT_ACCOUNT = {
  id: 'pilot-johndoe',
  username: 'johndoe',
  password: 'susiairtest',
} as const;

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid username or password';

/** Constant-time string comparison; hashing first makes both buffers the same length. */
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login({ username, password }: LoginDto): Promise<LoginResponseDto> {
    // Evaluate both checks so a wrong username takes as long as a wrong password.
    const usernameMatches = safeEqual(username, PILOT_ACCOUNT.username);
    const passwordMatches = safeEqual(password, PILOT_ACCOUNT.password);
    if (!usernameMatches || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const payload: JwtPayload = { sub: PILOT_ACCOUNT.id, username: PILOT_ACCOUNT.username };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }
}
