const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const createConfig = () => {
  const config = getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };

  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg").concat("lottie"),
    sourceExts: [...config.resolver.sourceExts, "svg"],
  };

  return config;
};

const config = createConfig();

module.exports = withNativeWind(config, { input: "./global.css" });
