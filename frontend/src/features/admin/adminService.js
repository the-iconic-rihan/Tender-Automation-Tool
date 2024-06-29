import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/adminDashboard`;

const getTotalData = async (data) => {
  const response = await axios.post(`${API_URL}/fetch-todays-data/`, data);

  return response.data;
};

const getUsersTenderData = async (data) => {
  const response = await axios.post(`${API_URL}/fetch-dashboard/`, data);

  return response.data;
};

const getAverageProcessingTime = async () => {
  const response = await axios.get(`${API_URL}/avg-time/`);

  const responseData = await response.data.map((t) => {
    return {
      ...t,
      average_time: t.average_time.toFixed(2),
    };
  });

  return responseData;
};

const adminService = {
  getTotalData,
  getUsersTenderData,
  getAverageProcessingTime,
};

export default adminService;
