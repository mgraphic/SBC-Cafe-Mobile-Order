const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: [
        "console",
        "worker_threads",
        "fs",
        "path",
        "os",
        "crypto",
        "stream",
        "buffer",
      ],
      onlyAliases: ["process"],
    }),
  ],
  resolve: {
    fallback: {
      buffer: false,
      crypto: require.resolve("crypto-browserify"),
      fs: false,
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      querystring: require.resolve("querystring-es3"),
      stream: require.resolve("stream-browserify"),
      zlib: require.resolve("browserify-zlib"),
    },
  },
};
