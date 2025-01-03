import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DEFAULT_TEMPLATE_ID,
  openAPIBuilderInstance,
  webSiteBuilderInstance,
} from "./config/webBuilder";
import { toast } from "react-toastify";
import Header from "./Components/Header";

const JobDetails = () => {
  const [website, setWebsite] = useState({
    css: "",
    html: "",
    js: "",
  });
  const [htmlContent, setHtmlContent] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [jobDetails, setJobDetails] = useState({});
  const [loader, setLoader] = useState(true);
  const { jobId } = useParams();

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const jobDetails = await fetchJobDetails();
        setJobDetails(jobDetails);
        if (jobDetails && Object.keys(jobDetails).length > 0) {
          console.log(jobDetails, "jobDetails");
          const response = await webSiteBuilderInstance.get(
            `/api/pages/${DEFAULT_TEMPLATE_ID}/job-details/content`
          );

          if (response?.data?.data) {
            setWebsite(response.data.data);
            setHtmlContent(response.data.data["mycustom-html"]);
          } else {
            toast.error("No data found");
            setNotFound(true);
          }
        } else {
          const message = error.message || "Invalid job ID";
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

  async function updateJobDetailsContent(
    htmlString,
    jobDetails,
    isUpdate = false
  ) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const jobCardDetails = doc.getElementById("job_card_details");
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
    jobCardDetails.querySelector(`#contact_person_profession`).innerText =
      jobDetails.publishedBy?.profession;

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
        <div>Loading...</div>
      ) : (
        <>
          <Header setLoader={setLoader} />
          <style>{website.css}</style>
          <style>{website["mycustom-css"]}</style>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </>
      )}
    </div>
  );
};

export default JobDetails;
