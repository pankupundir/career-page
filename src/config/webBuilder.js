import axios from "axios";

export const openJobAPI = import.meta.env.VITE_JOB_OPEN_API;

const createAxiosInstance = (baseUrl, contentType) => {
  const instance = axios.create({
    baseURL: baseUrl ? baseUrl : import.meta.env.VITE_WEBSITE_BUILDER,
  });

  instance.interceptors.request.use(
    (config) => {
      if (contentType) {
        config.headers["content-type"] = contentType;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  return instance;
};

// Create two instances with different content-type
export const webSiteBuilderInstance = createAxiosInstance();
export const webSiteBuilderFormInstance = createAxiosInstance(
  openJobAPI,
  "multipart/form-data"
);
export const openAPIBuilderInstance = createAxiosInstance(openJobAPI);
export const DEFAULT_TEMPLATE_ID = "67472e150e56424b96cfcd30";
export const DEFAULT_LADING_PAGE = "home";
