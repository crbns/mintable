import { ID } from "react-native-appwrite";
import { databases, appwriteConfig } from "../lib/appwrite";

export const createUserDB = (name: string, email: string, accountId: string) => {
  try {
    const res = databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: accountId,
        email: email,
        username: name,
      }
    )

    if (!res) throw new Error("Failed to create user entry in user database");

    return res;
  } catch (error) {
    throw new Error(error.message);
  }
}
