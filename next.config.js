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
  images: {
    domains: ['a.ppy.sh'], // Add domains here
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
