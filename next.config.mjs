import createNextIntlPlugin from "next-intl/plugin";

// ✅ Global i18n config (timeZone dahil)
const withNextIntl = createNextIntlPlugin("./next-intl.config.mjs");

export default withNextIntl({
  sassOptions: {
    quietDeps: true,
  },
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/osm-overpass",
        destination: "https://overpass-api.de/api/interpreter",
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:locale/reset-password",
        destination: "/:locale/forgot-password",
        permanent: true,
      },
    ];
  },
});
