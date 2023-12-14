import { Firestore } from "firebase/firestore";
import { createContext } from "react";

export interface FirebaseContextInterface {
  firestore: Firestore | null;
}
export const FirebaseContext = createContext<FirebaseContextInterface>({
  firestore: null,
});
export const FirebaseContextProvider = FirebaseContext.Provider;
