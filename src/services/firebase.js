import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUpnNQOHpUdJw8e4TTJlFQwuP7tF1aFao",
  authDomain: "northlibras.firebaseapp.com",
  projectId: "northlibras",
  storageBucket: "northlibras.firebasestorage.app",
  messagingSenderId: "447097228162",
  appId: "1:447097228162:web:c8f69e1831e64e448b1d9b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);