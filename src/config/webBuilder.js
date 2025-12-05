import axios from "axios";

export const openJobAPI = import.meta.env.VITE_JOB_OPEN_API;

const createAxiosInstance = (baseUrl, contentType) => {
  const instance = axios.create({
    baseURL: baseUrl ? baseUrl : import.meta.env.VITE_WEBSITE_BUILDER,
    withCredentials: true, // Enable sending cookies/session with cross-origin requests
    headers: {
      'Accept': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      // Set Content-Type if provided (for POST, PUT, PATCH requests with body)
      // GET requests don't need Content-Type, axios will handle it
      if (contentType) {
        config.headers["content-type"] = contentType;
      }
      // Ensure withCredentials is set for all requests (needed for CORS with cookies)
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle CORS and session errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle CORS errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        console.error('CORS Error:', error.message);
        console.error('Make sure the backend allows CORS requests from this origin');
      }
      // Handle session/authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Session/Authentication Error:', error.response?.status);
        console.error('Response:', error.response?.data);
      }
      return Promise.reject(error);
    }
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
export const updatedURLInstance = createAxiosInstance(openJobAPI);
export const DEFAULT_TEMPLATE_ID = "677e9e61d9e434ab98544ca8";
export const DEFAULT_LADING_PAGE = "Homepage";
export const GOOGLE_MAP_API_KEY = 'AIzaSyDRb_BGMWY3XocACa_K976a0g6y-5QwkqU';
