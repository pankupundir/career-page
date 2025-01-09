import { useState } from "react";
import "./SideBar.css";
import "bootstrap/dist/css/bootstrap.min.css";

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
import { Form } from "react-bootstrap";
import { useParams } from "react-router-dom";

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
  const { jobId } = useParams();
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
  const [rangeValue, setRangeValue] = useState(0);

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
        email: data.email,
        // firstName: data.firstName,
        // lastName: data.lastName,
        phone_number: data.phone_number,
        profession: data.profession,
        work_type: data.apply_work_type,
        language_prefreance: data.language_prefreance,
        // experinace: data.apply_experiance,
        address: data.apply_address,
        country: data.apply_country,
        time_zone: data.apply_timezone,
        zip_code: data.apply_zipcode,
        application_letter_text: data.name,
        external_id: isEmailVerified.external_id,
        job_id: jobDetails.job_external_id,
        resume_file: resumeLocation,
        video_file: videoLocation,
        screeing_questions_answers: jobDetails.screening_questions?.map(
          (question, index) => ({
            question_id: question?.id,
            question: question?.question,
            answer: data[`question_${index}`] || "1",
            web_type: question.web_type || "range",
          })
        ),
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

  return (
    <div
      className={`offcanvas offcanvas-end ofcanvas-width ${
        isOpen ? "visiblity" : ""
      }`}
    >
      <div className="offcanvas-body">
        <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
          <div className="sidebar offcanvas-header">
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
                  <div className="form-group">
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
                      <button
                        className="verifyb-btn-section"
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
                      <input
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
                      />
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

                  {/* <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location *</label>
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
                </div> */}

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label
                        htmlFor="exampleInputPassword1"
                        className="form-label"
                      >
                        Work Type*
                      </label>
                      <select
                        name="apply_work_type"
                        className="form-control apply_work_type"
                        {...register("apply_work_type", {
                          required: "Work type is required",
                        })}
                      >
                        <option value="">Select Work Type</option>
                        <option value="Onsite">Onsite</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Contact">Contact</option>
                      </select>
                    </div>
                    {errors.apply_work_type && (
                      <ErrorMsg error={errors.apply_work_type.message} />
                    )}
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label for="exampleInputPassword1" className="form-label">
                        Language Prefreances*
                      </label>
                      <select
                        name="apply_language_prefreances"
                        className="form-control apply_language_prefreances"
                        {...register("apply_language_prefreances", {
                          required: "Language is required",
                        })}
                      >
                        <option value="">Select Language</option>
                        <option value="English">English</option>
                        <option value="Swedsih">Swedish</option>
                      </select>
                    </div>
                    {errors.apply_language_prefreances && (
                      <ErrorMsg
                        error={errors.apply_language_prefreances.message}
                      />
                    )}
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label for="exampleInputPassword1" className="form-label">
                        Experiance*
                      </label>
                      <select
                        name="apply_experiance"
                        className="form-control apply_experiance"
                        {...register("apply_experiance", {
                          required: "Experience is required",
                        })}
                      >
                        <option value="">Select Experiance</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Year">2 Year</option>
                      </select>
                    </div>
                    {errors.apply_experiance && (
                      <ErrorMsg error={errors.apply_experiance.message} />
                    )}
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label for="exampleInputPassword1" className="form-label">
                        Address*
                      </label>
                      <input
                        type="text"
                        name="apply_address"
                        className="form-control apply_address"
                        placeholder="Enter address"
                        {...register("apply_address", {
                          required: "Address is required",
                        })}
                      />
                      {errors.apply_address && (
                        <ErrorMsg error={errors.apply_address.message} />
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label for="exampleInputPassword1" className="form-label">
                        Country*
                      </label>
                      <input
                        type="text"
                        name="apply_country"
                        className="form-control apply_country"
                        placeholder="Enter Country"
                        {...register("apply_country", {
                          required: "Country is required",
                        })}
                      />
                      {errors.apply_country && (
                        <ErrorMsg error={errors.apply_country.message} />
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label for="exampleInputPassword1" className="form-label">
                        Timezone*
                      </label>
                      <select
                        name="apply_timezone"
                        className="form-control apply_timezone"
                        {...register("apply_timezone", {
                          required: "Timezone is required",
                        })}
                      >
                        <option value="">Select Timezone</option>
                        <option value="-09:00">(GMT -9:00) Alaska</option>
                        <option value="+05:50">
                          (GMT +5:30) Bombay, Calcutta, Madras, New Delhi
                        </option>
                        <option value="+04:50">(GMT +4:30) Kabul</option>
                        <option value="+00:00">
                          (GMT) Western Europe Time, London, Lisbon, Casablanca
                        </option>
                      </select>
                    </div>
                    {errors.apply_timezone && (
                      <ErrorMsg error={errors.apply_timezone.message} />
                    )}
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label for="exampleInputPassword1" className="form-label">
                        Zipcode*
                      </label>
                      <input
                        type="text"
                        name="apply_zipcode"
                        className="form-control apply_zipcode"
                        placeholder="Enter Zipcode"
                        {...register("apply_zipcode", {
                          required: "Zipcode is required",
                        })}
                      />
                    </div>
                    {errors.apply_zipcode && (
                      <ErrorMsg error={errors.apply_zipcode.message} />
                    )}
                  </div>

                  <div className="questions-listing">
                    {jobDetails?.screening_questions?.map((res, index) => (
                      <div key={index} className="form-group">
                        <label className="form-label">{res.question}</label>
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
                            value={rangeValue}
                            onChange={handleRange}
                            className="custom-slider"
                          />
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
                    <label className="form-label">Application Letter</label>
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
                    <label className="form-label">
                      <input type="checkbox" />I confirm that I have read and
                      agree to the <a href="#">User Agreement</a>,{" "}
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
