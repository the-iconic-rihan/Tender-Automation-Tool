import axios from "axios";
import { formatDateFromDateString } from "../../utils/dateFormats";
import { findFileExtFromContentType } from "../../utils/findFileExtFromContentType";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/dashboard`;

const downLoadUploadedFileHelper = (data, fileName, type) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([data]));
  link.download = `${fileName}.${type}`;

  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 7000);
}

const addTenderMetaData = async (data) => {
  const response = await axios.post(`${API_URL}/add-metadata/`, data);

  return response.data;
};

const uploadTenderFiles = async (promises) => {
  const results = await Promise.all(promises);

  return {
    success: true,
    results,
  };
};

const fetchListFiles = async (data) => {
  const response = await axios.post(`${API_URL}/list-tender/`, data);

  const formattedData = await response.data.map((file) => {
    return {
      ...file,
      uploaded_date: formatDateFromDateString(file.uploaded_date),
    };
  });

  return formattedData;
};

const deleteFile = async (data) => {
  const response = await axios.post(`${API_URL}/delete-file/`, data);

  return response.data;
};

const downloadUploadedFiles = async ({ fileId, fileName }) => {
  const data = new FormData();
  data.append("file_id", fileId);

  const config = {
    method: "post",
    url: `${API_URL}/download-uploaded-files/`,
    headers: {
      "content-type": "multipart/form-data",
    },
    responseType: "blob",
    data: data,
  };

  const response = await axios(config);

  downLoadUploadedFileHelper(response.data, fileName, findFileExtFromContentType(response.headers['content-type']))

  response.status === 200
    ? {
      message: "File downloaded successfully",
    }
    : response;
}

const uploadService = {
  addTenderMetaData,
  uploadTenderFiles,
  deleteFile,
  fetchListFiles,
  downloadUploadedFiles
};

export default uploadService;
