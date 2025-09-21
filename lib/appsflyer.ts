import appsFlyer from "react-native-appsflyer";

export enum events {
  SIGN_UP = "af_sign_up",
  LOG_IN = "af_log_in",
  CREATE_BUDGET = "af_create_budget",
}

export const logEvent = (event: events, eventValues?: object) => {
  console.log("logging event: ", event);
  if (eventValues) {
    appsFlyer.logEvent(
      event,
      eventValues,
      (res) => {
        console.log("In app event " + event + " success! " + res);
      },
      (res) => {
        console.error("In app event " + event + " error! " + res);
      }
    );
  } else {
    appsFlyer.logEvent(
      event,
      {},
      (res) => {
        console.log("In app event " + event + " success! " + res);
      },
      (res) => {
        console.error("In app event " + event + " error! " + res);
      }
    );
  }
};
