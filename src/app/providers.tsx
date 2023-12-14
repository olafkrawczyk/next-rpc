// app/providers.tsx
"use client";

import { FirebaseContextProvider } from "@/context/firebaseContext";
import { ChakraProvider } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBO7GRy1EpcO-Xvkb23UBr9ExiEXOWHy0Q",
  authDomain: "video-906be.firebaseapp.com",
  projectId: "video-906be",
  storageBucket: "video-906be.appspot.com",
  messagingSenderId: "227766627357",
  appId: "1:227766627357:web:4ddc2244edc10cba352af4",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <FirebaseContextProvider value={{ firestore }}>
        {children}
      </FirebaseContextProvider>
    </ChakraProvider>
  );
}
