export const returnAddressInfo = async (addressComponents, geometry) => {
    if (!addressComponents || !geometry) {
      return { country: null, state: null, city: null, zip: null, lat: null, lng: null, timezone: null };
    }
  
    const countryObj = addressComponents.find((component) =>
      component.types.includes("country")
    );
  
    const stateObj = addressComponents.find((component) =>
      component.types.includes("administrative_area_level_1")
    );
  
    // Include postal_town as a fallback for city if locality or sublocality is not present
    const cityObj = addressComponents.find(
      (component) =>
        component.types.includes("locality") ||
        component.types.includes("sublocality") ||
        component.types.includes("administrative_area_level_2") ||
        component.types.includes("postal_town") || // Fallback for city
        component.types.includes("route") // Even fallback to street name
    );
  
    const zipObj = addressComponents.find((component) =>
      component.types.includes("postal_code")
    );
  
    // Extract lat and lng from geometry.location
    const lat = geometry?.location?.lat() || null;
    const lng = geometry?.location?.lng() || null;
  
    // Fetch the timezone data using Google Maps Time Zone API
    const timezone = await getTimezone(lat, lng);
  
    return {
      country: countryObj?.long_name || null,
      state: stateObj?.long_name || "Unknown State", // Fallback to a placeholder value
      city: cityObj?.long_name || "Unknown City", // Fallback to a placeholder value
      zip: zipObj?.long_name || null, // Return null if postal code is not found
      lat,
      lng,
      timezone, // Timezone info (e.g., "America/Los_Angeles UTC +7:00")
    };
  };
  
  const getTimezone = async (lat, lng) => {
    if (!lat || !lng) return null;
  
    const timestamp = new Date().getTime() / 1000; 
    const apiKey = "";  
  
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=AIzaSyDRb_BGMWY3XocACa_K976a0g6y-5QwkqU`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === "OK") {
        const rawOffset = data.rawOffset || 0; // seconds
        const dstOffset = data.dstOffset || 0; // seconds
        const totalOffset = rawOffset + dstOffset; // seconds

        const totalOffsetHours = totalOffset / 3600; // may be negative
        const hours = Math.trunc(totalOffsetHours);
        const minutes = Math.abs(Math.round((totalOffsetHours - hours) * 60));

        const sign = hours >= 0 ? "+" : "-";
        const hh = String(Math.abs(hours)).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const utcOffsetString = `UTC ${sign}${hh}:${mm}`;
        const timezone = data.timeZoneId;
        return `${timezone} ${utcOffsetString}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching timezone:", error);
      return null;
    }
  };
  
  
  