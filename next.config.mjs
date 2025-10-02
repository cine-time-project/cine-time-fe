import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

export default withNextIntl({
  sassOptions: {
    quietDeps: true, // dependency'lerden gelen deprecated @import uyarılarını bastırır
  },
  reactStrictMode: true
});
