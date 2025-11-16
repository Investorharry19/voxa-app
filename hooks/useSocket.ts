// useAnonymousMessages.js
import { MessagesRequest } from "@/utils/axios";
import { useGlobal } from "@/utils/globals";
import { VoxaMessage } from "@/utils/myTypes";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
export default function useAnonymousMessages({
  serverUrl,
}: {
  serverUrl: string;
}) {
  const socketRef = useRef<Socket | any>(null);
  const { setMessages, setFavoriteMessages, username: user } = useGlobal();
  const [messages, setLocalMessages] = useState<VoxaMessage[]>([]);

  // Log outside useEffect to confirm hook is being called

  useEffect(() => {
    if (!serverUrl) {
      console.error("Missing required parameters:", { user, serverUrl });
      return;
    }

    //Fetch initial messages from API
    const fetchInitialMessages = async () => {
      try {
        const res = await MessagesRequest.getMessages(user);

        const m: VoxaMessage[] = res.messages;
        setLocalMessages(res.messages);
        setMessages(res.messages);
        const favs = m.filter((fav) => fav.isStarred);
        setFavoriteMessages(favs);
      } catch (err) {
        console.error("Error fetching initial messages:", err);
      }
    };

    fetchInitialMessages();

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
  }, [serverUrl]);
  return messages;
}
