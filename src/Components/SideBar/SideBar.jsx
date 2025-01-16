import { useState } from "react";
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

const Sidebar = ({ isOpen, onClose, jobDetails }) => {
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
  const [isEmailVerified, setIsEmailVerified] = useState({
    isVerify: true,
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
  const [rangeValue, setRangeValue] = useState(0);

  const workTypeOptions = [
    { label: "Onsite", value: "onsite" },
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
  ];

  const language_preference = [
    { label: "English", value: "English" },
    { label: "Swedsih", value: "Swedsih" },
  ];

  const options = ["establishment", "geocode"];

  const nextPage = () => {
    if (!isEmailVerified.isVerify) {
      setShowVerifyEmailError(true);
      return;
    }
    handleSubmit(() => setShowNext(false))();
  };

  const handlePlaceSelected = async (place) => {
    setValue(fieldName, place?.formatted_address);

    const addressComponents = place?.address_components;
    const zipCodeObj = addressComponents?.find((component) =>
      component.types.includes("postal_code")
    );

    const countryObj = addressComponents?.find((component) =>
      component.types.includes("country")
    );
    const country = countryObj ? countryObj.long_name : null;
    setValue(`country_code`, country);

    const zipCode = zipCodeObj ? zipCodeObj.long_name : null;
    setValue("passcode", zipCode);

    const { lat, lng } = place.geometry.location;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat()},${lng()}&timestamp=${Math.floor(
          Date.now() / 1000
        )}&key=${GOOGLE_MAP_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const rawOffset = data.rawOffset;
        const dstOffset = data.dstOffset;
        const totalOffset = rawOffset + dstOffset;

        const hours = Math.floor(totalOffset / 3600);
        const minutes = Math.abs((totalOffset % 3600) / 60);

        const sign = hours >= 0 ? "+" : "-";
        const utcOffsetString = `UTC ${sign}${Math.abs(hours)}:${
          minutes === 0 ? "00" : minutes
        }`;

        const timezone = data.timeZoneId;
        const formattedResponse = `${timezone} ${utcOffsetString}`;
        setValue("time_zone", formattedResponse);
      } else {
        console.error("Error fetching timezone data: ", data.status);
      }
    } catch (error) {
      console.error("Error calling Google Timezone API: ", error);
    }
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
    console.log(data?.address, "log this is address data");
    setLoader(true);
    const addressInfo = await returnAddressInfo(
      data?.address?.address_components,
      data?.address?.geometry
    );
    console.log(addressInfo, "this is address info");
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
        email: data.email,
        name: data.firstName + data.lastName,
        // country_code: data.country_code,
        phone_number: data.phone_number.replace(/[^\d]/g, ""),
        profession: data.profession,
        work_type: data.work_type,
        language_preference: data.language_preference,
        experience: data.experience,
        address: data.address,
        country: data.country,
        time_zone: data.time_zone,
        zip_code: data.zip_code,
        external_id: isEmailVerified.external_id,
        job_id: jobDetails.job_external_id,
        resume_file: resumeLocation,
        video_file: videoLocation,
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
            >
              &times;
            </button>
          </div>
          <div className="career-sidebar-heading">
            <p>Application</p>
            <h5>{jobDetails?.title}</h5>
          </div>
          {loader && <ScreenLoader />}
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
                        {/* <PhoneInput
                            disabled={isEmailVerified.isVerify}
                            placeholder="Enter Your phone number"
                            defaultCountry="SW"
                            country="SW"
                            value={watch("phone_number")}
                            inputProps={
                              ({
                                name: "phone_number",
                                required: true,
                              },
                              {
                                ...register("phone_number", {
                                  required: "Phone number is required",
                                }),
                              })
                            }
                          />
                          {errors.phone_number && (
                            <ErrorMsg error={errors.phone_number.message} />
                          )} */}
                        <Controller
                          name={"phone_numer"}
                          control={control}
                          // rules={{ validate: validatePhoneNumber }}
                          render={({ field: { onChange, ref, ...field } }) => (
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
                                const numberValue = phone.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                setValue("phone_number", numberValue);
                                // setValue("country_code", code?.countryCode);
                              }}
                              disabled={!isEmailVerified.isVerify}
                              disableCountryGuess={false}
                            />
                          )}
                        />
                        {/* <input
                            type="text"
                            name="phone_number"
                            placeholder="+1"
                            {...register("phone_number", {
                              required: "Phone number is required",
                              onChange: (e) => {
                                const numberValue = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                setValue("phone_number", numberValue);
                              },
                            })}
                          /> */}
                        {errors.phone_number && (
                          <ErrorMsg error={errors.phone_number.message} />
                        )}
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
                                  setValue(
                                    "language_preference",
                                    language_preference
                                  );
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
                            <option value="1 Year">1 Year</option>
                            <option value="2 Year">2 Year</option>
                          </select>
                        </div>
                        {errors.experience && (
                          <ErrorMsg error={errors.experience.message} />
                        )}
                      </Col>

                      <Col lg={6}>
                        {/* uncomment this */}
                        {/* <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Address*
                          </label>
                          <input
                            type="text"
                            name="address"
                            disabled={!isEmailVerified.isVerify}
                            className="form-control apply_address"
                            placeholder="Enter address"
                            {...register("address", {
                              required: "Address is required",
                            })}
                          />
                          {errors.address && (
                            <ErrorMsg error={errors.address.message} />
                          )}
                        </div> */}
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

                      <Col lg={12}>
                        <div className="mb-3">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label"
                          >
                            Timezone*
                          </label>

                          {/* <Controller
                            name="{time_zone}"
                            control={control}
                            render={({ field }) => (
                              <Autocomplete
                                {...field}
                                apiKey={GOOGLE_MAP_API_KEY}
                                debounce={1000}
                                onPlaceSelected={handlePlaceSelected}
                                disabled={!isEmailVerified.isVerify}
                                onChange={(e) => {
                                  debugger;
                                  setValue("time_zone", e.target.value);
                                }}
                                options={{
                                  types: ["establishment", "geocode"],
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Time Zone"
                                  />
                                )}
                              />
                            )}
                          /> */}
                        </div>
                        {errors.time_zone && (
                          <ErrorMsg error={errors.time_zone.message} />
                        )}
                      </Col>
                    </Row>

                    <div className="questions-listing">
                      {jobDetails?.screening_questions?.map((res, index) => (
                        <div key={index} className="form-group">
                          <label className="form-label">{res.question}</label>
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
                            <Form.Range
                              {...register(`question_${index}`)}
                              disabled={!isEmailVerified.isVerify}
                              value={rangeValue}
                              onChange={handleRange}
                              className="custom-slider"
                            />
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
                    <label className="form-label">Upload Video</label>
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
                    <label className="form-label">Upload Video</label>
                    <div className="upload-video-box">
                      <VideoRecorder />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Application Letter</label>
                    <textarea
                      name="application_letter_text"
                      placeholder="Enter a short application text (max 1500 characters)"
                      {...register("application_letter_text", {
                        required: "Application Letter is required",
                      })}
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
