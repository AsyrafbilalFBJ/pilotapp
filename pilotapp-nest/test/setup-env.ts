/**
 * Fixed environment for every test run. Values set here take precedence over the
 * .env file (ConfigModule lets the process environment win), so tests do not
 * depend on a developer's local .env.
 */
process.env.PORT = '3001';
process.env.APP_TODAY = '2026-05-15';
process.env.DATASOURCE_DIR = 'src/datasource';
process.env.JWT_SECRET = 'test-secret-for-automated-tests-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:3000';
