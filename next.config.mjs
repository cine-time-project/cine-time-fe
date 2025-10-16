import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

export default withNextIntl({
  sassOptions: {
    quietDeps: true, // dependency'lerden gelen deprecated @import uyarılarını bastırır
  },
  reactStrictMode: true,

  // CORS için Overpass proxy
  async rewrites() {
    return [
      {
        source: "/osm-overpass",
        destination: "https://overpass-api.de/api/interpreter",
      },
    ];
  },

  // Eski /reset-password -> yeni /forgot-password
  async redirects() {
    return [];
  },
});
