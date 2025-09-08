import { useEffect, useRef } from 'react';

const GoogleMap = ({ latitude, longitude, zoom = 15, height = '400px', width = '100%' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

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

    // Add a marker at the specified location
    new window.google.maps.Marker({
      position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      map: mapInstanceRef.current,
      title: 'Job Location'
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h4 style="margin: 0 0 5px 0; color: #333;">Job Location</h4>
          <p style="margin: 0; color: #666;">Lat: ${latitude}, Lng: ${longitude}</p>
        </div>
      `
    });

    // Add click listener to marker to show info window
    const marker = new window.google.maps.Marker({
      position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      map: mapInstanceRef.current,
      title: 'Job Location'
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

  }, [latitude, longitude, zoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: height, 
        width: width,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}
    />
  );
};

export default GoogleMap;
