import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DEFAULT_TEMPLATE_ID,
  openAPIBuilderInstance,
  webSiteBuilderInstance,
} from "./config/webBuilder";
import { toast } from "react-toastify";
import Header from "./Components/Header";
import Sidebar from "./Components/SideBar/SideBar";
import ScreenLoader from "./ScreenLoader";
import LocationField from "./Components/common/LocationField";
import { useForm } from "react-hook-form";

const JobDetails = () => {
  const formConfig = useForm();
  const [website, setWebsite] = useState({
    css: "",
    html: "",
    js: "",
  });
  const [htmlContent, setHtmlContent] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [jobDetails, setJobDetails] = useState({});
  const [loader, setLoader] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenLoader, setScreenLoader] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState({
    isVerify: false,
    external_id: "",
  });
  const { jobId } = useParams();

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const jobDetails = await fetchJobDetails();
        setJobDetails(jobDetails);
        if (jobDetails && Object.keys(jobDetails).length > 0) {
          const response = await webSiteBuilderInstance.get(
            `/api/pages/activeTemplatePage/job-details`
          );

          if (response?.data?.data) {
            setWebsite(response.data.data);
            setHtmlContent(response.data.data["mycustom-html"]);
          } else {
            toast.error("No data found");
            setNotFound(true);
          }
        } else {
          const message = "Invalid job ID";
          toast.error(message);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching website data:", error);
        setNotFound(true);
      } finally {
        setLoader(false);
      }
    };

    fetchWebsite();
  }, [jobId]);

  useEffect(() => {
    if (website["mycustom-html"]) {
      const updateJObList = async () => {
        try {
          const updatedHTML = await updateJobDetailsContent(
            htmlContent,
            jobDetails
          );

          setHtmlContent(updatedHTML);
          setLoader(false);
        } catch (err) {
          setLoader(false);
          console.log(err);
        }
      };
      updateJObList();
    }
  }, [website]);

  useEffect(() => {
    const applyBtn = document.getElementById("apply_btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", handleApplyJob);
    }
  }, [htmlContent]);

  useEffect(() => {
    const applyBtn = document.getElementById("apply_btn");
    if (applyBtn) {
      applyBtn.style.position = "fixed";
      applyBtn.style.left = "50%";
      applyBtn.style.transform = "translateX(-50%)";
      applyBtn.style.width = "250px";
      applyBtn.style.padding = "12px 0";
      applyBtn.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, .1)";
      applyBtn.style.zIndex = "9999999";
      applyBtn.style.bottom = "25px";
      applyBtn.style.borderRadius = "50px";
      
      // Responsive bottom positioning
      if (window.innerWidth <= 768) {
        applyBtn.style.bottom = "67px"; // More space from bottom on mobile
        applyBtn.style.width = "calc(100% - 40px)"; // Full width with margins on mobile
        applyBtn.style.maxWidth = "350px";
        applyBtn.style.left = "20px";
        applyBtn.style.right = "20px";
        applyBtn.style.transform = "none";
      } else {
        applyBtn.style.bottom = "25px";
      }
    }
  }, [htmlContent]);

  useEffect(() => {
    const applyBtn = document.getElementById("apply_btn");
    if (sidebarOpen && applyBtn) {
      applyBtn.style.display = "none";
    } else if (!sidebarOpen && applyBtn) {
      applyBtn.style.display = "block";
    }
  }, [sidebarOpen]);

  // Effect to handle Google Map iframe with current coordinates
  useEffect(() => {
    const updateGoogleMapIframe = () => {
      const googleMapIframe = document.getElementById("google_map");
      
      if (googleMapIframe && googleMapIframe.tagName === 'IFRAME') {
        // Get coordinates from job details or use default
        console.log("jobDetails", jobDetails);
        const latitude = jobDetails.lat || 40.7484; // Default to Empire State Building
        const longitude = jobDetails.long || -73.9857;
        
        // Generate new Google Maps embed URL with current coordinates
        const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sJob%20Location!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`;
        
        // Update the iframe src
        googleMapIframe.src = embedUrl;
        
        console.log(`Google Map iframe updated with coordinates: ${latitude}, ${longitude}`);
      }
    };

    // Run the map update function
    updateGoogleMapIframe();
  }, [htmlContent, jobDetails]);



  async function updateJobDetailsContent(htmlString, jobDetails) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const jobCardDetails = doc.getElementById("job_card_details");

    const jobDetailsLink = jobCardDetails.querySelector("a");
    if (jobDetailsLink) {
      jobDetailsLink.setAttribute("href", `/`);
    } else {
      console.warn("Anchor tag not found in job_card_details.");
    }

    jobCardDetails.querySelector(`#job_title`).innerText = jobDetails.title;
    jobCardDetails.querySelector(`#job_title_side_bar`).innerText =
      jobDetails.title;
    jobCardDetails.querySelector(`#key_feature`).innerText =
      jobDetails.key_feature;
    jobCardDetails.querySelector(`#job_category`).innerText =
      jobDetails.job_category?.title;
    jobCardDetails.querySelector(`#job_category_side_bar`).innerText =
      jobDetails.job_category?.title;
    jobCardDetails.querySelector(`#contract_type`).innerText =
      jobDetails.contract_type;
    jobCardDetails.querySelector(`#contract_type_side_bar`).innerText =
      jobDetails.contract_type;
    jobCardDetails.querySelector(`#job_location`).innerText =
      jobDetails.job_location;
    jobCardDetails.querySelector(`#job_location_side_bar`).innerText =
      jobDetails.job_location;
    jobCardDetails.querySelector(`#contact_person_name`).innerText =
      jobDetails.publishedBy?.name;
    jobCardDetails.querySelector(`#contact_person_email`).innerText =
      jobDetails.publishedBy?.email;

    const contactPersonImg = jobCardDetails.querySelector(
      `#contact_person_profile`
    );
    if (contactPersonImg) {
      // Replace the current src with a new one
      contactPersonImg.src =
        jobDetails.publishedBy?.profile_picture || "/dummy_user.jpg";
    }

    if (jobDetails.description) {
      const description = jobCardDetails.querySelector(`#description`);
      if (description) {
        description.innerHTML = jobDetails.description;
      }
    }
    if (jobDetails.key_feature) {
      const key_feature = jobCardDetails.querySelector(`#key_feature`);
      if (key_feature) {
        key_feature.innerHTML = jobDetails.key_feature;
      }
    }
    if (jobDetails.benefits) {
      const benefitsElement = jobCardDetails.querySelector(`#benefits`);
      if (benefitsElement) {
        benefitsElement.innerHTML = jobDetails.benefits;
      }
    }

    if (jobDetails.role_responsibility) {
      const roleResponsibility =
        jobCardDetails.querySelector(`#role_responsibility`);
      if (roleResponsibility) {
        roleResponsibility.innerHTML = jobDetails.role_responsibility;
      }
    }

    return doc.body.innerHTML;
  }

  function handleApplyJob() {
    console.log("job");
    setSidebarOpen(true);
    setIsEmailVerified({ isVerify: false });
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  async function fetchJobDetails() {
    const response = await openAPIBuilderInstance.get(
      `web/job-details/${jobId}`
    );
    return response.data.data;
  }

  if (notFound) {
    return <div>Invalid job ID</div>;
  }


  return (
    <div>
      {loader ? (
        <ScreenLoader />
      ) : (
        <>
          {screenLoader && <ScreenLoader />}
          <div className={sidebarOpen ? "overlay" : ""}></div>
          <Header setLoader={setLoader} />
          
          <style>{website.css}</style>
          <style>{website["mycustom-css"]}</style>
      
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleCloseSidebar}
            jobDetails={jobDetails}
            setScreenLoader={setScreenLoader}
            loader={screenLoader}
            isEmailVerified={isEmailVerified}
            setIsEmailVerified={setIsEmailVerified}
          />
        </>
      )}
    </div>
  );
};

export default JobDetails;
