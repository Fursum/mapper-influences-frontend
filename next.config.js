const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["a.ppy.sh"], // Add domains here
  },
  sassOptions: {
    prependData: `
    @import "src/styles/extendables/index.scss";
    @import "src/styles/variables/index.scss";`,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
