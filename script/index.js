let allIssues = [];
let displayedIssues = [];
let currentFilter = "all";

const issuesList = document.getElementById("issues-list");
const issueCount = document.getElementById("issue-count");
const searchInput = document.getElementById("search-input");


const searchIssuesFromAPI = (searchText) => {
  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`)
    .then((res) => res.json())
    .then((data) => {
      displayedIssues = data.data || [];
      applyFilter();
    })
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
        <p class="text-red-500 font-medium">Failed to load issues.</p>
      `;
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
      "w-[280px] rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden";

    const statusColor =
      issue.status?.toLowerCase() === "open"
        ? "bg-[#00A96E]"
        : "bg-[#A855F7]";

    const priorityClass =
      issue.priority?.toLowerCase() === "high"
        ? "bg-rose-100 text-rose-500"
        : issue.priority?.toLowerCase() === "medium"
        ? "bg-amber-100 text-amber-500"
        : "bg-slate-100 text-slate-500";

    const tagsHTML =
      issue.labels && issue.labels.length
        ? issue.labels
            .map(
              (label) => `
            <span class="badge badge-outline rounded-full border-slate-300 text-slate-600 bg-slate-50 px-3 py-3 text-xs">
              ${label}
            </span>
          `
            )
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

        <h2 class="text-[15px] font-semibold text-slate-800 leading-6 mb-2">
          ${issue.title || "Untitled Issue"}
        </h2>

        <p class="text-sm text-slate-500 leading-5 mb-4">
          ${issue.description ? issue.description.slice(0, 80) + "..." : "No description available."}
        </p>

        <div class="flex gap-2 flex-wrap">
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
    btn.classList.remove("bg-blue-500", "text-white");
    btn.classList.add("bg-white", "text-black");
  });

  const activeBtn = document.getElementById(`btn-${status}`);
  activeBtn.classList.remove("bg-white", "text-black");
  activeBtn.classList.add("bg-blue-500", "text-white");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US");
};

fetchedIssues();