// useAnonymousMessages.js
import { useGlobal } from "@/utils/globals";
import { VoxaMessage } from "@/utils/myTypes";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useAnonymousMessages({
  serverUrl, 
}: {
  serverUrl: string;
}) {
  const socketRef = useRef<Socket | any>(null);
  const { setMessages, username: user } = useGlobal();

  useEffect(() => {
    if (!serverUrl) {
      console.error("Missing required parameters:", { user, serverUrl });
      return;
    }

    // Note: Initial messages are fetched by useFetchMessages hook
    // This hook only handles real-time socket updates

    try {
      //Connect to Socket.IO
      socketRef.current = io(serverUrl, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socketRef.current.emit("register-owner", user);
      // Listen for new anonymous messages
      socketRef.current.on("new-anonymous-message", (message: VoxaMessage) => {
        setMessages((prev: VoxaMessage[]) => [message, ...prev]);
      });


      socketRef.current.emit("owner_online", { messageId: user });

      socketRef.current.on("connect", () => {
        console.log("Connected to socket.io:", socketRef.current.id);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socketRef.current.on("error", (err: Socket) => {
        console.error("Socket error:", err);
      });
    } catch (error) {
      console.error("Error setting up socket connection:", error);
    }

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection");
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
      }
    };
  }, [serverUrl , user]);
}
