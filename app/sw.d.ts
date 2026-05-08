declare const self: Window & typeof globalThis & {
  __SW_MANIFEST: Array<{ url: string; revision: string | null }>;
};
