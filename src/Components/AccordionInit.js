export function initializeAccordion() {
  const filterGroups = [
    {
      group: "work_type_group",
      header: "work_type_header", 
      list: "work_type_list",
      arrow: "work_type_arrow",
    },
    {
      group: "contract_type_group",
      header: "contract_type_header",
      list: "contract_type_list", 
      arrow: "contract_type_arrow",
    },
    {
      group: "skill_set_group",
      header: "skill_set_header",
      list: "skill_set_list",
      arrow: "skill_set_arrow",
    },
  ];

  filterGroups.forEach((ids) => {
    const group = document.getElementById(ids.group);
    const header = document.getElementById(ids.header);
    const list = document.getElementById(ids.list);
    const arrow = document.getElementById(ids.arrow);

    if (header && list && arrow) {
      // Set initial state to open
      group.setAttribute("data-active", true);
      list.style.display = "block";
      arrow.style.transform = "rotate(-180deg)";

      header.addEventListener("click", function () {
        // Toggle active state
        const isActive = group.getAttribute("data-active") === "true";
        group.setAttribute("data-active", !isActive);

        // Toggle visibility
        if (!isActive) {
          list.style.display = "block";
          arrow.style.transform = "rotate(-180deg)";
        } else {
          list.style.display = "none";
          arrow.style.transform = "rotate(0deg)";
        }
      });
    }
  });
}
