import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  webSiteBuilderInstance,
  openAPIBuilderInstance,
  DEFAULT_TEMPLATE_ID,
  DEFAULT_LADING_PAGE,
} from "./config/webBuilder";
import { useParams } from "react-router-dom";
import NoPageFound from "./NoPageFound";
import ScreenLoader from "./ScreenLoader";
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
  const { page, onPageChange } = usePagination();
  const [paginationData, setPaginationData] = useState({
    totalData: 0,
    current_page: 0,
    per_page: 0,
  });
  const ITEMS_PER_PAGE = 2;

  useEffect(() => {
    setFilterActivate(false);
    fetchWebsite();
  }, []);

  const fetchWebsite = async () => {
    try {
      await fetchJobData();
      await fetchFilterList();
      const landingPage = pageId || DEFAULT_LADING_PAGE;
      const response = await webSiteBuilderInstance.get(
        `/api/pages/${DEFAULT_TEMPLATE_ID}/${landingPage}/content`
      );
      setHtmlContent(response?.data?.data["mycustom-html"]);

      // updateFilterSection(response?.data?.data["mycustom-html"]);

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
        // reset the sidebar form
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
        uncheckAll(jobTypeFilterCheckboxes);
        uncheckAll(jobSkillSetFilterCheckboxes);
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
    const totalResult = document.getElementById("result-total");
    const fromResult = document.getElementById("result-from");
    const toResult = document.getElementById("result-to");
    if (totalResult || fromResult || toResult) {
      const start =
        (paginationData.current_page - 1) * paginationData.per_page + 1;
      const end = Math.min(
        paginationData.current_page * paginationData.per_page,
        paginationData.totalData
      );
      totalResult.innerText = paginationData.totalData;
      fromResult.innerText = start;
      toResult.innerText = end;
    }
    const paginationComponent = document.getElementById("job_list_pagination");

    if (paginationComponent) {
      const root = createRoot(paginationComponent);
      root.render(
        <Pagination
          onPageChange={onPageChange}
          itemsPerPage={ITEMS_PER_PAGE}
          totalData={paginationData.totalData}
          currentPage={page}
        />
      );
    }
  }, [htmlContent]);

  useEffect(() => {
    setFilterActivate(true);
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

    const totalResult = document.getElementById("result-total");
    const fromResult = document.getElementById("result-from");
    const toResult = document.getElementById("result-to");
    if (totalResult || fromResult || toResult) {
      const start =
        (paginationData.current_page - 1) * paginationData.per_page + 1;
      const end = Math.min(
        paginationData.current_page * paginationData.per_page,
        paginationData.totalData
      );
      totalResult.innerText = paginationData.totalData;
      fromResult.innerText = start;
      toResult.innerText = end;
    }
  }, [jobList, website]);

  function uncheckAll(checkboxes) {
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkbox.checked = false;
      }
    });
  }

  const fetchFilterList = async () => {
    try {
      const response = await openAPIBuilderInstance.get(
        "/web/career/career-page-filters"
      );
      setFilterList(response.data.data);
      displayJobTypes(response.data.data)
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

    setSelectedFilter({ job_type: "", skill_name: "", search: "", sortBy: "" });

    if (selectedSkillSet.length > 0 || selectedJobType.length > 0) {
      fetchJobData();
    }
  }

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
        <p>Showing <span id="result-from">1</span>–<span id="result-to">10</span> of <span id="result-total">10<span> results</p>
        <select class="form-select" id="short_by_filter">
          <option value="DESC">Sort by: Oldest Job</option>
          <option value="ASC">Sort by: Latest Job</option>
        </select>
      `;
      jobListParent.insertBefore(sortBar, firstJobCard);

      debugger;
      
      // Update the sidebar only the first time
      const workTypeFilter = doc.getElementById("work_type_filter");
      const jobSkillFilter = doc.getElementById("job_skill_set_filter");
      const contractTypeFilter = doc.getElementById("contract_type_filter");

      workTypeFilter.innerHTML = "";
      jobSkillFilter.innerHTML = "";
      contractTypeFilter.innerHTML = "";

      filterList?.workTypes?.forEach((item) => {
        const listItem = doc.createElement("li");
        listItem.innerHTML = `
          <input type="checkbox" id="${item.originalName}">
          <label for="${item.originalName}">${item.type} (${item.count})</label>
        `;
        workTypeFilter.appendChild(listItem);
      });

      filterList?.skills?.forEach((item) => {
        const listItem = doc.createElement("li");
        listItem.innerHTML = `
          <input type="checkbox" id="${item.skill}">
          <label for="${item.skill}">${item.skill} (${item.count})</label>
        `;
        jobSkillFilter.appendChild(listItem);
      });

      filterList?.contractTypes?.forEach((item) => {
        const listItem = doc.createElement("li");
        listItem.innerHTML = `
          <input type="checkbox" id="${item.type}">
          <label for="${item.type}">${item.type} (${item.count})</label>
        `;
        contractTypeFilter.appendChild(listItem);
      });

      // Remove existing job cards
      for (let i = 1; i < 2; i++) {
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
    jobData.forEach((job) => {
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
      if (newJobCard.querySelector("#job-details-btn")) {
        newJobCard
          .querySelector("#job-details-btn")
          .setAttribute("href", `/job-details/${job.job_external_id}`);
      }

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

    document.getElementById("short_by_filter").value = "DESC";

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
    try {
      const response = await openAPIBuilderInstance.get(
        `web/jobs/published?page=${page}&per_page=${ITEMS_PER_PAGE}&job_type=${job_type}&skill_name=${skill_name}&search=${search}&sort_order=${sortBy}`
      );
      setPaginationData({
        totalData: response.data.data.total_items,
        current_page: response.data.data.current_page,
        per_page: response.data.data.per_page,
      });
      setJobList(response.data.data.jobs);
      setLoader(() => false);
    } catch (err) {
      setLoader(() => false);
      console.log(err);
    }
  }

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
    </div>
  );
};

export default Page;
