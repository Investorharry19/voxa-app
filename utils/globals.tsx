import React, { createContext, ReactNode, useContext, useState } from "react";
import { VoxaMessage } from "./myTypes";

// 1. Define the shape of your global state
type GlobalState = {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<any>>;
  messages: VoxaMessage[];
  favoriteMessages: VoxaMessage[];
  setMessages: React.Dispatch<React.SetStateAction<any>>;
  setFavoriteMessages: React.Dispatch<React.SetStateAction<any>>;
  backendUrl: string;

  allowPushNOtification: boolean;
  setAllowPushNOtification: React.Dispatch<React.SetStateAction<any>>;
};

// 2. Create the context with the correct type (or undefined for initial)
const GlobalContext = createContext<GlobalState | undefined>(undefined);

// 3. Provider props type
type GlobalProviderProps = {
  children: ReactNode;
};

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [messages, setMessages] = useState<VoxaMessage[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const [username, setUsername] = useState("");
  const backendUrl = "http://10.46.59.7:3000";
  const [allowPushNOtification, setAllowPushNOtification] = useState(true);
  return (
    <GlobalContext.Provider
      value={{
        username,
        setUsername,
        messages,
        setMessages,
        favoriteMessages,
        setFavoriteMessages,
        backendUrl,
        allowPushNOtification,
        setAllowPushNOtification,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// 4. Custom hook with error if used outside provider
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
