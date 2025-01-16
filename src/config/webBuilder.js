import axios from "axios";

export const openJobAPI = import.meta.env.VITE_JOB_OPEN_API;
export const openJobServerAPI = import.meta.env.VITE_JOB_OPEN_SERVER_API;

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
export const updatedURLInstance = createAxiosInstance(openJobServerAPI);
export const DEFAULT_TEMPLATE_ID = "677e9e61d9e434ab98544ca8";
export const DEFAULT_LADING_PAGE = "Homepage";
export const GOOGLE_MAP_API_KEY = 'AIzaSyDRb_BGMWY3XocACa_K976a0g6y-5QwkqU';
