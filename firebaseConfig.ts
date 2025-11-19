
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// REPLACE THIS WITH YOUR OWN FIREBASE CONFIG FROM THE FIREBASE CONSOLE
// Go to https://console.firebase.google.com/ -> Project settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  // apiKey: "AIzaSy...",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "...",
  // appId: "..."
};

let app;
let db: any;

try {
    if (Object.keys(firebaseConfig).length === 0) {
        console.warn("Firebase config is missing in firebaseConfig.ts. The app will not persist data to the cloud until configured.");
    } else {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully.");
    }
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { db };
