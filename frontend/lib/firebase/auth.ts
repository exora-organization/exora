import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import { auth } from "./client";

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential;
};

export const signOut = async (): Promise<void> => {
  return await firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  return await sendPasswordResetEmail(auth, email);
};

export const verifyEmail = async (): Promise<void> => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

export const getFirebaseAuthErrorMessage = (err: any): string => {
  const code = err?.code || "";
  const message = err?.message || "";

  if (code === "auth/email-already-in-use" || message.includes("auth/email-already-in-use")) {
    return "This email is already registered.";
  }
  if (code === "auth/invalid-email" || message.includes("auth/invalid-email")) {
    return "Invalid email address format.";
  }
  if (
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential" ||
    message.includes("auth/user-not-found") ||
    message.includes("auth/wrong-password") ||
    message.includes("auth/invalid-credential")
  ) {
    return "Invalid email or password.";
  }
  if (code === "auth/weak-password" || message.includes("auth/weak-password")) {
    return "Password is too weak. Please use a stronger password.";
  }
  if (code === "auth/too-many-requests" || message.includes("auth/too-many-requests")) {
    return "Too many failed attempts. Please wait a moment and try again.";
  }
  if (code === "auth/user-disabled" || message.includes("auth/user-disabled")) {
    return "This account has been disabled. Please contact support.";
  }
  if (code === "auth/network-request-failed" || message.includes("auth/network-request-failed")) {
    return "Network error. Please check your internet connection.";
  }
  if (code === "auth/operation-not-allowed" || message.includes("auth/operation-not-allowed")) {
    return "This sign-in method is currently disabled.";
  }
  if (code === "auth/requires-recent-login" || message.includes("auth/requires-recent-login")) {
    return "Please log in again to perform this action.";
  }
  if (code === "auth/expired-action-code" || message.includes("auth/expired-action-code")) {
    return "This action link has expired. Please request a new one.";
  }
  if (code === "auth/invalid-action-code" || message.includes("auth/invalid-action-code")) {
    return "This action link is invalid or has already been used.";
  }
  if (code === "auth/quota-exceeded" || message.includes("auth/quota-exceeded")) {
    return "Service quota exceeded. Please try again later.";
  }
  if (code === "auth/popup-closed-by-user" || message.includes("auth/popup-closed-by-user")) {
    return "Sign-in popup was closed before completing.";
  }

  // Strip technical "Firebase: Error (...)" prefix if an unhandled firebase error occurs
  if (typeof message === "string" && message.startsWith("Firebase: Error")) {
    return "Authentication error occurred. Please try again.";
  }

  return message || "An unexpected error occurred. Please try again.";
};

