import base from "./app.json";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";
const IS_DEBUG = process.env.EXPO_PUBLIC_DEBUG_MODE === "true";

// console.log("APPID ", process.env.APPSFLYER_APPID);
// console.log("DEVKEY ", process.env.APPSFLYER_DEVKEY);

export default {
  ...base,
  extra: {
    ...base.expo.extra,
    AF_APPID: process.env.APPSFLYER_APPID,
    AF_DEVKEY: process.env.APPSFLYER_DEVKEY,
    IS_DEBUG: IS_DEBUG || IS_DEV,
  },
};
