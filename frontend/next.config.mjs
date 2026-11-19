import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = { reactStrictMode: false, images: { unoptimized: true } };

export default withNextIntl(nextConfig);
