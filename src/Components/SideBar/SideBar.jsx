import { useEffect, useState,React } from "react";
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
import { useNavigate } from "react-router-dom";

// Utility function to trim file names
const trimFileName = (fileName, maxLength = 30) => {
  if (!fileName) return '';
  if (fileName.length <= maxLength) return fileName;
  
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  const trimmedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
  
  return `${trimmedName}.${extension}`;
};

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
  const navigate=useNavigate()
  
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
  const [applicationLetterUploadError, setApplicationLetterUploadError] = useState({
    show: false,
    msg: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [rangeValue, setRangeValue] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  // Loading states for individual uploads
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [recordingUploadLoading, setRecordingUploadLoading] = useState(false);
  const [applicationLetterUploadLoading, setApplicationLetterUploadLoading] = useState(false);
  
  // URLs for uploaded files
  const [uploadedCvUrl, setUploadedCvUrl] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [uploadedRecordingUrl, setUploadedRecordingUrl] = useState(null);
  const [uploadedApplicationLetterUrl, setUploadedApplicationLetterUrl] = useState(null);
  
  // Selected files state
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedApplicationLetterFile, setSelectedApplicationLetterFile] = useState(null);
  
  // Email verification state
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(() => {
    // Check if email was previously verified in this session
    const savedStatus = localStorage.getItem('emailVerificationStatus');
    const savedEmail = localStorage.getItem('verifiedEmail');
    const verificationTime = localStorage.getItem('emailVerificationTime');
    
    // Check if verification has expired (30 minutes = 1800000 ms)
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (savedStatus === 'verified' && savedEmail && verificationTime) {
      const timeSinceVerification = now - parseInt(verificationTime);
      
      // If more than 30 minutes have passed, clear the verification
      if (timeSinceVerification > thirtyMinutes) {
        localStorage.removeItem('emailVerificationStatus');
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('emailVerificationTime');
        localStorage.removeItem('verifiedExternalId');
        return 'unverified';
      }
      
      return 'verified';
    }
    return 'unverified';
  });
  // Watch the agreement checkbox value from React Hook Form
  const isAgreementChecked = watch("agreement") || false;

  // Effect to handle email verification status persistence
  useEffect(() => {
    const currentEmail = watch("email");
    if (emailVerificationStatus === 'verified' && currentEmail) {
      localStorage.setItem('emailVerificationStatus', 'verified');
      localStorage.setItem('verifiedEmail', currentEmail);
      localStorage.setItem('emailVerificationTime', Date.now().toString());
      // Update the parent component's verification status
      setIsEmailVerified({ isVerify: true, external_id: localStorage.getItem('verifiedExternalId') });
    } else if (emailVerificationStatus === 'unverified') {
      localStorage.removeItem('emailVerificationStatus');
      localStorage.removeItem('verifiedEmail');
      localStorage.removeItem('emailVerificationTime');
      localStorage.removeItem('verifiedExternalId');
      setIsEmailVerified({ isVerify: false });
    }
  }, [emailVerificationStatus, watch, setIsEmailVerified]);

  // Effect to check and restore verification status on component mount
  useEffect(() => {
    const savedStatus = localStorage.getItem('emailVerificationStatus');
    const savedEmail = localStorage.getItem('verifiedEmail');
    const savedExternalId = localStorage.getItem('verifiedExternalId');
    const verificationTime = localStorage.getItem('emailVerificationTime');
    
    if (savedStatus === 'verified' && savedEmail && savedExternalId && verificationTime) {
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      const timeSinceVerification = now - parseInt(verificationTime);
      
      if (timeSinceVerification <= thirtyMinutes) {
        setEmailVerificationStatus('verified');
        setIsEmailVerified({ isVerify: true, external_id: savedExternalId });
        // Always set the email in the form when verified
        setValue("email", savedEmail);
        // Trigger validation to clear any errors
        setTimeout(() => trigger("email"), 100);
      } else {
        // Clear expired verification
        localStorage.removeItem('emailVerificationStatus');
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('emailVerificationTime');
        localStorage.removeItem('verifiedExternalId');
        setEmailVerificationStatus('unverified');
        setIsEmailVerified({ isVerify: false });
      }
    }
  }, [setIsEmailVerified, setValue, watch, trigger]);

  // Effect to prefill email when sidebar is opened and email is verified
  useEffect(() => {
    if (isOpen && emailVerificationStatus === 'verified') {
      const savedEmail = localStorage.getItem('verifiedEmail');
      if (savedEmail) {
        setValue("email", savedEmail);
        // Trigger validation to clear any errors
        setTimeout(() => trigger("email"), 100);
      }
    }
  }, [isOpen, emailVerificationStatus, setValue, trigger]);

  // Effect to restore email when going back to form
  useEffect(() => {
    if (currentStep === 1 && emailVerificationStatus === 'verified') {
      const savedEmail = localStorage.getItem('verifiedEmail');
      if (savedEmail) {
        setValue("email", savedEmail);
        // Trigger validation to clear any errors
        setTimeout(() => trigger("email"), 100);
      }
    }
  }, [currentStep, emailVerificationStatus, setValue, trigger]);

  // Effect to reset verification status if email changes
  useEffect(() => {
    const currentEmail = watch("email");
    const savedEmail = localStorage.getItem('verifiedEmail');
    
    if (savedEmail && currentEmail !== savedEmail && emailVerificationStatus === 'verified') {
      setEmailVerificationStatus('unverified');
      setIsEmailVerified({ isVerify: false });
      localStorage.removeItem('emailVerificationStatus');
      localStorage.removeItem('verifiedEmail');
      localStorage.removeItem('emailVerificationTime');
      localStorage.removeItem('verifiedExternalId');
    }
  }, [watch("email"), emailVerificationStatus, setIsEmailVerified]);

  // Effect to check for verification expiration every minute
  useEffect(() => {
    if (emailVerificationStatus === 'verified') {
      const checkExpiration = () => {
        const verificationTime = localStorage.getItem('emailVerificationTime');
        if (verificationTime) {
          const now = Date.now();
          const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
          const timeSinceVerification = now - parseInt(verificationTime);
          
          if (timeSinceVerification > thirtyMinutes) {
            setEmailVerificationStatus('unverified');
            setIsEmailVerified({ isVerify: false });
            localStorage.removeItem('emailVerificationStatus');
            localStorage.removeItem('verifiedEmail');
            localStorage.removeItem('emailVerificationTime');
            localStorage.removeItem('verifiedExternalId');
            toast.info('Email verification has expired. Please verify again.');
          }
        }
      };

      // Check immediately
      checkExpiration();
      
      // Check every minute
      const interval = setInterval(checkExpiration, 60000); // 60000ms = 1 minute
      
      return () => clearInterval(interval);
    }
  }, [emailVerificationStatus, setIsEmailVerified]);

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

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate Step 1: Personal Information
    if (!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')) {
      setShowVerifyEmailError(true);
      return;
    }
      // Trigger validation for step 1 fields
      const step1Fields = ['firstName', 'lastName', 'phone_number', 'profession', 'address', 'language_preference', 'country', 'zip_code', 'experience', 'time_zone'];
      const isValid = step1Fields.every(field => {
        const value = getValues(field);
        return value && value.toString().trim() !== '';
      });
      
      if (!isValid) {
        toast.error("Please fill in all required fields in Step 1");
        return;
      }
      
      // If there are no screening questions, skip to step 3
      if (jobDetails?.screening_questions?.length === 0) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Validate Step 2: Screening Questions (if they exist)
      if (jobDetails?.screening_questions?.length > 0) {
        const screeningFields = jobDetails.screening_questions.map((_, index) => `question_${index}`);
        const isValid = screeningFields.every(field => {
          const value = getValues(field);
          return value && value.toString().trim() !== '';
        });
        
        if (!isValid) {
          toast.error("Please answer all screening questions");
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // For step 3, the next button should trigger form submission
      // This will be handled by the form's onSubmit
      beforeHandleSUbmit(new Event('submit'));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 3 && jobDetails?.screening_questions?.length === 0) {
        // If we're on step 3 and there are no screening questions, go back to step 1
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
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

      // Clear any previous errors and start loading
      setResumeUploadError({ show: false, msg: "", file: "" });
      setCvUploadLoading(true);
      setSelectedCvFile(null); // Don't show selected file yet
      
      // Upload the file immediately
      try {
        await uploadCvFile(file);
        // Only set selected file after successful upload
        setSelectedCvFile(file);
      } catch (error) {
        setCvUploadLoading(false);
        setResumeUploadError({
          show: true,
          msg: "Failed to upload CV. Please try again.",
        });
        // Reset file input on error
        event.target.value = "";
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

      // Clear any previous errors and start loading
      setVideoUploadError({ show: false, msg: "", file: "" });
      setVideoUploadLoading(true);
      setSelectedVideoFile(null); // Don't show selected file yet
      
      // Upload the file immediately
      try {
        await uploadVideoFile(file);
        // Only set selected file after successful upload
        setSelectedVideoFile(file);
      } catch (error) {
        setVideoUploadLoading(false);
        setVideoUploadError({
          show: true,
          msg: "Failed to upload video. Please try again.",
        });
        // Reset file input on error
        event.target.value = "";
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

  const uploadApplicationLetterFile = async (file) => {
    setApplicationLetterUploadLoading(true);
    try {
      const response = await webSiteBuilderFormInstance.post("/web/upload-file", {
        file: file,
      });
      const fileUrl = response.data.data.Location;
      setUploadedApplicationLetterUrl(fileUrl);
      toast.success("Application letter uploaded successfully!");
      return fileUrl;
    } catch (error) {
      console.error("Error uploading application letter:", error);
      toast.error("Failed to upload application letter. Please try again.");
      throw error;
    } finally {
      setApplicationLetterUploadLoading(false);
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

  const handleApplicationLetterUpload = async (event) => {
    // Define allowed file types for application letter
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    // Set maximum file size (optional, e.g., 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

    const file = event.target.files[0];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        // Handle invalid file type
        event.target.value = "";
        setApplicationLetterUploadError({
          show: true,
          msg: "Invalid file format. Please upload a valid document format (e.g., .pdf, .doc, .docx, .txt).",
        });
        return;
      }

      if (file.size > maxFileSize) {
        // Handle file size limit
        event.target.value = "";
        setApplicationLetterUploadError({
          show: true,
          msg: `File size too large. Maximum allowed size is ${
            maxFileSize / (1024 * 1024)
          }MB.`,
        });
        return;
      }

      // Clear any previous errors and start loading
      setApplicationLetterUploadError({ show: false, msg: "" });
      setApplicationLetterUploadLoading(true);
      setSelectedApplicationLetterFile(null); // Don't show selected file yet
      
      // Upload the file immediately
      try {
        await uploadApplicationLetterFile(file);
        // Only set selected file after successful upload
        setSelectedApplicationLetterFile(file);
      } catch (error) {
        setApplicationLetterUploadLoading(false);
        setApplicationLetterUploadError({
          show: true,
          msg: "Failed to upload application letter. Please try again.",
        });
        // Reset file input on error
        event.target.value = "";
      }
    } else {
      // Handle case when no file is selected
      event.target.value = "";
      setApplicationLetterUploadError({
        show: true,
        msg: "No file selected. Please choose an application letter file to upload.",
      });
    }
  };

  // Delete functions for selected files
  const deleteSelectedCvFile = () => {
    setSelectedCvFile(null);
    setUploadedCvUrl(null);
    setResumeUploadError({ show: false, msg: "", file: "" });
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const deleteSelectedVideoFile = () => {
    setSelectedVideoFile(null);
    setUploadedVideoUrl(null);
    setVideoUploadError({ show: false, msg: "" });
    // Reset the video file input
    const videoInput = document.querySelector('input[type="file"][accept*="video"]');
    if (videoInput) {
      videoInput.value = '';
    }
  };

  const deleteSelectedApplicationLetterFile = () => {
    setSelectedApplicationLetterFile(null);
    setUploadedApplicationLetterUrl(null);
    setApplicationLetterUploadError({ show: false, msg: "" });
    // Reset the application letter file input
    const applicationLetterInput = document.querySelector('input[type="file"][accept*="application"]');
    if (applicationLetterInput) {
      applicationLetterInput.value = '';
    }
  };

  // Function to handle email change
  const handleEmailChange = () => {
    setEmailVerificationStatus('unverified');
    setIsEmailVerified({ isVerify: false });
    localStorage.removeItem('emailVerificationStatus');
    localStorage.removeItem('verifiedEmail');
    localStorage.removeItem('emailVerificationTime');
    localStorage.removeItem('verifiedExternalId');
    // Clear the email field
    setValue("email", "");
  };

  const beforeHandleSUbmit = (event) => {
    event.preventDefault();
    if (!uploadedCvUrl) {
      setResumeUploadError({ show: true, msg: "Please upload your CV first" });
      return;
    }
    if (!isAgreementChecked) {
      toast.error("Please agree to the terms and conditions");
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
    setApplicationLetterUploadError({ show: false, msg: "" });
    setRecordedBlob(null);
    setUploadedCvUrl(null);
    setUploadedVideoUrl(null);
    setUploadedRecordingUrl(null);
    setUploadedApplicationLetterUrl(null);
    setSelectedCvFile(null);
    setSelectedVideoFile(null);
    setSelectedApplicationLetterFile(null);
    setEmailVerificationStatus('unverified');
    setCvUploadLoading(false);
    setVideoUploadLoading(false);
    setRecordingUploadLoading(false);
    setApplicationLetterUploadLoading(false);
    // Clear localStorage when closing sidebar
    localStorage.removeItem('emailVerificationStatus');
    localStorage.removeItem('verifiedEmail');
    localStorage.removeItem('emailVerificationTime');
    localStorage.removeItem('verifiedExternalId');
    reset();
    setCurrentStep(1);
    onClose();
  };

  const onSubmit = async (data) => {
    console.log(data?.address, "log this is address data");
    console.log(isEmailVerified,"isEmailVerified")
    setScreenLoader(true);

    try {
      // Get external_id with fallback to localStorage
      const externalId = isEmailVerified.external_id || localStorage.getItem('verifiedExternalId');
      
      console.log('External ID Debug:', {
        isEmailVerified: isEmailVerified,
        externalIdFromState: isEmailVerified.external_id,
        externalIdFromLocalStorage: localStorage.getItem('verifiedExternalId'),
        finalExternalId: externalId
      });
      
      // Validate that we have an external_id
      if (!externalId) {
        toast.error("Email verification is required. Please verify your email first.");
        setScreenLoader(false);
        return;
      }

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
        external_id: externalId,
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

      // Add application letter file URL if uploaded
      if (uploadedApplicationLetterUrl) {
        payload.application_letter_file = uploadedApplicationLetterUrl;
      }

      console.log(payload, "Payload for Job Application");

      // Submit Job Application
      await submitApplyJob(payload);
      setScreenLoader((prev) => !prev);
      
      // Clear localStorage after successful submission
     
      
    } catch (error) {
      console.error(error, "Error occurred during submission!");
      setScreenLoader((prev) => !prev);
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    }
  };
console.log(isEmailVerified,"isEmailVerified")
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
    setEmailVerificationStatus('verifying');
    const email = watch("email");
    if (!email || !EMAIL_REGEX.test(email)) {
      trigger("email");
      setEmailVerificationStatus('unverified');
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
      const message = response.data.message || "OTP sent successfully";
      toast.success(message);
      console.log("Opening OTP Modal...");
      setShowOTPModal(true);
      console.log("OTP Modal state after setting:", true);
      console.log(response, "response");
    } catch (err) {
      setScreenLoader((prev) => !prev);
      setEmailVerificationStatus('unverified');
      console.log(err, "error !!!!!!!!!!");
      const message = err?.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleConnect = async () => {
    setScreenLoader(true);
    try {
      // Get external_id with fallback to localStorage
      const externalId = isEmailVerified.external_id || localStorage.getItem('verifiedExternalId');
      
      if (!externalId) {
        toast.error("Email verification is required. Please verify your email first.");
        setScreenLoader(false);
        return;
      }

      const response = await updatedURLInstance.post(
        `/web/career/connect`,{
          id: externalId,
          job_id: jobDetails.job_external_id
        }
      );
      setShowThankYouModal(false);
      
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
            {/* Step Progress Indicator */}
            <div className="step-progress" style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '0 10px',
              position: 'relative'
            }}>
              {(jobDetails?.screening_questions?.length > 0 ? [1, 2, 3] : [1, 3]).map((step, index) => (
                <div key={step} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative'
                }}>
                  {/* Connecting line */}
                  {index < (jobDetails?.screening_questions?.length > 0 ? 2 : 1) && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      background: currentStep > step ? 'linear-gradient(to right, #FF6868, #C0A9FF)' : '#e9ecef',
                      zIndex: 1
                    }} />
                  )}
                  
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: currentStep >= step ? 'linear-gradient(to right, #FF6868, #C0A9FF)' : '#e9ecef',
                    color: currentStep >= step ? 'white' : '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    // border: currentStep === step ? '2px solid #007bff' : '2px solid #e9ecef',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {jobDetails?.screening_questions?.length > 0 ? step : (step === 1 ? 1 : 2)}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: currentStep >= step ? 'purple' : '#6c757d',
                    textAlign: 'center',
                    fontWeight: currentStep >= step ? '600' : '400'
                  }}>
                    {jobDetails?.screening_questions?.length > 0 
                      ? (step === 1 ? 'Personal Info' : step === 2 ? 'Screening' : 'Upload')
                      : (step === 1 ? 'Personal Info' : 'Upload')
                    }
                  </span>
                </div>
              ))}
            </div>
            
            {/* Back Button */}
            {currentStep > 1 && currentStep !== 3 && (
              <button 
                type="button" 
                className="back-btn" 
                onClick={prevStep}
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
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div>
                  <div className="form-group position-relative">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="email"
                        className="form-control user_email"
                        placeholder="Enter Email"
                        disabled={emailVerificationStatus === 'verified'}
                        style={{
                          backgroundColor: emailVerificationStatus === 'verified' ? '#f8fff8' : 'white',
                          borderColor: emailVerificationStatus === 'verified' ? '#28a745' : '#e9ecef',
                          borderWidth: emailVerificationStatus === 'verified' ? '2px' : '1px',
                          color: emailVerificationStatus === 'verified' ? '#155724' : 'inherit'
                        }}
                        {...register("email", {
                          required: emailVerificationStatus !== 'verified' ? "Email is required" : false,
                          pattern: {
                            value: EMAIL_REGEX,
                            message: "Enter a valid email address",
                          },
                        })}
                      />
                      <span className="verifyb-btn-section">
                        {emailVerificationStatus === 'verified' ? (
                       <></>
                        ) : (
                          <button
                            className="verify-mail-career"
                            onClick={handleVerifyEmail}
                            type="button"
                            disabled={emailVerificationStatus === 'verifying'}
                            style={{
                              opacity: emailVerificationStatus === 'verifying' ? 0.7 : 1,
                              cursor: emailVerificationStatus === 'verifying' ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {emailVerificationStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                      </span>
                    </div>
                    {emailVerificationStatus === 'verified' && (
                      <div style={{ 
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{
                          color: '#28a745',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>✓</span>
                          Verified Email
                        </span>
                        <button
                          type="button"
                          onClick={handleEmailChange}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#007bff',
                            fontSize: '12px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Change Email
                        </button>
                      </div>
                    )}
                    {errors.email && <ErrorMsg error={errors.email.message} />}
                  </div>
                  <div
                    className={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified') ? "showDisabled" : ""}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                          disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                                disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                          disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                        <div className="mb-3 language-preferences-container">
                          <label
                            htmlFor="language_preference"
                            className="form-label"
                            style={{
                              fontWeight: '600',
                              color: '#2c3e50',
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}
                          >
                            Language Preferences*
                          </label>
                          <Controller
                            name="language_preference"
                            control={control}
                            render={({
                              field: { onChange, ref, value, ...field },
                            }) => {
                              const [selectedLanguages, setSelectedLanguages] = useState([]);
                              const [inputValue, setInputValue] = useState('');
                              const [showSuggestions, setShowSuggestions] = useState(false);

                              // Initialize selected languages from form value
                              useEffect(() => {
                                if (value && typeof value === 'string' && value.trim() !== '') {
                                  const languageValues = value.split(',');
                                  const selectedLangs = languageValues
                                    .map(langValue => language_preference.find(lang => lang.value === langValue.trim()))
                                    .filter(lang => lang !== undefined);
                                  setSelectedLanguages(selectedLangs);
                                } else {
                                  setSelectedLanguages([]);
                                }
                              }, [value]);

                              // Filter languages based on input
                              const filteredLanguages = language_preference.filter(lang =>
                                lang.label.toLowerCase().includes(inputValue.toLowerCase()) &&
                                !selectedLanguages.some(selected => selected.value === lang.value)
                              );

                              // Handle adding language from input
                              const handleAddLanguage = (language) => {
                                if (!selectedLanguages.some(lang => lang.value === language.value)) {
                                  const newSelection = [...selectedLanguages, language];
                                  setSelectedLanguages(newSelection);
                                  const langString = newSelection.map(lang => lang.value).join(',');
                                  setValue("language_preference", langString);
                                  onChange(langString);
                                }
                                setInputValue('');
                                setShowSuggestions(false);
                              };

                              // Handle input change
                              const handleInputChange = (e) => {
                                const value = e.target.value;
                                setInputValue(value);
                                setShowSuggestions(value.length > 0);
                              };

                              // Handle input key press
                              const handleKeyPress = (e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (filteredLanguages.length > 0) {
                                    handleAddLanguage(filteredLanguages[0]);
                                  }
                                } else if (e.key === 'Backspace' && inputValue === '' && selectedLanguages.length > 0) {
                                  // Remove last selected language when backspace is pressed on empty input
                                  const newSelection = selectedLanguages.slice(0, -1);
                                  setSelectedLanguages(newSelection);
                                  const langString = newSelection.map(lang => lang.value).join(',');
                                  setValue("language_preference", langString);
                                  onChange(langString);
                                }
                              };

                              // Remove selected language
                              const removeLanguage = (languageToRemove) => {
                                const newSelection = selectedLanguages.filter(lang => lang.value !== languageToRemove.value);
                                setSelectedLanguages(newSelection);
                                const langString = newSelection.map(lang => lang.value).join(',');
                                setValue("language_preference", langString);
                                onChange(langString);
                              };

                              // Clear all selections
                              const clearAll = () => {
                                setSelectedLanguages([]);
                                setValue("language_preference", '');
                              };

                              return (
                                <div className="tag-input-container" style={{ position: 'relative' }}>
                                  {/* Tag Input Container */}
                                  <div 
                                    style={{
                                      border: '2px solid #e1e8ed',
                                      borderRadius: '12px',
                                      padding: '8px 12px',
                                      minHeight: '50px',
                                      backgroundColor: !(isEmailVerified.isVerify || emailVerificationStatus === 'verified') ? '#f8f9fa' : '#ffffff',
                                      cursor: !(isEmailVerified.isVerify || emailVerificationStatus === 'verified') ? 'not-allowed' : 'text',
                                      transition: 'all 0.3s ease',
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (isEmailVerified.isVerify || emailVerificationStatus === 'verified') {
                                        e.target.style.borderColor = '#3498db';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.borderColor = '#e1e8ed';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  >
                                    {/* Selected Language Tags */}
                                    {selectedLanguages.map((language) => (
                                      <div
                                        key={language.value}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          backgroundColor: '#e3f2fd',
                                          color: '#1976d2',
                                          border: '1px solid #bbdefb',
                                          borderRadius: '20px',
                                          padding: '6px 12px',
                                          fontSize: '13px',
                                          fontWeight: '500',
                                          height: '32px',
                                          maxWidth: '140px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          boxShadow: '0 2px 4px rgba(52, 152, 219, 0.1)',
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        <span style={{ marginRight: '6px', fontSize: '14px' }}>🌐</span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {language.label}
                                        </span>
                                        <span
                                          style={{
                                            cursor: 'pointer',
                                            marginLeft: '6px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#e74c3c',
                                            width: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onClick={() => removeLanguage(language)}
                                          onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.2)';
                                            e.target.style.transform = 'scale(1.1)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                                            e.target.style.transform = 'scale(1)';
                                          }}
                                        >
                                          ×
                                        </span>
                                      </div>
                                    ))}

                                    {/* Input Field */}
                                    <input
                                      type="text"
                                      value={inputValue}
                                      onChange={handleInputChange}
                                      onKeyDown={handleKeyPress}
                                      onFocus={() => setShowSuggestions(inputValue.length > 0)}
                                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                      placeholder={selectedLanguages.length === 0 ? "Type to add languages..." : ""}
                                      disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
                                      style={{
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '14px',
                                        flex: 1,
                                        minWidth: '120px',
                                        backgroundColor: 'transparent',
                                        color: '#2c3e50'
                                      }}
                                    />

                                    {/* Clear All Button */}
                                    {selectedLanguages.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={clearAll}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#e74c3c',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          transition: 'all 0.2s ease',
                                          marginLeft: 'auto'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.backgroundColor = 'transparent';
                                        }}
                                      >
                                        Clear All
                                      </button>
                                    )}
                                  </div>

                                  {/* Suggestions Dropdown */}
                                  {showSuggestions && filteredLanguages.length > 0 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: '#ffffff',
                                        border: '2px solid #e1e8ed',
                                        borderTop: 'none',
                                        borderRadius: '0 0 12px 12px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        zIndex: 1000,
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                      }}
                                    >
                                      {filteredLanguages.slice(0, 10).map((language) => (
                                        <div
                                          key={language.value}
                                          onClick={() => handleAddLanguage(language)}
                                          style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.2s ease',
                                            borderBottom: '1px solid #f8f9fa'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                          }}
                                        >
                                          <span style={{ marginRight: '8px', fontSize: '16px' }}>🌐</span>
                                          <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                                            {language.label}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }}
                          />
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#7f8c8d',
                            fontStyle: 'italic'
                          }}>
                            💡 Click to select multiple languages you're comfortable with
                          </div>
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
                            disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                            disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                            disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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
                            disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
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

                  </div>
                  {showVerifyEmailError && (
                    <ErrorMsg error={"Please verify the email first"} />
                  )}
                  <button className="next-btn" onClick={nextStep} type="button">
                    Next
                  </button>
                </div>
              )}

              {/* Step 2: Screening Questions */}
              {currentStep === 2 && (
                <div>
                  <h6 style={{ marginBottom: '20px', color: '#2c3e50' }}>Job Screening Questions</h6>
                  <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
                    Please answer these questions to help us match you better.
                  </p>
                  
                  {jobDetails?.screening_questions?.length > 0 ? (
                    <div className="questions-listing">
                      {jobDetails?.screening_questions?.map((res, index) => (
                        <div key={index} className="form-group">
                          <label className="form-label">
                          {(() => {
                            let displayQuestion = res.question;
                            if (res.question_type === "Skill" && res.question.includes("[Skill]")) {
                              displayQuestion = res.question.replace("[Skill]", res.title || "the skill");
                            } else if (res.question_type === "language" && res.question.includes("[Language]")) {
                              displayQuestion = res.question.replace("[Language]", res.title || "the language");
                            }
                            return displayQuestion;
                          })()} {res.is_required ? <span className="required-star">*</span> : null}
                        </label>

                          {res.question_type === "language" ? (
                            <div className="language-select-wrapper">
                              <select
                                className="form-control form-select apply_experiance language-proficiency-select"
                                {...register(`question_${index}`, {
                                  required: res.is_required ? "Please select a proficiency level" : false
                                })}
                              >
                                <option value="">Select proficiency level</option>
                                <option value="Conversational">Conversational</option>
                                <option value="Professional">Professional</option>
                                <option value="Native or Bilingual">Native or Bilingual</option>
                              </select>
                            </div>
                          ) : res.question_type === "Skill" ? (
                            <div className="skill-select-wrapper">
                              <select
                                className="form-control form-select apply_experiance skill-experience-select"
                                {...register(`question_${index}`, {
                                  required: res.is_required ? "Please select years of experience" : false
                                })}
                              >
                                <option value="">Select years of experience</option>
                                <option value="1-2">1-2</option>
                                <option value="2-3">2-3</option>
                                <option value="4-6">4-6</option>
                                <option value="7+">7+</option>
                              </select>
                            </div>
                          ) : res.web_type === "input" ? (
                            <input
                              type="text"
                              placeholder="Enter Answer"
                              {...register(`question_${index}`, {
                                required: res.is_required ? "This field is required" : false
                              })}
                            />
                          ) : res.web_type === "radio" ? (
                            <div className="radio-options">
                              <div className="custom-radio-wrapper">
                                <input
                                  type="radio"
                                  id={`yes_${index}`}
                                  name={`radio_${index}`}
                                  className="custom-radio-input"
                                  {...register(`question_${index}`, {
                                    required: res.is_required ? "Please select an option" : false
                                  })}
                                  value="yes"
                                />
                                <label
                                  className="custom-radio-label"
                                  htmlFor={`yes_${index}`}
                                >
                                  <span className="radio-custom"></span>
                                  <span className="radio-text">Yes</span>
                                </label>
                              </div>
                              <div className="custom-radio-wrapper">
                                <input
                                  type="radio"
                                  id={`no_${index}`}
                                  name={`radio_${index}`}
                                  className="custom-radio-input"
                                  disabled={!(isEmailVerified.isVerify || emailVerificationStatus === 'verified')}
                                  {...register(`question_${index}`)}
                                  value="no"
                                />
                                <label className="custom-radio-label" htmlFor={`no_${index}`}>
                                  <span className="radio-custom"></span>
                                  <span className="radio-text">No</span>
                                </label>
                              </div>
                            </div>
                            ) : res.web_type === "range" ? (
                              <div className="range-container">
                                <Form.Range
                                {...register(`question_${index}`, {
                                  required: res.is_required ? "Please select a value" : false
                                })}
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
                          {errors[`question_${index}`] && (
                            <ErrorMsg error={errors[`question_${index}`].message} />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#6c757d'
                    }}>
                      <p>No screening questions for this job.</p>
                  </div>
                  )}
                  
                  <button 
                    className="next-btn" 
                    type="button" 
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Step 3: Upload Documents */}
              {currentStep === 3 && (
                <div className="upload-section">
                  {/* Back Button at the top of Step 3 */}
                  <button 
                    type="button" 
                    className="back-btn" 
                    onClick={prevStep}
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
                  
                  <div className="form-group">
                    <label className="form-label">Upload your CV *</label>
                    {selectedCvFile && uploadedCvUrl ? (
                      <div className="selected-file-display" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa',
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>📄</span>
                          <div>
                            <div style={{ fontWeight: '500' }} title={selectedCvFile.name}>
                              {trimFileName(selectedCvFile.name)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {(selectedCvFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'green', fontSize: '12px' }}>✓ Uploaded</span>
                          <button
                            type="button"
                            onClick={deleteSelectedCvFile}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-box">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="file-input"
                          disabled={cvUploadLoading}
                        />
                        {cvUploadLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="loader-wrapper"></span>
                          </div>
                        ) : (
                          <span>Upload Document</span>
                        )}
                      </div>
                    )}
                    {resumeUploadError?.show && (
                      <ErrorMsg error={resumeUploadError.msg} />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Application Letter</label>
                    {selectedApplicationLetterFile && uploadedApplicationLetterUrl ? (
                      <div className="selected-file-display" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa',
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>📄</span>
                          <div>
                            <div style={{ fontWeight: '500' }} title={selectedApplicationLetterFile.name}>
                              {trimFileName(selectedApplicationLetterFile.name)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {(selectedApplicationLetterFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'green', fontSize: '12px' }}>✓ Uploaded</span>
                          <button
                            type="button"
                            onClick={deleteSelectedApplicationLetterFile}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-box">
                        <input
                          type="file"
                          onChange={handleApplicationLetterUpload}
                          className="file-input"
                          accept=".pdf,.doc,.docx,.txt"
                          disabled={applicationLetterUploadLoading}
                        />
                        {applicationLetterUploadLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="loader-wrapper"></span>
                          </div>
                        ) : (
                          <span>Upload Application Letter</span>
                        )}
                      </div>
                    )}
                    {applicationLetterUploadError?.show && (
                      <ErrorMsg error={applicationLetterUploadError.msg} />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Video</label>
                    {selectedVideoFile && uploadedVideoUrl ? (
                      <div className="selected-file-display" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa',
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>🎥</span>
                          <div>
                            <div style={{ fontWeight: '500' }} title={selectedVideoFile.name}>
                              {trimFileName(selectedVideoFile.name)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'green', fontSize: '12px' }}>✓ Uploaded</span>
                          <button
                            type="button"
                            onClick={deleteSelectedVideoFile}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-box">
                        <input
                          type="file"
                          onChange={handleVideoUpload}
                          className="file-input"
                          accept="video/mp4, video/mkv, video/avi, video/mov, video/webm"
                          disabled={videoUploadLoading}
                        />
                        {videoUploadLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="loader-wrapper"></span>
                          </div>
                        ) : (
                          <span>Upload Video</span>
                        )}
                      </div>
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
                    <label className="form-label">Comments</label>
                    <textarea
                      name="application_letter_text"
                      placeholder="Enter a short application text (max 1500 characters)"
                      {...register("application_letter_text")}
                      maxLength={1500}
                      className="application-textarea"
                    />
                    {errors?.application_letter_text && (
                      <ErrorMsg
                        error={errors.application_letter_text.message}
                      />
                    )}
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="form-label d-flex align-items-center gap-3" style={{ cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        className="w-auto" 
                        style={{ 
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          zIndex: 1,
                          position: 'relative'
                        }}
                        {...register("agreement", {
                          required: "You must agree to the terms and conditions"
                        })}
                      />
                      <div>
                        I confirm that I have read and agree to the{" "}
                        <a href="#">User Agreement</a>,{" "}
                        <a href="#">Privacy Policy</a>, and{" "}
                        <a href="#">Cookie Notice</a>.
                      </div>
                    </label>
                    {errors.agreement && (
                      <ErrorMsg error={errors.agreement.message} />
                    )}
                  </div>

                  <button 
                    className="submit-btn" 
                    type="submit"
                    disabled={!isAgreementChecked}
                    style={{
                      width: '100%',
                      opacity: !isAgreementChecked ? 0.6 : 1,
                      cursor: !isAgreementChecked ? 'not-allowed' : 'pointer',
                      marginTop: '20px'
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </form>
          </div>
          {showOTPModal && (
            <OTPModal
              modalIsOpen={showOTPModal}
              closeModal={() => {
                setShowOTPModal(false);
                // The verification status will be updated by the OTP modal when verification is successful
              }}
              email={watch("email")}
              setIsEmailVerified={(verificationData) => {
                setIsEmailVerified(verificationData);
                if (verificationData.isVerify) {
                  setEmailVerificationStatus('verified');
                  // Save the external_id for persistence
                  localStorage.setItem('verifiedExternalId', verificationData.external_id);
                } else {
                  setEmailVerificationStatus('unverified');
                  localStorage.removeItem('verifiedExternalId');
                }
              }}
            />
          )}
          {showThankYouModal && (
            <ThankYouModal
              isOpen={showThankYouModal}
              onClose={() => {
                navigate("/")
                setShowThankYouModal(false)
              } }
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

