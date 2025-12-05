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
        applyBtn.style.bottom = "35px";
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
        
      }
    };

    // Run the map update function
    updateGoogleMapIframe();
  }, [htmlContent, jobDetails]);

  // Effect to update job banner background image and height after HTML is rendered
  useEffect(() => {
    if (htmlContent) {
      // Hide the job_title element
      const jobTitleElement = document.querySelector(`#job_title`);
      if (jobTitleElement) {
        jobTitleElement.style.display = 'none';
      }

      // Update banner background image
      if (jobDetails.job_picture_url) {
        const jobBanner = document.querySelector(`.job-banner`);
        if (jobBanner) {
          jobBanner.style.backgroundImage = `url(${jobDetails.job_picture_url})`;
          jobBanner.style.backgroundSize = 'cover';
          jobBanner.style.backgroundPosition = 'center';
          jobBanner.style.backgroundRepeat = 'no-repeat';
          jobBanner.style.minHeight = '500px';
          jobBanner.style.height = '500px';
          jobBanner.style.width = '100%';
          jobBanner.style.backgroundAttachment = 'fixed';
          console.log("Job banner styles applied after render:", jobDetails.job_picture_url);
        }
      }

      // Update banner job location above title
      const bannerJobTitle = document.querySelector(`#banner_job_title`);
      if (bannerJobTitle && jobDetails.job_location) {
        let bannerJobLocation = document.querySelector(`#banner_job_location`);
        
        if (!bannerJobLocation) {
          // Create location element if it doesn't exist
          bannerJobLocation = document.createElement('div');
          bannerJobLocation.id = 'banner_job_location';
          bannerJobLocation.style.fontSize = '18px';
          bannerJobLocation.style.color = '#ffffff';
          bannerJobLocation.style.marginBottom = '10px';
          bannerJobLocation.style.opacity = '0.9';
          bannerJobLocation.style.fontWeight = '400';
          
          // Insert before the title
          if (bannerJobTitle.parentNode) {
            bannerJobTitle.parentNode.insertBefore(bannerJobLocation, bannerJobTitle);
          }
        }
        
        if (bannerJobLocation) {
          bannerJobLocation.innerText = jobDetails.job_location;
          console.log("Banner job location applied after render:", jobDetails.job_location);
        }
      }

      // Update banner company name and category below title
      if (bannerJobTitle) {
        let bannerCompanyCategory = document.querySelector(`#banner_company_category`);
        
        if (!bannerCompanyCategory) {
          // Create company/category element if it doesn't exist
          bannerCompanyCategory = document.createElement('div');
          bannerCompanyCategory.id = 'banner_company_category';
          bannerCompanyCategory.style.fontSize = '16px';
          bannerCompanyCategory.style.color = '#ffffff';
          bannerCompanyCategory.style.marginTop = '10px';
          bannerCompanyCategory.style.opacity = '0.85';
          bannerCompanyCategory.style.fontWeight = '400';
          bannerCompanyCategory.style.display = 'flex';
          bannerCompanyCategory.style.alignItems = 'center';
          bannerCompanyCategory.style.justifyContent = 'center';
          bannerCompanyCategory.style.gap = '10px';
          bannerCompanyCategory.style.textAlign = 'center';
          
          // Insert after the title
          if (bannerJobTitle.parentNode) {
            bannerJobTitle.parentNode.insertBefore(bannerCompanyCategory, bannerJobTitle.nextSibling);
          }
        }
        
        if (bannerCompanyCategory) {
          // Ensure centering styles are applied
          bannerCompanyCategory.style.justifyContent = 'center';
          bannerCompanyCategory.style.textAlign = 'center';
          
          const companyName = jobDetails.company_name || jobDetails.publishedBy?.name || '';
          const categoryName = jobDetails.job_category?.title || '';
          const separator = companyName && categoryName ? ' • ' : '';
          bannerCompanyCategory.innerText = `${companyName}${separator}${categoryName}`;
          console.log("Banner company and category applied after render:", companyName, categoryName);
        }
      }
    }
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

    // Hide the job_title element
    const jobTitleElement = jobCardDetails.querySelector(`#job_title`);
    if (jobTitleElement) {
      jobTitleElement.style.display = 'none';
    }
    
    jobCardDetails.querySelector(`#job_title_side_bar`).innerText =
      jobDetails.title;
    
    // Update banner job title
    const bannerJobTitle = jobCardDetails.querySelector(`#banner_job_title`) || doc.querySelector(`#banner_job_title`);
    if (bannerJobTitle) {
      // First, add job location above the title
      let bannerJobLocation = jobCardDetails.querySelector(`#banner_job_location`) || doc.querySelector(`#banner_job_location`);
      
      if (!bannerJobLocation && jobDetails.job_location) {
        // Create location element if it doesn't exist
        bannerJobLocation = doc.createElement('div');
        bannerJobLocation.id = 'banner_job_location';
        bannerJobLocation.style.fontSize = '18px';
        bannerJobLocation.style.color = '#ffffff';
        bannerJobLocation.style.marginBottom = '10px';
        bannerJobLocation.style.opacity = '0.9';
        
        // Insert before the title
        if (bannerJobTitle.parentNode) {
          bannerJobTitle.parentNode.insertBefore(bannerJobLocation, bannerJobTitle);
        }
      }
      
      if (bannerJobLocation && jobDetails.job_location) {
        bannerJobLocation.innerText = jobDetails.job_location;
        console.log("Banner job location updated:", jobDetails.job_location);
      }
      
      // Update the title
      bannerJobTitle.innerText = jobDetails.title;
      console.log("Banner job title updated:", jobDetails.title);
      
      // Add company name and category below the title (on one line)
      let bannerCompanyCategory = jobCardDetails.querySelector(`#banner_company_category`) || doc.querySelector(`#banner_company_category`);
      
      if (!bannerCompanyCategory) {
        // Create company/category element if it doesn't exist
        bannerCompanyCategory = doc.createElement('div');
        bannerCompanyCategory.id = 'banner_company_category';
        bannerCompanyCategory.style.fontSize = '16px';
        bannerCompanyCategory.style.color = '#ffffff';
        bannerCompanyCategory.style.marginTop = '10px';
        bannerCompanyCategory.style.opacity = '0.85';
        bannerCompanyCategory.style.fontWeight = '400';
        bannerCompanyCategory.style.display = 'flex';
        bannerCompanyCategory.style.alignItems = 'center';
        bannerCompanyCategory.style.justifyContent = 'center';
        bannerCompanyCategory.style.gap = '10px';
        bannerCompanyCategory.style.textAlign = 'center';
        
        // Insert after the title
        if (bannerJobTitle.parentNode) {
          bannerJobTitle.parentNode.insertBefore(bannerCompanyCategory, bannerJobTitle.nextSibling);
        }
      }
      
      if (bannerCompanyCategory) {
        // Ensure centering styles are applied
        bannerCompanyCategory.style.justifyContent = 'center';
        bannerCompanyCategory.style.textAlign = 'center';
        
        const companyName = jobDetails.company_name || jobDetails.publishedBy?.name || '';
        const categoryName = jobDetails.job_category?.title || '';
        const separator = companyName && categoryName ? ' • ' : '';
        bannerCompanyCategory.innerText = `${companyName}${separator}${categoryName}`;
        console.log("Banner company and category updated:", companyName, categoryName);
      }
    } else {
      console.log("Banner job title element not found anywhere in the document");
    }

    // Update job banner background image dynamically
    const jobBanner = doc.querySelector(`.job-banner`);
    if (jobBanner && jobDetails.job_picture_url) {
      jobBanner.style.backgroundImage = `url(${jobDetails.job_picture_url})`;
      jobBanner.style.backgroundSize = 'cover';
      jobBanner.style.backgroundPosition = 'center';
      jobBanner.style.backgroundRepeat = 'no-repeat';
      jobBanner.style.minHeight = '500px';
      jobBanner.style.height = '500px';
      jobBanner.style.width = '100%';
      jobBanner.style.backgroundAttachment = 'fixed';
      console.log("Job banner background image updated:", jobDetails.job_picture_url);
    } else if (jobBanner) {
      console.log("Job banner element found but job_picture_url is not available");
    } else {
      console.log("Job banner element with class .job-banner not found in the document");
    }
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

    // Debug: Log jobDetails to see structure
    console.log('JobDetails for skills:', {
      job_skills: jobDetails.job_skills,
      optional_skills: jobDetails.optional_skills,
      skills: jobDetails.skills,
      allKeys: Object.keys(jobDetails)
    });

    // Update required skills - search in entire document
    const jobSkillsSideBar = doc.querySelector(`#job_skills_side_bar`) || jobCardDetails?.querySelector(`#job_skills_side_bar`);
    // Try multiple possible property names for required skills
    const requiredSkills = jobDetails.job_skills || jobDetails.skills || jobDetails.required_skills || [];
    
    if (jobSkillsSideBar) {
      // Clear existing skills
      jobSkillsSideBar.innerHTML = '';
      
      if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
        // Add each skill as a span
        requiredSkills.forEach((skill) => {
          const skillSpan = document.createElement('span');
          skillSpan.className = 'skill-tag-sidebar';
          skillSpan.textContent = skill.skill_name || skill.normalized_skill_name || skill;
          jobSkillsSideBar.appendChild(skillSpan);
        });
        console.log('Required skills updated:', requiredSkills);
      } else {
        console.log('No required skills data found');
      }
    } else {
      console.log('Required skills element #job_skills_side_bar not found in document');
    }

    // Update optional skills - search in entire document
    const optionalSkillsSideBar = doc.querySelector(`#optional_skills_side_bar`) || jobCardDetails?.querySelector(`#optional_skills_side_bar`);
    const optionalSkills = jobDetails.optional_job_skills || [];
    
    if (optionalSkillsSideBar) {
      // Clear existing skills
      optionalSkillsSideBar.innerHTML = '';
      
      if (Array.isArray(optionalSkills) && optionalSkills.length > 0) {
        // Add each skill as a span with optional class
        optionalSkills.forEach((skill) => {
          const skillSpan = document.createElement('span');
          skillSpan.className = 'skill-tag-sidebar skill-tag-optional';
          skillSpan.textContent = skill.skill_name || skill.normalized_skill_name || skill;
          optionalSkillsSideBar.appendChild(skillSpan);
        });
        console.log('Optional skills updated:', optionalSkills);
      } else {
        console.log('No optional skills data found');
      }
    } else {
      console.log('Optional skills element #optional_skills_side_bar not found in document');
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
