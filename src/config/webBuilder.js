import axios from 'axios';

const baseURL = import.meta.env.VITE_WEBSITE_BUILDER;

console.log(baseURL, "baseURLLL");

const webSiteBuilderInstance = axios.create({
  baseURL,
});

export default webSiteBuilderInstance;
