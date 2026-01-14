import { useState } from "react";
import Modal from "react-modal";
import OTPInput from "react-otp-input";
import { updatedURLInstance } from "../config/webBuilder";
import { toast } from "react-toastify";
import ScreenLoader from "../ScreenLoader";

// Set the app element for accessibility
Modal.setAppElement("#root");

const OTPModal = ({ modalIsOpen, closeModal, email, setIsEmailVerified }) => {
  const [otp, setOtpValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loader, setLoader] = useState(false);

  const customStyles = {
    overlay: {
      backgroundColor: "rgb(16 14 14 / 75%)",
      padding: "20px",
      zIndex: 9999999,
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: 9999999,
      width: "90%",
      maxWidth: "500px",
      minWidth: "320px",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      maxHeight: "90vh",
      overflow: "auto",
    },
  };

  const handleOtpInputChange = (otp) => {
    if (isNaN(otp)) return;
    setOtpValue(otp);
    setError("");
  };

  const submitOTP = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid OTP.");
      return;
    }
    setLoader(true);
    setIsSubmitting(true); // Disable button while submitting
    try {
      const response = await updatedURLInstance.post(
        `/web/career/verify-email-otp`,
        {
          email: email,
          otp: otp,
        }
      );
      const message = response.data.message || "Applied successfully";
      toast.success(message);
      setIsEmailVerified({
        isVerify: true,
        external_id: response.data?.data?.external_id,
      });
      closeModal();
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoader((prev) => !prev);
      setIsSubmitting(false);
    }
  };

  console.log("OTPModal render - modalIsOpen:", modalIsOpen);
  
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
      shouldCloseOnOverlayClick={false}
    >
      {loader && <ScreenLoader />}


      <h2>Enter Verification Code</h2>
      <p>
        Enter the verification code we sent to your E-mail Id.{" "}
        <span className="" onClick={closeModal}>
          Change Email
        </span>
      </p>
      <div>
        <OTPInput
          className="mb-5"
          value={otp}
          onChange={handleOtpInputChange}
          numInputs={6}
          renderInput={(props) => (
            <input {...props} placeholder="-" className="otpInput" />
          )}
          isInputNum={true}
          containerStyle="OTPInputContainer"
        />
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        <button
          onClick={submitOTP}
          disabled={isSubmitting || otp.length < 6 || error}
          className="otpSubmitButton"
          style={{
            background: otp.length === 6 ? "linear-gradient(to right, #FF6868, #C0A9FF)" : "#ccc",
            color: otp.length === 6 ? "#fff" : "#666",
            cursor: otp.length === 6 ? "pointer" : "not-allowed",
          }}
        >
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>
      </div>
    </Modal>
  );
};

export default OTPModal;
