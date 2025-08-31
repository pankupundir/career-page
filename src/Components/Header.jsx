import React, { useEffect, useState } from "react";
import {
  DEFAULT_TEMPLATE_ID,
  webSiteBuilderInstance,
} from "../config/webBuilder";
import "./style.css";

const Header = ({ setLoader, loader }) => {
  const [headerSectionData, setHeaderSectionData] = useState("");
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const [activeAccountType, setActiveAccountType] = useState("user");
  const [candidateFormType, setCandidateFormType] = useState("login");

  useEffect(() => {
    webSiteBuilderInstance
      .get(`/api/section/${DEFAULT_TEMPLATE_ID}/header/content`)
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

        // Simple menu icon click handler
        const menuIconElements = document.querySelectorAll(".menu-icon");
        console.log(menuIconElements, "menuIconElements");
        menuIconElements.forEach((element) => {
          element.addEventListener("click", () => {
            const menuModal = document.getElementById("menu-modal");
            console.log(menuModal, "menuModal");
            if (menuModal) {
              menuModal.classList.add("active");
              menuModal.style.width = "100%";
            }
          });
        });

        // Close menu modal when clicking on menu-close
        const menuClose = document.getElementById("menu-close");
        if (menuClose) {
          menuClose.addEventListener("click", () => {
            const menuModal = document.getElementById("menu-modal");
            if (menuModal) {
              menuModal.classList.remove("active");
            }
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

        // Account type tab functionality
        const accountTabs = document.querySelectorAll(".account-tab");
        accountTabs.forEach((tab) => {
          tab.addEventListener("click", () => {
            const accountType = tab.getAttribute("data-type");
            
            // Remove active class from all tabs
            accountTabs.forEach((t) => t.classList.remove("active"));
            
            // Add active class to clicked tab
            tab.classList.add("active");
            
            // Update state
            setActiveAccountType(accountType);
            
            // Show/hide appropriate forms
            const userForm = document.getElementById("user-form");
            const candidateForm = document.getElementById("candidate-form");
            
            if (accountType === "user") {
              if (userForm) userForm.style.display = "block";
              if (candidateForm) candidateForm.style.display = "none";
            } else if (accountType === "candidate") {
              if (userForm) userForm.style.display = "none";
              if (candidateForm) candidateForm.style.display = "block";
            }
          });
        });

        // Login option button functionality
        const loginOptionButtons = document.querySelectorAll(".btn-login-option");
        loginOptionButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const buttonType = button.getAttribute("data-type");
            
            if (buttonType === "user") {
              // Redirect to user login page
              window.location.href = "http://localhost:5174/";
            } else if (buttonType === "candidate-login") {
              // Redirect to candidate login page
              window.location.href = "http://localhost:5174/";
            }
          });
        });

        // Signup text functionality
        const signupTexts = document.querySelectorAll(".signup-text");
        signupTexts.forEach((text) => {
          text.addEventListener("click", () => {
            // Redirect to talent registration page
            window.location.href = "http://localhost:5174/talent-registration";
          });
        });

   

      }, 5000);
    }
  }, [loader, activeAccountType, candidateFormType]);

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
