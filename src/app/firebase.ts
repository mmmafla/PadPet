// src/app/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDMWUM2CoG-ltfJp2GQv-IPCGOEuzRDUvw",
  authDomain: "proyecto-padpet-c313c.firebaseapp.com",
  projectId: "proyecto-padpet-c313c",
  storageBucket: "proyecto-padpet-c313c.firebasestorage.app",
  messagingSenderId: "835196241668",
  appId: "1:835196241668:web:b053be10649d4bef6f7251"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
