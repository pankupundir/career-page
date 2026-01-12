import { useState, useEffect } from 'react';
import {
  COOKIE_CATEGORIES,
  getConsentPreferences,
  saveConsentPreferences,
  hasConsentBeenGiven,
  applyConsentPreferences,
  getUserCookieData
} from '../utils/cookieHelper';
import './CookieConsent.css';

const CookieConsent = () => {
  const [showModal, setShowModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    functional: false,
    analytics: false,
    marketing: false
  });
  const [showUserData, setShowUserData] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showMoreText, setShowMoreText] = useState(false);

  useEffect(() => {
    // Check if consent has been given
    const hasConsent = hasConsentBeenGiven();
    
    if (!hasConsent) {
      // Show modal after a short delay if no consent given
      setTimeout(() => {
        setShowModal(true);
      }, 1000);
    } else {
      // Load existing preferences
      const savedPreferences = getConsentPreferences();
      if (savedPreferences) {
        setPreferences(savedPreferences);
        applyConsentPreferences(savedPreferences);
      }
    }
    
    // Always show floating button
    setShowFloatingButton(true);
  }, []);

  const toggleCategory = (categoryId) => {
    // Necessary cookies cannot be toggled
    if (categoryId === 'necessary') return;
    
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    if (categoryId === 'necessary') return; // Cannot disable necessary
    
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    applyConsentPreferences(allAccepted);
    setShowModal(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setPreferences(onlyNecessary);
    applyConsentPreferences(onlyNecessary);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    applyConsentPreferences(preferences);
    setShowModal(false);
  };

  const handleShowUserData = () => {
    const data = getUserCookieData();
    setUserData(data);
    setShowUserData(true);
  };

  // Update user data when modal opens or preferences change
  useEffect(() => {
    if (showModal) {
      const data = getUserCookieData();
      setUserData(data);
      setShowUserData(true);
    }
  }, [showModal, preferences]);

  const handleCloseModal = () => {
    // Only allow closing if consent has been given
    if (hasConsentBeenGiven()) {
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {showFloatingButton && (
        <button
          className="cookie-floating-button"
          onClick={() => {
            handleShowUserData();
            setShowModal(true);
          }}
          aria-label="Manage cookie preferences"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
          <span className="cookie-floating-button-text">Cookies</span>
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="cookie-modal-overlay" onClick={handleCloseModal}>
          <div className="cookie-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="cookie-modal-header">
              <h2 className="cookie-modal-title">Customise Consent Preferences</h2>
              <button
                className="cookie-modal-close"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="cookie-modal-body">
              <div className="cookie-intro-text">
                <p>
                  We use cookies to help you navigate efficiently and perform certain functions.
                  You will find detailed information about all cookies under each consent category below.
                  {!showMoreText && (
                    <span> </span>
                  )}
                  {showMoreText && (
                    <span className="cookie-more-text">
                      The cookies that are categorised as "Necessary" are stored on your browser as
                      they are essential for enabling the basic functionalities of the site.{' '}
                    </span>
                  )}
                  <button 
                    className="cookie-show-more-link" 
                    onClick={() => setShowMoreText(!showMoreText)}
                  >
                    {showMoreText ? 'Show less' : 'Show more'}
                  </button>
                </p>
              </div>

              {/* User Data Section */}
              {showUserData && userData && (
                <div className="cookie-user-data-section">
                  <h3>Your Cookie Data</h3>
                  <div className="cookie-user-data-grid">
                    <div className="cookie-data-item">
                      <strong>Total Cookies:</strong> {userData.totalCookies}
                    </div>
                    <div className="cookie-data-item">
                      <strong>Consent Given:</strong>{' '}
                      {userData.consentGivenAt
                        ? new Date(userData.consentGivenAt).toLocaleString()
                        : 'Not yet'}
                    </div>
                  </div>
                  <details className="cookie-data-details">
                    <summary>View All Cookies ({userData.totalCookies})</summary>
                    <div className="cookie-list">
                      {Object.entries(userData.cookies).map(([name, value]) => (
                        <div key={name} className="cookie-item">
                          <strong>{name}:</strong>{' '}
                          <span className="cookie-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Cookie Categories */}
              <div className="cookie-categories">
                {Object.keys(COOKIE_CATEGORIES).map((key) => {
                  const category = COOKIE_CATEGORIES[key];
                  const isExpanded = expandedCategories[category.id];
                  const isActive = preferences[category.id];

                  return (
                    <div
                      key={category.id}
                      className={`cookie-category ${isActive ? 'active' : ''}`}
                    >
                      <div
                        className="cookie-category-header"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="cookie-category-title-wrapper">
                          <span
                            className={`cookie-category-chevron ${
                              isExpanded ? 'expanded' : ''
                            }`}
                          >
                            ›
                          </span>
                          <span className="cookie-category-name">{category.name}</span>
                          {category.alwaysActive && (
                            <span className="cookie-always-active">Always Active</span>
                          )}
                        </div>
                        {!category.alwaysActive && (
                          <label className="cookie-toggle-switch">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleCategoryToggle(category.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="cookie-slider"></span>
                          </label>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="cookie-category-content">
                          <p className="cookie-category-description">
                            {category.description}
                          </p>
                          <div className="cookie-list-detail">
                            <strong>Cookies in this category:</strong>
                            <ul>
                              {category.cookies.map((cookie, idx) => (
                                <li key={idx}>
                                  <strong>{cookie.name}</strong> - {cookie.purpose} (Expires:
                                  {cookie.expiry})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="cookie-modal-footer">
              <button
                className="cookie-btn cookie-btn-reject"
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button
                className="cookie-btn cookie-btn-save"
                onClick={handleSavePreferences}
              >
                Save My Preferences
              </button>
              <button
                className="cookie-btn cookie-btn-accept"
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>

            <div className="cookie-modal-powered-by">
              Powered by <span className="cookie-powered-by-logo">CookieYes</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;

