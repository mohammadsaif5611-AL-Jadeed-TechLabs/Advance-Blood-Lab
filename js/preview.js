import * as Tests from "../tests/index.js";

const patient = JSON.parse(localStorage.getItem("patient"));
const report = JSON.parse(localStorage.getItem("report"));
const selectedTests = JSON.parse(localStorage.getItem("tests")) || [];

const pdf = document.getElementById("pdf");

let currentPage;
let content;

/* ================= PAGE CREATION ================= */
function createPage(isFirst = false) {
  currentPage = document.createElement("div");
  currentPage.className = "page";

  content = document.createElement("div");
  content.className = "page-content";

  if (isFirst) {
    content.style.paddingTop = "180px"; // only first page has top padding
    const patientDiv = document.createElement("div");
    patientDiv.className = "patient";
    patientDiv.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:12px;">
        <div>
          <b>Patient :</b> ${patient.name}<br>
          <b>Age/Sex :</b> ${patient.age} Yrs. / ${patient.gender}<br>
          <b>Sample :</b> ${patient.sample}<br>
          <b>LRN :</b> ${patient.lrn}
        </div>
        <div style="text-align:right;">
          <b>Reff. By :</b> ${patient.doctor}<br>
          <b>Date :</b> ${patient.date}<br>
        </div>
      </div>
      <hr>
    `;
    content.appendChild(patientDiv);
  }

  currentPage.appendChild(content);
  pdf.appendChild(currentPage);
}

/* ================= FIRST PAGE ================= */
createPage(true);

/* ================= TEST RENDERER ================= */
function renderTest(testKey) {
  const test = Tests[testKey];
  let html = `<table class="table table-bordered mb-4"><tbody>`;

  /* CBC TYPE */
  if (test.fields) {
    html += `
      <tr><th colspan="4" class="text-center">${test.title}</th></tr>
      <tr>
        <th>Investigation</th>
        <th>Result</th>
        <th>Unit</th>
        <th>Reference</th>
      </tr>
    `;
    test.fields.forEach(f => {
      html += `
        <tr>
          <td>${f[0]}</td>
          <td>${report[`${testKey}_${f[0]}`] || ""}</td>
          <td>${f[1]}</td>
          <td>${f[2]}</td>
        </tr>
      `;
    });
  }

  /* URINE TYPE */
  if (test.sections) {
    html += `<tr><th colspan="4" class="text-center">${test.title}</th></tr>`;
    test.sections.forEach(section => {
      html += `<tr><th colspan="4">${section.name}</th></tr>`;
      section.fields.forEach(f => {
        html += `
          <tr>
            <td colspan="2">${f[0]}</td>
            <td colspan="2">${report[`${testKey}_${f[0]}`] || ""}</td>
          </tr>
        `;
      });
    });
  }

  html += `</tbody></table>`;
  return html;
}

/* ================= HEIGHT CHECK (CORE LOGIC) ================= */
function fitsInPage(block) {
  const usedHeight = content.offsetHeight; // changed from scrollHeight
  const blockHeight = block.offsetHeight;
  const maxHeight = content.clientHeight;
  return (usedHeight + blockHeight) <= maxHeight;
}


/* ================= ADD TESTS SMARTLY ================= */
selectedTests.forEach(testKey => {
  const block = document.createElement("div");
  block.className = "test-block";
  block.innerHTML = renderTest(testKey);

  content.appendChild(block);

  if (!fitsInPage(block)) {
    content.removeChild(block);
    createPage(false); // new page with no patient padding
    content.appendChild(block);
  }
});


/* ================= PDF ================= */
window.download = function () {
  html2pdf()
    .from(pdf)
    .set({
      margin: 0,
      filename: "Pathology_Report.pdf",
      html2canvas: { scale: 2 },
      pagebreak: { mode: ["css"] }
    })
    .save();
};
