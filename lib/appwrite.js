import {
  Account,
  Client,
  Functions,
  Databases,
  ID,
  Avatars,
  Query,
  Permission,
  Role,
} from "react-native-appwrite";
import { CACHE_KEYS, loadFromCache, storeToCache } from "./cacheUtil";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  platform: "com.isaac.mintable",
  projectId: "6778bfe40010ede410ec",
  databaseId: "6779c5b9001b206984e1",
  userCollectionId: "6779c5d60024c7174702",
  lessonsCollectionId: "6779c8e1002ccb2b3782",
  budgetsCollectionId: "6779c653001bfd21e4d9",
  virtualBalanceCollectionId: "67e0e21a002a3e9bdf8f",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  lessonsCollectionId,
  budgetsCollectionId,
  virtualBalanceCollectionId,
} = appwriteConfig;

const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const functions = new Functions(client);

let sessionToken;

const preferences = {
  budgetOnboardComplete: false,
  updateFreq: 0,
  updateFreqDate: 0,
  startAmount: 0,
  addAmount: 0,
};

export { account, avatars, databases, functions };

export const createUser = async (
  email,
  password,
  username
  // firstName,
  // lastName
) => {
  console.log("request, createUser");
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    // const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        // avatar: avatarUrl,
        // firstName,
        // lastName,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signIn = async (email, password) => {
  console.log("request, signin");

  try {
    const session = await account.createEmailPasswordSession(email, password);
    sessionToken = session.secret;
    client.setSession(session.secret);

    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logOut = async () => {
  console.log("calling log out");
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

// updating user settings
export const updateName = async (fn, ln, user) => {
  try {
    const res = await databases.updateDocument(
      databaseId,
      userCollectionId,
      user.$id,
      { firstName: fn, lastName: ln }
    );
    if (!res) throw Error;
    return res;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateEmail = async (email, pwd) => {
  try {
    const res = await account.updateEmail(email, pwd);

    return res;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updatePassword = async (pwd, newPwd) => {
  try {
    const res = await account.updatePassword(pwd, newPwd);
    return res;
  } catch (error) {
    throw new Error(error.message);
  }
};

// implement this at some point
export const getCurrentUser = async () => {
  console.log("request, getcurrentuser");

  // if(loadFromCache(CACHE_KEYS.currentUser).accountId !== null) {
  //     console.log('user requested already exists in cache, load that');
  //     return loadFromCache(CACHE_KEYS.currentUser);
  // }

  try {
    // console.log('user requested does not exist in cache, load from db');
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("User document not found");

    // console.log(currentUser.documents[0]);

    // storeToCache(CACHE_KEYS.currentUser, currentUser.documents[0]);

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentUserNoCache = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("User document not found");

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getChapterQuiz = async (chapter) => {
  console.log("request, getchapterquiz");

  try {
    const questions = await databases.listDocuments(
      databaseId,
      lessonsCollectionId,
      [Query.equal("chapter", chapter)]
    );

    return questions.documents;
  } catch (error) {
    console.log(error);
  }
};

export const getChapterLessonIdQuiz = async (chapter, lid) => {
  console.log("request, getchapterlessonidquiz");

  try {
    const questions = await databases.listDocuments(
      databaseId,
      lessonsCollectionId,
      [
        Query.and([
          Query.equal("chapter", chapter),
          Query.equal("lessonId", lid),
        ]),
      ]
    );

    return questions.documents;
  } catch (error) {
    console.log(error);
  }
};

export const createBudget = async (
  title,
  goal,
  goalTime,
  user,
  repeating,
  repeatingFreq,
  color,
  started
) => {
  console.log("request, createbudget");

  try {
    const newBudget = await databases.createDocument(
      databaseId,
      budgetsCollectionId,
      ID.unique(),
      {
        title: title,
        goal: goal,
        goalTime: goalTime.toISOString(),
        users: user.$id,
        repeating: repeating,
        color: color,
        repeating_freq: repeatingFreq,
        started: started.toISOString(),
        accountId: user.accountId,
      },
      [
        Permission.read(Role.user(user.accountId)),
        Permission.update(Role.user(user.accountId)),
        Permission.delete(Role.user(user.accountId)),
      ]
    );
    return newBudget;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBudgets = async (user) => {
  console.log("request, getbudgets");

  if (!user) {
    console.error("ERROR: getBudget 'user' value undefined.");
    return null;
  }

  try {
    const budgets = await databases.listDocuments(
      databaseId,
      budgetsCollectionId,
      [Query.equal("accountId", user.accountId)]
    );

    return budgets.documents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBudgetByDocId = async (user, id) => {
  console.log("request, getBudgetByDocId");

  console.log("id: " + id);

  if (!user) {
    console.error("ERROR: 'user' value undefined.");
    return null;
  }

  try {
    const budget = await databases.getDocument(
      databaseId,
      budgetsCollectionId,
      id
    );
    if (!budget) throw Error;
    console.log("found budget", budget);
    return budget;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateBudget = async (id, progress) => {
  console.log("request, updatebudget");

  try {
    const result = await databases.updateDocument(
      databaseId,
      budgetsCollectionId,
      id,
      { progress: progress }
    );
    if (!result) throw Error;
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const editBudget = async (id, form) => {
  console.log("request, editBudget");

  // Validate required fields exist on form
  const requiredFields = [
    "title",
    "goal",
    "goalTime",
    "repeating",
    "color",
    "started",
    "accountId",
  ];
  for (const field of requiredFields) {
    if (!(field in form)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  console.log("form: ", form);
  try {
    const result = await databases.updateDocument(
      databaseId,
      budgetsCollectionId,
      id,
      {
        title: form.title,
        goal: form.goal,
        goalTime: form.goalTime,
        repeating: form.repeating,
        color: form.color,
        started: form.started,
        accountId: form.accountId,
      }
    );
    console.log("edited??");
    if (!result) throw new Error("Update failed with no result");
    return result;
  } catch (error) {
    console.error(error.message);
  }
};

export const deleteBudget = async (id) => {
  console.log("request, deletebudget");

  try {
    const result = await databases.deleteDocument(
      databaseId,
      budgetsCollectionId,
      id
    );
    console.log(result);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getPreferences = async () => {
  console.log("request, getpreferences");

  try {
    const result = await account.getPrefs();

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updatePreferences = async (prefs) => {
  console.log("request, updatepreferences");

  try {
    const result = await account.updatePrefs(prefs);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getVirtualBalance = async (user) => {
  console.log("request, getVirtualBalance");

  try {
    const result = await databases.listDocuments(
      databaseId,
      virtualBalanceCollectionId,
      [Query.equal("accountId", user.accountId)]
    );

    return result.documents;
  } catch (error) {
    console.log(error);
  }
};

export const createVirtualBalance = async (
  amount,
  updateFreq,
  updateAmount
) => {
  console.log("request, createvirtualbalance");

  try {
    const currentUser = await getCurrentUser();
    const docId = ID.unique();

    if (!currentUser) throw new Error();

    console.log("creating vbalance");
    const vBalance = await databases.createDocument(
      databaseId,
      virtualBalanceCollectionId,
      docId,
      {
        accountId: currentUser.accountId,
        users: currentUser.$id,
        balance: amount,
        updateFreq: updateFreq,
        updateAmount: updateAmount,
      }
    );

    console.log("updating user");
    // add virtual balance document id to user db entry
    const result = await databases.updateDocument(
      databaseId,
      userCollectionId,
      currentUser.$id,
      { virtualBalanceId: docId }
    );

    console.log("done");
    return vBalance;
  } catch (error) {
    console.log(error);
  }
};

export const updateVirtualBalance = async (
  amount,
  updateFreq,
  updateAmount
) => {
  console.log("request, updatevirtualbalance");

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.virtualBalanceId === null)
      throw new Error();

    const result = await databases.updateDocument(
      databaseId,
      virtualBalanceCollectionId,
      currentUser.virtualBalanceId,
      { balance: amount, updateFreq: updateFreq, updateAmount: updateAmount }
    );
    if (!result) throw Error;
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const updateVirtualBalanceUpdateFreq = async (updateFreq) => {
  console.log("request, updatevirtualbalanceupdatefreq");

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.virtualBalanceId === null)
      throw new Error();

    const result = await databases.updateDocument(
      databaseId,
      virtualBalanceCollectionId,
      currentUser.virtualBalanceId,
      { updateFreq: updateFreq }
    );
    if (!result) throw Error;
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const updateVirtualBalanceUpdateAmount = async (updateAmount) => {
  console.log("request, updatevirtualbalanceupdateamount");

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.virtualBalanceId === null)
      throw new Error();

    const parsedAmount = parseInt(updateAmount, 10);
    if (isNaN(parsedAmount)) {
      throw new Error("Invalid updateAmount: must be a valid integer");
    }

    const result = await databases.updateDocument(
      databaseId,
      virtualBalanceCollectionId,
      currentUser.virtualBalanceId,
      { updateAmount: parsedAmount }
    );
    if (!result) throw Error;
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const requestDeleteAccount = async () => {
  console.log("request, requestDeleteAccount");

  try {
    const res = functions.createExecution(
      "682d8902003641b388f9",
      "",
      true,
      "/deleteUser",
      "POST"
    );
    if (res) {
      return true;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const appleSignInToken = async (crediential) => {
  console.log("request, appleSignInTokenVerification");

  try {
    const exec = await functions.createExecution(
      "694f7aa90013cd2bf08e",
      JSON.stringify({
        identityToken: crediential.identityToken,
        user: crediential.user,
        email: crediential.email,
        fullName: crediential.fullName,
      })
    );

    if (!exec) throw new Error("Function execution failed");

    const res = JSON.parse(exec.responseBody);

    if (res.status === "success") {
      await account.createSession(res.userId, res.secret);
      console.log("Logged in with Apple!");
      return res;
    } else {
      console.error("Function error:", res.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
