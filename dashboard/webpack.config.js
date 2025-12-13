const { getDefaultConfig } = require("@expo/webpack-config");

// Custom webpack config to avoid eval-based source maps that break strict CSP.
module.exports = async function (env, argv) {
  const config = await getDefaultConfig({ ...env, mode: argv.mode });

  // Disable eval in source maps to satisfy strict CSP (no unsafe-eval).
  config.devtool = "source-map";

  return config;
};
