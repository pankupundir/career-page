import React, { useEffect, useState, useLayoutEffect } from "react";
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
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

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

  const toggleMenuModal = () => {
    setIsMenuModalOpen(!isMenuModalOpen);
  };

  const closeMenuModal = () => {
    setIsMenuModalOpen(false);
  };

  const handleAccountTypeChange = (type) => {
    setActiveAccountType(type);
  };

  const handleLoginOption = (type) => {
    console.log(`Login as ${type}`);
    if (type === 'user') {
      window.location.href = 'http://localhost:5174/';
    } else if (type === 'candidate-login') {
      window.location.href = 'http://localhost:5174/';
    }
  };

  const handleSignupRedirect = () => {
    window.location.href = 'http://localhost:5174/talent-registration';
  };

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

  // Add event listener for menu-icon buttons coming from API
  useEffect(() => {
    const handleMenuIconClick = (event) => {
      if (event.target.classList.contains('menu-icon')) {
        toggleMenuModal();
      }
    };

    // Use event delegation on the document to catch clicks on dynamically added elements
    document.addEventListener('click', handleMenuIconClick);

    return () => {
      document.removeEventListener('click', handleMenuIconClick);
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
        {/* Menu icon button */}
     
      </div>

      {/* Menu Modal */}
      <div id="menu-modal" className={`menu-modal ${isMenuModalOpen ? 'active' : ''}`}>
        <div className="menu-backdrop" onClick={closeMenuModal}></div>
        <div className="menu-content">
          <div className="menu-header">
            <div className="menu-logo">
              {/* Add your logo here */}
            </div>
            <button className="menu-close" onClick={closeMenuModal}>&times;</button>
          </div>
          
          <div className="menu-title-section">
            <h2 className="menu-title">Login</h2>
            <p className="menu-subtitle">To begin, please choose your account type</p>
          </div>
            
          <div className="account-type-section">
            <div className="account-type-tabs">
              <button 
                className={`account-tab ${activeAccountType === 'user' ? 'active' : ''}`} 
                onClick={() => handleAccountTypeChange('user')}
                data-type="user"
              >
                User
              </button>
              <button 
                className={`account-tab ${activeAccountType === 'candidate' ? 'active' : ''}`} 
                onClick={() => handleAccountTypeChange('candidate')}
                data-type="candidate"
              >
                Candidate
              </button>
            </div>
          </div>
            
          {/* User Login Options */}
          <div className="login-form-section" style={{ display: activeAccountType === 'user' ? 'block' : 'none' }}>
            <div className="login-options">
              <div className="login-option">
                <h3>User Login</h3>
                <p>Access your dashboard and manage your account</p>
                <button 
                  className="btn btn-login-option" 
                  onClick={() => handleLoginOption('user')}
                  data-type="user"
                >
                  Login as User
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Login/Signup Options */}
          <div className="login-form-section" style={{ display: activeAccountType === 'candidate' ? 'block' : 'none' }}>
            <div >
              <div className="login-option">
                <h3>Candidate Login</h3>
                <p>Access your candidate dashboard and manage your applications</p>
                <p className="signup-text" onClick={handleSignupRedirect}>
                  Want to sign up?
                </p>
                <button 
                  className="btn btn-login-option" 
                  onClick={() => handleLoginOption('candidate-login')}
                  data-type="candidate-login"
                >
                  Login as Candidate
                </button>
              </div>
            </div>
          </div>
          
          <div className="menu-footer">
            <div className="menu-footer-links">
              <a href="#home" className="footer-link">Home</a>
              <a href="#about" className="footer-link">About Us</a>
              <a href="#careers" className="footer-link">Career</a>
              <a href="#blog" className="footer-link">Blogs</a>
              <a href="#contact" className="footer-link">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
