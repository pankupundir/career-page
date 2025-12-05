import React, { useEffect } from 'react';
import Modal from 'react-modal';
import GoogleMap from './GoogleMap';
import './LocationModal.css';

Modal.setAppElement("#root");

const LocationModal = ({ isOpen, onClose, latitude, longitude, locationName, companyName }) => {
  // Trigger map resize when modal opens
  useEffect(() => {
    if (isOpen && window.google) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        window.google.maps.event.trigger(window, 'resize');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="location-modal"
      overlayClassName="location-modal-overlay"
      contentLabel="Job Location Map"
      onAfterOpen={() => {
        // Trigger resize after modal animation completes
        if (window.google) {
          setTimeout(() => {
            window.google.maps.event.trigger(window, 'resize');
          }, 300);
        }
      }}
    >
      <div className="location-modal-content">
        <div className="location-modal-header">
          <h3>{locationName || 'Job Location'}</h3>
          <button className="location-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="location-modal-body">
          {latitude && longitude ? (
            <div className="location-map-container">
              <GoogleMap 
                latitude={latitude} 
                longitude={longitude} 
                height="100%"
                zoom={15}
                locationName={locationName}
                companyName={companyName}
              />
            </div>
          ) : (
            <div className="location-modal-error">
              <p>Location coordinates not available</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LocationModal;

