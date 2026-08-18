/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_OCR_SPACE_API_KEY?: string;
  readonly VITE_AZURE_TRANSLATOR_KEY?: string;
  readonly VITE_AZURE_TRANSLATOR_REGION?: string;
  readonly VITE_AZURE_SPEECH_KEY?: string;
  readonly VITE_AZURE_SPEECH_REGION?: string;
  readonly VITE_AZURE_OPENAI_ENDPOINT?: string;
  readonly VITE_AZURE_OPENAI_KEY?: string;
  readonly VITE_AZURE_OPENAI_DEPLOYMENT?: string;
  readonly VITE_AZURE_OPENAI_API_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
