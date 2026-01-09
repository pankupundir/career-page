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

  // Handle Team link click to scroll to people section
  useEffect(() => {
    if (!headerSectionData["mycustom-html"]) return;

    // Function to scroll to people section with retries
    const scrollToPeopleSection = (retryCount = 0) => {
      // Try multiple selectors to find the people section
      let peopleSection = document.querySelector('.people-grid-inner');
      
      if (!peopleSection) {
        // Try querying by attribute containing the class name
        const allDivs = document.querySelectorAll('div[class*="people-grid-inner"]');
        if (allDivs.length > 0) {
          peopleSection = allDivs[0];
        }
      }
      
      if (!peopleSection) {
        // Try to find any element with "people-grid-inner" in its class list
        const allElements = document.querySelectorAll('*');
        for (let elem of allElements) {
          if (elem.className && typeof elem.className === 'string' && 
              elem.className.includes('people-grid-inner')) {
            peopleSection = elem;
            break;
          }
        }
      }
      
      if (peopleSection) {
        // Scroll to the people section smoothly
        peopleSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        console.log('✓ Scrolled to people section successfully');
      } else if (retryCount < 5) {
        // Retry after delay if element not found (DOM might still be loading)
        console.log(`Retrying to find people section (attempt ${retryCount + 1})...`);
        setTimeout(() => scrollToPeopleSection(retryCount + 1), 400);
      } else {
        console.warn('✗ People section not found after multiple attempts. Looking for class: people-grid-inner');
      }
    };

    // Handler for Team link clicks using event delegation with capture phase
    const handleTeamLinkClick = (e) => {
      // Find the closest header-drawer-link element
      const teamLink = e.target.closest('.header-drawer-link');
      
      if (!teamLink) return;
      
      // Check if this is the Team link
      const linkText = teamLink.textContent.trim();
      const linkHref = teamLink.getAttribute('href');
      const isTeamLink = linkText === 'Team' && (linkHref === '#' || linkHref === null);
      
      if (isTeamLink) {
        e.preventDefault();
        e.stopImmediatePropagation(); // Stop all other handlers including inline onclick
        
        // Close the drawer first
        if (window.closeHeaderDrawer) {
          window.closeHeaderDrawer();
        }
        
        // Wait for drawer to close before scrolling
        setTimeout(() => scrollToPeopleSection(), 500);
      }
    };

    // Also setup direct handler on Team link after DOM is ready
    const setupDirectHandler = () => {
      const drawerLinks = document.querySelectorAll('.header-drawer-link');
      drawerLinks.forEach((link) => {
        const linkText = link.textContent.trim();
        const linkHref = link.getAttribute('href');
        const isTeamLink = linkText === 'Team' && (linkHref === '#' || linkHref === null);
        
        if (isTeamLink && !link.hasAttribute('data-team-handler-attached')) {
          // Remove inline onclick to prevent conflicts
          link.removeAttribute('onclick');
          link.setAttribute('data-team-handler-attached', 'true');
          
          link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (window.closeHeaderDrawer) {
              window.closeHeaderDrawer();
            }
            
            setTimeout(() => scrollToPeopleSection(), 500);
          }, true);
        }
      });
    };

    // Setup with multiple attempts
    const timeoutId1 = setTimeout(setupDirectHandler, 100);
    const timeoutId2 = setTimeout(setupDirectHandler, 500);
    setupDirectHandler();

    // Use event delegation with capture phase to catch before inline handlers
    document.addEventListener('click', handleTeamLinkClick, true);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      document.removeEventListener('click', handleTeamLinkClick, true);
    };
  }, [headerSectionData]);

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
