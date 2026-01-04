import { OAuthProvider, Query } from "react-native-appwrite";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import {
  account,
  avatars,
  databases,
  functions,
  appwriteConfig,
} from "../lib/appwrite";
import { createUserDB } from "./userService";

export const googleOAuthSession = async () => {
  try {
    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    const scheme = `${deepLink.protocol}//`;

    const loginUrl = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${deepLink}home`,
      failure: `${deepLink}sign-in`,
    });

    const res = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);

    if (res.type !== "success") {
      if (res.type === "cancel" || res.type === "dismiss") {
        console.log("OAuth session cancelled by user");
        return null;
      }
      throw new Error(`OAuth session failed with type: ${res.type}`);
    }

    const url = new URL(res.url);
    console.log(url);

    if (url.searchParams.has("error")) {
      console.error("Auth error:", url.searchParams.get("error"));
      return url;
    }

    const secret = url.searchParams.get("secret");
    const userId = url.searchParams.get("userId");

    await account.createSession({
      userId,
      secret,
    });

    // check if user exists in user collection

    console.log("userId: ", userId);

    const userIdCheck = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", [userId])]
    );

    console.log("userIdCheck: ", userIdCheck);

    if (userIdCheck.total === 0) {
      // user doesn't exist so create new entry
      console.log("creating new user");
      const user = await account.get();
      if (!user) throw new Error("Error getting user.");
      const name = user.name;
      const email = user.email;

      await createUserDB(name, email, userId);
    }

    return url;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
