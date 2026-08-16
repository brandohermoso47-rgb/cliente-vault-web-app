import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
export { 
  app, 
  auth, 
  storage, 
  googleProvider, 
  db, 
  appCheck,
  OperationType, 
  handleFirestoreError,
  testFirestoreConnection 
} from './lib/firebase';
export type { FirestoreErrorInfo } from './lib/firebase';
export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
};
export type { FirebaseUser };

