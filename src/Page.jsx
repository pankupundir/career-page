import React, { useEffect, useState } from "react";
import webSiteBuilderInstance from "./config/webBuilder";
import { useParams } from "react-router-dom";
import NoPageFound from "./NoPageFound";
import ScreenLoader from "./ScreenLoader";

const Page = () => {
  const [website, setWebsite] = useState({
    css: "",
    html: "",
    js: "",
  });
  const [notFound, setNotFound] = useState(false);
  const [loader, setLoader] = useState(true);
  let { pageId } = useParams();

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        if (!pageId) {
          const data = await webSiteBuilderInstance.get("/api/pages");
          console.log(data.data, "pageList");
          const pageList = data?.data?.pages || [];
          const homePage = pageList.find((pg) => pg.isHomePage);
          if (homePage) {
            pageId = homePage.name;
          } else if (pageList.length > 0) {
            pageList.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            pageId = pageList[0].name;
          } else {
            setNotFound(true);
            console.log("no page found");
          }
        }
        const response = await webSiteBuilderInstance.get(
          `/api/pages/${pageId}/content`
        );
        setWebsite(response?.data?.data);
        if (
          response?.data?.data &&
          Object.keys(response?.data?.data).length === 0
        ) {
          setNotFound(true);
        }
        setLoader(false);
      } catch (error) {
        setNotFound(true);
        setLoader(false);
        console.error("Error fetching website data:", error);
      }
    };

    fetchWebsite();
  }, []);

  return (
    <div>
      {loader ? (
        <ScreenLoader />
      ) : (
        <>
          {notFound ? (
            <NoPageFound />
          ) : (
            <>
              <style>{website.css}</style>
              <style>{website["mycustom-css"]}</style>
              <div
                dangerouslySetInnerHTML={{ __html: website["mycustom-html"] }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
