import axios from "axios";
import { formattedDate, getTimeDifference } from "../../utils/dateFormats";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/dashboard`;

const getTenderFiles = async (division) => {
  const data = new FormData();

  data.append("division", division);

  const response = await axios.post(`${API_URL}/fetch-metadata/`, data);

  const formattedData = await response.data.map((tender) => {
    return {
      ...tender,
      published_date: formattedDate(tender.published_date),
      uploaded_date: formattedDate(tender.uploaded_date),
      processing_time: getTimeDifference(tender.uploaded_date_time, tender.updated_date_and_time)
    };
  });

  return formattedData;
};

const fetchRecentTenderFiles = async (division) => {
  const data = new FormData();

  data.append("division", division);

  const response = await axios.post(`${API_URL}/fetch-metadata/`, data);

  const result = response.data;

  if (result.length <= 5) {
    return {
      data: result.reverse(),
      length: result.length,
    };
  } else {
    return {
      data: result.slice(-5).reverse(),
      length: result.length,
    };
  }
};

const filterTenders = async (data) => {
  const response = await axios.post(`${API_URL}/search-tender/`, data);

  return response.data;
};

const fetchProcessedPagesData = async (division) => {
  const data = new FormData();

  data.append("division", division);

  const response = await axios.post(`${API_URL}/page-count/`, data);

  return response.data;
};

const markTenderFailed = async data => {
  const response = await axios.post(`${API_URL}/tender-fail/`, data);

  return response.data;
}

const dashboardService = {
  getTenderFiles,
  filterTenders,
  fetchRecentTenderFiles,
  fetchProcessedPagesData,
  markTenderFailed
};

export default dashboardService;
