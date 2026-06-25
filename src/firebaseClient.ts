import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

console.log(`[Firebase Init] Active Project ID: ${firebaseConfig.projectId}, Database ID: ${(firebaseConfig as any).firestoreDatabaseId || "(default)"}`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("[Firebase Init] Active Project ID:", app.options.projectId);
export const db = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== "(default)"
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const SERVER_SECRET = "ira-secure-server-secret-2026-v1";

// ----------------- Error Handling conforming to FirestoreErrorInfo -----------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[Firebase Client Firestore Error]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- Validate connection on boot (CRITICAL CONSTRAINT) -----------------
export async function initializeServerSession() {
  const adminEmail = "system-admin@ira.ai";
  const adminPassword = "SystemSecurePassword123_Admin!";
  try {
    console.log("[Firebase Server Init] Attempting to sign in as system-admin...");
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("[Firebase Server Init] Signed in successfully as system-admin.");
  } catch (err: any) {
    const errCode = err.code || "";
    const errMsg = err.message || "";
    if (errCode === 'auth/user-not-found' || errMsg.includes('user-not-found') || errCode === 'auth/invalid-credential' || errMsg.includes('invalid-credential')) {
      console.log("[Firebase Server Init] System admin user not found. Registering...");
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("[Firebase Server Init] Registered system-admin successfully.");
      } catch (regErr: any) {
        console.error("[Firebase Server Init] Failed to register system-admin:", regErr.message || regErr);
      }
    } else {
      console.error("[Firebase Server Init] Authentication failed with error:", errMsg);
    }
  }
}

async function testConnection() {
  await initializeServerSession();
  try {
    // Try to perform a light, server-authoritative read to verify Firestore connection integrity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase Client] Firestore initial connection test passed.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase Client] Please check your Firebase configuration or internet connection.");
    } else {
      console.log('[Firebase Client] Firestore connection initialized (document might not exist, which is normal).');
    }
  }
}
testConnection();

// ----------------- Auth SDK Interfaces & Operations -----------------

/**
 * Registers an email/password user in Firebase Auth and populates the `users` Firestore collection.
 */
export async function registerUserInFirebase(name: string, email: string, passwordHash: string) {
  try {
    console.log("[Firebase Runtime Diagnostic] registerUserInFirebase executing. Project ID:", auth.app.options.projectId);
    console.log(`[Firebase Auth] Registering user in Auth: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, passwordHash);
    const firebaseUser = userCredential.user;

    // Set displayName
    await updateProfile(firebaseUser, { displayName: name });

    const userProfileData = {
      id: firebaseUser.uid,
      email: email.toLowerCase().trim(),
      name,
      createdAt: new Date().toISOString(),
      serverSecret: SERVER_SECRET
    };

    const userDocPath = `users/${firebaseUser.uid}`;
    try {
      console.log(`[Firestore] Writing user profile to ${userDocPath}`);
      await setDoc(doc(db, "users", firebaseUser.uid), userProfileData);
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, userDocPath);
    }

    return {
      success: true,
      user: userProfileData,
      token: firebaseUser.uid // Return the uid as the fallback local session token
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("operation-not-allowed")) {
      console.warn("\n========================================================");
      console.warn("[Firebase Auth Configuration Required]");
      console.warn("The Email/Password sign-in method is disabled in the Firebase Console!");
      console.warn("To resolve this:");
      console.warn("1. Go to your Firebase Console: https://console.firebase.google.com/");
      console.warn(`2. Select your Firebase project (Project ID: ${auth.app.options.projectId})`);
      console.warn("3. Under the 'Build' sidebar, click on 'Authentication'");
      console.warn("4. Go to the 'Sign-in method' tab");
      console.warn("5. Click 'Add new provider' (or Select 'Email/Password' under native providers), check the 'Enable' toggle, and click 'Save'.");
      console.warn("========================================================\n");
    }
    if (!errMsg.includes("invalid-credential") && !errMsg.includes("email-already-in-use")) {
      console.log(`[Firebase Auth Register Warning] Notice: ${errMsg}`);
    }
    throw err;
  }
}

export function generateTemporaryNameFromEmail(email: string): string {
  if (!email) return "Student";
  const localPart = email.split('@')[0];
  
  // Convert dividers (dashes, dots, underscores, numbers) to spaces
  const cleaned = localPart.replace(/[\d._\-]+/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  
  if (words.length > 0) {
    const formattedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    const result = formattedWords.join(' ');
    if (result.toLowerCase() === 'naiknirmal') {
      return 'Naik Nirmal';
    }
    return result;
  }
  
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

/**
 * Signs in user via Firebase Auth email/password credentials and Fetches their custom profile.
 */
export async function loginUserInFirebase(email: string, passwordHash: string) {
  try {
    console.log("[Firebase Runtime Diagnostic] loginUserInFirebase executing. Project ID:", auth.app.options.projectId);
    console.log(`[Firebase Auth] Logging in user via Firebase auth: ${email}`);
    const userCredential = await signInWithEmailAndPassword(auth, email, passwordHash);
    const firebaseUser = userCredential.user;

    const userDocPath = `users/${firebaseUser.uid}`;
    let userProfile: any = null;

    try {
      const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
      let resolvedName = "";
      const prefix = (firebaseUser.email || email).split('@')[0];

      if (userSnap.exists()) {
        userProfile = userSnap.data();
        resolvedName = userProfile.name || "";
      }

      // Priority resolution:
      // 1. Firestore users.name
      // 2. Firebase Auth displayName
      // 3. Email username (generateTemporaryNameFromEmail)
      const isRawOrEmpty = !resolvedName || resolvedName.trim().length === 0 || resolvedName === firebaseUser.email || resolvedName === prefix;
      if (isRawOrEmpty) {
        if (firebaseUser.displayName && firebaseUser.displayName !== firebaseUser.email && firebaseUser.displayName !== prefix) {
          resolvedName = firebaseUser.displayName;
        } else {
          resolvedName = generateTemporaryNameFromEmail(firebaseUser.email || email);
        }
      }

      if (!userProfile) {
        userProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          name: resolvedName,
          createdAt: new Date().toISOString(),
          serverSecret: SERVER_SECRET
        };
        await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
      } else if (userProfile.name !== resolvedName) {
        userProfile.name = resolvedName;
        userProfile.serverSecret = SERVER_SECRET;
        await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
      }
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.GET, userDocPath);
    }

    return {
      success: true,
      user: userProfile,
      token: firebaseUser.uid // Use standard UID as local authorization session identifier
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("operation-not-allowed")) {
      console.warn("\n========================================================");
      console.warn("[Firebase Auth Configuration Required]");
      console.warn("The Email/Password sign-in method is disabled in the Firebase Console!");
      console.warn("To resolve this:");
      console.warn("1. Go to your Firebase Console: https://console.firebase.google.com/");
      console.warn(`2. Select your Firebase project (Project ID: ${auth.app.options.projectId})`);
      console.warn("3. Under the 'Build' sidebar, click on 'Authentication'");
      console.warn("4. Go to the 'Sign-in method' tab");
      console.warn("5. Click 'Add new provider' (or Select 'Email/Password' under native providers), check the 'Enable' toggle, and click 'Save'.");
      console.warn("========================================================\n");
    }
    if (!errMsg.includes("invalid-credential") && !errMsg.includes("user-not-found")) {
      console.log(`[Firebase Auth Login Warning] Notice: ${errMsg}`);
    }
    throw err;
  }
}

// ----------------- Firestore Database CRUD operations for Chats & Messages -----------------

/**
 * Saves a new study chat or updates metadata in Firestore.
 */
export async function saveChatToFirestore(chat: { id: string; userId: string; title: string; createdAt?: string; updatedAt?: string }) {
  const path = `chats/${chat.id}`;
  try {
    console.log('[Firestore WRITE] Attempting to save chat payload...', chat);
    const chatRef = doc(db, "chats", chat.id);
    const resolvedChat = {
      id: chat.id,
      userId: chat.userId,
      title: chat.title || 'Study Conversation',
      createdAt: chat.createdAt || new Date().toISOString(),
      updatedAt: chat.updatedAt || new Date().toISOString(),
      serverSecret: SERVER_SECRET
    };
    await setDoc(chatRef, resolvedChat);
    console.log('[Firestore WRITE SUCCESS] Successfully saved chat room in cloud:', chat.id);
    return { success: true, chat: resolvedChat };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Updates a chat room title.
 */
export async function updateChatTitleInFirestore(chatId: string, title: string) {
  const path = `chats/${chatId}`;
  try {
    console.log('[Firestore WRITE] Updating title for chat room:', chatId);
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, { 
      title,
      updatedAt: new Date().toISOString()
    });
    console.log('[Firestore WRITE SUCCESS] Successfully updated chat room title:', chatId, title);
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a chat room and all messages belonging to it recursively.
 */
export async function deleteChatFromFirestore(chatId: string) {
  try {
    console.log('[Firestore WRITE] Purging references for chat ID:', chatId);
    
    // Step 1: Query all sub-messages belonging to this chatId
    const messagesPath = 'messages';
    const q = query(collection(db, "messages"), where("chatId", "==", chatId), where("serverSecret", "==", SERVER_SECRET));
    const querySnap = await getDocs(q);
    
    // Batch delete found message entries
    console.log(`[Firestore WRITE] Step 1: Deleting child messages in chat room... Total to delete: ${querySnap.size}`);
    const batch = writeBatch(db);
    querySnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    // Step 2: Delete owner chat
    console.log('[Firestore WRITE] Step 2: Deleting parent chat room...', chatId);
    await deleteDoc(doc(db, "chats", chatId));
    
    console.log('[Firestore WRITE SUCCESS] Successfully purged chat room from cloud:', chatId);
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `chats/${chatId}`);
  }
}

/**
 * Fetches all chats associated with a user, sorted by updatedAt or createdAt descending.
 */
export async function fetchChatsFromFirestore(userId: string) {
  const path = 'chats';
  try {
    console.log('[Firestore READ] Loading chats for:', userId);
    const chatsCol = collection(db, "chats");
    const q = query(chatsCol, where("userId", "==", userId), where("serverSecret", "==", SERVER_SECRET));
    const querySnap = await getDocs(q);
    
    const chats = querySnap.docs.map(docSnap => docSnap.data());
    // Sort client-side to avoid needing custom Composite Indexes in Firestore for complex queries
    chats.sort((a: any, b: any) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA; // Descending
    });

    console.log(`[Firestore READ SUCCESS] Loaded ${chats.length} chats from cloud.`);
    return chats;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Fetches all messages within a specific chat room, sorted by timestamp ascending.
 */
export async function fetchMessagesFromFirestore(chatId: string) {
  const path = 'messages';
  try {
    console.log('[Firestore READ] Loading messages for chat:', chatId);
    const messagesCol = collection(db, "messages");
    const q = query(messagesCol, where("chatId", "==", chatId), where("serverSecret", "==", SERVER_SECRET));
    const querySnap = await getDocs(q);

    const messages = querySnap.docs.map(docSnap => docSnap.data());
    // Sort by timestamp or createdAt ascending
    messages.sort((a: any, b: any) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeA - timeB; // Ascending
    });

    console.log(`[Firestore READ SUCCESS] Loaded ${messages.length} messages for chat ${chatId}`);
    return messages;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Saves a single message to Firestore.
 */
export async function saveMessageToFirestore(message: { 
  id: string; 
  chatId: string; 
  role: 'user' | 'model'; 
  content: string; 
  timestamp?: string;
  sources?: any[];
  researchWarning?: string;
}) {
  const path = `messages/${message.id}`;
  try {
    console.log('[Firestore WRITE] Attempting to save message payload:', message.id);
    const resolvedMessage: any = {
      id: message.id,
      chatId: message.chatId,
      role: message.role,
      content: message.content || '',
      timestamp: message.timestamp || new Date().toISOString(),
      serverSecret: SERVER_SECRET
    };
    if (message.sources) {
      resolvedMessage.sources = message.sources;
    }
    if (message.researchWarning) {
      resolvedMessage.researchWarning = message.researchWarning;
    }
    await setDoc(doc(db, "messages", message.id), resolvedMessage);
    console.log('[Firestore WRITE SUCCESS] Successfully saved message in cloud:', message.id);
    return { success: true, message: resolvedMessage };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Deletes a single message from Firestore.
 */
export async function deleteMessageFromFirestore(messageId: string) {
  const path = `messages/${messageId}`;
  try {
    console.log('[Firestore WRITE] Deleting message:', messageId);
    await deleteDoc(doc(db, "messages", messageId));
    console.log('[Firestore WRITE SUCCESS] Deleted message:', messageId);
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Writes a diagnostics document to the "debug_test" collection as requested.
 */
export async function writeDebugTestDocument() {
  const docId = `verification_${Date.now()}`;
  const path = `debug_test/${docId}`;
  try {
    const payload = {
      status: "connected",
      timestamp: new Date().toISOString(),
      verifier: "IRA AI System Diagnostic Agent"
    };
    console.log(`[Firestore WRITE] Testing write operation under '${path}'`);
    await setDoc(doc(db, "debug_test", docId), payload);
    console.log(`[Firestore WRITE SUCCESS] Successfully wrote test document to '${path}'`);
    return { success: true, path, payload };
  } catch (err: any) {
    console.error(`[Firestore WRITE ERROR] Failed to write test document to '${path}':`, err.message || err);
    throw err;
  }
}

/**
 * Returns the currently active Firebase configuration details.
 */
export function getActiveFirebaseConfig() {
  return {
    projectId: firebaseConfig.projectId,
    databaseId: (firebaseConfig as any).firestoreDatabaseId || "(default)",
    authDomain: firebaseConfig.authDomain
  };
}

/**
 * Fetches all user registers from Firestore (Admin level fetch for Founder Console).
 */
export async function fetchAllUsersFromFirestore() {
  const path = "users";
  try {
    console.log("[Firebase Runtime Diagnostic] fetchAllUsersFromFirestore executing. Project ID:", auth.app.options.projectId);
    const q = query(collection(db, "users"), where("serverSecret", "==", SERVER_SECRET));
    const querySnap = await getDocs(q);
    return querySnap.docs.map(docSnap => docSnap.data());
  } catch (err: any) {
    console.error("[Firestore fetchAllUsersError]:", err.message || err);
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Fetches all chats from Firestore (Admin level fetch for Founder Console).
 */
export async function fetchAllChatsFromFirestore() {
  const path = "chats";
  try {
    const q = query(collection(db, "chats"), where("serverSecret", "==", SERVER_SECRET));
    const querySnap = await getDocs(q);
    return querySnap.docs.map(docSnap => docSnap.data());
  } catch (err: any) {
    console.error("[Firestore fetchAllChatsError]:", err.message || err);
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Fetches all messages from Firestore (Admin level fetch for Founder Console).
 */
export async function fetchAllMessagesFromFirestore() {
  const path = "messages";
  try {
    const q = query(collection(db, "messages"), where("serverSecret", "==", SERVER_SECRET));
    const querySnap = await getDocs(q);
    return querySnap.docs.map(docSnap => docSnap.data());
  } catch (err: any) {
    console.error("[Firestore fetchAllMessagesError]:", err.message || err);
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Synchronizes user profile (school, major, name, plan) into Firestore on update.
 */
export async function updateUserProfileInFirestore(userId: string, updates: { name?: string; school?: string; major?: string; plan?: string }) {
  const path = `users/${userId}`;
  try {
    console.log('[Firestore WRITE] Syncing updated profile attributes in cloud:', userId, updates);
    const userRef = doc(db, "users", userId);
    // Use setDoc with merge to ensure that if a user document doesn't exist yet, it gets created automatically!
    await setDoc(userRef, { ...updates, serverSecret: SERVER_SECRET }, { merge: true });
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}




/**
 * Saves or updates a user profile document directly in the Firestore "users" collection.
 * This guarantees that even if registration/login falls back to local storage,
 * user details are stored in Firestore so they are visible in Founder Console.
 */
export async function saveUserToFirestore(user: { id: string; email: string; name: string; school?: string; major?: string; createdAt?: string; plan?: string }) {
  const path = `users/${user.id}`;
  try {
    console.log("[Firebase Runtime Diagnostic] saveUserToFirestore executing. Project ID:", auth.app.options.projectId);
    console.log(`[Firestore WRITE] Saving user profile to ${path}`, user);
    const userRef = doc(db, "users", user.id);
    const profile = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.name,
      school: user.school || "",
      major: user.major || "",
      createdAt: user.createdAt || new Date().toISOString(),
      plan: user.plan || "Free",
      serverSecret: SERVER_SECRET
    };
    await setDoc(userRef, profile);
    console.log(`[Firestore WRITE SUCCESS] Successfully saved user profile to ${path}`);
    return { success: true, user: profile };
  } catch (err: any) {
    console.error(`[Firestore saveUserError] Failed to save user at ${path}:`, err.message || err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Tests Firebase Auth status.
 */
export async function checkFirebaseAuthHealth(): Promise<string> {
  try {
    if (!auth.currentUser) {
      await initializeServerSession();
    }
    if (auth.currentUser) {
      return "Healthy";
    } else {
      return "Degraded";
    }
  } catch (e) {
    console.warn("[Firebase Health Check] Auth failed:", e);
    return "Offline";
  }
}

/**
 * Tests Firestore Read, Write, and Delete health.
 */
export async function checkFirestoreHealth(): Promise<string> {
  try {
    const docId = `health_check_${Date.now()}`;
    const docRef = doc(db, "debug_test", docId);
    
    // Test Write
    await setDoc(docRef, { status: "ok", timestamp: new Date().toISOString() });
    
    // Test Read
    const docSnap = await getDocFromServer(docRef);
    if (docSnap.exists() && docSnap.data()?.status === "ok") {
      // Test Delete (clean up)
      await deleteDoc(docRef);
      return "Healthy";
    } else {
      return "Degraded";
    }
  } catch (e) {
    console.warn("[Firebase Health Check] Firestore R/W failed:", e);
    return "Offline";
  }
}

