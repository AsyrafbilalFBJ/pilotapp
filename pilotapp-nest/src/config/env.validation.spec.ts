import { validateEnv } from './env.validation.js';

const VALID = { JWT_SECRET: 'a-secret-that-is-long-enough' };

describe('validateEnv', () => {
  it('applies defaults when optional values are missing', () => {
    expect(validateEnv(VALID)).toEqual({
      PORT: 3001,
      APP_TODAY: '2026-05-15',
      DATASOURCE_DIR: 'src/datasource',
      JWT_SECRET: VALID.JWT_SECRET,
      JWT_EXPIRES_IN: '1d',
      CORS_ORIGIN: 'http://localhost:3000',
      SWAGGER_ENABLED: true,
    });
  });

  it('parses SWAGGER_ENABLED', () => {
    expect(validateEnv({ ...VALID, SWAGGER_ENABLED: 'false' }).SWAGGER_ENABLED).toBe(false);
    expect(validateEnv({ ...VALID, SWAGGER_ENABLED: 'TRUE' }).SWAGGER_ENABLED).toBe(true);
    expect(() => validateEnv({ ...VALID, SWAGGER_ENABLED: 'yes' })).toThrow(/SWAGGER_ENABLED/);
  });

  it('reads APP_TODAY from the environment', () => {
    expect(validateEnv({ ...VALID, APP_TODAY: '2025-01-01' }).APP_TODAY).toBe('2025-01-01');
  });

  it('rejects an invalid APP_TODAY', () => {
    expect(() => validateEnv({ ...VALID, APP_TODAY: '2026-02-30' })).toThrow(/APP_TODAY/);
  });

  it('requires JWT_SECRET of a minimum length', () => {
    expect(() => validateEnv({})).toThrow(/JWT_SECRET is required/);
    expect(() => validateEnv({ JWT_SECRET: 'short' })).toThrow(/at least 16/);
  });

  it('rejects an invalid PORT and JWT_EXPIRES_IN', () => {
    expect(() => validateEnv({ ...VALID, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...VALID, JWT_EXPIRES_IN: 'forever' })).toThrow(/JWT_EXPIRES_IN/);
  });
});
