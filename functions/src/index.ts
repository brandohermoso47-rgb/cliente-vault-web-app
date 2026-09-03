import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { auth } from "firebase-functions/v1";

initializeApp();

const db = getFirestore();

export const createUserData = auth.user().onCreate(async (user) => {
  await db.collection("users").doc(user.uid).set({
    displayName: user.displayName || "Nuevo Estudiante",
    email: user.email || "",
    role: "student",
    createdAt: new Date().toISOString(),
    avatarUrl: user.photoURL || "",
  });

  console.log(`Perfil creado exitosamente para el usuario: ${user.uid}`);
});
