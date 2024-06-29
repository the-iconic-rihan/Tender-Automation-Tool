import { useEffect, useContext } from "react";
import "../assets/css/Page.css";
import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useWebSocketContext } from "../utils/WebSocketContext";
import {
  resetQueueAndCount,
  updateFileProcessStatus,
  updateFileUploadStatus,
  updateTenderStatus,
} from "../features/upload/UploadSlice";
import UploadContext from "../utils/UploadContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getErrorToast, getWarnToast } from "../utils/useToast";

const Page = () => {
  const { setFileStorage } = useContext(UploadContext);

  const upload = useSelector((state) => state.upload);
  const { totalFiles, currentUploadedFiles, fileQueue } = useSelector(
    (state) => state.upload
  );
  const dispatch = useDispatch();

  const {
    lastJsonMessage,
    sendJsonMessage,
    readyState,
    sentMessage,
    setSentMessage,
  } = useWebSocketContext();

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault(); // Cancel the default behavior of the event
      event.returnValue = ""; // Chrome requires a returnValue to be set
      return "Files are processing, are you sure you want to leave?"; // Display the confirmation message
    };

    if (upload.isUploading) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [upload.isUploading]);

  useEffect(() => {
    if (lastJsonMessage) {
      if (
        !Array.isArray(lastJsonMessage) &&
        lastJsonMessage.message === "Category API completed"
      ) {
        dispatch(updateTenderStatus(lastJsonMessage));
        dispatch(updateFileProcessStatus(lastJsonMessage));
      } else if (
        !Array.isArray(lastJsonMessage) &&
        lastJsonMessage.message ===
        "Some technical problem , please contact developement team"
      ) {
        getErrorMessage(
          "There is a technical problem. Please contact the support team.",
          10000
        );
      }
    }

    console.log("=last json message=>", lastJsonMessage);
  }, [lastJsonMessage]);

  useEffect(() => {
    console.log("Queue modified!!!");

    if (totalFiles > 0 && totalFiles === currentUploadedFiles) {
      console.log(fileQueue);

      sendJsonMessage(fileQueue);
      dispatch(resetQueueAndCount());
      setFileStorage([]);
    }
  }, [totalFiles, currentUploadedFiles]);

  useEffect(() => {
    if (readyState === 3 && !sentMessage) {
      getWarnToast("The websocket connection got disconnected!", 20000, "dark");
      setSentMessage(true);
    }

    if (sentMessage && readyState === 1) {
      setSentMessage(false);
      toast.dismiss();
    }
  }, [readyState]);

  return (
    <div className="page home-main-container">
      <div className="home-sidebar-container">
        <Sidebar />
      </div>
      <div className="home-content-container">
        <div className="home-header-container">
          <Header />
        </div>
        <div className="home-outlet-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Page;
