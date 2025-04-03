const webpack = require('webpack');

module.exports = function override(config) {
  // Add polyfill fallbacks
  const fallback = {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "url": require.resolve("url/"),
    "process": require.resolve("process/browser"),
    "buffer": require.resolve("buffer/"),
    "path": require.resolve("path-browserify"),
    "fs": false
  };

  // Apply fallbacks
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    ...fallback
  };
  
  // Fix module resolution for .mjs files
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });

  // Add global object polyfills
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"]
    })
  ]);

  // Fix import extensions for ESM
  config.resolve.extensions = [...(config.resolve.extensions || []), ".js", ".mjs", ".ts", ".tsx"];
  
  // Add node-polyfill-webpack-plugin
  const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
  config.plugins.push(new NodePolyfillPlugin());

  return config;
};
