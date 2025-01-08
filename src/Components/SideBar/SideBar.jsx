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
  const [error, setCustomError] = useState({ show: false, msg: "" });
  const [file, setFile] = useState(false);
  const [resumeUrl, setResumeURL] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);

  const [showNext, setShowNext] = useState(true);

  const nextPage = () => {
    handleSubmit(() => setShowNext(false))();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files, "data of file");

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const file = event.target.files[0];
    if (file && allowedTypes.includes(file.type)) {
      setCustomError({ show: false, msg: "" });
      setFile(file);
    } else {
      event.target.value = "";
      setCustomError({ show: true, msg: "" });
    }
  };

  const beforeHandleSUbmit = (event) => {
    event.preventDefault();
    if (!file) {
      setCustomError({ show: true, msg: "Please Enter the file" });
    }
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data) => {
    if (!file) {
      setCustomError({ show: true, msg: "Please Enter the file" });
      return;
    }
    webSiteBuilderFormInstance
      .post("/web/upload-file", { file })
      .then((res) => {
        console.log(res.data.data.Location, "response");
        setResumeURL(res.data.data.Location);
        const payload = {
          ...data,
          job_id: jobDetails.id,
          resume: res.data.data.Location,
        };
        console.log(payload, "payload");
        submitApplyJob(payload);
        reset();
      })
      .catch((err) => {
        console.log(err, "error!!!");
        const message = error.message || "Something went wrong";
        toast.error(message);
      });
  };

  const submitApplyJob = async (payload) => {
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
    const email = watch("email");
    if (!email || !EMAIL_REGEX.test(email)) {
      trigger("email");
      return;
    }
    try {
      const response = await updatedURLInstance.post(
        `/web/career/get-email-otp`,
        {
          email: email,
        }
      );
      const message = response.data.message || "Applied successfully";
      toast.success(message);
      setShowOTPModal(true);
      console.log(response, "response");
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      const message = error.message || "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar">
        <button className="close_btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div>
        <h3>Application</h3>
        <p>{jobDetails.title}</p>
      </div>

      <form onSubmit={beforeHandleSUbmit}>
        {showNext ? (
          <div className="form-data">
            <div>
              <input
                type="text"
                name="email"
                placeholder="Email address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Enter a valid email address",
                  },
                })}
              />
              <button onClick={handleVerifyEmail} type="button">
                Verify
              </button>
            </div>

            {errors.email && <ErrorMsg error={errors.email.message} />}

            <input
              type="text"
              name="firstName"
              placeholder="Enter your First Name"
              {...register("firstName", { required: "First name is required" })}
            />
            {errors.firstName && <ErrorMsg error={errors.firstName.message} />}

            <input
              type="text"
              name="lastName"
              placeholder="Enter your Last Name"
              {...register("lastName", { required: "Last name is required" })}
            />
            {errors.lastName && <ErrorMsg error={errors.lastName.message} />}

            <input
              type="text"
              name="phone_number"
              placeholder="Phone number"
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

            <input
              type="text"
              name="profession"
              placeholder="Enter your Profession"
              {...register("profession", {
                required: "Profession is required",
              })}
            />
            {errors.profession && (
              <ErrorMsg error={errors.profession.message} />
            )}

            <input
              type="text"
              name="location"
              placeholder="Enter your location"
              {...register("location", { required: "Location is required" })}
            />
            {errors.location && <ErrorMsg error={errors.location.message} />}

            <div className="questionsListing">
              {jobDetails?.screening_questions?.map((res, index) => (
                <div key={index}>
                  <div key={res.id}>
                    <div>{res.question}</div>
                    {res.web_type == "input" ? (
                      <div>
                        {" "}
                        <input type="text" placeholder="Please enter value" />
                      </div>
                    ) : res.web_type == "radio" ? (
                      <div>
                        <div>
                          <input
                            type="radio"
                            id="yes"
                            name="radio-btn"
                            value="no"
                          />
                          <label>Yes</label>

                          <input
                            type="radio"
                            id="no"
                            name="radio-btn"
                            value="no"
                          />
                          <label>No</label>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={nextPage} type="button">
              Next
            </button>
          </div>
        ) : (
          <div>
            <div>
              <label>Upload your CV</label>
              <input type="file" onChange={handleFileUpload} />
              {error.show && <ErrorMsg error={error.msg} />}
            </div>

            <div>
              <label>Upload Video</label>
              <input type="file" onChange={handleFileUpload} />
              {error.show && <ErrorMsg error={error.msg} />}
            </div>

            <input
              type="text"
              name="letter"
              placeholder="Enter a short application text (max 1500 characters)"
              {...register("name", {
                required: "Application Letter is required",
              })}
            />
            {errors.name && <ErrorMsg error={errors.name.message} />}

            <div>
              <input type="checkbox" />I confirm that I have read and agree to
              the User agreement, Privacy policy and Cookie notice.
            </div>

            <button type="submit">Apply Now</button>
          </div>
        )}
      </form>
      {showOTPModal && (
        <OTPModal
          modalIsOpen={showOTPModal}
          closeModal={() => setShowOTPModal(false)}
          email={watch("email")}
        />
      )}
    </div>
  );
};
export default Sidebar;
