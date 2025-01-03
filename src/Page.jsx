import React, { useEffect, useState } from "react";
import {
  webSiteBuilderInstance,
  openJobAPI,
  openAPIBuilderInstance,
  DEFAULT_TEMPLATE_ID,
  DEFAULT_LADING_PAGE,
} from "./config/webBuilder";
import { useParams } from "react-router-dom";
import NoPageFound from "./NoPageFound";
import ScreenLoader from "./ScreenLoader";
import JobFormModal from "./Components/JobFormModal";
import axios from "axios";
import moment from "moment";
import Header from "./Components/Header";

const Page = () => {
  const [website, setWebsite] = useState({
    css: "",
    html: "",
    js: "",
  });
  const [notFound, setNotFound] = useState(false);
  const [loader, setLoader] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobDetails, setJobDetails] = useState({});
  const [htmlContent, setHtmlContent] = useState("");
  const [jobList, setJobList] = useState([]);
  const [isFilterActivate, setFilterActivate] = useState(false);
  const [filterList, setFilterList] = useState({
    job_type: [],
    job_skills: [],
    job_location: [],
    job_category: [],
    contract_type: [],
  });

  let { pageId } = useParams();

  useEffect(() => {
    setFilterActivate(false);
    fetchWebsite();
  }, []);

  const fetchWebsite = async () => {
    try {
      await fetchJobData();
      await fetchFilterList();
      // if (!pageId) {
      //   const data = await webSiteBuilderInstance.get("/api/pages");
      //   const pageList = data?.data?.pages || [];
      //   const homePage = pageList.find((pg) => pg.isHomePage);
      //   if (homePage) {
      //     pageId = homePage.name;
      //   } else if (pageList.length > 0) {
      //     pageList.sort(
      //       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      //     );
      //     pageId = pageList[0].name;
      //   } else {
      //     setNotFound(true);
      //     console.log("no page found");
      //   }
      // }
      const landingPage = pageId || DEFAULT_LADING_PAGE;
      const response = await webSiteBuilderInstance.get(
        `/api/pages/${DEFAULT_TEMPLATE_ID}/${landingPage}/content`
      );

      // commented for feature use
      // const updatedHTML = await updateJobListContent(
      //   response?.data?.data["mycustom-html"]
      // );
      // const updatedHTML = await updateJobFilterSelectBoxes(
      //   response?.data?.data["mycustom-html"],
      //   jobTypeRes.skillNames,
      //   jobTypeRes.jobType
      // );

      // setHtmlContent(updatedHTML);
      setHtmlContent(response?.data?.data["mycustom-html"]);

      setWebsite(response?.data?.data);
      if (
        response?.data?.data &&
        Object.keys(response?.data?.data).length === 0
      ) {
        setNotFound(true);
        setLoader(false);
      }
      setLoader(false);
    } catch (error) {
      setNotFound(true);
      setLoader(false);
      console.error("Error fetching website data:", error);
    }
  };
  useEffect(() => {
    const sideBarFilterBtn = document.getElementById("filter_btn");
    const sideBarFilterForm = document.getElementById("side_filter_form");
    if (sideBarFilterBtn) {
      sideBarFilterBtn.setAttribute("type", "submit");
      sideBarFilterForm.addEventListener("submit", handleFormSubmit);
    }
  }, [htmlContent]);

  const fetchFilterList = async () => {
    try {
      const response = await openAPIBuilderInstance.get(
        "/web/career/career-page-filters"
      );
      setFilterList(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (jobList.length > 0 && website["mycustom-html"]) {
      const updateJObList = async () => {
        try {
          const updatedHTML = await updateJobListContent(htmlContent, jobList);

          setHtmlContent(updatedHTML);
          setLoader(false);
          setFilterActivate(false);
        } catch (err) {
          setLoader(false);
          console.log(err);
        }
      };
      updateJObList();
    }
  }, [jobList, website]);

  async function updateJobListContent(htmlString, jobData) {
    const parser = new DOMParser();
    let doc;
    if (isFilterActivate) {
      doc = document;
    } else {
      doc = parser.parseFromString(htmlString, "text/html");
    }

    const firstJobCard = doc.getElementById("job_card");

    if (!firstJobCard) {
      console.error("No first job card found.");
      return;
    }

    const jobListParent = firstJobCard.parentNode;
    const copyFirstNode = firstJobCard.cloneNode(true);

    if (isFilterActivate) {
      const jobCards = doc.querySelectorAll("#job_card");
      jobCards.forEach((job) => {
        job.remove();
      });
    } else {
      // Update the sidebar only first time
      // updateSideFilterContent(htmlContent);
      const jobTypeFilter = doc.getElementById("job_type_filter");
      const jobSkillFilter = doc.getElementById("job_skill_set_filter");
      const jobCategoryFilter = doc.getElementById("job_category_filter");
      jobTypeFilter.innerHTML = "";
      jobSkillFilter.innerHTML = "";

      filterList?.jobType?.forEach((item) => {
        const listItem = doc.createElement("li");
        listItem.innerHTML = `
          <input type="checkbox" id="${item.originalName}">
          <label for="${item.originalName}">${item.type} (${item.count})</label>
      `;
        jobTypeFilter.appendChild(listItem);
      });
      filterList?.skills?.forEach((item) => {
        const listItem = doc.createElement("li");
        listItem.innerHTML = `
          <input type="checkbox" id="${item.skill}">
          <label for="${item.skill}">${item.skill} (${item.count})</label>
      `;
        jobSkillFilter.appendChild(listItem);
      });
      // filterList?.categories?.forEach((item) => {
      //   const listItem = doc.createElement("li");
      //   listItem.innerHTML = `
      //     <input type="checkbox" id="${item.id}">
      //     <label for="${item.title}">${item.title}</label>
      // `;
      //   jobCategoryFilter.appendChild(listItem);
      // });
      // Remove existing job cards
      for (let i = 1; i < 6; i++) {
        let jobCard;
        if (i === 1) {
          jobCard = firstJobCard; // This is the first card
        } else {
          jobCard = doc.querySelector(`#job_card-${i}`);
        }
        if (!jobCard) {
          break;
        }
        jobCard.remove();
      }
    }
    if (!jobListParent) {
      console.error("No parent container found for job cards.");
      return doc.body.innerHTML;
    }

    // Loop through jobData and append new job cards
    jobData.forEach((job, index) => {
      const newJobCard = copyFirstNode.cloneNode(true);
      newJobCard.querySelector(`#job_card_title`).innerText = job.title;
      newJobCard.querySelector(`#job_company_name`).innerText =
        job.company_name;
      newJobCard.querySelector(`#job-post-time`).innerText = moment(
        job.created_at
      ).fromNow();
      newJobCard.querySelector(`#job-time-zone`).innerText = job.time_zone;
      newJobCard.querySelector(`#job_contract_type`).innerText =
        job.contract_type;
      newJobCard
        .querySelector("#job-details-btn")
        .setAttribute("data-job-id", job.job_external_id);

      jobListParent.appendChild(newJobCard);
    });

    return doc.body.innerHTML;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const jobTypeFilterCheckboxes = document.querySelectorAll(
      '#job_type_filter input[type="checkbox"]'
    );
    const jobSkillSetFilterCheckboxes = document.querySelectorAll(
      '#job_skill_set_filter input[type="checkbox"]'
    );

    const selectedCategories = [];
    const selectedJobType = [];
    const selectedSkillSet = [];
    jobTypeFilterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedJobType.push(checkbox.id);
      }
    });
    jobSkillSetFilterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedSkillSet.push(checkbox.id);
      }
    });
    const job_type = selectedJobType.join(",");
    const category = selectedCategories.join(",");
    const skill_name = selectedSkillSet.join(",");
    const search = document.getElementById("search_job_title")?.value;
    setFilterActivate(true);
    fetchJobData(job_type, category, skill_name, search);
  }

  async function fetchJobData(
    job_type = "",
    category = "",
    skill_name = "",
    search = ""
  ) {
    const response = await openAPIBuilderInstance.get(
      `web/jobs/published?page=1&per_page=50&job_type=${job_type}&category=${category}&skill_name=${skill_name}&search=${search}`
    );
    console.log(response.data.data, "response.data.data.job");
    setJobList(response.data.data.jobs);
  }

  async function handleApplyJob(event) {
    console.log("function run hello");
    const jobId = event.target.getAttribute("data-job-id");
    console.log(jobId, "jobIdjobIdjobId");
    setLoader(true);
    axios
      .get(`${openJobAPI}/web/job-details/${jobId}`)
      .then((res) => {
        setJobDetails(res?.data?.data);
        setJobId(jobId);
        setIsOpen(true);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error !!!!", err);
      });
  }

  function closeModal() {
    setJobId(null);
    setIsOpen(false);
    setJobDetails(null);
  }

  const submitApplyJob = async (event) => {
    event.preventDefault();

    const emailInput = event.target.elements.email;
    if (!emailInput.value) {
      alert("Email is required");
      return;
    }
    const payload = {
      job_id: jobId,
      email: emailInput.value,
    };
    const response = await axios.post(
      `${openJobAPI}/web/career/apply-on-job`,
      payload
    );
    closeModal();
  };

  return (
    <div>
      {loader ? (
        <ScreenLoader />
      ) : (
        <>
          {notFound ? (
            <NoPageFound />
          ) : (
            <>
              <Header setLoader={setLoader} />
              <style>{website.css}</style>
              <style>{website["mycustom-css"]}</style>
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </>
          )}
        </>
      )}
      {modalIsOpen && (
        <JobFormModal
          closeModal={closeModal}
          modalIsOpen={modalIsOpen}
          submitApplyJob={submitApplyJob}
          jobDetails={jobDetails}
          setLoader={setLoader}
        />
      )}
    </div>
  );
};

export default Page;
