const MM_TO_PX = 3.78; // 96dpi standard

let liverHeaderPrinted = false;


function mmToPx(mm) {
  return mm * MM_TO_PX;
}

function makeKey(testKey, name) {
  return `${testKey}_${name}`
    .replace(/\./g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}


import Tests from "../tests/index.js";

function checkFlag(result, refList, gender) {
  if (!result || !refList || refList.length === 0) {
    return { flag: "" };
  }

  const value = parseFloat(
    String(result).replace(/,/g, "")
  );
  if (isNaN(value)) return { flag: "" };

  const ref = refList[0];
  const match = ref.match(
    /(\d+[,.\d]*)\s*-\s*(\d+[,.\d]*)/
  );
  if (!match) return { flag: "" };

  const min = parseFloat(match[1].replace(/,/g, ""));
  const max = parseFloat(match[2].replace(/,/g, ""));

  if (value < min) return { flag: "L" };
  if (value > max) return { flag: "H" };

  return { flag: "" };
}



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
function isTestOverflow() {
  const content = currentPage.querySelector(".page-content");

  const testsBottom =
    currentTestsBox.offsetTop + currentTestsBox.offsetHeight;

  // REAL SAFE ZONE = bottom image (38mm) + footer text (~22mm)
  const SAFE_MM = 60;

  const maxAllowed =
    content.offsetHeight - mmToPx(SAFE_MM);

  return testsBottom > maxAllowed;
}

function getSelectClass(value, options = []) {
  if (!value) return "";

  // ✅ FIRST OPTION = NORMAL
  if (options.length && value === options[0]) {
    return "normal-value";
  }

  // ❌ everything else abnormal
  return "abnormal-value";
}



/* ================= PAGE ================= */
let currentPage = null;
let currentTestsBox = null;

function newPage() {
 currentPage = document.createElement("div");
currentPage.className = "page";
currentPage.setAttribute("data-page", "true"); // 🔥 page marker


  const content = document.createElement("div");
content.className = "page-content";
content.id = "page-content";


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

  /* ===== TESTS HOLDER ===== */
  currentTestsBox = document.createElement("div");
  currentTestsBox.className = "tests";

  /* ===== FOOTER ===== */
  const footer = document.createElement("div");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer-line"></div>
    <div class="footer-text">
      P.NO - 1 ***ADVANCE BLOOD CLINICAL LABORATORY, WADNER BHOLJI ***
    </div>
    <div class="footer-thanks">"Thanks for Referral"</div>
  `;

  /* ===== FOOTER SAFE SPACE ===== */
  const footerSafe = document.createElement("div");
  footerSafe.className = "footer-safe"; // height = 40mm via CSS

  content.appendChild(patientDiv);
  content.appendChild(currentTestsBox);
  content.appendChild(footer);
  content.appendChild(footerSafe);

  currentPage.appendChild(content);
  pdf.appendChild(currentPage);
  liverHeaderPrinted = false;

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

    const dlcList = ["NEUTROPHILS","LYMPHOCYTES","EOSINOPHILS","MONOCYTES","BASOPHILS"];

    test.fields.forEach(f => {
      if (f[0] === "NEUTROPHILS") {
        html += `<tr class="dlc-heading"><td colspan="4">DIFF. LEUCOCYTE COUNT</td></tr>`;
      }

      const fieldKey = `${testKey}_${f[0].replace(/\s+/g, "_")}`;
      const result = report[fieldKey] || "";

     let flagHTML = "";
let rowClass = "";

if (result && f[2]) {
  const refList = f[2].split("|").map(r => r.trim());
  const { flag } = checkFlag(result, refList, patient.gender);
  if (flag) {
    flagHTML = ` <span class="flag shift-flag">${flag}</span>`;
    rowClass = "abnormal-value";
  }
}


      html += `
        <tr class="test-row ${dlcList.includes(f[0]) ? "dlc-row" : ""}">
          <td>${f[0]}</td>
         <td class="td-result ${rowClass}">
  <span class="result-value">${result}</span>
  ${flagHTML}
</td>


          <td class="td-unit">${f[1]}</td>
          <td class="td-ref">
  ${f[2].split("|").map(r => `<div>${r.trim()}</div>`).join("")}
</td>

        </tr>
      `;
    });
  }

/* ================= BIOCHEMISTRY / SUGAR ================= */
else if (
  test.title === "BIOCHEMISTRY REPORT" &&
  test.subtitle &&
  !test.class   // ❌ LFT ko exclude
) {

  html += `
    <tr class="test-title"><th colspan="4">${test.title}</th></tr>
    <tr class="test-head">
      <th>INVESTIGATION</th><th>RESULT</th><th>UNIT</th><th>REFERENCE RANGE</th>
    </tr>
    <tr class="bio-subtitle">
      <th colspan="4">${test.subtitle}</th>
    </tr>
  `;

  test.fields.forEach(f => {
    const fieldKey = makeKey(testKey, f.name);
    const result = report[fieldKey] || "";
    const isUrine = f.name.toUpperCase().includes("URINE");

    let flagHTML = "";
    let rowClass = "";

    // ✅ URINE SUGAR LOGIC
    if (isUrine) {
      if (result === "Absent") rowClass = "normal-value";
      else if (result) rowClass = "abnormal-value";
    }
    // ✅ NORMAL BIOCHEM FLAG
    else if (result && f.ref) {
      const { flag } = checkFlag(result, [f.ref], patient.gender);
      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    html += `
      <tr class="test-row">
        <td>${f.name}</td>
        <td class="td-result ${rowClass}">
          <span class="result-value">${result}</span>
          ${flagHTML}
        </td>
        <td class="td-unit">${f.unit}</td>
        <td class="td-ref">${f.ref}</td>
      </tr>
    `;
  });
}
/* ================= LIVER FUNCTION TEST ================= */
else if (test.class === "LIVER FUNCTION TEST") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.name);
    return report[k];
  });

  if (!hasValue) return "";

  if (!liverHeaderPrinted) {
    html += `
      <tr class="test-title">
        <th colspan="4">BIOCHEMISTRY REPORT</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
        <th>RESULT</th>
        <th>UNIT</th>
        <th>REFERENCE RANGE</th>
      </tr>
      <tr class="bio-subtitle">
        <th colspan="4">LIVER FUNCTION TEST</th>
      </tr>
    `;
    liverHeaderPrinted = true;
  }

  test.fields.forEach(f => {
    const key = makeKey(testKey, f.name);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    if (f.ref) {
      const { flag } = checkFlag(result, [f.ref], patient.gender);
      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    html += `
      <tr class="test-row">
        <td>${f.name}</td>
        <td class="td-result ${rowClass}">
          <span class="result-value">${result}</span>
          ${flagHTML}
        </td>
        <td class="td-unit">${f.unit}</td>
        <td class="td-ref">${f.ref}</td>
      </tr>
    `;
  });
}


  /* ================= URINE PROFILE ================= */
  if (test.sections) {
html += `<table class="urine-table">
      <tr class="test-title"><th colspan="2">${test.title}</th></tr>
      <tr class="test-head"><th>INVESTIGATION</th><th>RESULT</th></tr>
    `;

    test.sections.forEach(section => {
      html += `<tr><th colspan="2">${section.name}</th></tr>`;

      section.fields.forEach(f => {
        const fieldKey = `${testKey}_${f[0].replace(/\s+/g,"_").toUpperCase()}`;
        const value = report[fieldKey] || "";
const options = f[1]?.options || [];

let cls = "";

const alwaysNormalFields = ["QUANTITY", "NATURE", "REACTION"];

if (alwaysNormalFields.includes(f[0].toUpperCase())) {
  cls = "normal-value";
} else {
  cls = getSelectClass(value, options);
}





       html += `
  <tr>
    <td>${f[0]}</td>
    <td class="${cls}">${value}</td>
  </tr>
`;

      });
    });
  }

  html += `</tbody></table>`;
  return html;
}

/* ================= PAGINATION ================= */

selectedTests.forEach(testKey => {
  if (!currentPage) newPage();

  const block = document.createElement("div");
  block.className = "test-block";
  block.innerHTML = renderTest(testKey);

  currentTestsBox.appendChild(block);

  if (isTestOverflow()) {
    currentTestsBox.removeChild(block);
    newPage();
    currentTestsBox.appendChild(block);
  }
});


/* ===== REMOVE EMPTY PAGES ===== */
document.querySelectorAll(".page").forEach(p => {
  const tests = p.querySelector(".tests");
  if (!tests || tests.children.length === 0) p.remove();
});


function downloadColoredPDF() {
  pdf.classList.remove("plain-mode");

  html2pdf()
    .from(pdf)
    .set({
      margin: 0,
      filename: `${patient.name}_COLORED.pdf`,
      // jsPDF: { unit: "mm", format: [243, 320], orientation: "portrait" },
      jsPDF: {
  unit: "mm",
  format: "a4",
  orientation: "portrait"
},

      // html2canvas: {
      //   scale: 2,
      //   useCORS: true,
      //   backgroundColor: "#ffffff",
      //   scrollY: 0
      // },
//       html2canvas: {
//   scale: 3,
//   useCORS: true,
//   backgroundColor: "#ffffff",
//   scrollY: 0,
//   imageTimeout: 15000
// },
html2canvas: {
  scale: 4,
  useCORS: true,
  backgroundColor: "#ffffff",
  scrollY: 0,
  imageTimeout: 20000,
  letterRendering: true
}


    })
    .save();
}

function downloadPlainPDF() {
  pdf.classList.add("plain-mode");

  html2pdf()
    .from(pdf)
    .set({
      margin: 0,
      filename: `${patient.name}_PLAIN.pdf`,
      // jsPDF: { unit: "mm", format: [243, 320], orientation: "portrait" },
          jsPDF: {
  unit: "mm",
  format: "a4",
  orientation: "portrait"
},
      // html2canvas: {
      //   scale: 2,
      //   useCORS: true,
      //   backgroundColor: "#ffffff",
      //   scrollY: 0
      // },
//       html2canvas: {
//   scale: 3,
//   useCORS: true,
//   backgroundColor: "#ffffff",
//   scrollY: 0,
//   imageTimeout: 15000
// },
html2canvas: {
  scale: 4,
  useCORS: true,
  backgroundColor: "#ffffff",
  scrollY: 0,
  imageTimeout: 20000,
  letterRendering: true
}

    })
    .save()
    .then(() => {
      pdf.classList.remove("plain-mode"); // reset back
    });
}


/* ================= PDF ================= */

window.download = async () => {
  downloadColoredPDF();

  // small delay so DOM state switches cleanly
  setTimeout(() => {
    downloadPlainPDF();
  }, 600);
};


document.getElementById("downloadBtn")
  ?.addEventListener("click", download);

