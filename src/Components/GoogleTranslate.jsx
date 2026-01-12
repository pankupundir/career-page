import { useEffect, useState } from 'react';
import { getStoredLangInfo, getTargetLanguage, needsTranslation } from '../utils/languageHelper';

const GoogleTranslate = () => {
  const [targetLang, setTargetLang] = useState('en');

  useEffect(() => {
    // Inject CSS to hide Google Translate UI elements
    const hideGoogleTranslateUI = () => {
      // Create style element if it doesn't exist
      let styleElement = document.getElementById('hide-google-translate-ui');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'hide-google-translate-ui';
        styleElement.textContent = `
          /* Hide Google Translate Banner - Comprehensive Rules */
          .goog-te-banner-frame,
          .goog-te-banner-frame.skiptranslate,
          .skiptranslate,
          #google_translate_element,
          .goog-te-balloon-frame,
          .goog-te-menu-frame,
          .goog-te-menu-value,
          .goog-te-menu2,
          iframe[src*="translate.googleapis.com"],
          iframe.goog-te-banner-frame,
          iframe.goog-te-menu-frame {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            opacity: 0 !important;
            z-index: -9999 !important;
            pointer-events: none !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          
          /* Hide the banner that appears at top */
          .goog-te-banner-frame {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            opacity: 0 !important;
            top: -9999px !important;
            left: -9999px !important;
          }
          
          /* Hide iframe */
          iframe.goog-te-banner-frame,
          iframe.goog-te-menu-frame,
          iframe[src*="translate.googleapis.com"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            opacity: 0 !important;
            top: -9999px !important;
            left: -9999px !important;
          }
          
          /* Remove top margin/padding that Google Translate adds */
          body {
            top: 0 !important;
            position: static !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          
          /* Hide the Google Translate select dropdown if visible */
          .goog-te-combo,
          .goog-te-gadget,
          .goog-te-gadget-simple {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            top: -9999px !important;
            left: -9999px !important;
          }
          
          /* Hide any divs with Google Translate classes */
          div[id*="google_translate"],
          div[class*="goog-te"],
          div[class*="skiptranslate"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        `;
        document.head.appendChild(styleElement);
      }
      
      // Function to aggressively hide elements
      const forceHideElements = () => {
        // Hide all possible Google Translate elements
        const selectors = [
          '.goog-te-banner-frame',
          '.skiptranslate',
          'iframe[src*="translate.googleapis.com"]',
          '.goog-te-menu-frame',
          '.goog-te-balloon-frame',
          '#google_translate_element',
          '.goog-te-combo',
          '.goog-te-gadget',
          'div[id*="google_translate"]',
          'div[class*="goog-te"]',
          'div[class*="skiptranslate"]'
        ];
        
        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el && el.style) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.height = '0';
                el.style.width = '0';
                el.style.position = 'absolute';
                el.style.opacity = '0';
                el.style.top = '-9999px';
                el.style.left = '-9999px';
                el.style.zIndex = '-9999';
                el.style.pointerEvents = 'none';
              }
              // Also try to remove from DOM
              if (el && el.parentNode && selector.includes('banner')) {
                try {
                  el.parentNode.removeChild(el);
                } catch (e) {
                  // Ignore removal errors
                }
              }
            });
          } catch (e) {
            // Ignore selector errors
          }
        });
        
        // Reset body top
        if (document.body) {
          document.body.style.top = '0';
          document.body.style.position = 'static';
          document.body.style.marginTop = '0';
          document.body.style.paddingTop = '0';
        }
        
        // Fix html element too
        if (document.documentElement) {
          document.documentElement.style.marginTop = '0';
          document.documentElement.style.paddingTop = '0';
        }
      };
      
      // Hide immediately
      forceHideElements();
      
      // Also hide elements dynamically as they appear
      const observer = new MutationObserver(() => {
        forceHideElements();
      });
      
      // Observe the entire document
      observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id']
      });
      
      // Also run periodically to catch any late-loading elements
      const intervalId = setInterval(forceHideElements, 100);
      
      return () => {
        observer.disconnect();
        clearInterval(intervalId);
      };
    };

    const cleanup = hideGoogleTranslateUI();

    // Function to set Google Translate cookie directly
    const setGoogleTranslateCookie = (languageCode) => {
      // Google Translate uses cookies to store the selected language
      // Cookie name: googtrans
      // Format: /en/{targetLanguage} or /auto/{targetLanguage}
      if (languageCode === 'en') {
        // Remove translation cookie if English
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      } else {
        const cookieValue = `/en/${languageCode}`;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Expires in 1 year
        
        // Set cookie for current path
        document.cookie = `googtrans=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/`;
        
        // Also try to access the Google Translate iframe and trigger translation
        setTimeout(() => {
          // Try to access the iframe
          const frames = document.querySelectorAll('iframe');
          frames.forEach(frame => {
            if (frame.src && frame.src.includes('translate.googleapis.com')) {
              try {
                // Reload the iframe to apply new cookie
                frame.src = frame.src.split('&')[0] + '&u=' + encodeURIComponent(window.location.href);
              } catch (e) {
                console.log('Could not reload iframe:', e);
              }
            }
          });
        }, 100);
      }
    };

    // Function to apply translation based on langInfo
    const applyTranslation = (langInfo) => {
      if (!langInfo) return;

      const detectedLang = getTargetLanguage(langInfo);
      console.log('detectedLang', detectedLang);
      setTargetLang(detectedLang);

      // Only translate if not English
      if (needsTranslation(langInfo) && detectedLang !== 'en') {
        // Set the cookie first
        setGoogleTranslateCookie(detectedLang);

        // Wait for Google Translate to be ready and trigger translation
        let translationAttempted = false;
        const checkAndTranslate = () => {
          if (window.google && window.google.translate && !translationAttempted) {
            translationAttempted = true;
            
            // Method 1: Try to find and use the select element
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement && selectElement.options) {
              // Find the option with the target language
              for (let i = 0; i < selectElement.options.length; i++) {
                const option = selectElement.options[i];
                const optionValue = option.value || '';
                if (optionValue === detectedLang || optionValue.includes(`|${detectedLang}|`) || optionValue === `|${detectedLang}|`) {
                  selectElement.selectedIndex = i;
                  // Trigger change event to apply translation
                  selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                  // Also try firing input event
                  selectElement.dispatchEvent(new Event('input', { bubbles: true }));
                  break;
                }
              }
            }
            
            // Method 2: Try to access Google Translate's internal API
            if (window.google && window.google.translate && window.google.translate.TranslateService) {
              try {
                const service = new window.google.translate.TranslateService();
                service.translatePage('en', detectedLang, () => {
                  console.log('Translation applied via TranslateService');
                });
              } catch (e) {
                console.log('TranslateService not available:', e);
              }
            }
            
            // Method 3: Use the cookie-based approach and trigger a soft reload of translate widgets
            // The cookie is already set, now we need to tell Google Translate to re-check
            setTimeout(() => {
              const frames = document.querySelectorAll('iframe[src*="translate.googleapis.com"]');
              frames.forEach(frame => {
                try {
                  // Trigger iframe reload to pick up new cookie
                  const currentSrc = frame.src;
                  frame.src = currentSrc.split('#')[0] + '#' + Date.now();
                } catch (e) {
                  console.log('Could not reload iframe:', e);
                }
              });
            }, 500);
          } else if (!window.google || !window.google.translate) {
            // Retry after a short delay if Google Translate not ready (max 10 attempts)
            if (checkAndTranslate.attempts < 10) {
              checkAndTranslate.attempts = (checkAndTranslate.attempts || 0) + 1;
              setTimeout(checkAndTranslate, 500);
            }
          }
        };
        
        checkAndTranslate.attempts = 0;
        
        // Start checking after a delay to ensure Google Translate is initialized
        setTimeout(checkAndTranslate, 1500);
      } else {
        // If English or no translation needed, ensure cookie is set to English
        setGoogleTranslateCookie('en');
      }
    };

    // Define the global callback function for Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,sv,da,no,de,fr,es,it,nl,pt,ru,fi,pl', // Multiple languages supported
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );

        // After initialization, check for stored langInfo and apply translation
        setTimeout(() => {
          const langInfo = getStoredLangInfo();
          if (langInfo) {
            applyTranslation(langInfo);
          }
        }, 1000);
      }
    };

    // Check for stored langInfo on mount
    const langInfo = getStoredLangInfo();
    if (langInfo) {
      applyTranslation(langInfo);
    }

    // Listen for storage events to update when langInfo changes
    const handleStorageChange = (e) => {
      if (e.key === 'langInfo' && e.newValue) {
        try {
          const updatedLangInfo = JSON.parse(e.newValue);
          applyTranslation(updatedLangInfo);
        } catch (error) {
          console.error('Error parsing langInfo from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll for langInfo changes (for same-tab updates)
    const pollInterval = setInterval(() => {
      const currentLangInfo = getStoredLangInfo();
      if (currentLangInfo) {
        const currentTargetLang = getTargetLanguage(currentLangInfo);
        if (currentTargetLang !== targetLang) {
          applyTranslation(currentLangInfo);
        }
      }
    }, 1000); // Check every second

    // If the script has already loaded, initialize immediately
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      window.googleTranslateElementInit();
    }

    // Cleanup function
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
      if (cleanup) cleanup();
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    };
  }, [targetLang]);

  return (
    <div 
      id="google_translate_element" 
      style={{
        display: 'none', // Hide the Google Translate UI completely
        visibility: 'hidden',
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
      }}
    />
  );
};

export default GoogleTranslate;

