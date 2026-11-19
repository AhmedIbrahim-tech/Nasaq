import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, Locale } from './config';
import { getMessageFallback, handleTranslationError } from './fallback';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    getMessageFallback,
    onError: handleTranslationError,
  };
});
