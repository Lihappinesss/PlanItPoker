const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { merge } = require('webpack-merge');
const path = require('path');


module.exports = composePlugins(
  withNx(),
  withReact(), 
  (config) => {

  return merge(config, {
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, 'apps/client/src'),
      },
    },
  });
});
