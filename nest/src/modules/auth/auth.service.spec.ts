import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { JwtPayload } from './auth.types.js';
import { AuthService, INVALID_CREDENTIALS_MESSAGE } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'unit-test-secret-value', signOptions: { expiresIn: '1h' } })],
      providers: [AuthService],
    }).compile();
    service = moduleRef.get(AuthService);
    jwt = moduleRef.get(JwtService);
  });

  it('issues a signed token for the hardcoded pilot', async () => {
    const { token } = await service.login({ username: 'johndoe', password: 'susiairtest' });
    const payload = await jwt.verifyAsync<JwtPayload>(token);
    expect(payload).toMatchObject({ sub: 'pilot-johndoe', username: 'johndoe' });
  });

  it.each([
    ['wrong password', 'johndoe', 'wrong'],
    ['wrong username', 'janedoe', 'susiairtest'],
    ['case mismatch', 'JohnDoe', 'susiairtest'],
  ])('rejects %s', async (_case, username, password) => {
    await expect(service.login({ username, password })).rejects.toThrow(
      new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE),
    );
  });
});
