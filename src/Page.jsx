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
import { initializeAccordion } from "./Components/AccordionInit";

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
    work_type: [],
    contract_type: [],
    job_skills: [],
    job_location: [],
    job_category: [],
  });
  const [selectedFilter, setSelectedFilter] = useState({
    contract_type: "",
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

  const [initialJobCard, setInitialJobCard] = useState(null);
  const ITEMS_PER_PAGE = 5;

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
        `/api/pages/activeTemplatePage/`
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
        const jobSkillSetFilterCheckboxes = document.querySelectorAll(
          '#skill_set_list input[type="checkbox"]'
        );
        const selectedSkillSet = [];
        jobSkillSetFilterCheckboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            selectedSkillSet.push(checkbox.id);
          }
        });
        uncheckAll(jobSkillSetFilterCheckboxes);
        const selectedValue = shortByFilter.value;
        setSelectedFilter({
          ...selectedFilter,
          sortBy: selectedValue,
        });
        setFilterActivate(true);
        fetchJobData(
          selectedFilter.contract_type,
          selectedFilter.skill_name,
          selectedFilter.work_type,
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
        <div className="d-flex align-items-end justify-content-end mb-3 showing-text-sec">
          <Pagination
            onPageChange={onPageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalData={paginationData.totalData}
            currentPage={page}
          />
        </div>
      );
    }
    initializeAccordion();
  }, [htmlContent]);

  useEffect(() => {
    setFilterActivate(true);
    fetchJobData();
  }, [page]);

  useEffect(() => {
    if (website["mycustom-html"]) {
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

  useEffect(() => {
    const totalResult = document.getElementById("result-total");
    const fromResult = document.getElementById("result-from");
    const toResult = document.getElementById("result-to");

    if (totalResult && fromResult && toResult) {
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
  }, [paginationData]);

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
    } catch (err) {
      console.log(err);
    }
  };

  function handleResetForm() {
    console.log("handleResetForm");
    const skillSetFilterCheckboxes = document.querySelectorAll(
      '#skill_set_list input[type="checkbox"]'
    );
    const contractTypeFilterCheckboxes = document.querySelectorAll(
      '#contract_type_list input[type="checkbox"]'
    );
    const workTypeFilterCheckboxes = document.querySelectorAll(
      '#work_type_list input[type="checkbox"]'
    );

    uncheckAll(skillSetFilterCheckboxes);
    uncheckAll(contractTypeFilterCheckboxes);
    uncheckAll(workTypeFilterCheckboxes);

    setSelectedFilter({
      contract_type: "",
      skill_name: "",
      search: "",
      sortBy: "",
    });

    setFilterActivate(false);
    onPageChange(1);
    fetchJobData();
  }

  async function updateJobListContent(htmlString, jobData) {
    const parser = new DOMParser();
    let doc;
    if (isFilterActivate) {
      doc = document;
    } else {
      doc = parser.parseFromString(htmlString, "text/html");
    }

    let firstJobCard = doc.getElementById("job_card");
    console.log(firstJobCard, "firstJobCard");
    if (firstJobCard) setInitialJobCard(firstJobCard);
    if (!firstJobCard && !initialJobCard) {
      console.error("No first job card found.");
      return;
    }
    if (initialJobCard && !firstJobCard) {
      firstJobCard = initialJobCard;
    }

    const jobListParent = firstJobCard.parentNode;
    const copyFirstNode = firstJobCard.cloneNode(true);

    if (isFilterActivate) {
      const jobCards = doc.querySelectorAll("#job_card");
      jobCards.forEach((job) => job.remove());
    } else {
      const previousSortBar = doc.getElementById("sort_bar");
      if (previousSortBar) previousSortBar.remove();

      // Create sort bar
      const sortBar = document.createElement("div");
      sortBar.id = "sort_bar";
      sortBar.className =
        "d-flex align-items-center justify-content-between mb-3 showing-text-sec";
      sortBar.innerHTML = `
            <h4 class="showing-text">Showing <span id="result-from">1</span>–<span id="result-to">10</span> of <span id="result-total">${jobData.length}</span> results</h4>
            <div class="d-flex align-items-center justify-content-between filter-sort">
                <select class="form-select" id="short_by_filter">
                    <option value="DESC">Sort by: Oldest Job</option>
                    <option value="ASC">Sort by: Latest Job</option>
                </select>
            </div>
        `;

      // Check if job-card-view exists and insert sort bar accordingly
      const jobCardView = doc.getElementById("job_card_view");
      if (jobCardView) {
        // Insert sort bar before job-card-view
        jobCardView.parentNode.insertBefore(sortBar, jobCardView);
      } else {
        // If job-card-view doesn't exist, insert before first job card
        jobListParent.insertBefore(sortBar, firstJobCard);
      }

      // Update the sidebar only the first time
      const workTypeFilter = doc.getElementById("work_type_list");
      const jobSkillFilter = doc.getElementById("skill_set_list");
      const contractTypeFilter = doc.getElementById("contract_type_list");

      if (workTypeFilter) workTypeFilter.innerHTML = "";
      if (jobSkillFilter) jobSkillFilter.innerHTML = "";
      if (contractTypeFilter) contractTypeFilter.innerHTML = "";

      if (filterList?.workTypes?.length > 0) {
        filterList.workTypes.forEach((item) => {
          const listItem = document.createElement("li");
          listItem.innerHTML = `
                    <input type="checkbox" id="${item.originalName}">
                    <label for="${item.originalName}">${item.type} (${item.count})</label>
                `;
          workTypeFilter?.appendChild(listItem);
        });
      }

      filterList?.skills?.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
                <input type="checkbox" id="${item.skill}">
                <label for="${item.skill}">${item.skill} (${item.count})</label>
            `;
        jobSkillFilter?.appendChild(listItem);
      });

      filterList?.contractTypes?.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
                <input type="checkbox" id="${item.type}">
                <label for="${item.type}">${item.type} (${item.count})</label>
            `;
        contractTypeFilter?.appendChild(listItem);
      });

      doc.querySelectorAll("#job_card").forEach((job) => job.remove());
    }

    if (!jobListParent) {
      console.error("No parent container found for job cards.");
      return doc.body.innerHTML;
    }

    if (jobData.length === 0) {
      const noJobsMessage = document.createElement("div");
      noJobsMessage.id = "no_jobs";
      noJobsMessage.className = "no-jobs";
      noJobsMessage.innerHTML = `<p>No Jobs Found</p>`;
      jobListParent.appendChild(noJobsMessage);
    } else {
      const noJobsMessage = document.getElementById("no_jobs");
      if (noJobsMessage) noJobsMessage.remove();
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
        if (job.show_pay) {
          if (newJobCard.querySelector(`#job_pay`))
            newJobCard.querySelector(`#job_pay`).innerText = job.pay;
          if (newJobCard.querySelector(`#job_currency`))
            newJobCard.querySelector(`#job_currency`).innerText = job.currency;
        } else {
          if (newJobCard.querySelector(`#job_pay`)) {
            const payElement = newJobCard.querySelector(`#job_pay`);
            const payLiElement = payElement.closest("li");
            if (payLiElement) {
              payLiElement.remove();
            }
          }
        }
        if (newJobCard.querySelector("#job-details-btn")) {
          newJobCard
            .querySelector("#job-details-btn")
            .setAttribute("href", `/job-details/${job.job_external_id}`);
        }
        jobListParent.appendChild(newJobCard);
      });
    }

    if (!isFilterActivate) return doc.body.innerHTML;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const jobSkillSetFilterCheckboxes = document.querySelectorAll(
      '#skill_set_list input[type="checkbox"]'
    );
    const contractTypeFilterCheckboxes = document.querySelectorAll(
      '#contract_type_list input[type="checkbox"]'
    );
    const workTypeFilterCheckboxes = document.querySelectorAll(
      '#work_type_list input[type="checkbox"]'
    );

    document.getElementById("short_by_filter").value = "DESC";

    const selectedContractType = [];
    const selectedSkillSet = [];
    const selectedWorkType = [];
    jobSkillSetFilterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedSkillSet.push(checkbox.id);
      }
    });
    contractTypeFilterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedContractType.push(checkbox.id);
      }
    });
    workTypeFilterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedWorkType.push(checkbox.id);
      }
    });
    const contract_type = selectedContractType.join(",");
    const skill_name = selectedSkillSet.join(",");
    const work_type = selectedWorkType.join(",");
    const search = document.getElementById("search_job_title")?.value;
    setFilterActivate(true);
    setSelectedFilter({
      ...selectedFilter,
      contract_type,
      skill_name,
      work_type,
      search,
    });
    fetchJobData(
      contract_type,
      skill_name,
      work_type,
      search,
      selectedFilter.sortBy
    );
  }

  async function fetchJobData(
    contract_type = "",
    skill_name = "",
    work_type = "",
    search = "",
    sortBy = ""
  ) {
    setLoader(() => true);
    try {
      const response = await openAPIBuilderInstance.get(
        `web/jobs/published?page=${page}&per_page=${ITEMS_PER_PAGE}&contract_type=${contract_type}&skill_name=${skill_name}&work_type=${work_type}&search=${search}&sort_order=${sortBy}`
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
  console.log(paginationData, "");

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
