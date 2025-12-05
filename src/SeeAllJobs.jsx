import { useEffect, useState } from "react";
import {
  openAPIBuilderInstance,
  webSiteBuilderInstance,
} from "./config/webBuilder";
import { toast } from "react-toastify";
import Header from "./Components/Header";
import ScreenLoader from "./ScreenLoader";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import usePagination from "./Hooks/usePaginantion";
import Pagination from "./Components/Pagination";
import { createRoot } from "react-dom/client";

const SeeAllJobs = () => {
  const [website, setWebsite] = useState({
    css: "",
    html: "",
    js: "",
  });
  const [htmlContent, setHtmlContent] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [jobList, setJobList] = useState([]);
  const [loader, setLoader] = useState(true);
  const [screenLoader, setScreenLoader] = useState(false);
  const [jobDataLoader, setJobDataLoader] = useState(false);
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
  const [isFilterActivate, setFilterActivate] = useState(false);
  const [filterData, setFilterData] = useState({
    workTypes: [],
    contractTypes: [],
    skills: [],
    jobLocations: [],
    categories: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    work_type: "",
    contract_type: "",
    skill_name: "",
    search: ""
  });
  const ITEMS_PER_PAGE = 10;

  const fetchWebsite = async () => {
    try {
        setLoader(true);
      const response = await webSiteBuilderInstance.get(
        `/api/pages/activeTemplatePage/See-all-page`
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
            setLoader(false);
      }
      setLoader(false);
    } catch (error) {
      setNotFound(true);
      setLoader(false);
      console.error("Error fetching website data:", error);
    }
  };

  async function fetchJobData(
    contract_type = "",
    skill_name = "",
    work_type = "",
    search = "",
    sortBy = "",
    pageNumber = null
  ) {
    setJobDataLoader(true);
    try {
      // Use provided page number or current page state
      const currentPage = pageNumber !== null ? pageNumber : page;
      
      // Encode parameters to handle special characters
      const params = new URLSearchParams({
        page: currentPage.toString(),
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
        page: currentPage
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
        // Don't fetch website here - only update job list to avoid full page reload
   
   
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

  // Fetch filter data from API
  const fetchFilterData = async () => {
    try {
      const response = await openAPIBuilderInstance.get(
        "/web/career/career-page-filters"
      );
      if (response.data && response.data.data) {
        setFilterData({
          workTypes: response.data.data.workTypes || [],
          contractTypes: response.data.data.contractTypes || [],
          skills: response.data.data.skills || [],
          jobLocations: response.data.data.jobLocations || [],
          categories: response.data.data.categories || []
        });
      }
    } catch (err) {
      console.error("Error fetching filter data:", err);
    }
  };

  // Populate dropdowns with filter data
  const populateFilterDropdowns = () => {
    // Populate Work Type dropdown
    const workTypeSelect = document.getElementById("seeall_work_type");
    if (workTypeSelect && filterData.workTypes.length > 0) {
      // Clear existing options except the first "All" option
      while (workTypeSelect.options.length > 1) {
        workTypeSelect.remove(1);
      }
      // Add dynamic options
      filterData.workTypes.forEach((workType) => {
        const option = document.createElement("option");
        option.value = workType.originalName || workType.type?.toLowerCase() || "";
        option.textContent = workType.type || workType.originalName || "";
        workTypeSelect.appendChild(option);
      });
    }

    // Populate Contract Type dropdown
    const contractTypeSelect = document.getElementById("seeall_contract_type");
    if (contractTypeSelect && filterData.contractTypes.length > 0) {
      // Clear existing options except the first "All" option
      while (contractTypeSelect.options.length > 1) {
        contractTypeSelect.remove(1);
      }
      // Add dynamic options
      filterData.contractTypes.forEach((contractType) => {
        const option = document.createElement("option");
        option.value = contractType.originalName || contractType.type?.toLowerCase() || "";
        option.textContent = contractType.type || contractType.originalName || "";
        contractTypeSelect.appendChild(option);
      });
    }

    // Populate Skills dropdown
    const skillsSelect = document.getElementById("seeall_skills");
    if (skillsSelect && filterData.skills.length > 0) {
      // Clear existing options except the first "All" option
      while (skillsSelect.options.length > 1) {
        skillsSelect.remove(1);
      }
      // Add dynamic options
      filterData.skills.forEach((skill) => {
        const option = document.createElement("option");
        option.value = skill.skill || "";
        option.textContent = skill.skill || "";
        skillsSelect.appendChild(option);
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    const workType = document.getElementById("seeall_work_type")?.value || "";
    const contractType = document.getElementById("seeall_contract_type")?.value || "";
    const skill = document.getElementById("seeall_skills")?.value || "";
    const search = document.getElementById("seeall_search")?.value || "";

    setSelectedFilters({
      work_type: workType,
      contract_type: contractType,
      skill_name: skill,
      search: search
    });

    setFilterActivate(true);
    // Reset to page 1 when filters change
    setPage(1);
    onPageChange({ selected: 0 });
    
    fetchJobData(contractType, skill, workType, search, "");
  };

  // Handle reset filters
  const handleResetFilters = () => {
    console.log("Resetting all filters");
    
    // Clear all filter inputs
    const workTypeSelect = document.getElementById("seeall_work_type");
    const contractTypeSelect = document.getElementById("seeall_contract_type");
    const skillsSelect = document.getElementById("seeall_skills");
    const searchInput = document.getElementById("seeall_search");
    
    if (workTypeSelect) {
      workTypeSelect.value = "";
    }
    if (contractTypeSelect) {
      contractTypeSelect.value = "";
    }
    if (skillsSelect) {
      skillsSelect.value = "";
    }
    if (searchInput) {
      searchInput.value = "";
    }
    
    // Reset filter state
    setSelectedFilters({
      work_type: "",
      contract_type: "",
      skill_name: "",
      search: ""
    });
    
    // Deactivate filter mode
    setFilterActivate(false);
    
    // Reset to page 1 first
    setPage(1);
    onPageChange({ selected: 0 });
    
    // Immediately fetch all jobs without filters, forcing page 1
    fetchJobData("", "", "", "", "", 1);
    
    // Ensure reset button icon is set up after reset
    setTimeout(() => {
      setupResetButton();
    }, 300);
  };

  // Setup reset filters button icon
  const setupResetButton = () => {
    const resetFiltersBtn = document.getElementById("seeall_reset_filters");
    if (resetFiltersBtn) {
      // Clear existing content and add reset icon
      resetFiltersBtn.innerHTML = '';
      resetFiltersBtn.style.display = 'flex';
      resetFiltersBtn.style.alignItems = 'center';
      resetFiltersBtn.style.justifyContent = 'center';
      resetFiltersBtn.style.cursor = 'pointer';
      resetFiltersBtn.style.gap = '8px';
      resetFiltersBtn.style.padding = '8px 16px';
      resetFiltersBtn.style.borderRadius = '8px';
      resetFiltersBtn.style.border = '1px solid #e0e0e0';
      resetFiltersBtn.style.backgroundColor = '#ffffff';
      resetFiltersBtn.style.transition = 'all 0.3s ease';
      resetFiltersBtn.style.fontSize = '14px';
      resetFiltersBtn.style.fontWeight = '500';
      resetFiltersBtn.style.color = '#666';
      resetFiltersBtn.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      resetFiltersBtn.style.marginLeft = '12px';
      
      // Add title attribute for tooltip
      resetFiltersBtn.setAttribute('title', 'Reset Filters');
      
      const resetIcon = createSVGIcon('reset', 18);
      resetIcon.style.color = '#666';
      resetIcon.style.flexShrink = '0';
      resetIcon.style.transition = 'transform 0.3s ease, color 0.3s ease';
      
      resetFiltersBtn.appendChild(resetIcon);
      
      // Add hover effects
      resetFiltersBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f5f5f5';
        this.style.borderColor = '#d0d0d0';
        this.style.color = '#333';
        this.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        this.style.transform = 'translateY(-1px)';
        const icon = this.querySelector('svg');
        if (icon) {
          icon.style.color = '#333';
          icon.style.transform = 'rotate(180deg)';
        }
      });
      
      resetFiltersBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#ffffff';
        this.style.borderColor = '#e0e0e0';
        this.style.color = '#666';
        this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        this.style.transform = 'translateY(0)';
        const icon = this.querySelector('svg');
        if (icon) {
          icon.style.color = '#666';
          icon.style.transform = 'rotate(0deg)';
        }
      });
      
      // Add active/press effect
      resetFiltersBtn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
      });
      
      resetFiltersBtn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
      });
      
      // Remove old listener and add new one
      resetFiltersBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleResetFilters();
      };
    }
  };

  // Setup pagination event listeners
  const setupPaginationListeners = () => {
    // Handle pagination number buttons - use event delegation
    const paginationNumbers = document.getElementById("seeall_pagination_numbers");
    if (paginationNumbers) {
      // Remove old listener if exists
      const oldHandler = paginationNumbers._paginationClickHandler;
      if (oldHandler) {
        paginationNumbers.removeEventListener('click', oldHandler);
      }
      
      // Create new handler
      const clickHandler = (e) => {
        const button = e.target.closest('.seeall-pagination-number');
        if (button) {
          e.preventDefault();
          e.stopPropagation();
          const pageNum = parseInt(button.getAttribute('data-page'));
          if (pageNum && pageNum > 0 && pageNum !== paginationData.current_page) {
            setPage(pageNum);
            onPageChange({ selected: pageNum - 1 });
            fetchJobData(
              selectedFilters.contract_type,
              selectedFilters.skill_name,
              selectedFilters.work_type,
              selectedFilters.search,
              "",
              pageNum
            );
          }
        }
      };
      
      // Store handler reference and add listener
      paginationNumbers._paginationClickHandler = clickHandler;
      paginationNumbers.addEventListener('click', clickHandler);
    }

    // Handle previous button
    const prevButton = document.getElementById("seeall_pagination_prev");
    if (prevButton) {
      prevButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (paginationData.current_page > 1) {
          const newPage = paginationData.current_page - 1;
          setPage(newPage);
          onPageChange({ selected: newPage - 1 });
          fetchJobData(
            selectedFilters.contract_type,
            selectedFilters.skill_name,
            selectedFilters.work_type,
            selectedFilters.search,
            "",
            newPage
          );
        }
      };
    }

    // Handle next button
    const nextButton = document.getElementById("seeall_pagination_next");
    if (nextButton) {
      nextButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (paginationData.current_page < paginationData.total_pages) {
          const newPage = paginationData.current_page + 1;
          setPage(newPage);
          onPageChange({ selected: newPage - 1 });
          fetchJobData(
            selectedFilters.contract_type,
            selectedFilters.skill_name,
            selectedFilters.work_type,
            selectedFilters.search,
            "",
            newPage
          );
        }
      };
    }
  };

  // Update pagination UI
  const updatePaginationUI = () => {
    const paginationNumbers = document.getElementById("seeall_pagination_numbers");
    const prevButton = document.getElementById("seeall_pagination_prev");
    const nextButton = document.getElementById("seeall_pagination_next");
    const paginationInfo = document.getElementById("seeall_pagination_info");
    const paginationContainer = document.querySelector('.seeall-pagination-container');

    // Show/hide pagination container based on total_pages
    if (paginationContainer) {
      if (paginationData.total_pages > 1) {
        paginationContainer.style.display = '';
      } else {
        paginationContainer.style.display = 'none';
      }
    }

    // Update pagination numbers only if total_pages > 1
    if (paginationNumbers && paginationData.total_pages > 1) {
      paginationNumbers.innerHTML = '';
      
      // Calculate which page numbers to show (show max 5 pages at a time)
      const currentPage = paginationData.current_page;
      const totalPages = paginationData.total_pages;
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
      }
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }

      // Add first page if not in range
      if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'seeall-pagination-number';
        firstBtn.setAttribute('data-page', '1');
        firstBtn.textContent = '1';
        if (currentPage === 1) firstBtn.classList.add('active');
        paginationNumbers.appendChild(firstBtn);
        
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.style.padding = '0 8px';
          paginationNumbers.appendChild(ellipsis);
        }
      }

      // Add page numbers in range
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'seeall-pagination-number';
        pageBtn.setAttribute('data-page', i.toString());
        pageBtn.textContent = i.toString();
        if (i === currentPage) pageBtn.classList.add('active');
        paginationNumbers.appendChild(pageBtn);
      }

      // Add last page if not in range
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.style.padding = '0 8px';
          paginationNumbers.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'seeall-pagination-number';
        lastBtn.setAttribute('data-page', totalPages.toString());
        lastBtn.textContent = totalPages.toString();
        if (currentPage === totalPages) lastBtn.classList.add('active');
        paginationNumbers.appendChild(lastBtn);
      }
    }

    // Update prev/next button states
    if (prevButton) {
      prevButton.disabled = paginationData.current_page <= 1;
    }
    if (nextButton) {
      nextButton.disabled = paginationData.current_page >= paginationData.total_pages;
    }

    // Update pagination info
    if (paginationInfo) {
      const start = (paginationData.current_page - 1) * paginationData.per_page + 1;
      const end = Math.min(
        paginationData.current_page * paginationData.per_page,
        paginationData.totalData
      );
      paginationInfo.textContent = `Showing ${start} - ${end} of ${paginationData.totalData} jobs`;
    }
  };

  // Setup filter event listeners
  const setupFilterListeners = () => {
    const workTypeSelect = document.getElementById("seeall_work_type");
    const contractTypeSelect = document.getElementById("seeall_contract_type");
    const skillsSelect = document.getElementById("seeall_skills");
    const searchInput = document.getElementById("seeall_search");
    const filterForm = document.getElementById("seeall_filter_form");

    // Store timeout in a way that persists across calls
    if (!window.seeallSearchTimeout) {
      window.seeallSearchTimeout = null;
    }

    if (workTypeSelect) {
      // Remove old listener and add new one
      const newWorkTypeHandler = () => handleFilterChange();
      workTypeSelect.onchange = newWorkTypeHandler;
    }

    if (contractTypeSelect) {
      const newContractTypeHandler = () => handleFilterChange();
      contractTypeSelect.onchange = newContractTypeHandler;
    }

    if (skillsSelect) {
      const newSkillsHandler = () => handleFilterChange();
      skillsSelect.onchange = newSkillsHandler;
    }

    if (searchInput) {
      // Debounce search input
      searchInput.oninput = (e) => {
        if (window.seeallSearchTimeout) {
          clearTimeout(window.seeallSearchTimeout);
        }
        window.seeallSearchTimeout = setTimeout(() => {
          handleFilterChange();
        }, 500); // Wait 500ms after user stops typing
      };
    }

    if (filterForm) {
      filterForm.onsubmit = (e) => {
        e.preventDefault();
        handleFilterChange();
        return false;
      };
    }
  };

  useEffect(() => {
    fetchWebsite();
    fetchFilterData();
    fetchJobData();
  }, []);

  useEffect(() => {
    if (page > 0) {
      fetchJobData(
        selectedFilters.contract_type,
        selectedFilters.skill_name,
        selectedFilters.work_type,
        selectedFilters.search,
        ""
      );
    }
  }, [page]);

  // Populate dropdowns when filter data is available and HTML is loaded
  useEffect(() => {
    if (htmlContent) {
      // Use setTimeout to ensure DOM is ready after React renders
      const timer = setTimeout(() => {
        if (filterData.workTypes.length > 0 || filterData.contractTypes.length > 0 || filterData.skills.length > 0) {
          populateFilterDropdowns();
        }
        setupFilterListeners();
        setupResetButton();
        setupPaginationListeners();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [htmlContent, filterData]);

  // Additional useEffect to ensure reset button is set up whenever DOM updates
  useEffect(() => {
    const setupResetButtonWithRetry = () => {
      const resetFiltersBtn = document.getElementById("seeall_reset_filters");
      if (resetFiltersBtn) {
        // Check if icon already exists
        const existingIcon = resetFiltersBtn.querySelector('svg');
        if (!existingIcon) {
          setupResetButton();
        }
      }
    };

    // Try immediately
    setupResetButtonWithRetry();

    // Also try after a short delay to catch any delayed DOM updates
    const timer = setTimeout(() => {
      setupResetButtonWithRetry();
    }, 500);

    return () => clearTimeout(timer);
  }, [htmlContent, jobList, isFilterActivate]);

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
      case 'reset':
        // Reset/Refresh icon (circular arrows)
        const resetPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        resetPath1.setAttribute('d', 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8');
        svg.appendChild(resetPath1);
        const resetPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        resetPath2.setAttribute('d', 'M21 3v5h-5');
        svg.appendChild(resetPath2);
        const resetPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        resetPath3.setAttribute('d', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16');
        svg.appendChild(resetPath3);
        const resetPath4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        resetPath4.setAttribute('d', 'M3 21v-5h5');
        svg.appendChild(resetPath4);
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

        const jobTitleElement = newJobCard.querySelector(`#job_card_title`);
        if (jobTitleElement) {
          jobTitleElement.innerText = job.title;
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
            contractWrapper.textContent = job.contract_type;
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
            
            job.job_skills.forEach((skill, index) => {
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
            
            job.skills.split(',').forEach((skill, index) => {
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
          timeElement.style.color = '#94a3b8';
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

    if (!isFilterActivate) {
      // When filters are not active, we need to update the actual DOM
      // Find the job list container in the actual document
      const actualJobListParent = document.querySelector('#job_card')?.parentNode || 
                                   document.querySelector('#job_card_view') ||
                                   document.querySelector('[id*="job"]') ||
                                   document.querySelector('[class*="job"]');
      
      if (actualJobListParent) {
        // Clear existing job cards in the actual DOM
        const existingCards = actualJobListParent.querySelectorAll('#job_card');
        existingCards.forEach(card => card.remove());
        
        // Remove no jobs message if exists
        const noJobsMsg = document.getElementById("no_jobs");
        if (noJobsMsg) noJobsMsg.remove();
        
        // Apply flex layout
        actualJobListParent.style.display = 'flex';
        actualJobListParent.style.flexDirection = 'row';
        actualJobListParent.style.flexWrap = 'wrap';
        actualJobListParent.style.gap = '13px';
        
        // Get all job cards from the parsed doc and append to actual DOM
        const newCards = doc.querySelectorAll('#job_card');
        if (newCards.length > 0) {
          newCards.forEach(card => {
            const clonedCard = card.cloneNode(true);
            actualJobListParent.appendChild(clonedCard);
          });
        } else if (jobData.length === 0) {
          // Show no jobs message if no jobs
          const noJobsMessage = document.createElement("div");
          noJobsMessage.id = "no_jobs";
          noJobsMessage.className = "no-jobs";
          noJobsMessage.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
              <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
              <p style="font-size: 24px; color: #666; margin: 0;">No Jobs Found</p>
            </div>`;
          actualJobListParent.appendChild(noJobsMessage);
        }
      }
      
      return doc.body.innerHTML;
    }
  }

  useEffect(() => {
    if (website["mycustom-html"]) {
      const updateJObList = async () => {
        try {
          const updatedHTML = await updateJobListContent(htmlContent, jobList);
          if (updatedHTML && !isFilterActivate) {
            // Only update htmlContent when not filtering to preserve original structure
            setHtmlContent(updatedHTML);
          }
          console.log(updatedHTML,"updatedHTML")
          setJobDataLoader(false);
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
    // Add event delegation for job card clicks
    const handleJobCardClick = (e) => {
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
    
    // Attach event listener to document for event delegation
    document.addEventListener('click', handleJobCardClick);
    
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

    // Update pagination UI whenever pagination data changes
    updatePaginationUI();
    
    // Re-setup pagination listeners to ensure they use current state values
    setupPaginationListeners();
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleJobCardClick);
    };
  }, [navigate, htmlContent, paginationData, page, onPageChange, selectedFilters]);

  useEffect(() => {
    const numberSpan = document.querySelector(".number");
    if (numberSpan) {
      numberSpan.textContent = paginationData.totalData;
    }
  }, [paginationData.totalData, htmlContent]);

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

  return (
    <div>
      {loader ? (
        <ScreenLoader />
      ) : (
        <>
          {screenLoader && <ScreenLoader />}
          <Header setLoader={setLoader} />

          <style>{website.css}</style>
          <style>{website["mycustom-css"]}</style>

          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </>
      )}
    </div>
  );
};

export default SeeAllJobs;

