import { useEffect, useState } from "react";
import "./SideBar.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { Controller, useForm } from "react-hook-form";
import ErrorMsg from "../ErrorMsg";
import { toast } from "react-toastify";
import {
  openAPIBuilderInstance,
  updatedURLInstance,
  webSiteBuilderFormInstance,
  GOOGLE_MAP_API_KEY,
} from "../../config/webBuilder";
import { EMAIL_REGEX } from "../../Constant/Constant";
import OTPModal from "../OTPModal";
import ScreenLoader from "../../ScreenLoader";
import ThankYouModal from "../ThankyouModal/ThankYouModal";
import { Col, Form, Row } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import parsePhoneNumberFromString from "libphonenumber-js";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import VideoRecorder from "../common/VideoRecorder";
import LocationField from "../common/LocationField";
import { CleaningServices } from "@mui/icons-material";
import { returnAddressInfo } from "../../utils/helpers";

const Sidebar = ({ isOpen, onClose, jobDetails, setScreenLoader, loader, isEmailVerified, setIsEmailVerified }) => {
  const formConfig = useForm({
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    control,
  } = formConfig;
  const [showOTPModal, setShowOTPModal] = useState(false);
  
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
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [rangeValue, setRangeValue] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  // Loading states for individual uploads
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [recordingUploadLoading, setRecordingUploadLoading] = useState(false);
  
  // URLs for uploaded files
  const [uploadedCvUrl, setUploadedCvUrl] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [uploadedRecordingUrl, setUploadedRecordingUrl] = useState(null);

  const language_preference = [
    { label: "English", value: "English" },
    { label: "Swedish", value: "Swedish" },
    { label: "Danish", value: "Danish" },
    { label: "Norwegian", value: "Norwegian" },
    { label: "German", value: "German" },
    { label: "Dutch", value: "Dutch" },
    { label: "French", value: "French" },
    { label: "Spanish", value: "Spanish" },
    { label: "Italian", value: "Italian" },
    { label: "Portuguese", value: "Portuguese" },
    { label: "Russian", value: "Russian" },
  ];

  const options = ["establishment", "geocode"];

  const nextPage = () => {
    if (!isEmailVerified.isVerify) {
      setShowVerifyEmailError(true);
      return;
    }
    handleSubmit(() => setShowNext(false))();
  };

  const goBackToForm = () => {
    setShowNext(true);
  };

  const fillAddress = async (address) =>{
    const addressInfo = await returnAddressInfo(
        address?.address_components,
        address?.geometry
      );

    console.log(addressInfo, "addressInfo");

    setValue("country",addressInfo.country)
    setValue("zip_code",addressInfo.zip)
    setValue("time_zone",addressInfo.timezone)
  }
console.log(jobDetails,"jobDetails")

  const uploadCvFile = async (file) => {
    setCvUploadLoading(true);
    try {
      const response = await webSiteBuilderFormInstance.post("/web/upload-file", {
        file: file,
      });
      const fileUrl = response.data.data.Location;
      setUploadedCvUrl(fileUrl);
      toast.success("CV uploaded successfully!");
      return fileUrl;
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error("Failed to upload CV. Please try again.");
      throw error;
    } finally {
      setCvUploadLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
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
      
      // Upload the file immediately
      try {
        await uploadCvFile(file);
      } catch (error) {
        setResumeUploadError({
          show: true,
          msg: "Failed to upload CV. Please try again.",
        });
      }
    } else {
      // Handle case when no file is selected
      event.target.value = "";
      setResumeUploadError({
        show: true,
        msg: "No file selected. Please choose a resume file to upload.",
      });
    }
  };

  const uploadVideoFile = async (file) => {
    setVideoUploadLoading(true);
    try {
      const response = await webSiteBuilderFormInstance.post("/web/upload-file", {
        file: file,
      });
      const fileUrl = response.data.data.Location;
      setUploadedVideoUrl(fileUrl);
      toast.success("Video uploaded successfully!");
      return fileUrl;
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video. Please try again.");
      throw error;
    } finally {
      setVideoUploadLoading(false);
    }
  };

  const handleVideoUpload = async (event) => {
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
      
      // Upload the file immediately
      try {
        await uploadVideoFile(file);
      } catch (error) {
        setVideoUploadError({
          show: true,
          msg: "Failed to upload video. Please try again.",
        });
      }
    } else {
      // Handle case when no file is selected
      event.target.value = "";
      setVideoUploadError({
        show: true,
        msg: "No file selected. Please choose a video file to upload.",
      });
    }
  };

  const uploadRecordingFile = async (blob) => {
    setRecordingUploadLoading(true);
    try {
      const file = new File([blob], "recorded-video.webm", { type: "video/webm" });
      const response = await webSiteBuilderFormInstance.post("/web/upload-file", {
        file: file,
      });
      const fileUrl = response.data.data.Location;
      setUploadedRecordingUrl(fileUrl);
      toast.success("Recording uploaded successfully!");
      return fileUrl;
    } catch (error) {
      console.error("Error uploading recording:", error);
      toast.error("Failed to upload recording. Please try again.");
      throw error;
    } finally {
      setRecordingUploadLoading(false);
    }
  };

  const handleRecordingComplete = async (blob) => {
    setRecordedBlob(blob);
    // Upload the recording immediately
    try {
      await uploadRecordingFile(blob);
    } catch (error) {
      console.error("Failed to upload recording:", error);
    }
  };

  const beforeHandleSUbmit = (event) => {
    event.preventDefault();
    if (!uploadedCvUrl) {
      setResumeUploadError({ show: true, msg: "Please upload your CV first" });
      return;
    }
    handleSubmit(onSubmit)();
  };

  const handleOnCloseSidebar = () => {
    setShowOTPModal(false);
    setShowThankYouModal(false);
    setShowVerifyEmailError(false);
    setResumeUploadError({ show: false, msg: "", file: "" });
    setVideoUploadError({ show: false, msg: "" });
    setRecordedBlob(null);
    setUploadedCvUrl(null);
    setUploadedVideoUrl(null);
    setUploadedRecordingUrl(null);
    setCvUploadLoading(false);
    setVideoUploadLoading(false);
    setRecordingUploadLoading(false);
    reset();
    setShowNext(true);
    onClose();
  };

  const onSubmit = async (data) => {
    console.log(data?.address, "log this is address data");
    setScreenLoader(true);

    try {
      // Construct payload using pre-uploaded file URLs
      const payload = {
        email: data.email,
        name: data.firstName + data.lastName,
        phone_number: data.phone_number.replace(/[^\d]/g, ""),
        profession: data.profession,
        language_preference: data.language_preference,
        experience: data.experience,
        address: data.address?.formatted_address,
        country: data.country,
        time_zone: data.time_zone,
        zip_code: data.zip_code,
        external_id: isEmailVerified.external_id,
        job_id: jobDetails.job_external_id,
        resume_file: uploadedCvUrl,
        screeing_questions_answers: jobDetails.screening_questions?.map(
          (question, index) => ({
            question_id: question?.id,
            question: question?.question,
            answer: data[`question_${index}`],
            web_type: question.web_type,
          })
        ),
        application_letter_text: data.application_letter_text,
      };

      // Add video file URL if uploaded
      if (uploadedVideoUrl) {
        payload.video_file = uploadedVideoUrl;
      }

      // Add recording file URL if uploaded
      if (uploadedRecordingUrl) {
        payload.recording_file = uploadedRecordingUrl;
      }

      console.log(payload, "Payload for Job Application");

      // Submit Job Application
      await submitApplyJob(payload);
      setScreenLoader((prev) => !prev);
      
    } catch (error) {
      console.error(error, "Error occurred during submission!");
      setScreenLoader((prev) => !prev);
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
    try {
      const response = await openAPIBuilderInstance.post(
        `/web/career/apply-on-job`,
        payload
      );
      const message = response.data.message || "Applied successfully";
      toast.success(message);
      console.log("Opening Thank You Modal...");
      setShowThankYouModal(true);
      console.log("Thank You Modal state after setting:", true);
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
    setScreenLoader(true);
    try {
      const response = await updatedURLInstance.post(
        `/web/career/get-email-otp`,
        {
          email: email,
        }
      );
      setShowVerifyEmailError(false);
      setScreenLoader((prev) => !prev);
      const message = response.data.message || "Applied successfully";
      toast.success(message);
      console.log("Opening OTP Modal...");
      setShowOTPModal(true);
      console.log("OTP Modal state after setting:", true);
      console.log(response, "response");
    } catch (err) {
      setScreenLoader((prev) => !prev);
      console.log(err, "error !!!!!!!!!!");
      const message = err?.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleConnect = async () => {
    setScreenLoader(true);
    try {
      const response = await updatedURLInstance.post(
        `/web/career/connect`,{
          id:isEmailVerified.external_id,
          job_id: jobDetails.job_external_id
        }
      );
      setShowThankYouModal(false);
      
      console.log(response, "response");
      setScreenLoader((prev) => !prev);
      setIsEmailVerified({ isVerify: false });
      handleOnCloseSidebar();
      window.location.href = response.data.data.url;
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      const message = err.message || "Something went wrong";
      toast.error(message);
      setScreenLoader((prev) => !prev);
    }
  };

  const handleRange = (e) => {
    setRangeValue(e.target.value);
  };

  const validatePhoneNumber = (value) => {
    const stringValue = (value || "").trim();

    // Get country calling code from libphonenumber-js
    const phoneNumber = parsePhoneNumberFromString(stringValue, country);
    const countryCallingCode = phoneNumber?.countryCallingCode || "";

    if (!stringValue && isRequired) {
      return "Phone number is required";
    }

    // Strip the country code if already present
    const nationalNumber = stringValue.startsWith(`+${countryCallingCode}`)
      ? stringValue.replace(`+${countryCallingCode}`, "")
      : stringValue;

    // Re-validate using the extracted national number
    const parsedNumber = parsePhoneNumberFromString(nationalNumber, country);
    return parsedNumber && parsedNumber.isValid()
      ? true
      : "Invalid phone number";
  };

  return (
    <div
      className={`offcanvas offcanvas-end ofcanvas-width ${
        isOpen ? "visiblity" : ""
      }`}
    >
      <div className="offcanvas-body">
        <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
          <div className="sidebar_section offcanvas-header">
            <button
              className="close_btn btn-close text-reset"
              onClick={handleOnCloseSidebar}
              aria-label="Close"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="career-sidebar-heading">
            {!showNext && (
              <button 
                type="button" 
                className="back-btn" 
                onClick={goBackToForm}
                style={{
                  background: 'transparent',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px'
                }}
              >
                ← Back
              </button>
            )}
            <p>Application</p>
            <h5>{jobDetails?.title}</h5>
          </div>
          <div className="career-sidebar-input mt-3">
            <form onSubmit={beforeHandleSUbmit}>
              {showNext ? (
                <div>
                  <div className="form-group position-relative">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="email"
                        className="form-control user_email"
                        placeholder="Enter Email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: EMAIL_REGEX,
                            message: "Enter a valid email address",
                          },
                        })}
                      />
                      <span className="verifyb-btn-section">
                        <button
                          className="verify-mail-career"
                          onClick={handleVerifyEmail}
                          type="button"
                        >
                          Verify
                        </button>
                      </span>
                    </div>
                    {errors.email && <ErrorMsg error={errors.email.message} />}
                  </div>
                  <div
                    className={!isEmailVerified.isVerify ? "showDisabled" : ""}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          disabled={!isEmailVerified.isVerify}
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
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          disabled={!isEmailVerified.isVerify}
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
                        <label className="form-label">Phone Number *</label>
                        <Controller
                          name="phone_number" 
                          control={control}
                          rules={{
                            required: "Phone number is required",
                          }}
                          render={({ field: { onChange, ref, ...field }, fieldState: { error } }) => (
                            <>
                              <PhoneInput
                                {...field}
                                inputProps={{
                                  ref,
                                  required: true,
                                  autoFocus: true,
                                }}
                                country={"SW"}
                                placeholder={"Enter Your phone number"}
                                onChange={(phone, code) => {
                                  const numberValue = phone.replace(/[^0-9]/g, "");
                                  onChange(numberValue); // Update the form state
                                  setValue("phone_number", numberValue); // Update manually
                                }}
                                disabled={!isEmailVerified.isVerify}
                                disableCountryGuess={false}
                              />
                              {/* Display error message if any */}
                              {error && <ErrorMsg error={error.message} />}
                            </>
                          )}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Profession *</label>
                        <input
                          type="text"
                          disabled={!isEmailVerified.isVerify}
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

                    <Row>
                      <Col>
                        <LocationField
                          fieldName="address"
                          formConfig={formConfig}
                          className="form-control form-select apply_experiance"
                          placeholder="Enter Address here"
                          label={`Address *`}
                          rules={{ required: "Address is required" }}
                          options={{
                            types: ["address"],
                          }}
                          callBack={fillAddress}
                        />
                      </Col>

                      <Col lg={12}>
                        <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Language Preferences*
                          </label>
                          <Controller
                            name="{language_preference}"
                            control={control}
                            render={({
                              field: { onChange, ref, ...field },
                            }) => (
                              <Autocomplete
                                {...field}
                                multiple={true}
                                options={language_preference}
                                getOptionLabel={(option) => option.label}
                                disabled={!isEmailVerified.isVerify}
                                onChange={(language_preference, value) => {
                                  let lang = value.map((res) => res.value).join(',');
                                  setValue("language_preference", lang);
                                }}
                                
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Language Preference"
                                  />
                                )}
                              />
                            )}
                          />
                        </div>
                        {errors.language_preference && (
                          <ErrorMsg
                            error={errors.language_preference.message}
                          />
                        )}
                      </Col>

                      <Col lg={6}>
                        <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Country*
                          </label>
                          <input
                            type="text"
                            name="country"
                            className="form-control apply_country"
                            disabled={!isEmailVerified.isVerify}
                            placeholder="Enter Country"
                            {...register("country", {
                              required: "Country is required",
                            })}
                          />
                          {errors.country && (
                            <ErrorMsg error={errors.country.message} />
                          )}
                        </div>
                      </Col>

                      <Col lg={6}>
                        <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Zipcode*
                          </label>
                          <input
                            type="text"
                            name="zip_code"
                            disabled={!isEmailVerified.isVerify}
                            className="form-control apply_zipcode"
                            placeholder="Enter Zipcode"
                            {...register("zip_code", {
                              required: "Zipcode is required",
                            })}
                          />
                        </div>
                        {errors.zip_code && (
                          <ErrorMsg error={errors.zip_code.message} />
                        )}
                      </Col>

                      <Col lg={6}>
                        <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Experience*
                          </label>
                          <select
                            name="experience"
                            className="form-control form-select apply_experiance"
                            disabled={!isEmailVerified.isVerify}
                            {...register("experience", {
                              required: "Experience is required",
                            })}
                          >
                            <option value="">Select Experience</option>
                            <option value="1-2 Year">1-2 Year</option>
                            <option value="3-4 Year">3-4 Year</option>
                            <option value="5+ Year">5+ Year</option>
                          
                          </select>
                        </div>
                        {errors.experience && (
                          <ErrorMsg error={errors.experience.message} />
                        )}
                      </Col>

                      <Col lg={6}>
                        <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Timezone*
                          </label>

                          <input
                            type="text"
                            name="time_zone"
                            disabled={!isEmailVerified.isVerify}
                            className="form-control"
                            placeholder="Enter Time Zone"
                            {...register("time_zone", {
                              required: "time_zone is required",
                            })}
                          />
                        </div>
                        {/* {errors.time_zone && (
                          <ErrorMsg error={errors.time_zone.message} />
                        )} */}
                      </Col>
                    </Row>

                    {jobDetails?.screening_questions?.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Job Screening Questions</label>
                        <div className="form-text">Answer these to help us match you better.</div>
                      </div>
                    )}
                    <div className="questions-listing">
                      {jobDetails?.screening_questions?.map((res, index) => (
                        <div key={index} className="form-group">
                          <label className="form-label">
                          {res.question} {res.is_required ? <span className="required-star">*</span> : null}
                        </label>

                          {res.web_type === "input" ? (
                            <input
                              type="text"
                              placeholder="Enter Answer"
                              disabled={!isEmailVerified.isVerify}
                              {...register(`question_${index}`)}
                            />
                          ) : res.web_type === "radio" ? (
                            <div className="radio-options">
                              <div>
                                <input
                                  type="radio"
                                  id={`yes_${index}`}
                                  name={`radio_${index}`}
                                  disabled={!isEmailVerified.isVerify}
                                  {...register(`question_${index}`)}
                                  value="yes"
                                />
                                <label
                                  className="form-label"
                                  htmlFor={`yes_${index}`}
                                >
                                  Yes
                                </label>
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  id={`no_${index}`}
                                  name={`radio_${index}`}
                                  disabled={!isEmailVerified.isVerify}
                                  {...register(`question_${index}`)}
                                  value="no"
                                />
                                <label
                                  className="form-label"
                                  htmlFor={`no_${index}`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                            ) : res.web_type === "range" ? (
                              <div className="range-container">
                                <Form.Range
                                  {...register(`question_${index}`)}
                                  disabled={!isEmailVerified.isVerify}
                                  value={rangeValue}
                                  onChange={(e) => {
                                    handleRange(e);
                                    setRangeValue(e.target.value); 
                                  }}
                                  className="custom-slider"
                                  min={res.min}
                                  max={res.max}
                                />
                                 <div className="range-values">
                                  <span>Current: {rangeValue}</span>
                                </div>
                              </div>
                            ) : null}
  
                        </div>
                      ))}
                    </div>
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
                    <label className="form-label">Upload your CV *</label>
                    <div className="upload-box">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="file-input"
                      />
                   
                      {cvUploadLoading ? <span className="loader-wrapper" style={{marginLeft: '10px'}}></span> :
                       <span>Upload Document</span> 
                    }
                    </div>
                    {resumeUploadError?.file && (
                      <span>{resumeUploadError.file.name} </span>
                    )}
                    {uploadedCvUrl && (
                      <span style={{color: 'green'}}>✓ CV uploaded successfully</span>
                    )}
                    {resumeUploadError?.show && (
                      <ErrorMsg error={resumeUploadError.msg} />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Video</label>
                    <div className="upload-box">
                      <input
                        type="file"
                        onChange={handleVideoUpload}
                        className="file-input"
                        accept="video/mp4, video/mkv, video/avi, video/mov, video/webm"
                      />
                      <span>Upload Video</span>
                      {videoUploadLoading && <span className="loader-wrapper" style={{marginLeft: '10px'}}></span>}
                    </div>
                    {videoUploadError?.file && (
                      <span>{videoUploadError.file.name} </span>
                    )}
                    {uploadedVideoUrl && (
                      <span style={{color: 'green'}}>✓ Video uploaded successfully</span>
                    )}
                    {videoUploadError?.show && (
                      <ErrorMsg error={videoUploadError.msg} />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Create / Record Video</label>
                    <div className="upload-video-box custom_video_Recorder">
                      <VideoRecorder onRecordingComplete={handleRecordingComplete} />
                      {recordingUploadLoading && (
                        <div style={{marginTop: '10px'}}>
                          <span className="loader-wrapper"></span>
                        </div>
                      )}
                      {uploadedRecordingUrl && (
                        <div style={{marginTop: '10px', color: 'green'}}>
                          ✓ Recording uploaded successfully
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Application Letter</label>
                    <textarea
                      name="application_letter_text"
                      placeholder="Enter a short application text (max 1500 characters)"
                      {...register("application_letter_text")}
                      maxLength={1500}
                      className="application-textarea"
                    />
                    {}
                    {errors?.application_letter_text && (
                      <ErrorMsg
                        error={errors.application_letter_text.message}
                      />
                    )}
                  </div>

                  <div className="form-group checkbox-group ">
                    <label className="form-label d-flex align-items-center gap-3">
                      <input type="checkbox" className="w-auto" />
                      <div>
                        I confirm that I have read and agree to the{" "}
                        <a href="#">User Agreement</a>,{" "}
                        <a href="#">Privacy Policy</a>, and{" "}
                        <a href="#">Cookie Notice</a>.
                      </div>
                    </label>
                  </div>

                  <button className="submit-btn" type="submit">
                    Apply Now
                  </button>
                </div>
              )}
            </form>
          </div>
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
      </div>
    </div>
  );
};
export default Sidebar;
