/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Show the demo-account picker on sign-in screens. Defaults to on while there is no backend. */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
