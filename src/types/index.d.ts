import { ButtonHTMLAttributes } from 'react';

declare module '@/components/ui/badge' {
  export interface BadgeProps extends ButtonHTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
}

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
