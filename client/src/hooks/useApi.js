import API_UTIL from "@/services/ApiUtil";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";

export const useApi = (url, options, callOnInit = true) => {
  const [response, setResponse] = useState();
  const isDataFetched = useRef(false);

  const callApi = async (urlOverride, optionsOverride) => {
    try {
      const res = await API_UTIL(
        urlOverride || url,
        optionsOverride || options
      );
      setResponse(res);
    } catch (error) {}
  };

  useEffect(() => {
    if (callOnInit) {
      if (isDataFetched.current) return;
      isDataFetched.current = true;
      callApi();
    }
  }, []);

  return [response, callApi];
};
