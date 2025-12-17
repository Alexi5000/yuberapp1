export { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';

/**
 * Get login URL - for standalone mode, this triggers the demo login flow
 * No external OAuth server required
 */
export const getLoginUrl = () => {
  // In standalone mode, we use local authentication
  // This returns a URL that triggers the demo login on the frontend
  return '/login';
};

/**
 * Demo login endpoint for local authentication
 */
export const DEMO_LOGIN_ENDPOINT = '/api/auth/demo-login';
export const EMAIL_LOGIN_ENDPOINT = '/api/auth/login';
