import { useState } from "react";
import "./SideBar.css";

import { useForm } from "react-hook-form";
import ErrorMsg from "../ErrorMsg";
import { toast } from "react-toastify";
import {
  openAPIBuilderInstance,
  updatedURLInstance,
  webSiteBuilderFormInstance,
} from "../../config/webBuilder";
import { EMAIL_REGEX } from "../../Constant/Constant";
import OTPModal from "../OTPModal";
import ScreenLoader from "../../ScreenLoader";
import ThankYouModal from "../ThankyouModal/ThankYouModal";

const Sidebar = ({ isOpen, onClose, jobDetails }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm({
    mode: "onChange",
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState({
    isVerify: false,
    external_id: "",
  });
  const [showVerifyEmailError, setShowVerifyEmailError] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState({
    show: false,
    msg: "",
  });
  const [resumeUploadError, setResumeUploadError] = useState({
    show: false,
    msg: "",
    file: "",
  });
  const [showNext, setShowNext] = useState(true);
  const [loader, setLoader] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const nextPage = () => {
    if (!isEmailVerified.isVerify) {
      setShowVerifyEmailError(true);
      return;
    }
    handleSubmit(() => setShowNext(false))();
  };

  const handleFileUpload = (event) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // Set maximum file size (optional, e.g., 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

    const file = event.target.files[0];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        // Handle invalid file type
        event.target.value = "";
        setResumeUploadError({
          show: true,
          msg: "Invalid file format. Please upload a valid resume format (e.g., .pdf, .doc, .docx).",
        });
        return;
      }

      if (file.size > maxFileSize) {
        // Handle file size limit
        event.target.value = "";
        setResumeUploadError({
          show: true,
          msg: `File size too large. Maximum allowed size is ${
            maxFileSize / (1024 * 1024)
          }MB.`,
        });
        return;
      }

      // If file type and size are valid
      setResumeUploadError({ show: false, msg: "", file: file });
    } else {
      // Handle case when no file is selected
      event.target.value = "";
      setResumeUploadError({
        show: true,
        msg: "No file selected. Please choose a resume file to upload.",
      });
    }
  };

  const handleVideoUpload = (event) => {
    // Define allowed video file types
    const allowedTypes = [
      "video/mp4",
      "video/mkv",
      "video/avi",
      "video/mov",
      "video/webm",
    ];

    // Set maximum file size (optional, e.g., 50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes

    const file = event.target.files[0];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        // Handle invalid file type
        event.target.value = "";
        setVideoUploadError({
          show: true,
          msg: "Invalid file format. Please upload valid video formats like .mp4, .mkv, .avi, .mov, .webm.",
        });
        return;
      }

      if (file.size > maxFileSize) {
        // Handle file size limit
        event.target.value = "";
        setVideoUploadError({
          show: true,
          msg: `File size too large. Maximum allowed size is ${
            maxFileSize / (1024 * 1024)
          }MB.`,
        });
        return;
      }

      // If file type and size are valid
      setVideoUploadError({ show: false, msg: "", file: file });
    } else {
      // Handle case when no file is selected
      event.target.value = "";
      setVideoUploadError({
        show: true,
        msg: "No file selected. Please choose a video file to upload.",
      });
    }
  };

  const beforeHandleSUbmit = (event) => {
    event.preventDefault();
    if (!resumeUploadError.file) {
      setResumeUploadError({ show: true, msg: "Please Enter the file" });
    }
    if (!videoUploadError.file) {
      setVideoUploadError({
        ...videoUploadError,
        show: true,
        msg: "Video file is required",
      });
      trigger();
      return;
    }
    handleSubmit(onSubmit)();
  };

  const handleOnCloseSidebar = () => {
    setShowOTPModal(false);
    setShowThankYouModal(false);
    setShowVerifyEmailError(false);
    reset();
    setShowNext(true);
    onClose();
  };

  const onSubmit = async (data) => {
    setLoader(true);
    try {
      // Upload Resume
      const resumeResponse = await webSiteBuilderFormInstance.post(
        "/web/upload-file",
        {
          file: resumeUploadError.file,
        }
      );
      const resumeLocation = resumeResponse.data.data.Location;
      console.log(resumeLocation, "Resume Uploaded Location");

      // Upload Video (if applicable)
      let videoLocation = null;
      if (videoUploadError?.file) {
        const videoResponse = await webSiteBuilderFormInstance.post(
          "/web/upload-file",
          {
            file: videoUploadError.file,
          }
        );
        videoLocation = videoResponse.data.data.Location;
        console.log(videoLocation, "Video Uploaded Location");
      }

      // Construct payload
      const payload = {
        ...data,
        external_id: isEmailVerified.external_id,
        job_id: jobDetails.id,
        resume: resumeLocation,
        video: videoLocation,
      };

      console.log(payload, "Payload for Job Application");

      // Submit Job Application
      await submitApplyJob(payload);
      toast.success("Job application submitted successfully!");

      setLoader((prev) => !prev);
      handleOnCloseSidebar();
    } catch (error) {
      console.error(error, "Error occurred during submission!");
      setLoader((prev) => !prev);
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const submitApplyJob = async (payload) => {
    if (!isEmailVerified) {
      setShowVerifyEmailError(true);
    }
    setShowThankYouModal(true);
    try {
      const response = await openAPIBuilderInstance.post(
        `/web/career/apply-on-job`,
        payload
      );
      const message = response.data.message || "Applied successfully";
      toast.success(message);
      console.log(response, "response");
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      const message = error.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleVerifyEmail = async () => {
    setIsEmailVerified({ isVerify: false });
    const email = watch("email");
    if (!email || !EMAIL_REGEX.test(email)) {
      trigger("email");
      return;
    }
    setLoader(true);
    try {
      const response = await updatedURLInstance.post(
        `/web/career/get-email-otp`,
        {
          email: email,
        }
      );
      setShowVerifyEmailError(false);
      setLoader((prev) => !prev);
      const message = response.data.message || "Applied successfully";
      toast.success(message);
      setShowOTPModal(true);
      console.log(response, "response");
    } catch (err) {
      setLoader((prev) => !prev);
      console.log(err, "error !!!!!!!!!!");
      const message = err.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleConnect = async () => {
    setLoader(true);
    try {
      const response = await updatedURLInstance.get(
        `/web/career/connect/${isEmailVerified.external_id}`
      );
      setShowThankYouModal(false);
      const message =
        response.data.message ||
        "We have sent connection email please check your email";
      toast.success(message);
      console.log(response, "response");
      setLoader((prev) => !prev);
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      const message = err.message || "Something went wrong";
      toast.error(message);
      setLoader((prev) => !prev);
    }
  };

  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar">
        <button className="close_btn" onClick={handleOnCloseSidebar}>
          &times;
        </button>
      </div>
      <div>
        <h3>Application</h3>
        <p>{jobDetails?.title}</p>
      </div>
      {loader && <ScreenLoader />}
      <form onSubmit={beforeHandleSUbmit}>
        {showNext ? (
          <div>
            <div className="form-group">
              <label>Email *</label>
              <div className="input-group">
                <input
                  type="text"
                  name="email"
                  placeholder="Enter Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_REGEX,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                <button
                  className="verify-btn"
                  onClick={handleVerifyEmail}
                  type="button"
                >
                  Verify
                </button>
              </div>
              {errors.email && <ErrorMsg error={errors.email.message} />}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter First Name"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <ErrorMsg error={errors.firstName.message} />
                )}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter Last Name"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <ErrorMsg error={errors.lastName.message} />
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="+1"
                  {...register("phone_number", {
                    required: "Phone number is required",
                    onChange: (e) => {
                      const numberValue = e.target.value.replace(/[^0-9]/g, "");
                      setValue("phone_number", numberValue);
                    },
                  })}
                />
                {errors.phone_number && (
                  <ErrorMsg error={errors.phone_number.message} />
                )}
              </div>
              <div className="form-group">
                <label>Profession *</label>
                <input
                  type="text"
                  name="profession"
                  placeholder="Enter Profession Name"
                  {...register("profession", {
                    required: "Profession is required",
                  })}
                />
                {errors.profession && (
                  <ErrorMsg error={errors.profession.message} />
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter Location"
                  {...register("location", {
                    required: "Location is required",
                  })}
                />
                {errors.location && (
                  <ErrorMsg error={errors.location.message} />
                )}
              </div>
            </div>

            <div className="questions-listing">
              {jobDetails?.screening_questions?.map((res, index) => (
                <div key={index} className="form-group">
                  <label>{res.question}</label>
                  {res.web_type === "input" ? (
                    <input
                      type="text"
                      placeholder="Enter Answer"
                      {...register(`question_${index}`)}
                    />
                  ) : res.web_type === "radio" ? (
                    <div className="radio-options">
                      <div>
                        <input
                          type="radio"
                          id={`yes_${index}`}
                          name={`radio_${index}`}
                          value="yes"
                        />
                        <label htmlFor={`yes_${index}`}>Yes</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          id={`no_${index}`}
                          name={`radio_${index}`}
                          value="no"
                        />
                        <label htmlFor={`no_${index}`}>No</label>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {showVerifyEmailError && (
              <ErrorMsg error={"Please verify the email first"} />
            )}
            <button className="next-btn" onClick={nextPage} type="button">
              Next
            </button>
          </div>
        ) : (
          <div className="upload-section">
            <div className="form-group">
              <label>Upload your CV *</label>
              <div className="upload-box">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <span>Upload Document</span>
              </div>
              {resumeUploadError?.file && (
                <span>{resumeUploadError.file.name} </span>
              )}
              {resumeUploadError?.show && (
                <ErrorMsg error={resumeUploadError.msg} />
              )}
            </div>

            <div className="form-group">
              <label>Upload Video</label>
              <div className="upload-box">
                <input
                  type="file"
                  onChange={handleVideoUpload}
                  className="file-input"
                  accept="video/mp4, video/mkv, video/avi, video/mov, video/webm"
                />
                <span>Upload Video / Create Video</span>
              </div>
              {videoUploadError?.file && (
                <span>videoUploadError.file.name </span>
              )}
              {videoUploadError?.show && (
                <ErrorMsg error={videoUploadError.msg} />
              )}
            </div>

            <div className="form-group">
              <label>Application Letter</label>
              <textarea
                name="letter"
                placeholder="Enter a short application text (max 1500 characters)"
                {...register("name", {
                  required: "Application Letter is required",
                })}
                maxLength={1500}
                className="application-textarea"
              />
              {}
              {errors?.name && <ErrorMsg error={errors.name.message} />}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" />I confirm that I have read and agree to
                the <a href="#">User Agreement</a>,{" "}
                <a href="#">Privacy Policy</a>, and{" "}
                <a href="#">Cookie Notice</a>.
              </label>
            </div>

            <button className="submit-btn" type="submit">
              Apply Now
            </button>
          </div>
        )}
      </form>
      {showOTPModal && (
        <OTPModal
          modalIsOpen={showOTPModal}
          closeModal={() => setShowOTPModal(false)}
          email={watch("email")}
          setIsEmailVerified={setIsEmailVerified}
        />
      )}
      {showThankYouModal && (
        <ThankYouModal
          isOpen={showThankYouModal}
          onClose={() => setShowThankYouModal(false)}
          jobTitle={jobDetails.title}
          handleConnect={handleConnect}
          loader={loader}
        />
      )}
    </div>
  );
};
export default Sidebar;
