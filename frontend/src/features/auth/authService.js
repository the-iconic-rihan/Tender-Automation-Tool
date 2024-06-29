import axios from "axios";
import useAxiosPrivate from "../../components/common/useAxiosPrivate";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login/`, userData);

  return response.data;
};

const resetPassword = async (userData) => {
  const response = await axios.post(`${API_URL}/reset-password/`, userData);

  return response.data;
};

const logout = async () => {
  const { axiosPrivate, destroy } = useAxiosPrivate();

  const response = await axiosPrivate.post(`${API_URL}/logout/`);

  destroy();
  return response.data;
};

const forgotPassword = async (data) => {
  const response = await axios.post(`${API_URL}/forgot-password/`, data);

  return response.data;
};

const confirmPassword = async (reqData) => {
  const response = await axios.post(
    `${API_URL}/password/reset/confirm/${reqData.uid}/${reqData.token}/`,
    reqData.data
  );

  return response.data;
};

const verifyDivision = async (reqData) => {
  const response = await axios.post(
    `
  ${API_URL}/verify-division/`,
    reqData
  );

  return response.data;
};

const authService = {
  login,
  resetPassword,
  logout,
  forgotPassword,
  confirmPassword,
  verifyDivision,
};

export default authService;
