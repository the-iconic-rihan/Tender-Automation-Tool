import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteFile,
  updateFileUploadStatus,
} from "../../../features/upload/UploadSlice";
import Modal from "../../common/Modal";

const DeleteButton = (data) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const upload = useSelector((state) => state.upload);
  const dispatch = useDispatch();

  const deleteHandler = () => {
    if (data.row.original.file_upload_status.toLowerCase() === "uploading") {
      data.row.original.cancelToken.cancel("File upload canceled by the user.");

      dispatch(
        updateFileUploadStatus({
          ...data.row.original,
          file_upload_status: "Cancelled",
        })
      );
    } else {
      const formData = new FormData();
      formData.append("file_id", data.row.original._id);

      dispatch(deleteFile(formData))
        .unwrap()
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  };

  return (
    <>
      <button
        className="delete_bin-btn"
        style={{
          background: "transparent",
          border: "none",
        }}
        onClick={() => setIsModalOpen(true)}
        disabled={
          data.row.original.file_processing_status.toLowerCase() ===
            "processing" ||
          (data.row.original.file_processing_status.toLowerCase() ===
            "succeeded" &&
            upload.isUploading)
        }
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 0.6 0.6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.192 0.218H0.125v-0.014h0.121m-0.054 0.014V0.475h0.215V0.218m-0.215 0h0.215m0 0H0.475v-0.014h-0.121m-0.108 0V0.15h0.108v0.054m-0.108 0h0.108"
            stroke="#186daa"
            strokeWidth={0.037500000000000006}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0.25 0.275v0.15"
            stroke="#186daa"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.025}
          />
          <path
            d="M0.3 0.275v0.15"
            stroke="#186daa"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.025}
          />
          <path
            d="M0.35 0.275v0.15"
            stroke="#186daa"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.025}
          />
        </svg>
      </button>
      <Modal
        style={{
          width: "500px",
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <p
          style={{
            textAlign: "left",
            fontSize: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          Do you really want to delete this file?
        </p>
        <div className="unt_modal-btn-container">
          <button onClick={() => setIsModalOpen(false)}>No</button>
          <button onClick={() => deleteHandler()}>Yes</button>
        </div>
      </Modal>
    </>
  );
};

export default DeleteButton;
