import axios from "axios";
import { toast } from "react-toastify";

const API_UTIL = axios.create({
  baseURL: process.env.REACT_APP_SERVER_IP,
});

// function AUTHINTERCEPTOR({ children }) {
API_UTIL.interceptors.request.use((config) => {
  // Add headers to outgoing request

  // if (!config.url?.includes("/auth/") && typeof window !== "undefined") {
  //   config.headers.Authorization = window.localStorage.getItem("token");
  // }
  return config;
});

API_UTIL.interceptors.response.use(
  (response) => {
    // Process response
    return response;
  },
  (error) => {
    // Process Errors
    if (error?.response?.status === 700) {
      toast(error?.response?.data?.message);
    } else if (error?.response?.status === 600) {
      toast.warn(error?.response?.data?.message, {
        theme: "colored",
        hideProgressBar: true,
        icon: true,
      });
    } else {
      toast.error(error?.response?.data?.message || error.message, {
        theme: "colored",
        hideProgressBar: true,
        icon: true,
      });
    }
    return Promise.reject(error);
  }
);

export default API_UTIL;
