import { useEffect, useRef } from 'react';

const GoogleMap = ({ latitude, longitude, zoom = 15, height = '400px', width = '100%', locationName = '', companyName = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const mapOptions = {
      center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      zoom: zoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    // Initialize the map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

    // Create a custom red pin icon
    const redPinIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 32 16 32s16-20.5 16-32C32 7.163 24.837 0 16 0z" fill="#FF0000"/>
          <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 48),
      anchor: new window.google.maps.Point(16, 48)
    };

    // Build info window content with company name and location name
    let infoContent = '<div style="padding: 10px; min-width: 200px;">';
    if (companyName) {
      infoContent += `<h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${companyName}</h4>`;
    }
    if (locationName) {
      infoContent += `<p style="margin: 0; color: #666; font-size: 14px;">📍 ${locationName}</p>`;
    }
    if (!companyName && !locationName) {
      infoContent += `<h4 style="margin: 0 0 5px 0; color: #333;">Job Location</h4>`;
      infoContent += `<p style="margin: 0; color: #666;">Lat: ${latitude}, Lng: ${longitude}</p>`;
    }
    infoContent += '</div>';

    // Add info window
    infoWindowRef.current = new window.google.maps.InfoWindow({
      content: infoContent
    });

    // Add a red marker at the specified location
    markerRef.current = new window.google.maps.Marker({
      position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      map: mapInstanceRef.current,
      icon: redPinIcon,
      title: companyName ? `${companyName} - ${locationName}` : locationName || 'Job Location'
    });

    // Open info window automatically when map loads
    infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);

    // Add click listener to marker to show info window
    markerRef.current.addListener('click', () => {
      infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
    });

    // Resize map when container size changes (e.g., when modal opens)
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    // Also trigger resize after a short delay to ensure modal is fully rendered
    const resizeTimeout = setTimeout(() => {
      if (mapInstanceRef.current) {
        window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
      }
    }, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      // Clean up marker and info window
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };

  }, [latitude, longitude, zoom, locationName, companyName]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: height === '100%' ? '100%' : height, 
        width: width,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        minHeight: height === '100%' ? '400px' : 'auto',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    />
  );
};

export default GoogleMap;
