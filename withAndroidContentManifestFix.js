const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAndroidManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    if (androidManifest.manifest && androidManifest.manifest.application) {
      const application = androidManifest.manifest.application[0];

      // Add tools:replace to override the conflicting attributes
      application.$["tools:replace"] =
        "android:fullBackupContent,android:dataExtractionRules";
    }

    return config;
  });
};
