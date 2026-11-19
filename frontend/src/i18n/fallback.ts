import { IntlErrorCode } from 'next-intl';

const warnedMissingKeys = new Set<string>();

export interface TranslationFallbackParams {
  key: string;
  namespace?: string;
  error: {
    code: string;
    message?: string;
    originalMessage?: string;
  };
}

export interface TranslationErrorParams {
  code: string;
  message?: string;
  originalMessage?: string;
}

export function getMessageFallback({ key, error }: TranslationFallbackParams): string {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return key;
  }
  return `[Translation error: ${key}]`;
}
export function handleTranslationError(error: TranslationErrorParams): void {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    if (process.env.NODE_ENV !== 'production') {
      const identifier = error.originalMessage || error.message || 'unknown key';
      if (!warnedMissingKeys.has(identifier)) {
        warnedMissingKeys.add(identifier);
        console.warn(`[next-intl] Missing translation: ${identifier}`);
      }
    }
    return;
  }

  console.error(error);
}
