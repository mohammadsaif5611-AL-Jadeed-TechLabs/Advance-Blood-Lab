import Tests from "../tests/index.js";

const patient = JSON.parse(localStorage.getItem("patient"));
const report = JSON.parse(localStorage.getItem("report"));
const selectedTests = JSON.parse(localStorage.getItem("tests")) || [];

const pdf = document.getElementById("pdf");

let page, testsBox;


function formatDateDDMMYY(dateStr) {
  if (!dateStr) return "";

  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

/* ================= PAGE ================= */
let currentPage = null;
let currentTestsBox = null;

function newPage() {
  currentPage = document.createElement("div");
  currentPage.className = "page";

  const content = document.createElement("div");
  content.className = "page-content";

  // PATIENT
  const patientDiv = document.createElement("div");
  patientDiv.className = "patient";
  patientDiv.innerHTML = `
    <div class="patient-grid">
      <div>
        <div class="p-row"><span class="p-label">Patient</span><span class="p-colon">:</span><span class="p-value">${patient.name}</span></div>
        <div class="p-row"><span class="p-label">Reff. By</span><span class="p-colon">:</span><span class="p-value">${patient.doctor}</span></div>
        <div class="p-row"><span class="p-label">Sample</span><span class="p-colon">:</span><span class="p-value">${patient.sample}</span></div>
      </div>
      <div>
        <div class="p-row"><span class="p-label">Age/Sex</span><span class="p-colon">:</span><span class="p-value">${patient.age} / ${patient.gender}</span></div>
        <div class="p-row"><span class="p-label">Date</span><span class="p-colon">:</span><span class="p-value">${formatDateDDMMYY(patient.date)}</span></div>
        <div class="p-row"><span class="p-label">LRN</span><span class="p-colon">:</span><span class="p-value">${patient.lrn}</span></div>
      </div>
    </div>
  `;

  currentTestsBox = document.createElement("div");
  currentTestsBox.className = "tests";

  const footer = document.createElement("div");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer-line"></div>
    <div class="footer-text">
      P.NO : 1 *** ADVANCE BLOOD CLINICAL LABORATORY, WADNER BHOLJI ***
    </div>
    <div class="footer-thanks">"Thanks for Referral"</div>
  `;

  content.appendChild(patientDiv);
  content.appendChild(currentTestsBox);
  content.appendChild(footer);

  currentPage.appendChild(content);
  pdf.appendChild(currentPage);
}

/* ================= TEST RENDERER ================= */
function renderTest(testKey) {
  const test = Tests[testKey];
  let html = `<table><tbody>`;

  /* ================= CBC TYPE ================= */
  if (Array.isArray(test.fields?.[0])) {
    html += `
      <tr class="test-title">
        <th colspan="4">${test.title}</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
        <th>RESULT</th>
        <th>UNIT</th>
        <th>REFERENCE RANGE</th>
      </tr>
    `;

    const dlcList = [
      "NEUTROPHILS",
      "LYMPHOCYTES",
      "EOSINOPHILS",
      "MONOCYTES",
      "BASOPHILS"
    ];

    test.fields.forEach(f => {
      if (f[0] === "NEUTROPHILS") {
        html += `
          <tr class="dlc-heading">
            <td colspan="4">DIFF. LEUCOCYTE COUNT</td>
          </tr>
        `;
      }

      const isDLC = dlcList.includes(f[0]);

      let refHTML = f[2].includes("|")
        ? f[2].split("|").map(r => `<div>${r.trim()}</div>`).join("")
        : f[2];

      html += `
        <tr class="test-row ${isDLC ? "dlc-row" : ""}">
          <td class="${isDLC ? "dlc-name" : ""}">${f[0]}</td>
          <td class="td-result">${report[`${testKey}_${f[0]}`] || ""}</td>
          <td class="td-unit">${f[1]}</td>
          <td class="td-ref">${refHTML}</td>
        </tr>
      `;
    });
  }

  /* ================= BLOOD SUGAR / BIOCHEM ================= */
  else if (typeof test.fields?.[0] === "object") {
    html += `
      <tr class="test-title">
        <th colspan="4">${test.title}</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
        <th>RESULT</th>
        <th>UNIT</th>
        <th>REFERENCE RANGE</th>
        
      
    
    
        </tr>
        <th colspan="4" style="
    text-align: left;
">${test.subtitle}</th>
    `;

    test.fields.forEach(f => {
      const nameHTML = f.sub
        ? `${f.name}<br><br><span class="sub-name">${f.sub}</span>`
        : f.name;

      html += `
        <tr class="test-row sugar-row">
          <td>${nameHTML}</td>
          <td class="td-result">${report[`${testKey}_${f.name}`] || ""}</td>
          <td class="td-unit">${f.unit}</td>
          <td class="td-ref">${f.ref}</td>
        </tr>
      `;
    });
  }

 

  /* ===== URINE / PROFILE TYPE ===== */
if (test.sections) {
  html += `
    <tr class="test-title">
      <th colspan="2">${test.title}</th>
    </tr>
    <tr class="test-head">
      <th class="urine-investigation">INVESTIGATION</th>
      <th class="urine-result-head">RESULT</th>
    </tr>
  `;

  test.sections.forEach(section => {
    html += `
      <tr class="urine-section">
        <th colspan="2">${section.name}</th>
      </tr>
    `;

    section.fields.forEach(f => {
      html += `
        <tr class="urine-row">
          <td class="urine-investigation">
            ${f[0]}
          </td>
          <td class="urine-result">
            ${report[`${testKey}_${f[0]}`] || ""}
          </td>
        </tr>
      `;
    });
  });
}


  html += `</tbody></table>`;
  return html;
}

/* ================= ADD TESTS WITH PAGINATION ================= */
selectedTests.forEach(testKey => {
  if (!currentPage) newPage();

  const block = document.createElement("div");
  block.className = "test-block";
  block.innerHTML = renderTest(testKey);

  currentTestsBox.appendChild(block);

  if (currentPage.scrollHeight > currentPage.offsetHeight) {
    currentTestsBox.removeChild(block);
    newPage();
    currentTestsBox.appendChild(block);
  }
});



/* ================= PDF ================= */

window.download = () => {
  html2pdf()
    .from(pdf)
    .set({
      margin: 0,
      filename: `${patient.name}.pdf`,
      jsPDF: { unit: "mm", format: [213, 285] },
      //       html2canvas: {
//   scale: 1,
//   scrollY: 0,
//   windowHeight: document.body.scrollHeight
// },
      html2canvas: {
        scale: 1,
        scrollY: 0
      }

       // jsPDF: { unit: "mm", format: "a4" }
    })
    .save();
};

