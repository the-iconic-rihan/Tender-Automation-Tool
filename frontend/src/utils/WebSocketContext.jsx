import React, { createContext, useContext, useState } from "react";
import { useSelector } from "react-redux";
import useWebSocket from "react-use-websocket";
const WebSocketContext = createContext();
export const WebSocketProvider = ({ children }) => {
  const user = useSelector((state) => state.auth);
  const socketUrl = `${import.meta.env.VITE_WS_URL}`;
  const {
    sendMessage,
    sendJsonMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(socketUrl, {
    onopen: () => {
      console.log("OPENED");
    },
    onclose: (e) => console.log(e, "CLOSED"),
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 30,
    //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
    reconnectInterval: (attemptNumber) =>
      Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
  });
  const closeWSConnection = () => {
    const ws = getWebSocket();
    ws.close();
  };
  const [sentMessage, setSentMessage] = useState(false);

  const socketContextValue = {
    sendMessage,
    sendJsonMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
    closeWSConnection,
    sentMessage,
    setSentMessage,
  };

  return (
    <WebSocketContext.Provider value={socketContextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
export const useWebSocketContext = () => useContext(WebSocketContext);
