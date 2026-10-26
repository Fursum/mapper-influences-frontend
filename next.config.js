/** @type {import('next').NextConfig} */

const regexEqual = (x, y) => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

const nextConfig = {
  // next/image is not used. This turns off /_next/image so bots cannot use it.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import', 'slash-div'],
    quietDeps: true,
    prependData: `
    @import "src/styles/extendables/index.scss";
    @import "src/styles/variables/index.scss";
    @import "src/styles/mixins/index.scss";`,
  },
  reactStrictMode: true,
  // Sass fix
  webpack: (config) => {
    const oneOf = config.module.rules.find(
      (rule) => typeof rule.oneOf === 'object',
    );

    if (oneOf) {
      const sassRule = oneOf.oneOf.find((rule) =>
        regexEqual(rule.test, /\.module\.(scss|sass)$/),
      );
      if (sassRule) {
        const sassLoader = sassRule.use.find((el) =>
          el.loader.includes('next/dist/compiled/sass-loader'),
        );
        if (sassLoader) {
          sassLoader.loader = 'sass-loader';
        }
      }
    }

    return config;
  },
};

module.exports = nextConfig;
