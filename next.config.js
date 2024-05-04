let assetPrefix;
if (process.env.NODE_ENV === "production") assetPrefix = "/assets";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["a.ppy.sh"], // Add domains here
  },
  sassOptions: {
    prependData: `
    @import "src/styles/extendables/index.scss";
    @import "src/styles/variables/index.scss";
    @import "src/styles/mixins/index.scss";`,
  },
  reactStrictMode: true,
  assetPrefix,
};

module.exports = nextConfig;
