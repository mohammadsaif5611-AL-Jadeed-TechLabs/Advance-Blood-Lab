const MM_TO_PX = 3.78; // 96dpi standard

const serologyGroup = [];


window.liverHeaderPrinted = false;
window.serologyHeaderPrinted = false;
window.kidneyHeaderPrinted = false;
window.crpHeaderPrinted = false;
window.esrHeaderPrinted = false;



function isPositiveSerology(value) {
  if (!value) return false;

  value = String(value).toUpperCase().trim();

  // Direct positives
  if (value === "POSITIVE") return true;

  // WIDAL significance
  if (
    value.includes("AGGLUTINATION") &&
    (
      value.includes("1:120") ||
      value.includes("1:160")
    )
  ) {
    return true;
  }

  return false;
}







const selectedSerology =
  JSON.parse(localStorage.getItem("selectedSerology")) || {};



function mmToPx(mm) {
  return mm * MM_TO_PX;
}

function makeKey(testKey, name) {
  return `${testKey}_${name}`
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase();
}




function renderSerologyGroup() {
  if (!serologyGroup.length) return;

  serologyGroup.forEach(testKey => {
    const test = Tests[testKey];
    const selectedIndexes = selectedSerology[testKey] || [];
    if (!selectedIndexes.length) return;

    selectedIndexes.forEach(index => {

      const section = test.sections[index];
      if (!section) return;

      // 🔎 check any value
  const hasValue =
  section.fields.some(([name]) =>
    report[makeKey(testKey, name)]
  ) ||
  (
    section.name.toUpperCase().includes("WIDAL") &&
    section.fixedFields?.length
  );


if (!hasValue) return;

      if (!hasValue) return;

      if (!currentPage) newPage();

      // 🔹 section block (atomic)

      
      const block = document.createElement("div");
      block.className = "test-block serology-block";
      block.style.pageBreakInside = "avoid";

      let html = `
        <table>
          <tr class="test-title">
            <th colspan="2">${test.title}</th>
          </tr>
          <tr class="test-head">
            <th>INVESTIGATION</th>
            <th style="width:40%;">RESULT</th>
          </tr>
         
      `;

      // 🔹 SECTION NAME (WIDAL / NORMAL)
if (section.name) {
  if (section.name.toUpperCase().includes("WIDAL")) {
    html += `
      <tr class="bio-subtitle">
        <th colspan="2" style="text-align:left;">
          ${section.name}
        </th>
      </tr>
    `;
  } else {
    html += `
      <tr class="bio-subtitle">
      </tr>
    `;
  }
}

//  <tr class="bio-subtitle">
//             <th colspan="2">${section.name}</th>
//           </tr>


/* ===================== 🔥 DENGUE SPECIAL ===================== */
if (section.name.toUpperCase().includes("DENGUE")) {

  // ---- NS1 FIELD ----
  const ns1Field = section.fields?.find(([name]) =>
    name.toUpperCase().includes("NS1")
  );
  const ns1Value = ns1Field
    ? report[makeKey(testKey, ns1Field[0])]
    : null;

  // ---- IgG / IgM VALUES ----
  const iggIgmValues = (section.fields2 || [])
    .map(([name]) => ({
      name,
      value: report[makeKey(testKey, name)],
      isAbnormal: isPositiveSerology(
        report[makeKey(testKey, name)]
      )
    }))
    .filter(f => f.value);

  // ❌ skip section only if NOTHING entered
  if (!ns1Value && iggIgmValues.length === 0) return;

  /* ===== 1️⃣ NS1 RESULT ROW ===== */
  if (ns1Value) {
    html += `
      <tr class="test-row">
        <td class="mono-space">${ns1Field[0]}</td>
        <td class="td-result">
          <span class="result-value">${ns1Value}</span>
        </td>
      </tr>
    `;
  }

  /* ===== 2️⃣ NS1 SUB LINES ===== */
  section.sub?.forEach(s => {
    html += `
      <tr class="bio-sub-row">
        <td colspan="2">${s}</td>
      </tr>
    `;
  });

  /* ===== 3️⃣ NS1 PARA (NOTE) ===== */
  section.para?.forEach(p => {
    p.split(/\n|<br\s*\/?>/i).forEach(line => {
      if (!line.trim()) return;
      html += `
        <tr class="bio-para-row">
          <td colspan="2">${line.trim()}</td>
        </tr>
      `;
    });
  });

  /* ===== 4️⃣ IgG / IgM SUBTITLE ===== */
  if (iggIgmValues.length) {
    section.sub2?.forEach(s => {
      html += `
        <tr class="bio-subtitle">
          <th colspan="2">${s}</th>
        </tr>
      `;
    });
  }

  /* ===== 5️⃣ IgG / IgM RESULT ROWS ===== */
  iggIgmValues.forEach(f => {
    const style = f.isAbnormal
      ? "font-weight:bold"
      : "";
    html += `
      <tr class="test-row">
        <td class="mono-space">${f.name}</td>
        <td class="td-result">
          <span class="result-value" style="${style}">
            ${f.value}
          </span>
        </td>
      </tr>
    `;
  });

  /* ===== 6️⃣ IgG / IgM PARA ===== */
  section.para2?.forEach(p => {
    p.split(/\n|<br\s*\/?>/i).forEach(line => {
      if (!line.trim()) return;
      html += `
        <tr class="bio-para-row">
          <td colspan="2">${line.trim()}</td>
        </tr>
      `;
    });
  });
}


     /* ===================== NORMAL SEROLOGY ===================== */
/* ===================== NORMAL SEROLOGY ===================== */
else {
section.fields.forEach(field => {

  const name = field.name || field[0];
  const key  = makeKey(testKey, name);
  const value = report[key];
  if (!value) return;

  const isAbnormal = isPositiveSerology(value);
  const cls = isAbnormal ? "serology-positive" : "";

  // 🧪 MAIN RESULT ROW
  html += `
    <tr class="test-row">
      <td class="mono-space">${name}</td>
      <td class="td-result">
        <span class="result-value ${cls}">
          ${value}
        </span>
      </td>
    </tr>
  `;

 // 🧾 FIELD-LEVEL AFTER TEXT (HBsAg / HCV METHOD)
const config = field[1] || {};

config.after?.forEach(line => {
  html += `
    <tr class="bio-sub-row">
      <td colspan="2">${line}</td>
    </tr>
  `;
});


});

/* ================= FIXED FIELDS (e.g., WIDAL) ================= */
section.fixedFields?.forEach(([name, fixedValue]) => {
  if (!fixedValue) return;

  const isAbnormal = isPositiveSerology(fixedValue);
  const cls = isAbnormal ? "serology-positive" : "";

  html += `
    <tr class="test-row">
      <td class="mono-space">${name}</td>
      <td class="td-result">
        <span class="result-value ${cls}">
          ${fixedValue}
        </span>
      </td>
    </tr>
  `;
});
/* ===================== USER-ENTERED WIDAL RESULTS ===================== */
(section.result || []).forEach(r => {
  if (!r) return;

  const name = r.name || "Result";
  const key  = makeKey(testKey, name);
  const value = report[key];
  if (!value) return; // agar empty hai to skip

  const isAbnormal = isPositiveSerology(value);
  const cls = isAbnormal ? "serology-positive" : "";

  html += `
    <tr class="test-row">
      <td class="mono-space">${name}</td>
      <td class="td-result">
        <span class="result-value ${cls}">${value}</span>
      </td>
    </tr>
  `;
});

  

  section.sub?.forEach(s => {
    html += `
      <tr class="bio-sub-row">
        <td colspan="2">${s}</td>
      </tr>
    `;
  });

  section.para?.forEach(p => {
    p.split(/\n|<br\s*\/?>/i).forEach(line => {
      if (!line.trim()) return;
      html += `
        <tr class="bio-para-row">
          <td colspan="2">${line.trim()}</td>
        </tr>
      `;
    });
  });

  section.para2?.forEach(p => {
    p.split(/\n|<br\s*\/?>/i).forEach(line => {
      if (!line.trim()) return;
      html += `
        <tr class="bio-para-row">
          <td colspan="2">${line.trim()}</td>
        </tr>
      `;
    });
  });
}



      html += `</table>`;
      block.innerHTML = html;

      currentTestsBox.appendChild(block);

      // 🔥 overflow → move whole section
      if (isTestOverflow()) {
        currentTestsBox.removeChild(block);
        newPage();
        window.serologyHeaderPrinted = false;
        currentTestsBox.appendChild(block);
      }
    });
  });
}



import Tests from "../tests/index.js";

function checkFlag(result, refList, gender) {
  if (!result || !refList || refList.length === 0) {
    return { flag: "" };
  }

  const value = parseFloat(String(result).replace(/,/g, ""));
  if (isNaN(value)) return { flag: "" };

  const ref = refList[0];

  /* ================= RANGE: 0 - 30 ================= */
  let match = ref.match(/(\d+[\d.]*)\s*-\s*(\d+[\d.]*)/);
  if (match) {
    const min = parseFloat(match[1]);
    const max = parseFloat(match[2]);

    if (value < min) return { flag: "L" };
    if (value > max) return { flag: "H" };
    return { flag: "" };
  }

  /* ================= RANGE: Upto 30 ================= */
  match = ref.match(/upto\s*([\d.]+)/i);
  if (match) {
    const max = parseFloat(match[1]);
    if (value > max) return { flag: "H" };
    return { flag: "" };
  }

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
window.serologyHeaderPrinted = false;
window.kidneyHeaderPrinted = false;
window.crpHeaderPrinted = false;


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

     const fieldKey = makeKey(testKey, f[0]);

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
else if (test.title === "BIOCHEMISTRY REPORT" && test.subtitle && !test.class) {

  // 🔎 at least one value entered
  const hasAnyValue = test.fields.some(f => {
    const k = makeKey(testKey, f.name);
    return report[k] && report[k] !== "";
  });
  if (!hasAnyValue) return "";

  html += `
    <tr class="test-title"><th colspan="4">${test.subtitle}</th></tr>
    <tr class="test-head">
      <th>INVESTIGATION</th>
      <th>RESULT</th>
      <th>UNIT</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;

  test.fields.forEach(f => {
    const fieldKey = makeKey(testKey, f.name);
    const result = report[fieldKey];

    // 🔹 skip if empty AND no sub
    if (!result && !f.sub) return;

    // ✅ Sub-label first (AFTER 1 & 1/2 HOURS)
    if (f.sub) {
      html += `
        <tr class="sub-row">
          <td colspan="4" class="sub-label">${f.sub}</td>
        </tr>
      `;
    }

    // 🔹 skip field if no value
    if (!result) return;

    const isUrine = f.name.toUpperCase().includes("URINE");

    let rowClass = "";
    let flagHTML = "";

   let resultClass = "";

if (isUrine) {
  const val = String(result).trim().toUpperCase();
  resultClass = val === "ABSENT" ? "normal-value" : "abnormal-value";
} 
else if (f.ref) {
  const { flag } = checkFlag(result, [f.ref], patient.gender);
  if (flag) {
    resultClass = "abnormal-value";
    flagHTML = `<span class="flag shift-flag">${flag}</span>`;
  }
}


    // ✅ Main field row
   html += `
  <tr class="test-row">
    <td>${f.name}</td>
    <td class="td-result">
      <span class="result-value ${resultClass}">${result}</span>
      ${flagHTML}
    </td>
    <td class="td-unit">${f.unit || ""}</td>
    <td class="td-ref">${f.ref || "Nil"}</td>
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
/* ================= KIDNEY FUNCTION TEST ================= */
else if (test.class === "KIDNEY FUNCTION TEST") {

  const hasValue = test.fields.some(f => {
    if (f.sub) return false;
    const k = makeKey(testKey, f.name);
    return report[k];
  });

  if (!hasValue) return "";

  // ✅ Independent header flag for KFT
  if (!window.kidneyHeaderPrinted) {
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
        <th colspan="4">KIDNEY FUNCTION TEST</th>
      </tr>
    `;
    window.kidneyHeaderPrinted = true;
  }

  test.fields.forEach(f => {

   if (f.sub) {
  html += `
    <tr class="bio-sub-row">
      <td colspan="4" class="bio-sub-left" style="font-weight:600;">
        ${f.sub}
      </td>
    </tr>
  `;
  return;
}


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
/* ================= HEMATOLOGY : ESR ================= */
else if (test.class === "HEMATOLOGYESR") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key || f.name);
    return report[k];
  });

  if (!hasValue) return "";

  if (!window.esrHeaderPrinted) {
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
    window.esrHeaderPrinted = true;
  }

  test.fields.forEach(f => {

    const key = makeKey(testKey, f.key || f.name);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    if (f.ref) {
     const gender =
  String(patient.gender).toUpperCase().startsWith("M")
    ? "M"
    : "F";

const genderRef = gender === "M" ? f.ref.M : f.ref.F;


      const { flag } = checkFlag(result, [genderRef], patient.gender);
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
        <td>${f.unit}</td>
        <td>M: ${f.ref.M} | F: ${f.ref.F}</td>
      </tr>
    `;
  });
}


/* ================= SEROLOGY : CRP & RA TEST ================= */
else if (test.class === "CRP SEROLOGY TEST") {

  // 🔎 Check if any value entered
  const hasValue = test.fields.some(f => {
    if (!f.name) return false;
    const k = makeKey(testKey, f.name);
    return report.hasOwnProperty(k) && report[k] !== "";
  });

  if (!hasValue) return "";

  // ✅ Header (ONLY ONCE)
  if (!window.crpHeaderPrinted) {
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
    window.crpHeaderPrinted = true;
  }

  /* ================= CRP SECTION ================= */

  const crpField = test.fields.find(
    f =>
      f.name &&
      (
        f.name.toUpperCase().includes("C REACTIVE") ||
        f.name.toUpperCase().includes("CRP")
      )
  );

  const crpKey = crpField && makeKey(testKey, crpField.name);
  const crpValue =
    crpKey && report.hasOwnProperty(crpKey)
      ? report[crpKey]
      : "";

  // ✅ IMPORTANT: value empty ho to skip row
  if (crpKey && crpValue !== "") {

    let flagHTML = "";
    let rowClass = "";

    if (crpField.ref) {
      const { flag } = checkFlag(crpValue, [crpField.ref], patient.gender);
      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    html += `
      <tr class="test-row">
        <td>${crpField.name}</td>
        <td class="td-result ${rowClass}">
          <span class="result-value">${crpValue}</span>
          ${flagHTML}
        </td>
        <td>${crpField.unit}</td>
        <td>${crpField.ref} ${crpField.unit}</td>
      </tr>
    `;

    // 🔹 CRP sub / para
    test.fields.forEach(f => {
      if (f.sub && !f.name && !f.sub.includes("RA")) {
        html += `
          <tr class="bio-sub-row">
            <td colspan="4">${f.sub}</td>
          </tr>
        `;
      }
      if (f.para) {
        html += `
          <tr class="bio-para-row">
            <td colspan="4">${f.para}</td>
          </tr>
        `;
      }
    });
  }

  /* ================= RA SECTION ================= */

  const raField = test.fields.find(
    f => f.name && f.name.toUpperCase().includes("RHEUMATOID")
  );

  const raKey = raField && makeKey(testKey, raField.name);
  const raValue =
    raKey && report.hasOwnProperty(raKey)
      ? report[raKey]
      : "";

  // ✅ SAME FIX FOR RA
  if (raKey && raValue !== "") {

    html += `
      <tr class="bio-subtitle">
        <th colspan="4">RHEUMATOID FACTOR (RA)</th>
      </tr>
    `;

    let flagHTML = "";
    let rowClass = "";

    if (raField.ref) {
      const { flag } = checkFlag(raValue, [raField.ref], patient.gender);
      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    html += `
      <tr class="test-row">
        <td>${raField.name}</td>
        <td class="td-result ${rowClass}">
          <span class="result-value">${raValue}</span>
          ${flagHTML}
        </td>
        <td>${raField.unit}</td>
        <td>${raField.ref} ${raField.unit}</td>
      </tr>
    `;

    // 🔹 RA method
    test.fields.forEach(f => {
      if (f.sub && f.sub.includes("Immunoturbidometry")) {
        html += `
          <tr class="bio-sub-row">
            <td colspan="4">${f.sub}</td>
          </tr>
        `;
      }
    });
  }
}

/* ================= SEROLOGY : ALL TEST (PREVIEW) ================= */
else if (test.class === "SEROLOGY TEST") {

  let hasAnyData = false;
  let htmlParts = [];

  const selectedIndexes = selectedSerology[testKey] || [];

  selectedIndexes.forEach(index => {

    const section = test.sections[index];
    if (!section) return;

    // 🔎 check any value entered
   const hasValue =
  section.fields.some(([name]) =>
    report[makeKey(testKey, name)]
  ) ||
  section.fixedFields?.some(([_, v]) => v);


    if (!hasValue) return;

    // 🔹 table header (once)
    if (!hasAnyData) {
      htmlParts.push(`
        <table>
          <tr class="test-title">
            <th colspan="2">${test.title}</th>
          </tr>
          <tr class="test-head">
            <th>INVESTIGATION</th>
            <th>RESULT</th>
          </tr>
      `);
      hasAnyData = true;
    }
// 🔹 WIDAL special heading
if (section.name.toUpperCase().includes("WIDAL")) {
  htmlParts.push(`
    <tr class="bio-subtitle">
      <th colspan="2" style="text-align:left;">
        ${section.name}
      </th>
    </tr>
  `);
} else {
  htmlParts.push(`
    <tr class="bio-subtitle">
      <th colspan="2">${section.name}</th>
    </tr>
  `);
}

  

  /* ================= FIELDS ================= */
section.fields.forEach(([name]) => {
  const key = makeKey(testKey, name);
  const value = report[key];
  if (!value) return;

  const isAbnormal = isPositiveSerology(value);
  const cls = isAbnormal ? "serology-positive" : "";

  htmlParts.push(`
    <tr class="test-row">
      <td class="mono-space">${name}</td>
      <td class="td-result">
        <span class="result-value ${cls}">
          ${value}
        </span>
      </td>
    </tr>
  `);
});

/* ================= FIXED FIELDS ================= */
section.fixedFields?.forEach(([name, fixedValue]) => {
  // ✅ Highlight if positive
  const isAbnormal = isPositiveSerology(fixedValue);
  const cls = isAbnormal ? "serology-positive" : "";

  htmlParts.push(`
    <tr class="test-row">
      <td class="mono-space">${name}</td>
      <td class="td-result">
        <span class="result-value ${cls}">
          ${fixedValue}
        </span>
      </td>
    </tr>
  `);
});


    /* ================= SUB / PARA ================= */
    section.sub?.forEach(s => {
      htmlParts.push(`
        <tr class="bio-sub-row">
          <td colspan="2">${s}</td>
        </tr>
      `);
    });

    section.para?.forEach(p => {
      p.split(/\n|<br\s*\/?>/i).forEach(line => {
        if (!line.trim()) return;
        htmlParts.push(`
          <tr class="bio-para-row">
            <td colspan="2">${line.trim()}</td>
          </tr>
        `);
      });
    });

  });

  if (!hasAnyData) return "";

  htmlParts.push(`</table>`);
  html += htmlParts.join("");
}





/* ================= URINE PROFILE ================= */
else if (test.title?.toUpperCase().includes("URINE")) {


  // 🔎 check if ANY urine value exists
  const hasAnyValue = test.sections.some(section =>
    section.fields.some(f => {
      const key = makeKey(testKey, f[0]);
      return report[key];
    })
  );

  if (!hasAnyValue) return ""; // ❌ completely skip if nothing entered

  html += `<table class="urine-table">
    <tr class="test-title">
      <th colspan="2">${test.title}</th>
    </tr>
    <tr class="test-head">
      <th>INVESTIGATION</th>
      <th>RESULT</th>
    </tr>
  `;

  test.sections.forEach(section => {

    html += `
      <tr class="bio-subtitle">
        <th colspan="2">${section.name}</th>
      </tr>
    `;
section.fields.forEach(f => {
  const fieldName = f[0];
  const config = f[1] || {};
  const fieldKey = makeKey(testKey, fieldName);
  const value = report[fieldKey];

  if (!value) return;

  let cls = "";

  // 🟢 TEXT → always normal
  if (config.type === "text") {
    cls = "normal-value";
  }

  // 🟢 SELECT → first option normal, rest abnormal
  else if (
    config.type === "select" &&
    Array.isArray(config.options) &&
    config.options.length
  ) {
    cls =
      value === config.options[0]
        ? "normal-value"
        : "abnormal-value";
  }

  html += `
    <tr class="test-row">
      <td>${fieldName}</td>
      <td class="td-result">
        <span class="result-value ${cls}">${value}</span>
      </td>
    </tr>
  `;
});


  });

  html += `</table>`;
}

/* ================= HEMATOLOGY : PS FOR MP ================= */
else if (
  test.class === "HEMATOLOGY" &&
  (
    test.testname === "PS FOR MP"
  )
) {

  let hasValue = false;
  let htmlParts = [];

  test.sections.forEach(section => {
    section.fields.forEach(([name, config]) => {
      const key = makeKey(testKey, name);
      if (report[key]) hasValue = true;
    });
  });

  if (!hasValue) return "";

  htmlParts.push(`
    <table>
      <tr class="test-title">
        <th colspan="2">${test.title}</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
       <th style="
    width: 40%;
">RESULT</th>
      </tr>
  `);

  test.sections.forEach(section => {

    // htmlParts.push(`
    //   <tr class="bio-subtitle">
    //     <th colspan="2">${section.name}</th>
    //   </tr>
    // `);

    section.fields.forEach(([name, config]) => {
      const key = makeKey(testKey, name);
      const value = report[key];
      if (!value) return;

      // ✅ NORMAL / ABNORMAL LOGIC
      const isNormal = value === config.options[0];
      const cls = isNormal ? "normal-value" : "bldgr";

      htmlParts.push(`
        <tr class="test-row">
          <td class="mono-space">${name}</td>
          <td class="td-result">
            <span class="result-value ${cls}">
              ${value}
            </span>
          </td>
        </tr>
      `);
    });
  });

  htmlParts.push(`</table>`);
  html += htmlParts.join("");
}
else if (
  test.class === "HEMATOLOGY" &&
  test.testname === "BLOOD GROUP"
) {

  let hasValue = false;
  let htmlParts = [];

  test.sections.forEach(section => {
    section.fields.forEach(([name]) => {
      const key = makeKey(testKey, name);
      if (report[key]) hasValue = true;
    });
  });

  if (!hasValue) return "";

  htmlParts.push(`
    <table>
      <tr class="test-title">
        <th colspan="2">${test.title}</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
        <th style="width:40%">RESULT</th>
      </tr>
  `);

  test.sections.forEach(section => {
    section.fields.forEach(([name]) => {

      const key = makeKey(testKey, name);
      let value = report[key];
      if (!value) return;

      // ✅ OTHER support
      if (value === "OTHER") {
        const otherVal = report[key + "_other"];
        if (otherVal) value = otherVal;
      }

      htmlParts.push(`
        <tr class="test-row">
          <td class="mono-space">${name}</td>
          <td class="td-result">
            <span style="
              color: #000;
              font-weight: bold;
              letter-spacing: 0.5px;
            ">
              ${value}
            </span>
          </td>
        </tr>
      `);
    });
  });

  htmlParts.push(`</table>`);
  html += htmlParts.join("");
}




  html += `</tbody></table>`;
  return html;
}

/* ================= PAGINATION ================= */

selectedTests.forEach(testKey => {

  const test = Tests[testKey];

  if (test.class === "SEROLOGY TEST") {
    serologyGroup.push(testKey);
    return;
  }

  if (!currentPage) newPage();

  const block = document.createElement("div");
  block.className = "test-block serology-block category-block";

  const html = renderTest(testKey);
  if (!html) return;

  block.innerHTML = html;
  currentTestsBox.appendChild(block);

  if (isTestOverflow()) {
    currentTestsBox.removeChild(block);
    newPage();
    currentTestsBox.appendChild(block);

    window.liverHeaderPrinted = false;
    window.serologyHeaderPrinted = false;
    window.kidneyHeaderPrinted = false;
    window.crpHeaderPrinted = false;
  }
});

// ✅ IMPORTANT
window.serologyHeaderPrinted = false;
window.crpHeaderPrinted = false;

renderSerologyGroup();



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

