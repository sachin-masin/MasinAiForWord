declare namespace NodeJS {
  interface ProcessEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_PUBLISHABLE_KEY: string;
  }
}

