import { supabase } from "./supabase.js";

const tableBody = document.getElementById("historyTableBody");
const mobileContainer = document.getElementById("mobileHistory");
const searchInput = document.getElementById("searchInput");
const monthFilter = document.getElementById("monthFilter");

let allReports = [];

function setCurrentMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  monthFilter.value = `${year}-${month}`;
}


async function loadHistory() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return;

  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from("report_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return;

  allReports = data;
  renderHistory(allReports);
}

function renderHistory(data) {

  tableBody.innerHTML = "";
  mobileContainer.innerHTML = "";

  data.forEach(row => {

    const formattedDate = new Date(row.created_at)
      .toLocaleDateString("en-GB");

    /* ===== DESKTOP TABLE ===== */
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td>${row.patient.name}</td>
      <td>${row.tests.length}</td>
      <td>
        <button class="btn btn-sm btn-primary"
          onclick="previewReport('${row.id}')">
          View
        </button>
      </td>
    `;

    tableBody.appendChild(tr);

    /* ===== MOBILE CARD ===== */
    const card = document.createElement("div");
    card.className = "history-card";

    card.innerHTML = `
      <div class="history-header">Date</div>
      <div class="history-value mb-2">${formattedDate}</div>

      <div class="history-header">Patient</div>
      <div class="history-value mb-2">${row.patient.name}</div>

      <div class="history-header">Tests</div>
      <div class="history-value mb-3">${row.tests.length}</div>

      <button class="btn btn-primary btn-block"
        onclick="previewReport('${row.id}')">
        View Report
      </button>
    `;

    mobileContainer.appendChild(card);
  });
}

/* ===== SEARCH ===== */
searchInput.addEventListener("input", () => {
  applyFilters();
});

/* ===== MONTH FILTER ===== */
monthFilter.addEventListener("change", () => {
  applyFilters();
});

function applyFilters() {

  const searchValue = searchInput.value.toLowerCase();
  const monthValue = monthFilter.value;

  let filtered = allReports.filter(row => {

    const patientName = row.patient.name.toLowerCase();
    const created = new Date(row.created_at);

    const matchesSearch = patientName.includes(searchValue);

    let matchesMonth = true;

    if (monthValue) {
      const [year, month] = monthValue.split("-");
      matchesMonth =
        created.getFullYear() == year &&
        (created.getMonth() + 1) == month;
    }

    return matchesSearch && matchesMonth;
  });

  renderHistory(filtered);
}

/* ===== PREVIEW ===== */
window.previewReport = async (id) => {
  const { data } = await supabase
    .from("report_history")
    .select("*")
    .eq("id", id)
    .single();

 localStorage.setItem("patient", JSON.stringify(data.patient));
localStorage.setItem("report", JSON.stringify(data.report));
localStorage.setItem("tests", JSON.stringify(data.tests));

/* 🔥 IMPORTANT FLAG */
localStorage.setItem("fromHistory", "1");

window.location.href = "preview.html";

};

setCurrentMonth();
loadHistory();

