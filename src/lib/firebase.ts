
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "studio-5729505515-f160d",
  appId: "1:536405165483:web:7df72c0d217b46c0003eee",
  storageBucket: "studio-5729505515-f160d.firebasestorage.app",
  apiKey: "AIzaSyAgpHVwBIS1ChFQIhFNuyl7HhwerUGI7FA",
  authDomain: "studio-5729505515-f160d.firebaseapp.com",
  messagingSenderId: "536405165483",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
