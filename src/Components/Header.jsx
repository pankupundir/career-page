import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  DEFAULT_TEMPLATE_ID,
  webSiteBuilderInstance,
} from "../config/webBuilder";
import "./style.css";

const Header = ({ setLoader, loader }) => {
  const [headerSectionData, setHeaderSectionData] = useState("");
  const [isHeaderActive, setIsHeaderActive] = useState(false);

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

  // Set up drawer functions for API HTML drawer (coming from API)
  useEffect(() => {
    // Implement drawer functions based on the API HTML structure
    window.openHeaderDrawer = () => {
      const overlay = document.getElementById('headerDrawerOverlay');
      const drawer = document.getElementById('headerDrawer');
      if (overlay && drawer) {
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    };
    
    window.closeHeaderDrawer = () => {
      const overlay = document.getElementById('headerDrawerOverlay');
      const drawer = document.getElementById('headerDrawer');
      if (overlay && drawer) {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
    
    window.switchDrawerTab = (tab) => {
      const tabs = document.querySelectorAll('.header-drawer-tab');
      const contents = document.querySelectorAll('.header-drawer-tab-content');
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      if (tab === 'user') {
        if (tabs[0]) tabs[0].classList.add('active');
        const userTab = document.getElementById('drawerTabUser');
        if (userTab) userTab.classList.add('active');
      } else {
        if (tabs[1]) tabs[1].classList.add('active');
        const candidateTab = document.getElementById('drawerTabCandidate');
        if (candidateTab) candidateTab.classList.add('active');
      }
    };
    
    // Close drawer on ESC key
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && window.closeHeaderDrawer) {
        window.closeHeaderDrawer();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      // Clean up global functions
      delete window.openHeaderDrawer;
      delete window.closeHeaderDrawer;
      delete window.switchDrawerTab;
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <>
      <div className={true ? "header-show" : "header-hide"}>
        <style>{headerSectionData["mycustom-css"]}</style>
        <div
          dangerouslySetInnerHTML={{
            __html: headerSectionData["mycustom-html"],
          }}
        />
      </div>
    </>
  );
};

export default Header;
