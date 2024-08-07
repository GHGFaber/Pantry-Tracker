// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgRB1oh4LFYXsiS5KIvgdcxi0mZeJ8UZ0",
  authDomain: "inventory-management-496ed.firebaseapp.com",
  projectId: "inventory-management-496ed",
  storageBucket: "inventory-management-496ed.appspot.com",
  messagingSenderId: "214823496601",
  appId: "1:214823496601:web:af24b42d08ef21a8b98108",
  measurementId: "G-3HS6CDKYHE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };
