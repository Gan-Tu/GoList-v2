// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXPy7JK5KrtTB30vwH5IPusE_SmGZVhAw",
  authDomain: "golist-v2.firebaseapp.com",
  projectId: "golist-v2",
  storageBucket: "golist-v2.appspot.com",
  messagingSenderId: "429198896031",
  appId: "1:429198896031:web:eb5c6b33b3fbc512ac6baa",
  measurementId: "G-HLPL8XFWPS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcjdWEgAAAAALv8OzKlJgNklv2kpL4iAXFNuRuZ'),
  isTokenAutoRefreshEnabled: true
});
const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, appCheck, analytics, db, functions };
