const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [''], // Add domains here
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `@import "extendables/index.scss";`,
  },
  reactStrictMode: true,
}

module.exports = nextConfig;