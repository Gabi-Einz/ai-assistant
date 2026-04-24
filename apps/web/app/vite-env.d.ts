interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  [key: string]: string | undefined;
}

declare var process: { env: Record<string, string | undefined> };
