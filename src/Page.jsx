import React, { useEffect, useState } from "react";
import ReactDOM, { createRoot } from "react-dom/client";
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
import usePagination from "./Hooks/usePaginantion";
import Pagination from "./Components/Pagination";

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
  const [selectedFilter, setSelectedFilter] = useState({
    job_type: "",
    skill_name: "",
    search: "",
    sortBy: "",
  });

  let { pageId } = useParams();
  const { page, onPageChange, setPage } = usePagination();
  const [totalData, setTotalData] = useState(100);
  const ITEMS_PER_PAGE = 2;

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
    const sideBarResetBtn = document.getElementById("reset_btn");
    const sideBarFilterForm = document.getElementById("side_filter_form");
    const shortByFilter = document.getElementById("short_by_filter");
    if (sideBarFilterBtn) {
      sideBarFilterBtn.setAttribute("type", "submit");
      sideBarFilterForm.addEventListener("submit", handleFormSubmit);
    }
    if (sideBarResetBtn) {
      sideBarResetBtn.addEventListener("click", handleResetForm);
    }
    if (shortByFilter) {
      shortByFilter.addEventListener("change", function () {
        const selectedValue = shortByFilter.value;
        setSelectedFilter({
          ...selectedFilter,
          sortBy: selectedValue,
        });
        setFilterActivate(true);
        fetchJobData(
          selectedFilter.job_type,
          selectedFilter.skill_name,
          selectedFilter.search,
          selectedValue
        );
      });
    }
    const paginationComponent = document.getElementById("job_list_pagination");

    // if (paginationComponent) {
    //   const root = createRoot(paginationComponent);
    //   root.render(
    //     <Pagination
    //       onPageChange={onPageChange}
    //       itemsPerPage={ITEMS_PER_PAGE}
    //       totalData={totalData}
    //       currentPage={page}
    //     />
    //   );
    // }
  }, [htmlContent]);

  useEffect(() => {
    fetchJobData();
  }, [page]);

  useEffect(() => {
    if (jobList.length > 0 && website["mycustom-html"]) {
      const updateJObList = async () => {
        try {
          const updatedHTML = await updateJobListContent(htmlContent, jobList);
          if (updatedHTML) setHtmlContent(updatedHTML);
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

  function handleResetForm() {
    const jobTypeFilterCheckboxes = document.querySelectorAll(
      '#job_type_filter input[type="checkbox"]'
    );
    const jobSkillSetFilterCheckboxes = document.querySelectorAll(
      '#job_skill_set_filter input[type="checkbox"]'
    );
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

    setSelectedFilter({ job_type, skill_name, search, sortBy: "" });

    if (selectedSkillSet.length > 0 || selectedJobType.length > 0) {
      fetchJobData();
    }
  }

  // async function updateJobListContent(htmlString, jobData) {
  //   const parser = new DOMParser();
  //   let doc;
  //   if (isFilterActivate) {
  //     doc = document;
  //   } else {
  //     doc = parser.parseFromString(htmlString, "text/html");
  //   }

  //   const firstJobCard = doc.getElementById("job_card");

  //   if (!firstJobCard) {
  //     console.error("No first job card found.");
  //     return;
  //   }

  //   const jobListParent = firstJobCard.parentNode;
  //   const copyFirstNode = firstJobCard.cloneNode(true);

  //   if (isFilterActivate) {
  //     const jobCards = doc.querySelectorAll("#job_card");
  //     jobCards.forEach((job) => {
  //       job.remove();
  //     });
  //   } else {
  //     // Update the sidebar only first time
  //     // updateSideFilterContent(htmlContent);
  //     const jobTypeFilter = doc.getElementById("job_type_filter");
  //     const jobSkillFilter = doc.getElementById("job_skill_set_filter");
  //     jobTypeFilter.innerHTML = "";
  //     jobSkillFilter.innerHTML = "";

  //     filterList?.jobType?.forEach((item) => {
  //       const listItem = doc.createElement("li");
  //       listItem.innerHTML = `
  //         <input type="checkbox" id="${item.originalName}">
  //         <label for="${item.originalName}">${item.type} (${item.count})</label>
  //     `;
  //       jobTypeFilter.appendChild(listItem);
  //     });
  //     filterList?.skills?.forEach((item) => {
  //       const listItem = doc.createElement("li");
  //       listItem.innerHTML = `
  //         <input type="checkbox" id="${item.skill}">
  //         <label for="${item.skill}">${item.skill} (${item.count})</label>
  //     `;
  //       jobSkillFilter.appendChild(listItem);
  //     });
  //     // filterList?.categories?.forEach((item) => {
  //     //   const listItem = doc.createElement("li");
  //     //   listItem.innerHTML = `
  //     //     <input type="checkbox" id="${item.id}">
  //     //     <label for="${item.title}">${item.title}</label>
  //     // `;
  //     //   jobCategoryFilter.appendChild(listItem);
  //     // });
  //     // Remove existing job cards
  //     for (let i = 1; i < 6; i++) {
  //       let jobCard;
  //       if (i === 1) {
  //         jobCard = firstJobCard; // This is the first card
  //       } else {
  //         jobCard = doc.querySelector(`#job_card-${i}`);
  //       }
  //       if (!jobCard) {
  //         break;
  //       }
  //       jobCard.remove();
  //     }
  //   }
  //   if (!jobListParent) {
  //     console.error("No parent container found for job cards.");
  //     return doc.body.innerHTML;
  //   }

  //   // Loop through jobData and append new job cards
  //   jobData.forEach((job, index) => {
  //     const newJobCard = copyFirstNode.cloneNode(true);
  //     newJobCard.querySelector(`#job_card_title`).innerText = job.title;
  //     newJobCard.querySelector(`#job_company_name`).innerText =
  //       job.company_name;
  //     newJobCard.querySelector(`#job-post-time`).innerText = moment(
  //       job.created_at
  //     ).fromNow();
  //     newJobCard.querySelector(`#job-time-zone`).innerText = job.time_zone;
  //     newJobCard.querySelector(`#job_contract_type`).innerText =
  //       job.contract_type;
  //     if (newJobCard.querySelector(`#job_pay`))
  //       newJobCard.querySelector(`#job_pay`).innerText = job.pay;
  //     if (newJobCard.querySelector(`#job_currency`))
  //       newJobCard.querySelector(`#job_currency`).innerText = job.currency;
  //     newJobCard
  //       .querySelector("#job-details-btn")
  //       .setAttribute("data-job-id", job.job_external_id);

  //     jobListParent.appendChild(newJobCard);
  //   });
  //   if (!isFilterActivate) return doc.body.innerHTML;
  // }

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
      // Insert sort-bar before job listings
      const sortBar = document.createElement("div");
      sortBar.className = "sort-bar";
      sortBar.innerHTML = `
        <span>Showing 6–10 of 10 results</span>
        <select class="form-select" id="short_by_filter">
          <option value="DESC">Sort by: Oldest Job</option>
          <option value="ASC">Sort by: Latest Job</option>
        </select>
      `;
      jobListParent.insertBefore(sortBar, firstJobCard);

      // Update the sidebar only the first time
      const jobTypeFilter = doc.getElementById("job_type_filter");
      const jobSkillFilter = doc.getElementById("job_skill_set_filter");
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
      if (newJobCard.querySelector(`#job_pay`))
        newJobCard.querySelector(`#job_pay`).innerText = job.pay;
      if (newJobCard.querySelector(`#job_currency`))
        newJobCard.querySelector(`#job_currency`).innerText = job.currency;
      newJobCard
        .querySelector("#job-details-btn")
        .setAttribute("data-job-id", job.job_external_id);

      jobListParent.appendChild(newJobCard);
    });

    if (!isFilterActivate) return doc.body.innerHTML;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const jobTypeFilterCheckboxes = document.querySelectorAll(
      '#job_type_filter input[type="checkbox"]'
    );
    const jobSkillSetFilterCheckboxes = document.querySelectorAll(
      '#job_skill_set_filter input[type="checkbox"]'
    );

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
    const skill_name = selectedSkillSet.join(",");
    const search = document.getElementById("search_job_title")?.value;
    setFilterActivate(true);
    setSelectedFilter({
      ...selectedFilter,
      job_type,
      skill_name,
      search,
    });
    fetchJobData(job_type, skill_name, search, selectedFilter.sortBy);
  }

  async function fetchJobData(
    job_type = "",
    skill_name = "",
    search = "",
    sortBy = ""
  ) {
    setLoader(() => true);
    const response = await openAPIBuilderInstance.get(
      `web/jobs/published?page=${page}&per_page=${ITEMS_PER_PAGE}&job_type=${job_type}&skill_name=${skill_name}&search=${search}&sort_order=${sortBy}`
    );
    setTotalData(response.data.data.total_items);
    setJobList(response.data.data.jobs);
    setLoader(() => false);
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
      {loader && <ScreenLoader />}
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
