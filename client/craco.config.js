const { InjectManifest } = require('workbox-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Otimizações de produção
      if (env === 'production') {
        // Code splitting otimizado
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true
            }
          }
        };

        // Service Worker
        webpackConfig.plugins.push(
          new InjectManifest({
            swSrc: path.resolve(__dirname, 'public/sw.js'),
            swDest: 'sw.js',
            exclude: [/\.map$/, /manifest$/, /\.htaccess$/]
          })
        );

        // Otimizações de bundle
        webpackConfig.optimization.usedExports = true;
        webpackConfig.optimization.sideEffects = false;
      }

      return webpackConfig;
    }
  },
  babel: {
    plugins: [
      // Lazy loading de componentes
      ['@babel/plugin-syntax-dynamic-import'],
      // Tree shaking otimizado
      ['babel-plugin-transform-imports', {
        'lodash': {
          'transform': 'lodash/${member}',
          'preventFullImport': true
        }
      }]
    ]
  }
};