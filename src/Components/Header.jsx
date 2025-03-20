import React, { useEffect, useState } from "react";
import {
  DEFAULT_TEMPLATE_ID,
  webSiteBuilderInstance,
} from "../config/webBuilder";

const Header = ({ setLoader, loader }) => {
  const [headerSectionData, setHeaderSectionData] = useState("");
  const [isHeaderActive, setIsHeaderActive] = useState(false);

  useEffect(() => {
    webSiteBuilderInstance
      .get(`/api/section/activeTemplateHeader/header`)
      .then((res) => {
        // console.log(res.data);
        setHeaderSectionData(res.data?.data);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (!loader) {
      setTimeout(() => {
        const headerToggle = document.getElementById("header-toggle");
        if (headerToggle) {
          headerToggle.addEventListener("click", () => {
            const body = document.body;
            body.classList.add("header-active");
            setIsHeaderActive(true);
          });
        }
        const jobDetailsButtons = document.querySelectorAll(".job-details-btn");
        if (jobDetailsButtons) {
          jobDetailsButtons.forEach((button) => {
            button.addEventListener("click", () => {
              const jobId = button.getAttribute("data-job-id");
              window.location.href = `/job-details/${jobId}`;
            });
          });
        }
      }, 5000);
    }
  }, [loader]);

  useEffect(() => {
    if (isHeaderActive) {
      const closeMenuHeader = document.getElementById("close-menu-header");
      if (closeMenuHeader) {
        closeMenuHeader.addEventListener("click", () => {
          const body = document.body;
          body.classList.remove("header-active");
          setIsHeaderActive(false);
        });
      }
    }
  }, [isHeaderActive]);

  return (
    <div className={isHeaderActive ? "header-show" : "header-hide"}>
      <style>{headerSectionData["mycustom-css"]}</style>
      <div
        dangerouslySetInnerHTML={{
          __html: headerSectionData["mycustom-html"],
        }}
      />
    </div>
  );
};

export default Header;
