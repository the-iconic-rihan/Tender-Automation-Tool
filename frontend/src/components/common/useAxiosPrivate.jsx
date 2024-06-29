import axios from "axios";

import useRefreshToken from "./useRefreshToken";

const URL = `${import.meta.env.VITE_BACKEND_URL}`;

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();

  const accessToken = localStorage.getItem("accessToken");

  const axiosPrivate = axios.create({
    baseURL: URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const requestIntercept = axiosPrivate.interceptors.request.use(
    (config) => {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const responseIntercept = axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const prevRequest = error?.config;
      const message = error.response.data.detail;

      if (
        error.response.status === 401 &&
        message === "Given token not valid for any token type"
      ) {
        try {
          const newAccessToken = await refresh();
          localStorage.setItem("accessToken", newAccessToken);
          prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        } catch (error) {
          localStorage.clear();
          location.replace("/");
        }
      }

      return Promise.reject(error);
    }
  );

  const destroy = () => {
    axiosPrivate.interceptors.request.eject(requestIntercept);
    axiosPrivate.interceptors.response.eject(responseIntercept);
  };

  return { axiosPrivate, destroy };
};

export default useAxiosPrivate;
