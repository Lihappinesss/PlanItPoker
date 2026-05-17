const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const resolvePackage = (packageName) =>
  path.dirname(require.resolve(`${packageName}/package.json`, { paths: [__dirname] }));

module.exports = composePlugins(
  withNx(),
  withReact(),
  (config) => {
    return merge(config, {
      resolve: {
        alias: {
          react: resolvePackage('react'),
          'react-dom': resolvePackage('react-dom'),
          'react-redux': resolvePackage('react-redux'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@pages': path.resolve(__dirname, 'src/pages'),
          '@src': path.resolve(__dirname, 'src'),
        },
      },
      plugins: [
        new webpack.DefinePlugin({
          __APP_API_BASE_URL__: JSON.stringify(process.env.APP_API_BASE_URL || 'http://localhost:3000'),
          __APP_WS_BASE_URL__: JSON.stringify(process.env.APP_WS_BASE_URL || 'ws://localhost:3000/plan/'),
        }),
      ],
    });
  }
);
