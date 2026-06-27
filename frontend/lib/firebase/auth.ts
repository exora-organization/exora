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
