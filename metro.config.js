const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const { assetExts } = config.resolver;
config.resolver.assetExts = [...assetExts, "lottie"];

module.exports = withNativeWind(config, { input: "./global.css" });
