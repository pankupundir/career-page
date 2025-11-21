import { useEffect, useState, useLayoutEffect } from "react";
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
import WebsiteLoader from "./Components/WebsiteLoader";
import JobDataLoader from "./Components/JobDataLoader";
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
  const [websiteLoader, setWebsiteLoader] = useState(true);
  const [jobDataLoader, setJobDataLoader] = useState(false);
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
  const { page, onPageChange, setPage } = usePagination();
  const [paginationData, setPaginationData] = useState({
    totalData: 0,
    current_page: 0,
    per_page: 0,
    total_pages: 0,
  });

  const [initialJobCard, setInitialJobCard] = useState(null);
  const [originalJobCardHTML, setOriginalJobCardHTML] = useState(null);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setFilterActivate(false);
    fetchWebsite();
      fetchJobData();
    
  }, []);

  const fetchWebsite = async () => {
    try {
      setWebsiteLoader(true);
      const landingPage = pageId || DEFAULT_LADING_PAGE;
      const response = await webSiteBuilderInstance.get(
        `/api/pages/activeTemplatePage/`
      );
      let html = response?.data?.data["mycustom-html"];
      // Manipulate the number in <span class="number"> to 45
      if (html) {
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        setHtmlContent(doc.body.innerHTML);
      
      } else {
        setHtmlContent(html);
      }
      setWebsite(response?.data?.data);
      if (
        response?.data?.data &&
        Object.keys(response?.data?.data).length === 0
      ) {
        setNotFound(true);
        setWebsiteLoader(false);
      }
      setWebsiteLoader(false);
    } catch (error) {
      setNotFound(true);
      setWebsiteLoader(false);
      console.error("Error fetching website data:", error);
    }
  };

  useEffect(() => {
    const sideBarFilterBtn = document.getElementById("filter_btn");
    const sideBarResetBtn = document.getElementById("reset_btn");
    const sideBarFilterForm = document.getElementById("side_filter_form");
    const shortByFilter = document.getElementById("short_by_filter");
    
    // Clean up existing event listeners
    if (sideBarFilterForm) {
      sideBarFilterForm.removeEventListener("submit", handleFormSubmit);
    }
    if (sideBarResetBtn) {
      sideBarResetBtn.removeEventListener("click", handleResetForm);
    }
    if (shortByFilter) {
      shortByFilter.removeEventListener("change", handleSortByChange);
    }
    
   
    const jobOpeningButtons = document.querySelectorAll('.btn-job-opening');
    const registerButtons = document.querySelectorAll('.register-btn');
    const connectButtons = document.querySelectorAll('.btn-connect');
    const connectButtonScrollDown = document.querySelectorAll('.scroll-down-icon');
    
    jobOpeningButtons.forEach(button => {
      button.removeEventListener('click', handleJobOpeningClick);
      button.addEventListener('click', handleJobOpeningClick);
    });
    
    registerButtons.forEach(button => {
      button.removeEventListener('click', handleJobOpeningClick);
      button.addEventListener('click', handleJobOpeningClick);
    });
    
    connectButtons.forEach(button => {
      button.removeEventListener('click', handleConnectClick);
      button.addEventListener('click', handleConnectClick);
    });

      
    connectButtonScrollDown.forEach(button => {
      button.removeEventListener('click', handleConnectClick);
      button.addEventListener('click', handleConnectClick);
    });


    
    if (sideBarFilterBtn) {
      sideBarFilterBtn.setAttribute("type", "submit");
      if (sideBarFilterForm) {
        sideBarFilterForm.addEventListener("submit", handleFormSubmit);
      }
    }
    if (sideBarResetBtn) {
      sideBarResetBtn.addEventListener("click", handleResetForm);
    }
    if (shortByFilter) {
      shortByFilter.addEventListener("change", handleSortByChange);
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
      

      
      // Only show pagination if there are multiple pages and total items > 0
      if (paginationData.total_pages > 1 && paginationData.totalData > 0) {
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
      } else {
        // Hide pagination when total_pages is 0 or 1, or when there are no items
        root.render(<div></div>);
      }
    }
    initializeAccordion();
    
    // Cleanup function
    return () => {
      if (sideBarFilterForm) {
        sideBarFilterForm.removeEventListener("submit", handleFormSubmit);
      }
      if (sideBarResetBtn) {
        sideBarResetBtn.removeEventListener("click", handleResetForm);
      }
      if (shortByFilter) {
        shortByFilter.removeEventListener("change", handleSortByChange);
      }
      // Clean up job opening, register, and connect button event listeners
      jobOpeningButtons.forEach(button => {
        button.removeEventListener('click', handleJobOpeningClick);
      });
      registerButtons.forEach(button => {
        button.removeEventListener('click', handleJobOpeningClick);
      });
      connectButtons.forEach(button => {
        button.removeEventListener('click', handleConnectClick);
      });
    };
  }, [htmlContent, paginationData]);

  useEffect(() => {
    setFilterActivate(true);
    // Use current filter state when page changes
    fetchJobData(
      selectedFilter.contract_type,
      selectedFilter.skill_name,
      selectedFilter.work_type,
      selectedFilter.search,
      selectedFilter.sortBy
    );
  }, [page]);



  useEffect(() => {
    if (website["mycustom-html"]) {
      const updateJObList = async () => {
        try {
          const updatedHTML = await updateJobListContent(htmlContent, jobList);
          if (updatedHTML) setHtmlContent(updatedHTML);
          console.log(updatedHTML,"updatedHTML")
          setJobDataLoader(false);
          setFilterActivate(false);
        } catch (err) {
          setJobDataLoader(false);
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

  useEffect(() => {
    const numberSpan = document.querySelector(".number");
    if (numberSpan) {
      numberSpan.textContent = paginationData.totalData;
    }
  }, [paginationData.totalData, htmlContent]);

  // Call fetchFilterList after DOM is ready but before paint
  useEffect(() => {
    fetchFilterList();
  }, []);

  // Restore search input value and filter states from state
  useEffect(() => {
    const searchInput = document.getElementById("search_job_title");
    if (searchInput && selectedFilter.search) {
      searchInput.value = selectedFilter.search;
    }
    
    // Restore checkbox states for all filter types
    if (selectedFilter.skill_name) {
      const skillNames = selectedFilter.skill_name.split(',');
      skillNames.forEach(skill => {
        const checkbox = document.getElementById(skill);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
    
    if (selectedFilter.contract_type) {
      const contractTypes = selectedFilter.contract_type.split(',');
      contractTypes.forEach(type => {
        const checkbox = document.getElementById(type);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
    
    if (selectedFilter.work_type) {
      const workTypes = selectedFilter.work_type.split(',');
      workTypes.forEach(type => {
        const checkbox = document.getElementById(type);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
    
    // Restore sort order
    const sortSelect = document.getElementById("short_by_filter");
    if (sortSelect && selectedFilter.sortBy) {
      sortSelect.value = selectedFilter.sortBy;
    }
  }, [selectedFilter, htmlContent]);

  function uncheckAll(checkboxes) {
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkbox.checked = false;
      }
    });
  }

  const handleJobOpeningClick = (event) => {
  
    // Redirect to the specified URL
    window.open(`${import.meta.env.VITE_CRM_URL}/talent-registration`, '_blank');
  };

  const handleConnectClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Find the job-openings div and scroll to it
    const jobOpeningsDiv = document.querySelector('.job-openings') || document.getElementById('job-openings');
    if (jobOpeningsDiv) {
      jobOpeningsDiv.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.warn('job-openings div not found');
    }
  };

  const handleSortByChange = (event) => {
    const jobSkillSetFilterCheckboxes = document.querySelectorAll(
      '#skill_set_list input[type="checkbox"]'
    );
    const contractTypeFilterCheckboxes = document.querySelectorAll(
      '#contract_type_list input[type="checkbox"]'
    );
    const workTypeFilterCheckboxes = document.querySelectorAll(
      '#work_type_list input[type="checkbox"]'
    );
    
    const selectedSkillSet = [];
    const selectedContractType = [];
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
    const search = document.getElementById("search_job_title")?.value || "";
    const selectedValue = event.target.value;
    
    setSelectedFilter({
      ...selectedFilter,
      contract_type,
      skill_name,
      work_type,
      search,
      sortBy: selectedValue,
    });
    setFilterActivate(true);
    fetchJobData(
      contract_type,
      skill_name,
      work_type,
      search,
      selectedValue
    );
  };

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
    console.log("handleResetForm - Resetting all filters and fetching all jobs");
    
    const skillSetFilterCheckboxes = document.querySelectorAll(
      '#skill_set_list input[type="checkbox"]'
    );
    const contractTypeFilterCheckboxes = document.querySelectorAll(
      '#contract_type_list input[type="checkbox"]'
    );
    const workTypeFilterCheckboxes = document.querySelectorAll(
      '#work_type_list input[type="checkbox"]'
    );
    const searchInput = document.getElementById("search_job_title");
    const shortByFilter = document.getElementById("short_by_filter");

    // Uncheck all filter checkboxes
    uncheckAll(skillSetFilterCheckboxes);
    uncheckAll(contractTypeFilterCheckboxes);
    uncheckAll(workTypeFilterCheckboxes);
    
    // Clear the search input field
    if (searchInput) {
      searchInput.value = "";
    }
    
    // Reset sort filter to default
    if (shortByFilter) {
      shortByFilter.value = "";
    }

    // Reset all filter state
    setSelectedFilter({
      contract_type: "",
      skill_name: "",
      search: "",
      sortBy: "",
    });

    // Deactivate filter mode and reset to page 1
    setFilterActivate(false);
    setPage(1); // Directly set page to 1
    onPageChange({ selected: 0 }); // Also call the pagination hook
    fetchWebsite();
    
    
    // Restore the original job card structure if it was lost
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      restoreJobCardStructure();
    }, 100);
    
    // Fetch all jobs without any filters
    console.log("Fetching all jobs after reset...");
    
    // Force a complete refresh by re-fetching the website content if needed
    if (!originalJobCardHTML) {
      console.log("No original card HTML stored, re-fetching website content");
      fetchWebsite();
    } else {
      fetchJobData("", "", "", "", "");
    }
  }

  function restoreJobCardStructure() {
    console.log("restoreJobCardStructure called");
    console.log("originalJobCardHTML exists:", !!originalJobCardHTML);
    
    // If we have the original card HTML and no job cards exist, restore the structure
    if (originalJobCardHTML) {
      const existingJobCard = document.getElementById("job_card");
      const noJobsMessage = document.getElementById("no_jobs");
      
      console.log("existingJobCard:", !!existingJobCard);
      console.log("noJobsMessage:", !!noJobsMessage);
      
      if (!existingJobCard && noJobsMessage) {
        console.log("Removing no jobs message and restoring card structure");
        // Remove the no jobs message
        noJobsMessage.remove();
        
        // Find the job list parent container
        const jobCardView = document.getElementById("job_card_view");
        
        if (jobCardView) {
          // Create a temporary div to parse the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = originalJobCardHTML;
          const restoredCard = tempDiv.firstElementChild;
          
          console.log("Restored card:", restoredCard);
          
          // Append the restored card to the container
          jobCardView.appendChild(restoredCard);
          
          // Update the initial job card reference
          setInitialJobCard(restoredCard);
          console.log("Card structure restored successfully");
        } else {
          console.log("jobCardView not found, trying alternative approach");
          // Try to find the correct container that should hold job cards
          // Look for containers that are NOT buttons and have appropriate structure
          const possibleContainers = document.querySelectorAll('div[class*="job"], div[id*="job"], div[class*="card"], div[id*="card"], section[class*="job"], section[id*="job"], main, .container, .row');
          
          // Filter out buttons and other inappropriate elements
          const validContainers = Array.from(possibleContainers).filter(container => {
            const tagName = container.tagName.toLowerCase();
            const className = container.className || '';
            const id = container.id || '';
            
            // Skip buttons, inputs, and other form elements
            if (['button', 'input', 'select', 'textarea', 'a'].includes(tagName)) {
              return false;
            }
            
            // Skip elements that are clearly buttons or links
            if (className.includes('btn') || className.includes('button') || className.includes('link')) {
              return false;
            }
            
            // Prefer containers that look like they should hold content
            return true;
          });
          
          console.log("Valid containers found:", validContainers.length);
          
          if (validContainers.length > 0) {
            // Try to find the most appropriate container
            let bestContainer = null;
            
            // First, look for containers with specific job-related IDs or classes
            bestContainer = validContainers.find(container => 
              container.id && (container.id.includes('job') || container.id.includes('card') || container.id.includes('list'))
            );
            
            // If not found, look for containers with job-related classes
            if (!bestContainer) {
              bestContainer = validContainers.find(container => 
                container.className && (container.className.includes('job') || container.className.includes('card') || container.className.includes('list'))
              );
            }
            
            // If still not found, use the first valid container
            if (!bestContainer) {
              bestContainer = validContainers[0];
            }
            
            console.log("Selected container:", bestContainer);
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalJobCardHTML;
            const restoredCard = tempDiv.firstElementChild;
            bestContainer.appendChild(restoredCard);
            setInitialJobCard(restoredCard);
            console.log("Card structure restored to alternative container");
          } else {
            console.log("No valid containers found for job card restoration");
          }
        }
      } else if (existingJobCard) {
        console.log("Job card already exists, no need to restore");
      } else {
        console.log("No jobs message not found, might not need restoration");
      }
    } else {
      console.log("No original job card HTML stored");
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

    let firstJobCard = doc.getElementById("job_card");
    console.log(firstJobCard, "firstJobCard");
    if (firstJobCard) {
      setInitialJobCard(firstJobCard);
      // Store the original HTML structure of the job card
      if (!originalJobCardHTML) {
        setOriginalJobCardHTML(firstJobCard.outerHTML);
        console.log("Stored original job card HTML");
      }
    }
    if (!firstJobCard && !initialJobCard) {
      console.error("No first job card found.");
      // Try to restore from stored HTML if available
      if (originalJobCardHTML) {
        console.log("Attempting to restore job card from stored HTML");
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalJobCardHTML;
        const restoredCard = tempDiv.firstElementChild;
        if (restoredCard) {
          firstJobCard = restoredCard;
          setInitialJobCard(restoredCard);
          console.log("Job card restored from stored HTML");
        }
      }
      if (!firstJobCard) {
        console.error("Still no job card available after restoration attempt");
        return;
      }
    }
    if (initialJobCard && !firstJobCard) {
      firstJobCard = initialJobCard;
    }

    // Find the correct parent container for job cards
    let jobListParent = firstJobCard.parentNode;
    
    // If the parent is a button or inappropriate element, find a better parent
    if (jobListParent && (jobListParent.tagName.toLowerCase() === 'button' || 
        (jobListParent.className && jobListParent.className.includes('btn')))) {
      console.log("Parent is a button, finding better container");
      
      // Look for a more appropriate parent container
      const betterContainers = document.querySelectorAll('div[class*="job"], div[id*="job"], div[class*="card"], div[id*="card"], section[class*="job"], section[id*="job"], main, .container, .row');
      const validContainers = Array.from(betterContainers).filter(container => {
        const tagName = container.tagName.toLowerCase();
        const className = container.className || '';
        return !['button', 'input', 'select', 'textarea', 'a'].includes(tagName) && 
               !className.includes('btn') && !className.includes('button');
      });
      
      if (validContainers.length > 0) {
        jobListParent = validContainers[0];
        console.log("Found better parent container:", jobListParent);
      }
    }
    
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
      const searchInput = doc.getElementById("search_job_title");

      // Create search input if it doesn't exist
      if (!searchInput) {
        const searchContainer = doc.querySelector('.search-container') || doc.querySelector('.filter-container');
        if (searchContainer) {
          const searchInputElement = document.createElement("input");
          searchInputElement.type = "text";
          searchInputElement.id = "search_job_title";
          searchInputElement.placeholder = "Search jobs...";
          searchInputElement.className = "form-control mb-3";
          // Set the current search value if it exists
          if (selectedFilter.search) {
            searchInputElement.value = selectedFilter.search;
          }
          searchContainer.insertBefore(searchInputElement, searchContainer.firstChild);
        }
      } else {
        // If search input exists, make sure it has the current value
        if (selectedFilter.search) {
          searchInput.value = selectedFilter.search;
        }
      }

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
                <label for="${item.skill}">${item.skill.charAt(0).toUpperCase() + item.skill.slice(1)} (${item.count})</label>
            `;
        jobSkillFilter?.appendChild(listItem);
      });

      filterList?.contractTypes?.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
                <input type="checkbox" id="${item.originalName}">
                <label for="${item.originalName}">${item.type} (${item.count})</label>
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
      noJobsMessage.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
          <p style="font-size: 24px; color: #666; margin: 0;">No Jobs Found</p>
        </div>`;
      jobListParent.appendChild(noJobsMessage);
      console.log("No jobs found - added no jobs message");
    } else {
      const noJobsMessage = document.getElementById("no_jobs");
      if (noJobsMessage) noJobsMessage.remove();
      jobData.forEach((job) => {
        let newJobCard;
        // Use original HTML structure if available, otherwise use the current card
        if (originalJobCardHTML && !firstJobCard) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = originalJobCardHTML;
          newJobCard = tempDiv.firstElementChild.cloneNode(true);
        } else {
          newJobCard = copyFirstNode.cloneNode(true);
        }

        newJobCard.querySelector(`#job_card_title`).innerText = job.title;
        const companyNameElement = newJobCard.querySelector(`#job_company_name`);
        if (companyNameElement) {
          companyNameElement.innerText = job.company_name;
          
          // Add skills below company name
          const existingSkillsContainer = newJobCard.querySelector('.job-skills-container');
          if (existingSkillsContainer) {
            existingSkillsContainer.remove();
          }
          
          if (job.job_skills && job.job_skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'job-skills-container';
            skillsContainer.setAttribute('data-not-editable', 'true');
            skillsContainer.style.marginBottom = '15px';
            
            const skillsList = document.createElement('ul');
            skillsList.className = 'skills-list';
            skillsList.setAttribute('data-not-editable', 'true');
            skillsList.style.display = 'flex';
            skillsList.style.alignItems = 'center';
            skillsList.style.flexWrap = 'wrap';
            skillsList.style.gap = '8px';
            skillsList.style.listStyle = 'none';
            skillsList.style.padding = '0';
            skillsList.style.margin = '0';
            
            job.job_skills.forEach((skill, index) => {
              const skillItem = document.createElement('li');
              skillItem.className = 'skill-tag';
              skillItem.setAttribute('data-not-editable', 'true');
              skillItem.id = `job_skill_${skill.id || skill.skill_id || index}`;
              skillItem.style.display = 'flex';
              skillItem.style.alignItems = 'center';
              skillItem.style.gap = '6px';
              
              // Create SVG star icon
              const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svgIcon.setAttribute('class', 'skill-icon');
              svgIcon.setAttribute('width', '14');
              svgIcon.setAttribute('height', '14');
              svgIcon.setAttribute('viewBox', '0 0 24 24');
              svgIcon.setAttribute('fill', 'none');
              svgIcon.setAttribute('stroke', 'currentColor');
              svgIcon.setAttribute('stroke-width', '2');
              svgIcon.setAttribute('stroke-linecap', 'round');
              svgIcon.setAttribute('stroke-linejoin', 'round');
              svgIcon.style.flexShrink = '0';
              
              const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
              polygon.setAttribute('points', '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2');
              svgIcon.appendChild(polygon);
              
              // Create span for skill name
              const skillSpan = document.createElement('span');
              skillSpan.textContent = skill.skill_name || skill;
              
              skillItem.appendChild(svgIcon);
              skillItem.appendChild(skillSpan);
              skillsList.appendChild(skillItem);
            });
            
            skillsContainer.appendChild(skillsList);
            
            // Insert skills container after company name
            if (companyNameElement.parentNode) {
              companyNameElement.parentNode.insertBefore(skillsContainer, companyNameElement.nextSibling);
            }
          } else if (job.skills) {
            // Fallback to comma-separated skills string
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'job-skills-container';
            skillsContainer.setAttribute('data-not-editable', 'true');
            skillsContainer.style.marginBottom = '15px';
            
            const skillsList = document.createElement('ul');
            skillsList.className = 'skills-list';
            skillsList.setAttribute('data-not-editable', 'true');
            skillsList.style.display = 'flex';
            skillsList.style.alignItems = 'center';
            skillsList.style.flexWrap = 'wrap';
            skillsList.style.gap = '8px';
            skillsList.style.listStyle = 'none';
            skillsList.style.padding = '0';
            skillsList.style.margin = '0';
            
            job.skills.split(',').forEach((skill, index) => {
              const skillItem = document.createElement('li');
              skillItem.className = 'skill-tag';
              skillItem.setAttribute('data-not-editable', 'true');
              skillItem.style.display = 'flex';
              skillItem.style.alignItems = 'center';
              skillItem.style.gap = '6px';
              
              // Create SVG star icon
              const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svgIcon.setAttribute('class', 'skill-icon');
              svgIcon.setAttribute('width', '14');
              svgIcon.setAttribute('height', '14');
              svgIcon.setAttribute('viewBox', '0 0 24 24');
              svgIcon.setAttribute('fill', 'none');
              svgIcon.setAttribute('stroke', 'currentColor');
              svgIcon.setAttribute('stroke-width', '2');
              svgIcon.setAttribute('stroke-linecap', 'round');
              svgIcon.setAttribute('stroke-linejoin', 'round');
              svgIcon.style.flexShrink = '0';
              
              const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
              polygon.setAttribute('points', '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2');
              svgIcon.appendChild(polygon);
              
              // Create span for skill name
              const skillSpan = document.createElement('span');
              skillSpan.textContent = skill.trim();
              
              skillItem.appendChild(svgIcon);
              skillItem.appendChild(skillSpan);
              skillsList.appendChild(skillItem);
            });
            
            skillsContainer.appendChild(skillsList);
            
            // Insert skills container after company name
            if (companyNameElement.parentNode) {
              companyNameElement.parentNode.insertBefore(skillsContainer, companyNameElement.nextSibling);
            }
          }
        } else {
          // Fallback if company name element not found
          newJobCard.querySelector(`#job_company_name`).innerText = job.company_name;
        }
        newJobCard.querySelector(`#job-post-time`).innerText = moment(
          job.created_at
        ).fromNow();
        newJobCard.querySelector(`#job_contract_type`).innerText =
          job.contract_type;
        
        // Add location display if location field exists
        if (job.job_location && newJobCard.querySelector(`#job_location`)) {
          newJobCard.querySelector(`#job_location`).innerText = job.job_location;
        }
        
        // Add created_at display in a more readable format
        if (newJobCard.querySelector(`#job_created_at`)) {
          newJobCard.querySelector(`#job_created_at`).innerText = moment(
            job.created_at
          ).format('MMM DD, YYYY');
        }
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
        // Ensure we're not appending to a button or inappropriate element
        if (jobListParent && jobListParent.tagName.toLowerCase() !== 'button' && 
            !(jobListParent.className && jobListParent.className.includes('btn'))) {
          jobListParent.appendChild(newJobCard);
        } else {
          console.error("Cannot append job card to button element:", jobListParent);
          // Try to find a better parent
          const betterParent = document.querySelector('div[class*="job"], div[id*="job"], div[class*="card"], div[id*="card"], section[class*="job"], section[id*="job"], main, .container, .row');
          if (betterParent && betterParent.tagName.toLowerCase() !== 'button') {
            betterParent.appendChild(newJobCard);
            console.log("Appended to better parent:", betterParent);
          }
        }
      });
    }

    if (!isFilterActivate) return doc.body.innerHTML;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    console.log("Form submitted - handleFormSubmit called");
    
    const jobSkillSetFilterCheckboxes = document.querySelectorAll(
      '#skill_set_list input[type="checkbox"]'
    );
    const contractTypeFilterCheckboxes = document.querySelectorAll(
      '#contract_type_list input[type="checkbox"]'
    );
    const workTypeFilterCheckboxes = document.querySelectorAll(
      '#work_type_list input[type="checkbox"]'
    );

    const shortByFilter = document.getElementById("short_by_filter");
    if (shortByFilter) {
      shortByFilter.value = "DESC";
    }

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
    const search = document.getElementById("search_job_title")?.value || "";
    
    console.log("Filter values:", {
      contract_type,
      skill_name,
      work_type,
      search,
      sortBy: selectedFilter.sortBy
    });
    
    setFilterActivate(true);
    setSelectedFilter({
      ...selectedFilter,
      contract_type,
      skill_name,
      work_type,
      search,
    });
    
    // Reset to page 1 when applying filters
    setPage(1); // Directly set page to 1
    onPageChange({ selected: 0 }); // Also call the pagination hook
    
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
    setJobDataLoader(true);
    try {
      // Encode parameters to handle special characters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: ITEMS_PER_PAGE.toString(),
        contract_type: contract_type || "",
        skill_name: skill_name || "",
        work_type: work_type || "",
        search: search || "",
        sort_order: sortBy || ""
      });
      
      const apiUrl = `web/jobs/published?${params.toString()}`;
      console.log("API Call URL:", apiUrl);
      console.log("Fetching jobs with parameters:", {
        contract_type,
        skill_name,
        work_type,
        search,
        sortBy,
        page
      });
      
      const response = await openAPIBuilderInstance.get(apiUrl);
      
      console.log("API Response:", response.data);
      
      if (response.data && response.data.data) {
        let list=response.data.data.jobs 
        setJobList(list);
        const newPaginationData = {
          totalData: response.data.data.total_items || 0,
          current_page: response.data.data.current_page || 1,
          per_page: response.data.data.per_page || ITEMS_PER_PAGE,
          total_pages: response.data.data.total_pages || 0,
        };     
        setPaginationData(newPaginationData);
        // Only fetch website if any filter value is present
        console.log("Filter parameters:", { contract_type, skill_name, work_type, search, sortBy })
        const hasActiveFilters = [contract_type, skill_name, work_type, search, sortBy].some(value => value && value.trim() !== '');
        if (hasActiveFilters) {
          fetchWebsite();
        }
   
   
      } else {
        console.warn("Unexpected API response structure:", response.data);
        setPaginationData({
          totalData: 0,
          current_page: 1,
          per_page: ITEMS_PER_PAGE,
          total_pages: 0,
        });
        setJobList([]);
      }
      setJobDataLoader(false);
    } catch (err) {
      setJobDataLoader(false);
      console.error("Error fetching job data:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Set empty data on error
      setPaginationData({
        totalData: 0,
        current_page: 1,
        per_page: ITEMS_PER_PAGE,
        total_pages: 0,
      });
      setJobList([]);
    }
  }

  return (
    
    <div>
      {
        websiteLoader ? (
          <WebsiteLoader />
        ) : jobDataLoader ? (
          <JobDataLoader />
        ) : (
          <>
            <Header setLoader={setWebsiteLoader} />
            <style>{website.css}</style>
            <style>{website["mycustom-css"]}</style>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </>
        )
      }
      
    </div>
  );
};

export default Page;
