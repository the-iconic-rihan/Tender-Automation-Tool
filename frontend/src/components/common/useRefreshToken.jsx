import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

const useRefreshToken = () => {
  const refreshToken = localStorage.getItem("refreshToken");

  const refershToken = async () => {
    const response = await axios.post(`${API_URL}/token/refresh/`, {
      refresh: refreshToken,
    });
    localStorage.setItem("accessToken", response.data.access);

    return await response.data.access;
  };

  return refershToken;
};

export default useRefreshToken;
