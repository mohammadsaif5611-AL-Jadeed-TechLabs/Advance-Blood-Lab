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
      <td>${String(row.lrn).padStart(2, "0")}</td>
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

      <div class="history-header">LRN</div>
      <div class="history-value mb-3">${String(row.lrn).padStart(2, "0")}</div>

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

  const searchValue = searchInput.value.trim().toLowerCase();
  const monthValue = monthFilter.value;

  const isNumberSearch = /^[0-9]+$/.test(searchValue);

  let filtered = allReports.filter(row => {

    const patientName = row.patient.name.toLowerCase();
    const lrnString = String(row.lrn);
    const created = new Date(row.created_at);

    /* ✅ SEARCH LOGIC */
    let matchesSearch = true;

    if (searchValue) {
      if (isNumberSearch) {
        // search by LRN
        matchesSearch = lrnString.includes(searchValue);
      } else {
        // search by patient name
        matchesSearch = patientName.includes(searchValue);
      }
    }

    /* ✅ MONTH FILTER */
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

  const { data, error } = await supabase
    .from("report_history")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Failed to load report");
    return;
  }

  /* ✅ Ensure patient object contains correct LRN */
  const patientData = {
    ...data.patient,
    lrn: data.lrn
  };

  localStorage.setItem("patient", JSON.stringify(patientData));
  localStorage.setItem("report", JSON.stringify(data.report));
  
  localStorage.setItem("tests", JSON.stringify(data.tests));

  /* ✅ store LRN separately if needed */
  localStorage.setItem("lrn", JSON.stringify(data.lrn));

  /* 🔥 IMPORTANT FLAG */
  localStorage.setItem("fromHistory", "1");

  window.location.href = "preview.html";
};

setCurrentMonth();
loadHistory();
