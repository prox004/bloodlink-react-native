import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Define the structure of the Firebase configuration object
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Interface for user data in Firestore
export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  bloodType: string;
  phoneNumber: string;
  age: string;
  weight: string;
  address: string;
  city: string;
  lastDonation?: string;
  medicalConditions?: string;
  isAvailableToDonate: boolean;
  createdAt: firebase.firestore.Timestamp;
  lastLogin: firebase.firestore.Timestamp;
}

// Your Firebase configuration object with proper typing
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBiwJWrRV8L36_e2pVhILjtZ4kVaqPY0gE",
  authDomain: "bloodlink-2903c.firebaseapp.com",
  projectId: "bloodlink-2903c",
  storageBucket: "bloodlink-2903c.firebasestorage.app",
  messagingSenderId: "757396088908",
  appId: "1:757396088908:web:8628d51c58c60d27022ce9",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export everything we need
export { firebase, auth, db };