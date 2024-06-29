import { useEffect, useState, useContext } from "react";

import Select from "react-select";

import { formatSizeUnits } from "../../../utils/sizeConverter";

import "../../../assets/css/uploadFiles.css";

import fileUpload from "../../../assets/images/file_upload_cloud.svg";
import cross from "../../../assets/images/cross.svg";
import pdf from "../../../assets/images/pdf_logo.svg";
import doc from "../../../assets/images/doc.svg";
import jpeg from "../../../assets/images/jpeg.svg";
import jpg from "../../../assets/images/jpg.svg";
import png from "../../../assets/images/png.svg";
import xls from "../../../assets/images/xls.svg";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Modal from "../../common/Modal";

import {
  appendTenderFile,
  modifyUploadStatus,
  resetQueueAndCount,
  resetTenderFiles,
  setTotalFilesCount,
  updateFileQueueAndCurrFileCount,
  updateFileUploadStatus,
} from "../../../features/upload/UploadSlice";
import { useNavigate } from "react-router-dom";
import { getErrorToast, getInfoToast } from "../../../utils/useToast";
import { nanoid } from "nanoid";
import UploadContext from "../../../utils/UploadContext";
import { useWebSocketContext } from "../../../utils/WebSocketContext";

const options = [
  { value: "tender", label: "Tender" },
  { value: "amendment", label: "Amendment" },
];

const validateFileType = (file) => {
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/vnd.ms-excel" ||
    file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/pdf" ||
    file.type === "application/msword"
    // ||
    // file.type === "image/png" ||
    // file.type === "image/jpeg" ||
    // file.type === "image/jpg"
  ) {
    return true;
  } else {
    getInfoToast(`${file.type} not allowed!!!`, 10000);
    return false;
  }
};

const displayImageType = (type) => {
  switch (type) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return doc;

    case "application/msword":
      return doc;

    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return xls;

    case "application/vnd.ms-excel":
      return xls;

    case "application/pdf":
      return pdf;

    default:
      return pdf;
  }
};

const uploadTenderFile = async (data, token) => {
  const response = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/dashboard/save-file/`,
    data,
    {
      cancelToken: token,
    }
  );

  return response;
};

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setFileStorage } = useContext(UploadContext);
  const { readyState } = useWebSocketContext();

  const upload = useSelector((state) => state.upload);
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!upload.tenderName || readyState !== 1) {
      navigate("/page/dashboard");
      return;
    }
  }, []);

  const fileDropHandler = (e) => {
    e.preventDefault();

    if (!fileType) {
      getErrorToast("Please select a file type from the dropdown!", 3000);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const fileList = files.filter((file) => {
      const existingFile = findFile(file);

      if (existingFile) {
        getErrorToast(
          `You have already selected that file! -: ${existingFile.name}`,
          5000
        );

        return;
      }

      if (validateFileType(file)) {
        file.trackingId = nanoid();
        return file;
      }
    });

    setIsSelected(true);
    setFiles(fileList);
  };

  const fileInputHandler = (e) => {
    if (!fileType) {
      getErrorToast("Please select a file type from the dropdown!", 3000);
      return;
    }

    const files = Array.from(e.target.files);

    const fileList = files.filter((file) => {
      const existingFile = findFile(file);

      if (existingFile) {
        getErrorToast(
          `You have already selected that file! -: ${existingFile.name}`,
          5000
        );

        return;
      }

      if (validateFileType(file)) {
        file.trackingId = nanoid();
        return file;
      }
    });

    setIsSelected(true);
    setFiles(fileList);
  };

  const removeFileHandler = (file) => {
    const newFileList = files.filter((lsFl) => {
      return lsFl.trackingId !== file.trackingId;
    });

    setFiles(newFileList);
  };

  const uploadFilesHandler = () => {
    if (!fileType) {
      getErrorToast("Please select a file type from the dropdown!", 3000);
      return;
    }

    if (files.length === 0) {
      getErrorToast("Please upload files!", 3000);
      return;
    }

    const fileLength = files.length;

    dispatch(resetTenderFiles());
    dispatch(resetQueueAndCount());
    dispatch(setTotalFilesCount(fileLength));

    files.forEach((file) => {
      const formData = new FormData();
      formData.append("files", file, file.name);
      formData.append("tender_name", upload.tenderName);
      formData.append("division", auth.division);
      formData.append("tender_number", upload.tenderNo);
      formData.append("published_date", upload.publishedDate);
      formData.append("uploaded_by", auth.username);
      formData.append("uploaded_date", upload.uploadDate);
      formData.append("file_type", fileType);
      formData.append("total_no_files", files.length);
      localStorage.setItem("file_type", fileType);
      localStorage.setItem("total_no_files", files.length);

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      const id = nanoid();

      dispatch(
        appendTenderFile({
          file_name: file.name,
          tender_name: upload.tenderName,
          uploaded_date: upload.uploadDate,
          uploaded_by: auth.username,
          file_upload_status: "Uploading",
          file_processing_status: "Pending",
          id,
          uploadStatus: 0,
        })
      );

      const contextFileData = {
        file_name: file.name,
        id,
        uploadStatus: 0,
        cancel: source.cancel,
        file,
      };

      setFileStorage((prev) => [...prev, contextFileData]);

      uploadTenderFile(formData, source.token)
        .then((res) => {
          console.log(res);

          dispatch(modifyUploadStatus({ id, status: 1 }));
          dispatch(updateFileQueueAndCurrFileCount({ file_id: res.data._id }));
          dispatch(updateFileUploadStatus(res.data));

          setFileStorage((fs) => fs.filter((file) => file.id !== id));
        })
        .catch((err) => {
          if (err.code !== "ERR_CANCELED") {
            dispatch(modifyUploadStatus({ id, status: 2 }));
          }
        });
    });

    navigate("/page/file-list");
  };

  function findFile(file) {
    return files.find(function (existingFile) {
      return (
        (existingFile.name === file.name && existingFile.type === file.type) ||
        (existingFile.name === file.name &&
          existingFile.lastModified === file.lastModified &&
          existingFile.size === file.size &&
          existingFile.type === file.type)
      );
    });
  }

  return (
    <div className="upload_files-container">
      <div className="uf-heading-container">
        <h3>{upload.isLoading ? "Loading..." : "File upload"}</h3>
        <p>Select relevant tender douments to complete the process</p>
      </div>

      {files.length === 0 && !isSelected ? (
        <>
          <div className="uf-select-container">
            <label>File Type</label>
            <Select
              options={options}
              className="uf-select-component"
              onChange={(e) => setFileType(e.value)}
            />
          </div>
          <div
            onDrop={fileDropHandler}
            onDragOver={(e) => e.preventDefault()}
            className="uf-dnd-container"
          >
            <img src={fileUpload} alt="flie-upload-cloud" />
            <p>Select a file or drag and drop here</p>
            <div className="uf-browse-btn-container">
              <label
                htmlFor="tender-input"
                style={{
                  cursor: !fileType ? "not-allowed" : "pointer",
                }}
                onClick={() => {
                  if (!fileType) {
                    getErrorToast(
                      "Please select a file type from the dropdown!",
                      3000
                    );
                    return;
                  }
                }}
              >
                Browse File
              </label>
              <input
                type="file"
                name="uploadfile"
                id="tender-input"
                style={{
                  display: "none",
                }}
                accept=".pdf, .docx, .doc, .xls, .xlsx"
                onChange={fileInputHandler}
                multiple
                disabled={!fileType}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            onDrop={(e) => {
              e.preventDefault();

              const files = Array.from(e.dataTransfer.files);

              const fileList = files.filter((file) => {
                const existingFile = findFile(file);

                if (existingFile) {
                  getErrorToast(
                    `You have already selected that file! -: ${existingFile.name}`,
                    5000
                  );

                  return;
                }

                if (validateFileType(file)) {
                  file.trackingId = nanoid();
                  return file;
                }
              });

              setFiles((prev) => [...prev, ...fileList]);
              event.target.value = null;
            }}
            onDragOver={(e) => e.preventDefault()}
            className="uf_small-dnd-container"
          >
            <img src={fileUpload} width={50} height={50} alt="" />
            <p>Select a file or drag and drop here</p>
            <label
              htmlFor="uf_small-browse-input"
              className="uf_small-browse-btn"
            >
              Browse File
            </label>
            <input
              type="file"
              name="uploadfile"
              id="uf_small-browse-input"
              style={{
                display: "none",
              }}
              multiple
              // accept=".pdf, .docx"
              accept=".pdf, .docx, .doc, .xls, .xlsx"
              onChange={(e) => {
                console.log(e.target.files);
                const files = Array.from(e.target.files);

                const fileList = files.filter((file) => {
                  const existingFile = findFile(file);

                  if (existingFile) {
                    getErrorToast(
                      `You have already selected that file! -: ${existingFile.name}`,
                      5000
                    );

                    return;
                  }

                  if (validateFileType(file)) {
                    file.trackingId = nanoid();
                    return file;
                  }
                });

                setFiles((prev) => [...prev, ...fileList]);
                event.target.value = null;
              }}
            />
          </div>

          <div className="uf_file_list-contianer">
            <p>
              {files.length <= 0
                ? ""
                : files.length === 1
                  ? "File added"
                  : "Files added"}
            </p>

            <div className="uf_file_list-overflow-container">
              {files.map((file) => {
                return (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="uf_list-file-card"
                  >
                    <img
                      width={40}
                      height={40}
                      src={displayImageType(file.type)}
                      alt="pdf"
                      className="uf_card-pdf-logo"
                    />
                    <div className="uf_file-card-details-container">
                      <p>{file.name}</p>
                      <small>{formatSizeUnits(file.size)}</small>
                    </div>

                    <button
                      onClick={() => removeFileHandler(file)}
                      className="uf_file-card-remove-btn"
                    >
                      <img src={cross} alt="" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="uf_actions-container">
        <p
          style={{
            color: "#a90101",
            fontWeight: "600",
            marginLeft: "24px",
            fontSize: "1.125rem",
            fontFamily: "serif",
          }}
          className="uf_actions-warning"
        >
          Only pdf,xls,xlsx,doc, and docx files are allowed!
        </p>

        <div style={{ display: "flex" }}>
          <button
            className="uf_action-cancel-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Cancel
          </button>
          <button className="uf_action-upload-btn" onClick={uploadFilesHandler}>
            Upload
          </button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>Clicking cancel will not upload the files do you want to leave?</p>
        <div className="unt_modal-btn-container">
          <button onClick={() => setIsModalOpen(false)}>No</button>
          <button onClick={() => navigate("/page/dashboard")}>Yes</button>
        </div>
      </Modal>
    </div>
  );
};

export default UploadFiles;