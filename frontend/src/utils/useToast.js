import { toast, Slide } from "react-toastify";

export const getSuccessToast = (
  message = "Success",
  time = 2000,
  theme = "colored"
) => {
  toast.dismiss();
  return toast.success(message, {
    position: "top-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
    transition: Slide,
  });
};

export const getErrorToast = (
  message = "Error",
  time = 2000,
  theme = "colored"
) => {
  toast.dismiss();
  return toast.error(message, {
    position: "top-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
    transition: Slide,
  });
};

export const getWarnToast = (
  message = "Warning",
  time = 2000,
  theme = "colored"
) => {
  toast.dismiss();
  return toast.warn(message, {
    position: "top-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
    transition: Slide,
  });
};

export const getInfoToast = (
  message = "Information",
  time = 2000,
  theme = "colored"
) => {
  toast.dismiss();
  return toast.info(message, {
    position: "top-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
    transition: Slide,
  });
};
