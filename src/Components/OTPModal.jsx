import { useState } from "react";
import Modal from "react-modal";
import OTPInput from "react-otp-input";
import { updatedURLInstance } from "../config/webBuilder";
import { toast } from "react-toastify";
const OTPModal = ({ modalIsOpen, closeModal, email }) => {
  const [otp, setOtpValue] = useState("");
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: 999999,
    },
  };
  const handleOtpInputChange = (otp) => {
    if (isNaN(otp)) return;
    setOtpValue(otp);
  };

  const submitOTP = async () => {
    // submit the OTP here
    console.log("OTP submitted: ", otp);
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
      //   setShowOTPModal(true);
      console.log(response, "response");
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      const message = err.message || "Something went wrong";
      toast.error(message);
    }
    closeModal();
  };
  return (
    <Modal
      isOpen={modalIsOpen}
      //   onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
      shouldCloseOnOverlayClick={false}
    >
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
        <button onClick={submitOTP}>Submit</button>
      </div>
    </Modal>
  );
};

export default OTPModal;
