import { useContext } from "react";
import UploadContext from "../../../utils/UploadContext";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadUploadedFiles,
  modifyUploadStatus,
  removeFiles,
  updateFileQueueAndCurrFileCount,
  updateFileUploadStatus,
} from "../../../features/upload/UploadSlice";
import cancel from "../../../assets/images/cancel.svg";
import axios from "axios";
import { getErrorToast, getSuccessToast } from "../../../utils/useToast";

const uploadEnum = {
  uploading: 0,
  uploaded: 1,
  failed: 2,
  cancelled: 3,
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

const FileActions = (data) => {
  return (
    <>
      {data.row.original.uploadStatus === uploadEnum.uploading ? (
        <Cancel file={data.row.original} />
      ) : data.row.original.uploadStatus === uploadEnum.failed ? (
        <Retry fileId={data.row.original.id} />
      ) : (
        <svg
          fill="#186daa"
          width={25}
          height={25}
          viewBox="0 0 0.75 0.75"
          data-name="Flat Color"
          xmlns="http://www.w3.org/2000/svg"
          className="icon flat-color"
        >
          <path
            d="M.313.563A.031.031 0 0 1 .291.554L.135.398A.031.031 0 0 1 .179.354l.134.134.259-.259a.031.031 0 1 1 .044.044L.335.554a.031.031 0 0 1-.022.009Z"
            style={{
              fill: "#186daa",
            }}
          />
        </svg>
      )}
    </>
  );
};

export default FileActions;

const Cancel = ({ file }) => {
  const { fileStorage, setFileStorage } = useContext(UploadContext);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => {
        fileStorage.forEach((currFile) => {
          if (currFile.id === file.id) {
            currFile.cancel("Cancelled by the user");

            setFileStorage((fs) => fs.filter((fl) => fl.id !== file.id));

            dispatch(removeFiles(file.id));
          }
        });
      }}
      style={{
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
      }}
    >
      <img src={cancel} alt="" />
    </button>
  );
};

const Retry = ({ fileId }) => {
  const { fileStorage, setFileStorage } = useContext(UploadContext);
  const dispatch = useDispatch();
  const upload = useSelector((state) => state.upload);
  const auth = useSelector((state) => state.auth);

  return (
    <button
      style={{
        border: "none",
        backgroundColor: "transparent",
      }}
      onClick={() => {
        const file = fileStorage.filter((file) => file.id === fileId)[0];

        if (file) {
          const CancelToken = axios.CancelToken;
          const source = CancelToken.source();
          const fileType = localStorage.getItem("file_type");
          const totalFiles = localStorage.getItem("total_no_files");

          const fData = new FormData();
          fData.append("files", file.file, file.file.name);
          fData.append("tender_name", upload.tenderName);
          fData.append("division", auth.division);
          fData.append("tender_number", upload.tenderNo);
          fData.append("published_date", upload.publishedDate);
          fData.append("uploaded_by", auth.username);
          fData.append("uploaded_date", upload.uploadDate);
          fData.append("file_type", fileType);
          fData.append("total_no_files", totalFiles);

          setFileStorage((currFl) =>
            currFl.map((fl) =>
              fl.id === file.id ? { ...fl, cancel: source.cancel } : { ...fl }
            )
          );

          dispatch(modifyUploadStatus({ id: file.id, status: 0 }));
          uploadTenderFile(fData, source.token)
            .then((res) => {
              dispatch(modifyUploadStatus({ id: file.id, status: 1 }));
              dispatch(
                updateFileQueueAndCurrFileCount({ file_id: res.data._id })
              );
              dispatch(updateFileUploadStatus(res.data));

              setFileStorage((fs) => fs.filter((fl) => fl.id !== file.id));
            })
            .catch((err) => {
              console.log(err);

              if (err.code !== "ERR_CANCELED") {
                dispatch(modifyUploadStatus({ id: file.id, status: 2 }));
              }
            });
        }
      }}
    >
      <svg
        width="17.5px"
        height="17.5px"
        viewBox="0 0 0.35 0.35"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#186daa"
          d="M0.327 0.175h0.002a0.022 0.022 0 0 1 0.02 0.025 0.175 0.175 0 0 1 -0.293 0.103L0.037 0.321A0.021 0.021 0 0 1 0.001 0.306V0.218h0.088c0.02 0 0.03 0.023 0.015 0.037L0.088 0.272A0.131 0.131 0 0 0 0.271 0.267a0.131 0.131 0 0 0 0.035 -0.072 0.022 0.022 0 0 1 0.025 -0.019H0.327ZM0.252 0.018a0.175 0.175 0 0 1 0.043 0.03L0.313 0.029A0.021 0.021 0 0 1 0.35 0.044v0.088H0.264C0.244 0.131 0.233 0.107 0.247 0.095L0.264 0.079a0.131 0.131 0 0 0 -0.219 0.079A0.022 0.022 0 1 1 0 0.153 0.175 0.175 0 0 1 0.25 0.02Z"
        />
      </svg>
    </button>
  );
};

const DownloadIcon = () => (
  <svg
    fill="#186daa"
    width={22}
    height={22}
    viewBox="-0.137 -0.137 0.66 0.66"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMinYMin"
  >
    <path d="m.22.182.031-.03A.027.027 0 0 1 .29.191L.211.269a.027.027 0 0 1-.039 0L.095.191A.027.027 0 1 1 .134.152l.031.031V.027a.027.027 0 1 1 .055 0v.155zM.027.33h.33a.027.027 0 0 1 0 .055h-.33a.027.027 0 0 1 0-.055z" />
  </svg>
);

export const UploadedFileActions = ({ row }) => {
  const dispatch = useDispatch();

  const downloadHandler = () => {
    dispatch(downloadUploadedFiles({
      fileId: row.original._id,
      fileName: row.original.tender_file_name
    })).unwrap().then(() => {
      getSuccessToast('File Downloaded successfully', 1000);
    }).catch(err => {
      if (err.status === 404) {
        getErrorToast('File not found on the server')
      } else getErrorToast('Something went wrong!')
    })
  }


  return (
    <div style={{ display: 'flex', alignItems: "center", justifyContent: 'space-evenly' }} className="up_fl-actions-container">

      <button onClick={downloadHandler} style={{ cursor: 'pointer' }} className="btn-icon">
        <DownloadIcon />
      </button>
    </div>
  )
}

