// import React from "react";
// import ReactDOM from "react-dom";
// import Modal from "react-modal";

// const customStyles = {
//   content: {
//     top: "50%",
//     left: "50%",
//     right: "auto",
//     bottom: "auto",
//     marginRight: "-50%",
//     transform: "translate(-50%, -50%)",
//   },
// };

// // Modal.setAppElement("#appElement");

// const JobFormModal = ({ modalIsOpen, closeModal, submitApplyJob, jobDetails }) => {
//   let subtitle;
//   function afterOpenModal() {
//     // references are now sync'd and can be accessed.
//     subtitle.style.color = "#f00";
//   }
// console.log(jobDetails,"jobDetails")
//   return (
//     <Modal
//       isOpen={modalIsOpen}
//       onAfterOpen={afterOpenModal}
//       onRequestClose={closeModal}
//       style={customStyles}
//       contentLabel="Example Modal"
//       shouldCloseOnOverlayClick={false}
//     >
//       <h2>Please enter email for job apply</h2>
//       <form onSubmit={submitApplyJob}>
//         <input type="email" name="email" required />
//         <button type="submit">Submit</button>
//       </form>
//       <button onClick={closeModal}>close</button>
//     </Modal>
//   );
// };

// export default JobFormModal;
import Modal from "react-modal";
import "./style.css"; // Import the CSS file
import { useState } from "react";
import {
  openAPIBuilderInstance,
  webSiteBuilderFormInstance,
} from "../config/webBuilder";
import { useForm } from "react-hook-form";
import ErrorMsg from "./ErrorMsg";
import { toast } from "react-toastify";

// Set the app element for accessibility
Modal.setAppElement("#root");

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 999999,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    zIndex: 999999,
    width: "500px",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
};

function ExampleModal({
  modalIsOpen,
  afterOpenModal,
  closeModal,
  // submitApplyJob,
  jobDetails,
  setLoader,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const [error, setError] = useState({ show: false, msg: "" });
  const [file, setFile] = useState(false);
  const [resumeUrl, setResumeURL] = useState("");

  let subtitle;
  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = "#f00";
  }

  const handleFileUpload = (event) => {
    // setShowCreateDocument()
    console.log(event.target.files, "data of file");

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const file = event.target.files[0];
    // setType(file?.type);
    // setSelectedImg(file);
    if (file && allowedTypes.includes(file.type)) {
      setError({ show: false, msg: "" });
      setFile(file);
    } else {
      event.target.value = "";
      setError({ show: true, msg: "" });
    }
  };

  const beforeHandleSUbmit = (event) => {
    event.preventDefault();
    if (!file) {
      setError({ show: true, msg: "Please Enter the file" });
    }
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data) => {
    if (!file) {
      setError({ show: true, msg: "Please Enter the file" });
      return;
    }
    setLoader(true);
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
        setLoader(false);
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
      setLoader(false);
      closeModal();
      console.log(response, "response");
    } catch (err) {
      console.log(err, "error !!!!!!!!!!");
      const message = error.message || "Something went wrong";
      toast.error(message);
      setLoader(false);
      closeModal();
    }

    // setLoader(false);
    // webSiteBuilderInstance
    //   .post(`/web/career/apply-on-job`, payload)
    //   .then((res) => {
    //     closeModal();
    //     setLoader(false);
    //   })
    //   .catch((err) => {
    //     setLoader(false);
    //     console.log(err, "error !!!");
    //   });
  };

  console.log(jobDetails, "jobDetailsjobDetails");
  return (
    <Modal
      isOpen={modalIsOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
      shouldCloseOnOverlayClick={false}
    >
      <h2>Please enter your email to apply</h2>
      <form onSubmit={beforeHandleSUbmit}>
        <input
          type="text"
          name="email"
          placeholder="Email address"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        {errors.email && <ErrorMsg error={errors.email.message} />}

        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <ErrorMsg error={errors.name.message} />}

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

        <label>Enter your resume</label>
        <input type="file" onChange={handleFileUpload} />
        {error.show && <ErrorMsg error={error.msg} />}

        <button type="submit">Submit</button>
      </form>
      {/* <form onSubmit={submitApplyJob}>
        <input type="email" name="email" placeholder="Email address" required />
        <input type="email" name="email" placeholder="Email address" required />
        <input type="email" name="email" placeholder="Email address" required />

        Enter you resume
        <input type="file" onChange={handleFileUpload} />
        {error && <p>Not A valid file Please enter only .pdf, .doc, .docx</p>}
       
        <button type="submit">Submit</button>
      </form> */}
      <button className="close-btn" onClick={closeModal}>
        Close
      </button>
    </Modal>
  );
}

export default ExampleModal;
