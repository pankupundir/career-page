/**
 * Language helper utility
 * Maps country codes to language codes and handles language detection
 */

// Country code to language code mapping
const COUNTRY_TO_LANGUAGE = {
  'SE': 'sv', // Sweden -> Swedish
  'DK': 'da', // Denmark -> Danish
  'NO': 'no', // Norway -> Norwegian
  'FI': 'fi', // Finland -> Finnish
  'DE': 'de', // Germany -> German
  'FR': 'fr', // France -> French
  'ES': 'es', // Spain -> Spanish
  'IT': 'it', // Italy -> Italian
  'NL': 'nl', // Netherlands -> Dutch
  'PT': 'pt', // Portugal -> Portuguese
  'RU': 'ru', // Russia -> Russian
  'PL': 'pl', // Poland -> Polish
  'IN': 'en', // India -> English (default)
  'US': 'en', // USA -> English
  'GB': 'en', // UK -> English
  'AU': 'en', // Australia -> English
  'CA': 'en', // Canada -> English
  // Add more mappings as needed
};

/**
 * Get language code from country code
 * @param {string} countryCode - ISO country code (e.g., 'SE', 'IN')
 * @returns {string} - Language code (e.g., 'sv', 'en')
 */
export const getLanguageFromCountry = (countryCode) => {
  if (!countryCode) return 'en'; // Default to English
  return COUNTRY_TO_LANGUAGE[countryCode.toUpperCase()] || 'en';
};

/**
 * Get target language from langInfo object
 * @param {Object} langInfo - Language info from API
 * @returns {string} - Target language code (e.g., 'sv', 'en')
 */
export const getTargetLanguage = (langInfo) => {
  if (!langInfo) return 'en';
  
  // Priority: 
  // 1. If cloudflareLang exists and is not 'en', use it
  // 2. If cloudflareLang is 'en' or not set, check country code
  // 3. If country code maps to a non-English language, use that
  // 4. Otherwise check browserLang
  // 5. Default to English
  
  // First check cloudflareLang if it's not English
  if (langInfo.cloudflareLang && langInfo.cloudflareLang !== 'en') {
    return langInfo.cloudflareLang;
  }
  
  // If cloudflareLang is 'en' or not set, prioritize country code
  if (langInfo.detectedCountry) {
    const countryLang = getLanguageFromCountry(langInfo.detectedCountry);
    // Use country language if it's not English
    if (countryLang !== 'en') {
      return countryLang;
    }
  }
  
  // Fallback to browserLang if available and not English
  if (langInfo.browserLang && langInfo.browserLang !== 'en') {
    return langInfo.browserLang;
  }
  
  return 'en'; // Default to English
};

/**
 * Store langInfo in localStorage
 * @param {Object} langInfo - Language info from API
 */
export const storeLangInfo = (langInfo) => {
  try {
    localStorage.setItem('langInfo', JSON.stringify(langInfo));
  } catch (error) {
    console.error('Error storing langInfo:', error);
  }
};

/**
 * Get stored langInfo from localStorage
 * @returns {Object|null} - Stored language info or null
 */
export const getStoredLangInfo = () => {
  try {
    const stored = localStorage.getItem('langInfo');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving langInfo:', error);
    return null;
  }
};

/**
 * Check if translation is needed
 * @param {Object} langInfo - Language info from API
 * @returns {boolean} - True if translation is needed
 */
export const needsTranslation = (langInfo) => {
  const targetLang = getTargetLanguage(langInfo);
  return targetLang !== 'en';
};

