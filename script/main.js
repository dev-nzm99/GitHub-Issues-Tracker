let allIssues = [];
let displayedIssues = [];
let currentFilter = "all";

const issuesList = document.getElementById("issues-list");
const issueCount = document.getElementById("issue-count");
const searchInput = document.getElementById("search-input");
const loader = document.getElementById("loader");

const issueModal = document.getElementById("issue-modal");
const modalContent = document.getElementById("modal-content");
const modalLoader = document.getElementById("modal-loader");

const showLoader = () => {
  loader.classList.remove("hidden");
  issuesList.classList.add("hidden");
};

const hideLoader = () => {
  loader.classList.add("hidden");
  issuesList.classList.remove("hidden");
};

const showModalLoader = () => {
  modalLoader.classList.remove("hidden");
  modalContent.innerHTML = "";
};

const hideModalLoader = () => {
  modalLoader.classList.add("hidden");
};

const getPriorityClass = (priority) => {
  const value = (priority || "").toLowerCase();

  if (value === "high") return "bg-rose-100 text-rose-500";
  if (value === "medium") return "bg-amber-100 text-amber-500";
  return "bg-slate-100 text-slate-500";
};

const getLabelClass = (label) => {
  const lowerLabel = (label || "").toLowerCase();

  if (lowerLabel.includes("bug")) {
    return "badge badge-outline rounded-full px-3 py-3 text-xs font-medium border-rose-200 bg-rose-50 text-rose-500";
  }

  if (lowerLabel.includes("enhancement")) {
    return "badge badge-outline rounded-full px-3 py-3 text-xs font-medium border-emerald-200 bg-emerald-50 text-emerald-600";
  }

  if (lowerLabel.includes("help")) {
    return "badge badge-outline rounded-full px-3 py-3 text-xs font-medium border-amber-200 bg-amber-50 text-amber-600";
  }

  if (lowerLabel.includes("documentation")) {
    return "badge badge-outline rounded-full px-3 py-3 text-xs font-medium border-sky-200 bg-sky-50 text-sky-600";
  }

  return "badge badge-outline rounded-full px-3 py-3 text-xs font-medium border-slate-300 bg-slate-50 text-slate-600";
};

const getModalLabelClass = (label) => {
  const lowerLabel = (label || "").toLowerCase();

  if (lowerLabel.includes("bug")) {
    return "badge rounded-full border border-rose-200 bg-rose-50 text-rose-500";
  }

  if (lowerLabel.includes("enhancement")) {
    return "badge rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600";
  }

  if (lowerLabel.includes("help")) {
    return "badge rounded-full border border-amber-200 bg-amber-50 text-amber-600";
  }

  if (lowerLabel.includes("documentation")) {
    return "badge rounded-full border border-sky-200 bg-sky-50 text-sky-600";
  }

  return "badge rounded-full border border-slate-200 bg-slate-100 text-slate-500";
};

const searchIssuesFromAPI = (searchText) => {
  showLoader();

  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(searchText)}`)
    .then((res) => res.json())
    .then((data) => {
      displayedIssues = data.data || [];
      applyFilter();
    })
    .catch((error) => {
      console.error("Error searching issues:", error);
      issuesList.innerHTML = `
        <div class="w-full text-center py-10 text-red-500 font-medium">
          Failed to search issues.
        </div>
      `;
      issueCount.textContent = "0 Issues";
    })
    .finally(() => {
      hideLoader();
    });
};

searchInput.addEventListener("input", (e) => {
  const searchText = e.target.value.trim();

  if (searchText === "") {
    displayedIssues = [...allIssues];
    applyFilter();
    return;
  }

  searchIssuesFromAPI(searchText);
});

const fetchedIssues = () => {
  showLoader();

  fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then((res) => res.json())
    .then((data) => {
      allIssues = data.data || [];
      displayedIssues = [...allIssues];
      applyFilter();
      setActiveButton("all");
    })
    .catch((error) => {
      console.error("Error fetching issues:", error);
      issuesList.innerHTML = `
        <div class="w-full text-center py-10 text-red-500 font-medium">
          Failed to load issues.
        </div>
      `;
      issueCount.textContent = "0 Issues";
    })
    .finally(() => {
      hideLoader();
    });
};

const renderIssues = (issues) => {
  issuesList.innerHTML = "";
  issueCount.textContent = `${issues.length} Issues`;

  if (issues.length === 0) {
    issuesList.innerHTML = `
      <div class="w-full text-center py-10 text-slate-500">
        No issues found.
      </div>
    `;
    return;
  }

  issues.forEach((issue, index) => {
    const card = document.createElement("div");
    card.className =
      "w-[280px] rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden cursor-pointer transition duration-200 hover:shadow-xl hover:-translate-y-1";

    card.addEventListener("click", () => {
      openIssueModal(issue.id);
    });

    const statusColor =
      issue.status?.toLowerCase() === "open"
        ? "bg-[#00A96E]"
        : "bg-[#A855F7]";

    const priorityClass = getPriorityClass(issue.priority);

    const tagsHTML =
      issue.labels && issue.labels.length
        ? issue.labels
            .map((label) => {
              return `<span class="${getLabelClass(label)}">${label}</span>`;
            })
            .join("")
        : `
          <span class="badge badge-outline rounded-full border-slate-300 text-slate-600 bg-slate-50 px-3 py-3 text-xs">
            No Label
          </span>
        `;

    card.innerHTML = `
      <div class="h-1 ${statusColor} w-full"></div>

      <div class="p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="w-7 h-7 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
            <div class="w-4 h-4 rounded-full border-2 border-dashed border-emerald-400"></div>
          </div>

          <div class="badge border-0 ${priorityClass} font-medium px-5 py-4 text-xs uppercase">
            ${issue.priority || "Low"}
          </div>
        </div>

        <h2 class="text-[15px] font-semibold text-slate-800 leading-8 mb-2">
          ${issue.title || "Untitled Issue"}
        </h2>

        <p class="text-sm text-slate-500 leading-7 mb-4">
          ${issue.description ? issue.description.slice(0, 90) + "..." : "No description available."}
        </p>

        <div class="flex gap-2 flex-wrap mb-2">
          ${tagsHTML}
        </div>
      </div>

      <div class="border-t border-slate-200 px-5 py-4 text-slate-500 text-sm space-y-2">
        <p>#${issue.id || index + 1} by ${issue.author || issue.createdBy || "unknown_user"}</p>
        <p>${formatDate(issue.createdAt || issue.date)}</p>
      </div>
    `;

    issuesList.appendChild(card);
  });
};

const applyFilter = () => {
  let filtered = [...displayedIssues];

  if (currentFilter !== "all") {
    filtered = filtered.filter(
      (issue) => issue.status && issue.status.toLowerCase() === currentFilter
    );
  }

  renderIssues(filtered);
};

const filterIssues = (status) => {
  currentFilter = status;
  setActiveButton(status);
  applyFilter();
};

const setActiveButton = (status) => {
  const allBtn = document.getElementById("btn-all");
  const openBtn = document.getElementById("btn-open");
  const closedBtn = document.getElementById("btn-closed");

  [allBtn, openBtn, closedBtn].forEach((btn) => {
    btn.classList.remove("bg-blue-500", "text-white", "border-none");
    btn.classList.add("bg-white", "text-black");
  });

  const activeBtn = document.getElementById(`btn-${status}`);

  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "text-black");
    activeBtn.classList.add("bg-blue-500", "text-white", "border-none");
  }
};

const openIssueModal = (id) => {
  issueModal.classList.remove("hidden");
  issueModal.classList.add("flex");
  showModalLoader();

  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const issue = data.data;
      renderModal(issue);
    })
    .catch((error) => {
      console.error("Error fetching issue details:", error);
      modalContent.innerHTML = `
        <div class="text-center py-8 text-red-500 font-medium">
          Failed to load issue details.
        </div>
      `;
    })
    .finally(() => {
      hideModalLoader();
    });
};

const closeIssueModal = () => {
  issueModal.classList.add("hidden");
  issueModal.classList.remove("flex");
  modalContent.innerHTML = "";
};

const renderModal = (issue) => {
  if (!issue) {
    modalContent.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        Issue not found.
      </div>
    `;
    return;
  }

  const statusClass =
    issue.status?.toLowerCase() === "open"
      ? "badge-success text-white border-0"
      : "badge-secondary text-white border-0";

  const priorityClass =
    issue.priority?.toLowerCase() === "high"
      ? "bg-red-500 text-white"
      : issue.priority?.toLowerCase() === "medium"
      ? "bg-amber-400 text-white"
      : "bg-slate-300 text-slate-700";

  const labelsHTML =
    issue.labels && issue.labels.length
      ? issue.labels
          .map((label) => {
            return `<span class="${getModalLabelClass(label)}">${label}</span>`;
          })
          .join("")
      : `<span class="badge rounded-full bg-slate-100 text-slate-500 border-slate-200">No Label</span>`;

  modalContent.innerHTML = `
    <div>
      <h2 class="text-[32px] font-bold text-slate-800 leading-tight mb-3">
        ${issue.title || "Untitled Issue"}
      </h2>

      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-5">
        <span class="badge ${statusClass} capitalize">${issue.status || "Open"}</span>
        <span>• Opened by ${issue.author || issue.createdBy || "Unknown User"}</span>
        <span>• ${formatDate(issue.createdAt || issue.date)}</span>
      </div>

      <div class="flex flex-wrap gap-2 mb-5">
        ${labelsHTML}
      </div>

      <p class="text-slate-500 leading-7 mb-6">
        ${issue.description || "No description available."}
      </p>

      <div class="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-slate-400 mb-1">Assignee:</p>
          <p class="font-semibold text-slate-800">
            ${issue.assignee || issue.author || issue.createdBy || "Unassigned"}
          </p>
        </div>

        <div>
          <p class="text-sm text-slate-400 mb-1">Priority:</p>
          <span class="badge border-0 ${priorityClass} uppercase px-3 py-3">
            ${issue.priority || "Low"}
          </span>
        </div>
      </div>
    </div>
  `;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
};

issueModal.addEventListener("click", (e) => {
  if (e.target === issueModal) {
    closeIssueModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeIssueModal();
  }
});

fetchedIssues();