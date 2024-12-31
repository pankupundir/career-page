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
import { useNavigate } from "react-router-dom";

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
  const [skillSetList, setSkillList] = useState([]);
  const [jobTypeList, setJobTypeList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [firstTimeRender, setFirstTimeRender] = useState(true);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const [headerSectionData, setHeaderSectionData] = useState("");
  const navigate = useNavigate();

  // console.log(htmlContent, "htmlcontent=====>>>>>");

  let { pageId } = useParams();

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        // const jobTypeRes = await updateTheContent();
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

    fetchWebsite();
  }, []);

  useEffect(() => {
    if (!loader && !notFound) {
      setTimeout(() => {
        const headerToggle = document.getElementById("header-toggle");
        if (headerToggle) {
          headerToggle.addEventListener("click", () => {
            const body = document.body;
            body.classList.add("header-active");
            setIsHeaderActive(true);
          });
        }
        const jobDetailsButtons = document.querySelectorAll(".job-details-btn");
        if (jobDetailsButtons) {
          jobDetailsButtons.forEach((button) => {
            button.addEventListener("click", () => {
              // const jobId = button.getAttribute("data-job-id");
              window.location.href = `/job-details`;
            });
          });
        }
      }, 5000);
    }
  }, [loader]);

  useEffect(() => {
    if (isHeaderActive) {
      const closeMenuHeader = document.getElementById("close-menu-header");
      if (closeMenuHeader) {
        closeMenuHeader.addEventListener("click", () => {
          const body = document.body;
          body.classList.remove("header-active");
          setIsHeaderActive(false);
        });
      }
    }
  }, [isHeaderActive]);

  // useEffect(() => {
  //   if (!loader && !notFound) {
  //     const jobPostButton = document.querySelectorAll("#apply-more");
  //     if (jobPostButton) {
  //       jobPostButton.forEach((button) => {
  //         console.log("working")
  //         button.addEventListener("click", handleApplyJob);
  //       });
  //     }
  //   }
  // }, [loader]);

  // commented for feature use
  // useEffect(() => {
  //   console.log("useEffect run hello");
  //   if (htmlContent) {
  //     const jobPostButton = document.querySelectorAll("#apply-more");
  //     if (jobPostButton) {
  //       jobPostButton.forEach((button) => {
  //         button.addEventListener("click", handleApplyJob);
  //       });
  //     }
  //   }

  //   const select1 = document.getElementById("select1");
  //   const select2 = document.getElementById("select2");
  //   const input = document.getElementById("input");

  //   if (select1) {
  //     select1.addEventListener("change", handleSelect);
  //   }
  //   if (select2) {
  //     select2.addEventListener("change", handleSelect);
  //   }
  //   if (input) {
  //     input.addEventListener("input", handleSelect);
  //   }

  //   return () => {
  //     const select1 = document.getElementById("select1");
  //     const select2 = document.getElementById("select2");
  //     const input = document.getElementById("input");

  //     if (select1) {
  //       select1.removeEventListener("change", handleSelect);
  //     }
  //     if (select2) {
  //       select2.removeEventListener("change", handleSelect);
  //     }
  //     if (input) {
  //       input.removeEventListener("input", handleSelect);
  //     }

  //     const jobPostButton = document.querySelectorAll("#apply-more");
  //     jobPostButton.forEach((button) => {
  //       button.removeEventListener("click", handleApplyJob);
  //     });
  //   };
  // }, [htmlContent, modalIsOpen]);

  // useEffect(() => {
  //   if (jobList.length > 0 && website["mycustom-html"]) {
  //     const updateJObList = async () => {
  //       try {
  //         const updatedHTML = await updateJobListContent(htmlContent, jobList);

  //         setHtmlContent(updatedHTML);
  //         setLoader(false);
  //       } catch (err) {
  //         setLoader(false);
  //         console.log(err);
  //       }
  //     };
  //     updateJObList();
  //   }
  // }, [jobList, website]);

  useEffect(() => {
    webSiteBuilderInstance
      .get(`/api/section/${DEFAULT_TEMPLATE_ID}/header/content`)
      .then((res) => {
        // console.log(res.data);
        setHeaderSectionData(res.data?.data);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  }, []);

  const updateTheContent = async () => {
    const jobData = await fetchJobData();
    setJobList(jobData);
    const skillNames = Array.from(
      new Set(
        jobData.flatMap((job) =>
          job.job_skills.map((skill) => skill.skill_name?.toLowerCase())
        )
      )
    );
    const jobType = [
      ...new Set(jobData.map((job) => job.job_type?.toLowerCase())),
    ];
    setSkillList(skillNames);
    setJobTypeList(jobType);
    return { skillNames, jobType };
  };

  async function updateJobListContent(htmlString, jobData, isUpdate = false) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const firstJobCard = doc.getElementById("job-card");

    if (!firstJobCard) {
      console.error("No first job card found.");
      return;
    }

    const jobListParent = firstJobCard.parentNode;
    const copyFirstNode = firstJobCard.cloneNode(true);

    if (isUpdate) {
      const jobCards = doc.querySelectorAll("#job-card");
      jobCards.forEach((job) => {
        job.remove();
      });
    } else {
      // Remove existing job cards
      for (let i = 1; i < 6; i++) {
        let jobCard;
        if (i === 1) {
          jobCard = firstJobCard; // This is the first card
        } else {
          jobCard = doc.querySelector(`#job-card-${i}`);
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
      newJobCard.querySelector("#job-title").innerText = job.title;
      newJobCard.querySelector("#job-description").innerText = job.description;
      newJobCard.querySelector("#job-location").innerText = job.job_location;
      newJobCard
        .querySelector("#read-more")
        .setAttribute("data-job-id", job.id);
      newJobCard
        .querySelector("#apply-more")
        .setAttribute("data-job-id", job.id);
      // Clear previous skills if any
      // const skillMatch = newJobCard.querySelector("#skill-match");
      for (let i = 0; i < 10; i++) {
        let skillCard;
        if (i === 1) {
          skillCard = newJobCard.querySelector("#skill-match"); // This is the first card
        } else {
          skillCard = doc.querySelector(`#skill-match-${i}`);
        }
        if (!skillCard) {
          break;
        }
        skillCard.remove();
        // skillCard.innerText = ""; // Clear previous skills
      }

      job.job_skills.forEach((skill) => {
        let jobSkills = "";
        // for (let i = 1; i < 10; i++) {
        //   if (i === 1) {
        //     jobSkills = newJobCard.querySelector(`#skill-match`);
        //   } else {
        //     jobSkills = newJobCard.querySelector(`#skill-match-${i}`);
        //   }
        //   if (!jobSkills) {
        //     break;
        //   }

        //   jobSkills.remove();
        // }
        newJobCard.querySelector("#skill-match").innerText = skill.skill_name;
      });

      jobListParent.appendChild(newJobCard);
    });

    return doc.body.innerHTML;
  }

  const handleSelect = (event) => {
    console.log("func call hellooooooo", event.target);
    const eventValue = event.target;
    let tempJobData = [];
    if (eventValue.id === "select1") {
      tempJobData = jobList.filter((jb) =>
        jb.job_skills.some(
          (skl) => skl.skill_name.toLowerCase() === eventValue.value
        )
      );
    } else if (eventValue.id === "select2") {
      tempJobData = jobList.filter(
        (jb) => jb.job_type?.toLowerCase() === eventValue.value
      );
    } else {
      tempJobData = jobList.filter((jb) => jb.title.includes(eventValue.value));
    }
    updateJobListContent(htmlContent, tempJobData, true);
  };

  function updateJobFilterSelectBoxes(htmlString, skillSetList, jobTypeList) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const jobFilter = doc.getElementById("job-filter");

    if (!jobFilter) {
      console.error("No job filter found.");
      return htmlString;
    }

    const jobSkillsSelect = jobFilter.querySelector("#select1");
    if (jobSkillsSelect) {
      jobSkillsSelect.innerHTML = "";
      skillSetList.forEach((skill) => {
        const option = document.createElement("option");
        option.value = skill;
        option.textContent = skill;
        jobSkillsSelect.appendChild(option);
      });

      jobSkillsSelect.addEventListener("change", (event) => {
        handleInputChange(event.target.value);
      });

      jobSkillsSelect.value = skillSetList.length > 0 ? skillSetList[0] : "";
    }

    const jobTypeSelect = jobFilter.querySelector("#select2");
    if (jobTypeSelect) {
      jobTypeSelect.innerHTML = "";
      jobTypeList.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        jobTypeSelect.appendChild(option);
      });

      jobTypeSelect.addEventListener("change", (event) => {
        handleInputChange(event.target.value);
      });

      jobTypeSelect.value = jobTypeList.length > 0 ? jobTypeList[0] : "";
    }

    const inputField = jobFilter.querySelector("#input");
    if (inputField) {
      inputField.addEventListener("change", (event) => {
        handleInputChange(event.target.value);
      });
    }
    return doc.body.innerHTML;
  }

  async function fetchJobData(jobId) {
    const response = await openAPIBuilderInstance.get(
      "web/jobs/published?page=1&per_page=50"
    );
    return response.data.data.jobs;
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

  function handleInputChange(value) {
    console.log("Selected value:", value);
  }
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
              {/* <style>{headerSectionData.css}</style> */}
              <div className={isHeaderActive ? "header-show" : "header-hide"}>
                <style>{headerSectionData["mycustom-css"]}</style>
                <div
                  dangerouslySetInnerHTML={{
                    __html: headerSectionData["mycustom-html"],
                  }}
                />
              </div>
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
