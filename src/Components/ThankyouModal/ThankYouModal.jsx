import ScreenLoader from "../../ScreenLoader";
import "./thankyouModal.css";

import Modal from "react-modal";

// Set the app element for accessibility
Modal.setAppElement("#root");
const ThankYouModal = ({
  isOpen,
  onClose,
  jobTitle,
  handleConnect,
  loader,
}) => {
  const customStyles = {
    overlay: {
      backgroundColor: "rgb(16 14 14 / 75%)",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: 999999,
      width: "600px",
      padding: "50px",
      borderRadius: "15px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    },
  };
  console.log("ThankYouModal render - isOpen:", isOpen);
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Example Modal"
      shouldCloseOnOverlayClick={false}
    >
      {loader && <ScreenLoader />}
      <div className="modal-content">
        <img
          src="/plane-png.png" // Replace with the paper plane image
          alt="Paper Plane"
          className="modal-image"
        />
        <h2>Thank You For Applying!</h2>
        <p>
          We’ve received your application for <strong>{jobTitle}</strong>. Our
          team will review it and be in touch shortly.
        </p>
        <div className="modal-actions">
          <button className="otpSubmitButton" onClick={handleConnect}>
           Engage
          </button>
          <button className="backToCareerButton" onClick={onClose}>
            Back To Career
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ThankYouModal;
