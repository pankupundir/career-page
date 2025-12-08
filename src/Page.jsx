import { useEffect, useState, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  webSiteBuilderInstance,
  openAPIBuilderInstance,
  DEFAULT_TEMPLATE_ID,
  DEFAULT_LADING_PAGE,
} from "./config/webBuilder";
import { useParams, useNavigate } from "react-router-dom";
import WebsiteLoader from "./Components/WebsiteLoader";
import JobDataLoader from "./Components/JobDataLoader";
import moment from "moment";
import Header from "./Components/Header";
import usePagination from "./Hooks/usePaginantion";
import Pagination from "./Components/Pagination";
import { initializeAccordion } from "./Components/AccordionInit";
import LocationModal from "./Components/LocationModal";

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
  const navigate = useNavigate();
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
  const [locationModal, setLocationModal] = useState({
    isOpen: false,
    latitude: null,
    longitude: null,
    locationName: '',
    companyName: ''
  });

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
    const seeAllButtons = document.querySelectorAll('#see_all, .see_all, .see_all_container button, .see_all_container a, .see_all_container .see_all');
    
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

    seeAllButtons.forEach(button => {
      button.removeEventListener('click', handleSeeAllClick);
      button.addEventListener('click', handleSeeAllClick);
    });

    // Also handle the button by ID directly (in case it's not found by class)
    const seeAllButtonById = document.getElementById('see_all');
    if (seeAllButtonById) {
      seeAllButtonById.removeEventListener('click', handleSeeAllClick);
      seeAllButtonById.addEventListener('click', handleSeeAllClick);
    }


    
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
    
    // Add event delegation for location clicks
    const handleLocationClickDelegation = (e) => {
      const locationElement = e.target.closest('#job_location') || (e.target.id === 'job_location' ? e.target : null);
      if (locationElement) {
        const latitude = locationElement.getAttribute('data-latitude');
        const longitude = locationElement.getAttribute('data-longitude');
        const locationName = locationElement.textContent.trim() || 'Job Location';
        
        // Find the job card to get company name
        const jobCard = locationElement.closest('#job_card');
        let companyName = '';
        if (jobCard) {
          const companyNameElement = jobCard.querySelector('#job_company_name');
          if (companyNameElement) {
            companyName = companyNameElement.textContent.trim() || '';
          }
        }
        
        if (latitude && longitude) {
          e.preventDefault();
          e.stopPropagation();
          setLocationModal({
            isOpen: true,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            locationName: locationName,
            companyName: companyName
          });
        }
      }
    };
    
    // Add event delegation for job card clicks
    const handleJobCardClick = (e) => {
      // Don't navigate if clicking on location element (it has its own handler)
      if (e.target.closest('#job_location') || e.target.id === 'job_location') {
        return;
      }
      
      // Find the closest job card element
      const jobCard = e.target.closest('#job_card');
      if (jobCard) {
        const jobId = jobCard.getAttribute('data-job-id');
        // Don't navigate if clicking on buttons or links inside the card
        if (!e.target.closest('button') && !e.target.closest('a') && !e.target.closest('.btn-job-opening') && !e.target.closest('.register-btn')) {
          if (jobId) {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/job-details/${jobId}`);
          }
        }
      }
    };
    
    // Attach event listeners to document for event delegation
    document.addEventListener('click', handleLocationClickDelegation);
    document.addEventListener('click', handleJobCardClick);
    
    // Cleanup function
    return () => {
      // Remove location and job card click listeners
      document.removeEventListener('click', handleLocationClickDelegation);
      document.removeEventListener('click', handleJobCardClick);
      if (sideBarFilterForm) {
        sideBarFilterForm.removeEventListener("submit", handleFormSubmit);
      }
      if (sideBarResetBtn) {
        sideBarResetBtn.removeEventListener("click", handleResetForm);
      }
      if (shortByFilter) {
        shortByFilter.removeEventListener("change", handleSortByChange);
      }
      // Clean up job opening, register, connect, and see all button event listeners
      jobOpeningButtons.forEach(button => {
        button.removeEventListener('click', handleJobOpeningClick);
      });
      registerButtons.forEach(button => {
        button.removeEventListener('click', handleJobOpeningClick);
      });
      connectButtons.forEach(button => {
        button.removeEventListener('click', handleConnectClick);
      });
      seeAllButtons.forEach(button => {
        button.removeEventListener('click', handleSeeAllClick);
      });
      const seeAllButtonById = document.getElementById('see_all');
      if (seeAllButtonById) {
        seeAllButtonById.removeEventListener('click', handleSeeAllClick);
      }
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

  const handleSeeAllClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigate('/see-all-jobs');
  };

  const closeLocationModal = () => {
    setLocationModal({
      isOpen: false,
      latitude: null,
      longitude: null,
      locationName: '',
      companyName: ''
    });
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

  // Helper function to create SVG icons
  const createSVGIcon = (type, size = 16) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.flexShrink = '0';
    svg.style.display = 'inline-block';
    svg.style.verticalAlign = 'middle';
    
    switch(type) {
      case 'company':
        // Building icon
        const buildingPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        buildingPath.setAttribute('d', 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4');
        svg.appendChild(buildingPath);
        const window1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        window1.setAttribute('x1', '9');
        window1.setAttribute('y1', '9');
        window1.setAttribute('x2', '9.01');
        window1.setAttribute('y2', '9');
        svg.appendChild(window1);
        const window2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        window2.setAttribute('x1', '9');
        window2.setAttribute('y1', '12');
        window2.setAttribute('x2', '9.01');
        window2.setAttribute('y2', '12');
        svg.appendChild(window2);
        const window3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        window3.setAttribute('x1', '9');
        window3.setAttribute('y1', '15');
        window3.setAttribute('x2', '9.01');
        window3.setAttribute('y2', '15');
        svg.appendChild(window3);
        break;
      case 'location':
        // Map pin icon
        const pinPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pinPath.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
        svg.appendChild(pinPath);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '10');
        circle.setAttribute('r', '3');
        svg.appendChild(circle);
        break;
      case 'skill':
        // Tag icon
        const tagPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tagPath.setAttribute('d', 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z');
        svg.appendChild(tagPath);
        const tagCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        tagCircle.setAttribute('cx', '7');
        tagCircle.setAttribute('cy', '7');
        tagCircle.setAttribute('r', '1');
        svg.appendChild(tagCircle);
        break;
      case 'time':
        // Clock icon
        const clockCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        clockCircle.setAttribute('cx', '12');
        clockCircle.setAttribute('cy', '12');
        clockCircle.setAttribute('r', '10');
        svg.appendChild(clockCircle);
        const clockLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        clockLine1.setAttribute('x1', '12');
        clockLine1.setAttribute('y1', '6');
        clockLine1.setAttribute('x2', '12');
        clockLine1.setAttribute('y2', '12');
        svg.appendChild(clockLine1);
        const clockLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        clockLine2.setAttribute('x1', '16');
        clockLine2.setAttribute('y1', '14');
        clockLine2.setAttribute('x2', '12');
        clockLine2.setAttribute('y2', '12');
        svg.appendChild(clockLine2);
        break;
      default:
        return svg;
    }
    
    return svg;
  };

  // Helper function to add icon to element
  const addIconToElement = (element, iconType, size = 16) => {
    if (!element) return;
    
    // Check if icon already exists
    const existingIcon = element.querySelector('.job-icon');
    if (existingIcon) {
      existingIcon.remove();
    }
    
    // Create wrapper if element doesn't have display flex
    const currentDisplay = window.getComputedStyle(element).display;
    if (currentDisplay !== 'flex' && currentDisplay !== 'inline-flex') {
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.gap = '6px';
    } else {
      element.style.gap = '6px';
      element.style.alignItems = 'center';
    }
    
    const icon = createSVGIcon(iconType, size);
    icon.classList.add('job-icon');
    // Enhanced icon colors based on element type
    if (iconType === 'company') {
      icon.style.color = '#64748b';
    } else if (iconType === 'location') {
      icon.style.color = '#64748b';
    } else if (iconType === 'time') {
      icon.style.color = '#94a3b8';
    } else {
      icon.style.color = '#64748b';
    }
    icon.style.marginRight = '4px';
    icon.style.opacity = '0.8';
    
    // Insert icon at the beginning
    if (element.firstChild) {
      element.insertBefore(icon, element.firstChild);
    } else {
      element.appendChild(icon);
    }
  };

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
      // Apply flex layout styling when filters are active (working with document)
      const jobCardViewActive = document.getElementById("job_card_view");
      if (jobCardViewActive) {
        jobCardViewActive.style.display = 'flex';
        jobCardViewActive.style.flexDirection = 'row';
        jobCardViewActive.style.flexWrap = 'wrap';
        jobCardViewActive.style.gap = '13px';
      }
      // Also style the jobListParent if it's in the document
      if (jobListParent && jobListParent.ownerDocument === document) {
        jobListParent.style.display = 'flex';
        jobListParent.style.flexDirection = 'row';
        jobListParent.style.flexWrap = 'wrap';
        jobListParent.style.gap = '13px';
      }
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
        // Apply flex layout styling to job_card_view if it exists
        jobCardView.style.display = 'flex';
        jobCardView.style.flexDirection = 'row';
        jobCardView.style.flexWrap = 'wrap';
        jobCardView.style.gap = '13px';
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

    // Apply flex layout styling to the job cards container
    if (jobListParent) {
      jobListParent.style.display = 'flex';
      jobListParent.style.flexDirection = 'row';
      jobListParent.style.flexWrap = 'wrap';
      jobListParent.style.gap = '13px';
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
      
      // Format contract type: "full-time" -> "Full Time"
      const formatContractType = (contractType) => {
        if (!contractType) return '';
        return contractType
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };
      
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

        // Style each job card to take up 1/3 of the row width (accounting for gaps)
        // For 3 cards with 20px gap: (100% - 40px) / 3 = calc((100% - 40px) / 3)
        newJobCard.style.flex = '0 0 calc((100% - 40px) / 3)';
        newJobCard.style.minWidth = 'calc((100% - 40px) / 3)';
        newJobCard.style.maxWidth = 'calc((100% - 40px) / 3)';
        newJobCard.style.width = 'calc((100% - 40px) / 3)';
        
        // Enhanced job card design with better border radius and styling
        newJobCard.style.borderRadius = '16px';
        newJobCard.style.overflow = 'hidden';
        newJobCard.style.backgroundColor = '#ffffff';
        newJobCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)';
        newJobCard.style.transition = 'all 0.3s ease';
        newJobCard.style.border = '1px solid rgba(0, 0, 0, 0.08)';
        
        // Add hover effect
        newJobCard.addEventListener('mouseenter', function() {
          this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.08)';
          this.style.transform = 'translateY(-2px)';
        });
        newJobCard.addEventListener('mouseleave', function() {
          this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)';
          this.style.transform = 'translateY(0)';
        });

        // Create and add tooltip with full job title
        const existingTooltip = newJobCard.querySelector('.job-card-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        const tooltip = document.createElement('div');
        tooltip.className = 'job-card-tooltip';
        tooltip.textContent = job.title || '';
        tooltip.setAttribute('data-not-editable', 'true');
        newJobCard.appendChild(tooltip);

        const jobTitleElement = newJobCard.querySelector(`#job_card_title`);
        if (jobTitleElement) {
          // Truncate job title to 25 characters and add ellipsis if longer
          const truncatedTitle = job.title && job.title.length > 25 
            ? job.title.substring(0, 25) + '...' 
            : job.title;
          jobTitleElement.innerText = truncatedTitle;
          // Enhanced title styling
          jobTitleElement.style.fontSize = '20px';
          jobTitleElement.style.fontWeight = '700';
          jobTitleElement.style.color = '#1a1a1a';
          jobTitleElement.style.lineHeight = '1.3';
          jobTitleElement.style.marginBottom = '10px';
          jobTitleElement.style.marginTop = '0';
          jobTitleElement.style.letterSpacing = '-0.02em';
          jobTitleElement.style.wordWrap = 'break-word';
          jobTitleElement.style.overflowWrap = 'break-word';
        }
        
        // Helper function to check if URL is valid
        const isValidUrl = (url) => {
          return url && 
                 url !== null && 
                 url !== undefined && 
                 typeof url === 'string' && 
                 url.trim() !== '';
        };
        
        // Find and update the existing job_card_image element
        const jobCardImage = newJobCard.querySelector(`#job_card_image`);
        if (jobCardImage) {
          if (isValidUrl(job.job_picture_url)) {
            // Update the image src with API image
            jobCardImage.src = job.job_picture_url;
            jobCardImage.alt = job.title || 'Job image';
            jobCardImage.style.display = 'block';
            // Make the image with better styling
            jobCardImage.style.width = '100%';
            jobCardImage.style.height = '220px';
            jobCardImage.style.objectFit = 'cover';
            jobCardImage.style.borderRadius = '16px 16px 0 0';
            jobCardImage.style.marginBottom = '0';
            
            // Handle image load errors
            jobCardImage.onerror = function() {
              this.style.display = 'none';
            };
          } else {
            // Hide the image if no valid URL
            jobCardImage.style.display = 'none';
          }
        }
        
        // Handle company name and contract type on one line
        const companyNameElement = newJobCard.querySelector(`#job_company_name`);
        const contractTypeElement = newJobCard.querySelector(`#job_contract_type`);
        
        if (companyNameElement) {
          // Create a container for company name and contract type
          const existingCompanyContainer = newJobCard.querySelector('.company-contract-container');
          if (existingCompanyContainer) {
            existingCompanyContainer.remove();
          }
          
          const companyContractContainer = document.createElement('div');
          companyContractContainer.className = 'company-contract-container';
          companyContractContainer.setAttribute('data-not-editable', 'true');
          companyContractContainer.style.display = 'flex';
          companyContractContainer.style.alignItems = 'center';
          companyContractContainer.style.gap = '8px';
          companyContractContainer.style.flexWrap = 'wrap';
          companyContractContainer.style.marginBottom = '10px';
          companyContractContainer.style.marginTop = '0';
          
          // Company name wrapper
          const companyWrapper = document.createElement('span');
          companyWrapper.style.display = 'flex';
          companyWrapper.style.alignItems = 'center';
          companyWrapper.style.gap = '6px';
          companyWrapper.innerText = job.company_name;
          addIconToElement(companyWrapper, 'company', 16);
          companyWrapper.style.fontSize = '15px';
          companyWrapper.style.fontWeight = '500';
          companyWrapper.style.color = '#4a5568';
          companyWrapper.style.lineHeight = '1.5';
          
          companyContractContainer.appendChild(companyWrapper);
          
          // Add separator if contract type exists
          if (contractTypeElement && job.contract_type) {
            const separator = document.createElement('span');
            separator.textContent = '•';
            separator.style.color = '#cbd5e0';
            separator.style.fontSize = '14px';
            separator.style.margin = '0 2px';
            companyContractContainer.appendChild(separator);
            
            // Contract type wrapper
            const contractWrapper = document.createElement('span');
            // Convert contract_type to camelCase (e.g., "part-time" -> "partTime", "full-time" -> "fullTime")
            const formatContractTypeToCamelCase = (contractType) => {
              if (!contractType) return '';
              return contractType
                .split('-')
                .map((word, index) => 
                  index === 0 
                    ? word.toLowerCase() 
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join('');
            };
            contractWrapper.textContent = formatContractTypeToCamelCase(job.contract_type);
            contractWrapper.style.fontSize = '14px';
            contractWrapper.style.fontWeight = '500';
            contractWrapper.style.color = '#64748b';
            contractWrapper.style.lineHeight = '1.5';
            
            companyContractContainer.appendChild(contractWrapper);
            
            // Hide the original contract type element
            contractTypeElement.style.display = 'none';
          }
          
          // Insert the container before the company name element
          if (companyNameElement.parentNode) {
            companyNameElement.parentNode.insertBefore(companyContractContainer, companyNameElement);
            // Hide the original company name element
            companyNameElement.style.display = 'none';
          }
          
          if (!isValidUrl(job.job_picture_url)) {
            companyContractContainer.style.marginTop = '';
          }
          
          // Add skills below company name
          const existingSkillsContainer = newJobCard.querySelector('.job-skills-container');
          if (existingSkillsContainer) {
            existingSkillsContainer.remove();
          }
          
          if (job.job_skills && job.job_skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'job-skills-container';
            skillsContainer.setAttribute('data-not-editable', 'true');
            skillsContainer.style.marginBottom = '16px';
            skillsContainer.style.marginTop = '14px';
            
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
            
            job.job_skills.slice(0, 3).forEach((skill, index) => {
              const skillItem = document.createElement('li');
              skillItem.className = 'skill-tag';
              skillItem.setAttribute('data-not-editable', 'true');
              skillItem.id = `job_skill_${skill.id || skill.skill_id || index}`;
              skillItem.style.display = 'flex';
              skillItem.style.alignItems = 'center';
              skillItem.style.gap = '6px';
              // Enhanced skill tag styling
              skillItem.style.backgroundColor = '#f7f8fa';
              skillItem.style.padding = '6px 12px';
              skillItem.style.borderRadius = '16px';
              skillItem.style.fontSize = '12px';
              skillItem.style.fontWeight = '500';
              skillItem.style.color = '#2d3748';
              skillItem.style.border = '1px solid #e2e8f0';
              
              // Create SVG tag icon for skills
              const svgIcon = createSVGIcon('skill', 14);
              svgIcon.setAttribute('class', 'skill-icon');
              svgIcon.style.color = '#64748b';
              svgIcon.style.opacity = '0.7';
              svgIcon.style.flexShrink = '0';
              
              // Create span for skill name
              const skillSpan = document.createElement('span');
              skillSpan.textContent = skill.skill_name || skill;
              
              skillItem.appendChild(svgIcon);
              skillItem.appendChild(skillSpan);
              skillsList.appendChild(skillItem);
            });
            
            skillsContainer.appendChild(skillsList);
            
            // Insert skills container after company-contract container
            const companyContainer = newJobCard.querySelector('.company-contract-container');
            if (companyContainer && companyContainer.parentNode) {
              companyContainer.parentNode.insertBefore(skillsContainer, companyContainer.nextSibling);
            } else if (companyNameElement && companyNameElement.parentNode) {
              companyNameElement.parentNode.insertBefore(skillsContainer, companyNameElement.nextSibling);
            }
          } else if (job.skills) {
            // Fallback to comma-separated skills string
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'job-skills-container';
            skillsContainer.setAttribute('data-not-editable', 'true');
            skillsContainer.style.marginBottom = '16px';
            skillsContainer.style.marginTop = '14px';
            
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
            
            job.skills.split(',').slice(0, 3).forEach((skill, index) => {
              const skillItem = document.createElement('li');
              skillItem.className = 'skill-tag';
              skillItem.setAttribute('data-not-editable', 'true');
              skillItem.style.display = 'flex';
              skillItem.style.alignItems = 'center';
              skillItem.style.gap = '6px';
              // Enhanced skill tag styling
              skillItem.style.backgroundColor = '#f7f8fa';
              skillItem.style.padding = '6px 12px';
              skillItem.style.borderRadius = '16px';
              skillItem.style.fontSize = '12px';
              skillItem.style.fontWeight = '500';
              skillItem.style.color = '#2d3748';
              skillItem.style.border = '1px solid #e2e8f0';
              
              // Create SVG tag icon for skills
              const svgIcon = createSVGIcon('skill', 14);
              svgIcon.setAttribute('class', 'skill-icon');
              svgIcon.style.color = '#64748b';
              svgIcon.style.opacity = '0.7';
              svgIcon.style.flexShrink = '0';
              
              // Create span for skill name
              const skillSpan = document.createElement('span');
              skillSpan.textContent = skill.trim();
              
              skillItem.appendChild(svgIcon);
              skillItem.appendChild(skillSpan);
              skillsList.appendChild(skillItem);
            });
            
            skillsContainer.appendChild(skillsList);
            
            // Insert skills container after company-contract container
            const companyContainer = newJobCard.querySelector('.company-contract-container');
            if (companyContainer && companyContainer.parentNode) {
              companyContainer.parentNode.insertBefore(skillsContainer, companyContainer.nextSibling);
            } else if (companyNameElement && companyNameElement.parentNode) {
              companyNameElement.parentNode.insertBefore(skillsContainer, companyNameElement.nextSibling);
            }
          }
        }
        // Handle time display with icon
        const timeElement = newJobCard.querySelector(`#job-post-time`);
        if (timeElement) {
          timeElement.innerText = moment(job.created_at).fromNow();
          addIconToElement(timeElement, 'time', 14);
          timeElement.style.display = 'inline-flex';
          timeElement.style.alignItems = 'center';
          timeElement.style.gap = '6px';
          timeElement.style.color = '#000000';
          timeElement.style.fontSize = '13px';
          timeElement.style.fontWeight = '400';
          timeElement.style.marginTop = '8px';
          timeElement.style.marginBottom = '4px';
          timeElement.style.lineHeight = '1.4';
          timeElement.style.width = 'fit-content';
        }
        
        // Contract type is now handled in the company name section above
        
        // Add location display if location field exists
        if (job.job_location && newJobCard.querySelector(`#job_location`)) {
          const locationElement = newJobCard.querySelector(`#job_location`);
          locationElement.innerText = job.job_location;
          addIconToElement(locationElement, 'location', 16);
          // Enhanced location styling
          locationElement.style.display = 'flex';
          locationElement.style.alignItems = 'center';
          locationElement.style.gap = '6px';
          locationElement.style.color = '#64748b';
          locationElement.style.fontSize = '14px';
          locationElement.style.fontWeight = '400';
          locationElement.style.marginTop = '8px';
          locationElement.style.marginBottom = '8px';
          locationElement.style.lineHeight = '1.5';
          locationElement.style.listStyle = 'none';
          
          // Add click handler for location modal
          // Store lat/long from job data (use provided values or job.lat/job.long)
          const latitude = job.lat || 22.7681995;
          const longitude = job.long || 86.20066969999999;
          
          // Set data attributes for coordinates
          locationElement.setAttribute('data-latitude', latitude);
          locationElement.setAttribute('data-longitude', longitude);
          
          // Make location clickable (event delegation handles the click)
          locationElement.style.cursor = 'pointer';
          locationElement.style.userSelect = 'none';
          
          // Remove dot from parent list item if location is inside a <li>
          const parentLi = locationElement.closest('li');
          if (parentLi) {
            parentLi.style.listStyle = 'none';
            parentLi.style.listStyleType = 'none';
          }
        }
        
        // Add created_at display in a more readable format
        const createdAtElement = newJobCard.querySelector(`#job_created_at`);
        if (createdAtElement) {
          createdAtElement.innerText = moment(job.created_at).format('MMM DD, YYYY');
          // Enhanced created at styling
          createdAtElement.style.color = '#94a3b8';
          createdAtElement.style.fontSize = '13px';
          createdAtElement.style.fontWeight = '400';
          createdAtElement.style.marginTop = '4px';
          createdAtElement.style.marginBottom = '4px';
          createdAtElement.style.lineHeight = '1.4';
        }
        if (job.show_pay) {
          const payElement = newJobCard.querySelector(`#job_pay`);
          const currencyElement = newJobCard.querySelector(`#job_currency`);
          if (payElement) {
            payElement.innerText = job.pay;
            // Enhanced pay styling
            payElement.style.color = '#1e40af';
            payElement.style.fontSize = '16px';
            payElement.style.fontWeight = '600';
            payElement.style.marginTop = '8px';
            payElement.style.marginBottom = '4px';
            payElement.style.lineHeight = '1.4';
          }
          if (currencyElement) {
            currencyElement.innerText = job.currency;
            // Enhanced currency styling
            currencyElement.style.color = '#1e40af';
            currencyElement.style.fontSize = '16px';
            currencyElement.style.fontWeight = '600';
          }
        } else {
          if (newJobCard.querySelector(`#job_pay`)) {
            const payElement = newJobCard.querySelector(`#job_pay`);
            const payLiElement = payElement.closest("li");
            if (payLiElement) {
              payLiElement.remove();
            }
          }
        }
        // Make entire card clickable to open job details
        if (job.job_external_id) {
          newJobCard.style.cursor = 'pointer';
          // Add data attribute for event delegation
          newJobCard.setAttribute('data-job-id', job.job_external_id);
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
        // Don't fetch website when filters change - only update job data
        // The website HTML structure doesn't need to be reloaded on filter changes
   
   
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
      <LocationModal
        isOpen={locationModal.isOpen}
        onClose={closeLocationModal}
        latitude={locationModal.latitude}
        longitude={locationModal.longitude}
        locationName={locationModal.locationName}
        companyName={locationModal.companyName}
      />
    </div>
  );
};

export default Page;
