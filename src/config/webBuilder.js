import axios from "axios";

export const openJobAPI = import.meta.env.VITE_JOB_OPEN_API;
export const websiteBuilderURL = import.meta.env.VITE_WEBSITE_BUILDER;

// Validate environment variables
if (!openJobAPI) {
  console.warn('VITE_JOB_OPEN_API is not set. API calls may fail.');
}
if (!websiteBuilderURL) {
  console.warn('VITE_WEBSITE_BUILDER is not set. Website builder API calls may fail.');
}

const createAxiosInstance = (baseUrl, contentType) => {
  // Use provided baseUrl or fallback to website builder URL
  const finalBaseURL = baseUrl || websiteBuilderURL;
  
  // Log the base URL being used (without sensitive data)
  if (finalBaseURL) {
    console.log('Creating axios instance with baseURL:', finalBaseURL);
  } else {
    console.error('No baseURL provided for axios instance. This will cause API calls to fail.');
  }
  
  const instance = axios.create({
    baseURL: finalBaseURL,
    withCredentials: true, // Enable sending cookies/session with cross-origin requests
    headers: {
      'Accept': 'application/json',
    },
    timeout: 30000, // 30 second timeout
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
      // Log full error details for debugging
      console.error('API Error Details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
        responseData: error.response?.data
      });
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('Network Error:', error.message);
        console.error('This could be due to:');
        console.error('1. API server is down or unreachable');
        console.error('2. CORS configuration issue');
        console.error('3. Incorrect API base URL');
        console.error('Base URL used:', error.config?.baseURL);
      }
      
      // Handle CORS errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        console.error('CORS Error:', error.message);
        console.error('Make sure the backend allows CORS requests from this origin');
        console.error('Origin:', window.location.origin);
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('Request Timeout:', error.message);
        console.error('The API request took too long to respond');
      }
      
      // Handle session/authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Session/Authentication Error:', error.response?.status);
        console.error('Response:', error.response?.data);
      }
      
      // Handle 404 errors
      if (error.response?.status === 404) {
        console.error('API Endpoint Not Found (404)');
        console.error('URL:', error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url);
      }
      
      // Handle 500+ errors
      if (error.response?.status >= 500) {
        console.error('Server Error:', error.response?.status);
        console.error('The API server encountered an error');
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
