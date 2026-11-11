/**
 * Runtime configuration read from Vite env variables (see `.env.example`).
 *
 * DEMO_MODE shows the sample-account shortcuts on sign-in screens. It defaults
 * to on because the app currently runs against in-memory sample data; set
 * `VITE_DEMO_MODE=false` once a real identity provider is connected.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
