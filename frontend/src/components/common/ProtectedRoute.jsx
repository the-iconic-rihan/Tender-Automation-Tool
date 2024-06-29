import { Navigate } from "react-router-dom";
import { WebSocketProvider } from "../../utils/WebSocketContext";
import { UploadProvider } from "../../utils/UploadContext";

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <UploadProvider>
        <WebSocketProvider>{children}</WebSocketProvider>;
      </UploadProvider>
    </>
  );
};

export default ProtectedRoute;
