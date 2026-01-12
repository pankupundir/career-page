// Cookie utility functions for managing cookie consent

export const COOKIE_KEYS = {
  CONSENT_PREFERENCES: 'cookie_consent_preferences',
  CONSENT_TIMESTAMP: 'cookie_consent_timestamp',
  COOKIE_DATA: 'cookie_user_data'
};

// Cookie categories configuration
export const COOKIE_CATEGORIES = {
  NECESSARY: {
    id: 'necessary',
    name: 'Necessary',
    description: 'Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.',
    alwaysActive: true,
    cookies: [
      { name: 'session_id', purpose: 'Maintains user session', expiry: 'Session' },
      { name: 'csrf_token', purpose: 'Security token for forms', expiry: 'Session' },
      { name: 'cookie_consent_preferences', purpose: 'Stores your cookie preferences', expiry: '1 year' }
    ]
  },
  FUNCTIONAL: {
    id: 'functional',
    name: 'Functional',
    description: 'Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.',
    alwaysActive: false,
    cookies: [
      { name: 'language_preference', purpose: 'Stores your language preference', expiry: '1 year' },
      { name: 'theme_preference', purpose: 'Stores your theme preference', expiry: '1 year' },
      { name: 'user_feedback', purpose: 'Stores user feedback data', expiry: '30 days' }
    ]
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analytics cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.',
    alwaysActive: false,
    cookies: [
      { name: '_ga', purpose: 'Google Analytics - distinguishes users', expiry: '2 years' },
      { name: '_gid', purpose: 'Google Analytics - distinguishes users', expiry: '24 hours' },
      { name: '_gat', purpose: 'Google Analytics - throttles request rate', expiry: '1 minute' }
    ]
  },
  MARKETING: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.',
    alwaysActive: false,
    cookies: [
      { name: 'ad_user_id', purpose: 'Tracks user for advertising', expiry: '1 year' },
      { name: 'campaign_source', purpose: 'Tracks marketing campaign source', expiry: '30 days' },
      { name: 'conversion_id', purpose: 'Tracks conversion events', expiry: '90 days' }
    ]
  }
};

// Get consent preferences from localStorage
export const getConsentPreferences = () => {
  try {
    const preferences = localStorage.getItem(COOKIE_KEYS.CONSENT_PREFERENCES);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error reading consent preferences:', error);
    return null;
  }
};

// Save consent preferences to localStorage
export const saveConsentPreferences = (preferences) => {
  try {
    localStorage.setItem(COOKIE_KEYS.CONSENT_PREFERENCES, JSON.stringify(preferences));
    localStorage.setItem(COOKIE_KEYS.CONSENT_TIMESTAMP, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error saving consent preferences:', error);
    return false;
  }
};

// Check if user has given consent
export const hasConsentBeenGiven = () => {
  return getConsentPreferences() !== null;
};

// Get consent status for a specific category
export const getCategoryConsent = (categoryId) => {
  const preferences = getConsentPreferences();
  if (!preferences) return false;
  
  // Necessary cookies are always true
  if (categoryId === COOKIE_CATEGORIES.NECESSARY.id) {
    return true;
  }
  
  return preferences[categoryId] === true;
};

// Set cookie with proper expiry
export const setCookie = (name, value, days = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

// Get cookie value
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Delete cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Get all cookies as an object
export const getAllCookies = () => {
  const cookies = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
};

// Get user data stored in cookies
export const getUserCookieData = () => {
  const allCookies = getAllCookies();
  const preferences = getConsentPreferences();
  const timestamp = localStorage.getItem(COOKIE_KEYS.CONSENT_TIMESTAMP);
  
  return {
    totalCookies: Object.keys(allCookies).length,
    cookies: allCookies,
    preferences: preferences,
    consentGivenAt: timestamp,
    categories: Object.keys(COOKIE_CATEGORIES).map(key => ({
      ...COOKIE_CATEGORIES[key],
      consented: getCategoryConsent(COOKIE_CATEGORIES[key].id)
    }))
  };
};

// Apply consent preferences - enable/disable cookies based on consent
export const applyConsentPreferences = (preferences) => {
  // Necessary cookies are always enabled
  Object.keys(COOKIE_CATEGORIES).forEach(key => {
    const category = COOKIE_CATEGORIES[key];
    const isConsented = category.alwaysActive || preferences[category.id] === true;
    
    if (isConsented) {
      // Enable cookies for this category
      category.cookies.forEach(cookie => {
        // You can set actual cookies here if needed
        console.log(`Enabled: ${cookie.name} (${category.name})`);
      });
    } else {
      // Delete cookies for this category if consent not given
      category.cookies.forEach(cookie => {
        deleteCookie(cookie.name);
        console.log(`Disabled: ${cookie.name} (${category.name})`);
      });
    }
  });
  
  // Save preferences
  saveConsentPreferences(preferences);
};

// Reset all consent preferences
export const resetConsentPreferences = () => {
  localStorage.removeItem(COOKIE_KEYS.CONSENT_PREFERENCES);
  localStorage.removeItem(COOKIE_KEYS.CONSENT_TIMESTAMP);
};

