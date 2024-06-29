import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/dashboard`;

const downloadFileHelper = (data, tenderN, fileN, type) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([data]));
  link.download = `${tenderN}_${fileN}.${type}`;

  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 7000);
};

const downloadPDF = async ({ fileId, fileName, tenderName }) => {
  const data = new FormData();
  data.append("file_id", fileId);

  const config = {
    method: "post",
    url: `${API_URL}/download-category/`,
    headers: {
      "content-type": "multipart/form-data",
    },
    responseType: "blob",
    data: data,
  };

  const response = await axios(config);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([response.data]));
  link.download = `${tenderName}_${fileName}.pdf`;

  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 7000);

  response.status === 200
    ? {
      message: "File downloaded successfully",
    }
    : response;
};

const downloadDOCX = async ({ fileId, fileName, tenderName }) => {
  const data = new FormData();
  data.append("file_id", fileId);

  const config = {
    method: "post",
    url: `${API_URL}/download-parameter/`,
    headers: {
      "content-type": "multipart/form-data",
    },
    responseType: "blob",
    data: data,
  };

  const response = await axios(config);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([response.data]));
  link.download = `${tenderName}_${fileName}.docx`;

  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 7000);

  response.status === 200
    ? {
      message: "File downloaded successfully",
      status: 200,
    }
    : response;
};

const downloadXLSX = async ({ fileId, fileName, tenderName }) => {
  const data = new FormData();
  data.append("file_id", fileId);

  const config = {
    method: "post",
    url: `${API_URL}/download-xlsx-parameter/`,
    headers: {
      "content-type": "multipart/form-data",
    },
    responseType: "blob",
    data: data,
  };

  const response = await axios(config);

  downloadFileHelper(response.data, tenderName, fileName, "xlsx");

  response.status === 200
    ? {
      message: "File downloaded successfully",
    }
    : response;
};

const downloadCumulativeFile = async ({ fileId, tenderName }) => {
  const data = new FormData();
  data.append("file_id", fileId);

  const config = {
    method: "post",
    url: `${API_URL}/cummulative-wise-download-view/`,
    headers: {
      "content-type": "multipart/form-data",
    },
    responseType: "blob",
    data: data,
  };

  const response = await axios(config);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([response.data]));
  link.download = `${tenderName}_Cumulitive_Summary.docx`;

  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 7000);

  response.status === 200
    ? {
      message: "File downloaded successfully",
      status: 200,
    }
    : response;
};

const fetchCumulitiveId = async (data) => {
  const response = await axios.post(`${API_URL}/merge-docx-view/`, data);

  return response.data;
}

const categoryService = {
  downloadPDF,
  downloadDOCX,
  downloadXLSX,
  downloadCumulativeFile,
  fetchCumulitiveId
};

export default categoryService;
