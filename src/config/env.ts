/**
 * Backend location.
 *
 * Debug builds talk to your laptop's backend through `adb reverse`
 * (run `npm run reverse` once per USB / emulator session), which works
 * the same on an emulator and on a USB-connected phone.
 * Release builds use the deployed backend.
 *
 * Want a debug build to hit the deployed backend? Set USE_DEPLOYED_BACKEND = true.
 */
const USE_DEPLOYED_BACKEND = false;

const LOCAL_ORIGIN = 'http://localhost:3000';
const DEPLOYED_ORIGIN = 'https://blinkit-backend-2bv1.onrender.com';

const origin = __DEV__ && !USE_DEPLOYED_BACKEND ? LOCAL_ORIGIN : DEPLOYED_ORIGIN;

export const env = Object.freeze({
  API_ORIGIN: origin,
  API_BASE_URL: `${origin}/api/v1/delivery`,
  /** Shown on the login screen so the demo never stalls on credentials. */
  DEMO_LOGIN_HINT: 'Demo rider: 9000000001 / Rider@123',
  /** Pre-fills the login form for demos. Set to null to show an empty form. */
  DEMO_PREFILL: { phone: '9000000001', password: 'Rider@123' } as {
    phone: string;
    password: string;
  } | null,
});
