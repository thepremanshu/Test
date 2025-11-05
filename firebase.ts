// FIX: Switch to Firebase v8 compatibility imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqRJLnhGd9D6EIAFZg8sHChwRKhdYyWE0",
  authDomain: "apna-adda1.firebaseapp.com",
  databaseURL: "https://apna-adda1-default-rtdb.firebaseio.com",
  projectId: "apna-adda1",
  storageBucket: "apna-adda1.appspot.com",
  messagingSenderId: "997102437224",
  appId: "1:997102437224:web:ab316efa94e28b7245ccdd"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const firestore = firebase.firestore; // Export namespace for Timestamp
