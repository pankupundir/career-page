import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { webSiteBuilderInstance } from "./config/webBuilder";
import WebsiteLoader from "./Components/WebsiteLoader";
import Header from "./Components/Header";

const DynamicPage = () => {
  const { pageName } = useParams();
  const [website, setWebsite] = useState({
    css: "",
    html: "",
    js: "",
  });
  const [htmlContent, setHtmlContent] = useState("");
  const [websiteLoader, setWebsiteLoader] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pageName) {
      fetchPageData();
    }
  }, [pageName]);

  const fetchPageData = async () => {
    try {
      setWebsiteLoader(true);
      setNotFound(false);
      setError(null);

      // Call the API with the page name from URL
      const response = await webSiteBuilderInstance.get(
        `/api/pages/activeTemplatePage/${pageName}`
      );

      console.log("API Response:", response.data);

      // Extract HTML and CSS from response
      let html = response?.data?.data?.html || response?.data?.data?.["mycustom-html"] || "";
      let css = response?.data?.data?.css || response?.data?.data?.["mycustom-css"] || "";
      let js = response?.data?.data?.js || "";

      if (html) {
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        setHtmlContent(doc.body.innerHTML);
      } else {
        setHtmlContent(html);
      }

      setWebsite({
        css: css || "",
        html: html || "",
        js: js || "",
      });

      // Check if data is empty
      if (
        response?.data?.data &&
        Object.keys(response?.data?.data).length === 0
      ) {
        setNotFound(true);
      }

      setWebsiteLoader(false);
    } catch (error) {
      console.error("Error fetching page data:", error);
      setNotFound(true);
      setError(error.response?.data?.message || "Failed to load page");
      setWebsiteLoader(false);
    }
  };

  // Execute JS if available
  useEffect(() => {
    if (website.js && !websiteLoader) {
      try {
        // Create a script element and execute the JS
        const script = document.createElement("script");
        script.textContent = website.js;
        document.body.appendChild(script);
        
        return () => {
          // Cleanup: remove script when component unmounts
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (err) {
        console.error("Error executing page JS:", err);
      }
    }
  }, [website.js, websiteLoader]);

  if (websiteLoader) {
    return <WebsiteLoader />;
  }

  if (notFound) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Page Not Found</h1>
        <p>
          {error || `The page "${pageName}" could not be found.`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header setLoader={setWebsiteLoader} />
      <style>{website.css}</style>
      <style>{website["mycustom-css"]}</style>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default DynamicPage;

