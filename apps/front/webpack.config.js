const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { merge } = require('webpack-merge');
const path = require('path');

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
    });
  }
);
