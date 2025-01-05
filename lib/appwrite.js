import { Account, Client, Databases, ID, Avatars, Query } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.isaac.mintable",
    projectId: "6778bfe40010ede410ec",
    databaseId: "6779c5b9001b206984e1",
    userCollectionId: "6779c5d60024c7174702",
}

const {
    endpoint, 
    platform, 
    projectId, 
    databaseId, 
    userCollectionId,
} = appwriteConfig;

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform)

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username, firstName, lastName) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(databaseId, userCollectionId, ID.unique(), {accountId: newAccount.$id, email, username, avatar: avatarUrl, firstName, lastName})

        return newUser;
    } catch (error) {
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session
    } catch (error) {
        throw new Error(error)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error)
    }
}