const MM_TO_PX = 3.78; // 96dpi standard

const serologyGroup = [];


const normalTestKeys = [];


const COMBINED_SEROLOGY_SECTIONS = [
  "AUSTRALIA ANTIGEN", // HBsAg
  "HCV",
  "HIV"
];

function isCombinedSerology(sectionName = "") {
  const name = sectionName.toUpperCase();
  return COMBINED_SEROLOGY_SECTIONS.some(k => name.includes(k));
}




window.liverHeaderPrinted = false;
window.lipidHeaderPrinted = false;
window.serologyHeaderPrinted = false;
window.kidneyHeaderPrinted = false;
    window.COAGUHeaderPrinted = false;
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

  let combinedTableOpen = false;
  let combinedHTML = "";

  const COMBINED_SEROLOGY_SECTIONS = ["AUSTRALIA ANTIGEN", "HCV", "HIV"];
  function isCombinedSerology(sectionName = "") {
    if (!sectionName) return false;
    const name = sectionName.toUpperCase();
    return COMBINED_SEROLOGY_SECTIONS.some(k => name.toUpperCase().includes(k.toUpperCase()));
  }

  serologyGroup.forEach(testKey => {
    const test = Tests[testKey];
    const selectedIndexes = selectedSerology[testKey] || [];
    if (!selectedIndexes.length) return;

    selectedIndexes.forEach(index => {
      if (!(selectedSerology[testKey] || []).includes(index)) return;

      const section = test.sections?.[index];
      if (!section) return;

      // 🔥 WIDAL ABSOLUTE GUARD (before hasValue)
if (
  section.name?.toUpperCase().includes("WIDAL") &&
  !(selectedSerology[testKey] || []).includes(index)
) {
  return;
}


      const hasValue =
        (Array.isArray(section.fields) &&
          section.fields.some(f => {
            const name = f.name || f[0];
            const v = report[makeKey(testKey, name)];
            return v && v !== "";
          })) ||
        (Array.isArray(section.result) &&
          section.result.some(r => {
            const key = makeKey(testKey, r.name || "Result");
            const v = report[key];
            return v && v !== "" && v !== "NEGATIVE"; // 🔥 DEFAULT IGNORE
          }));

      if (!hasValue) return;




      if (!currentPage) newPage();

      const block = document.createElement("div");
      block.className = "test-block serology-block";
      block.style.pageBreakInside = "avoid";

      const isCombined = isCombinedSerology(section.name);
      let html = "";

      if (isCombined) {
        if (!combinedTableOpen) {
          combinedHTML = `
            <table>
              <tr class="test-title">
                <th colspan="2">SEROLOGY REPORT</th>
              </tr>
              <tr class="test-head">
                <th>INVESTIGATION</th>
                <th style="width:50%;">RESULT</th>
              </tr>
          `;
          combinedTableOpen = true;
        }

// 🔥 ONLY HIV ke liye heading
if (isCombined && section.name.toUpperCase().includes("HIV")) {
  combinedHTML += `
    <tr class="bio-subtitle">
      <th colspan="2" style="text-align:left; padding-left:6px;font-weight:800;">
        REPORT ON HIV
      </th>
    </tr>
  `;
}


        // 🔹 Add section heading inside combined table
        combinedHTML += `
          <tr class="test-title">
            <th colspan="2" style="text-align:left; font-size: 19px;
    padding-left: 6px;"></th>
            </tr>
        `;
      } else {
        html = `
          <table>
            <tr class="test-title">
              <th colspan="2">${test.title}</th>
            </tr>
            <tr class="test-head">
              <th>INVESTIGATION</th>
              <th style="width:40%;">RESULT</th>
            </tr>
        `;
      }

      // 🔹 SECTION NAME (WIDAL / NORMAL)
      if (section.name) {
        if (section.name.toUpperCase().includes("WIDAL")) {
          const rowHTML = `
            <tr class="bio-subtitle">
              <th colspan="2" style="text-align:left;">
                ${section.name}
              </th>
            </tr>
          `;
          if (isCombined) combinedHTML += rowHTML;
          else html += rowHTML;
        } else {
          const rowHTML = `
            <tr class="bio-subtitle">
            </tr>
          `;
          if (isCombined) combinedHTML += rowHTML;
          else html += rowHTML;
        }
      }

      /* ===================== 🔥 DENGUE SPECIAL ===================== */
      if (section.name.toUpperCase().includes("DENGUE")) {
        const ns1Field = section.fields?.find(([name]) =>
          name.toUpperCase().includes("NS1")
        );
        const ns1Value = ns1Field
          ? report[makeKey(testKey, ns1Field[0])]
          : null;

        const iggIgmValues = (section.fields2 || [])
          .map(([name]) => ({
            name,
            value: report[makeKey(testKey, name)],
            isAbnormal: isPositiveSerology(report[makeKey(testKey, name)])
          }))
          .filter(f => f.value);

        if (!ns1Value && iggIgmValues.length === 0) return;

      if (section.sub?.length) {
  const rowHTML = `
    <tr class="bio-sub-row">
      <td colspan="2" style="font-weight:600">DENGUE NS1 Antigen</td>
    </tr>
  `;
  if (isCombined) combinedHTML += rowHTML;
  else html += rowHTML;
}


        if (ns1Value) {
const isNs1Positive = isPositiveSerology(ns1Value);
          
          const rowHTML = `
            <tr class="test-row">
              <td class="mono-space"">${ns1Field[0]}</td>
              <td class="td-result">
               <span class="result-value" style="${isNs1Positive ? 'font-weight:bold' : ''}">
  ${ns1Value}
</span>

              </td>
            </tr>
          `;
          if (isCombined) combinedHTML += rowHTML;
          else html += rowHTML;
        }

          // sub lines
  section.sub.forEach(s => {
    const rowHTML = `
      <tr class="bio-para-row" style="  
    font-size: 13.5px;">
        <td colspan="2">${s}</td>
      </tr>
    `;
    if (isCombined) combinedHTML += rowHTML;
    else html += rowHTML;
  });

       

        section.para?.forEach(p => {
          p.split(/\n|<br\s*\/?>/i).forEach(line => {
            if (!line.trim()) return;
            const rowHTML = `
              <tr class="bio-para-row" style="text-align: justify; font-size:14px;">
                <td colspan="2">${line.trim()}</td>
              </tr>
            `;
            if (isCombined) combinedHTML += rowHTML;
            else html += rowHTML;
          });
        });

        if (iggIgmValues.length) {
          section.sub2?.forEach(s => {
            const rowHTML = `
              <tr class="bio-subtitle">
                <th colspan="2">${s}</th>
              </tr>
            `;
            if (isCombined) combinedHTML += rowHTML;
            else html += rowHTML;
          });
        }

        iggIgmValues.forEach(f => {
          const style = f.isAbnormal ? "font-weight:bold" : "";
          const rowHTML = `
            <tr class="test-row">
              <td class="mono-space">${f.name}</td>
              <td class="td-result">
                <span class="result-value" style="${style}">${f.value}</span>
              </td>
            </tr>
          `;
          if (isCombined) combinedHTML += rowHTML;
          else html += rowHTML;
        });

        section.para2?.forEach(p => {
          p.split(/\n|<br\s*\/?>/i).forEach(line => {
            if (!line.trim()) return;
            const rowHTML = `
              <tr class="bio-para-row" style="text-align: justify; font-size:14px;">
                <td colspan="2" style="line-height:1.4;">${line.trim()}</td>
              </tr>
            `;
            if (isCombined) combinedHTML += rowHTML;
            else html += rowHTML;
          });
        });
      }

      /* ===================== NORMAL SEROLOGY ===================== */
      else {
      section.fields.forEach((field, fieldIndex) => {
  const name = field.name || field[0];
  const key = makeKey(testKey, name);
  const value = report[key];
  if (!value) return;

  const isAbnormal = isPositiveSerology(value);
  const cls = isAbnormal ? "serology-positive" : "";

  const rowHTML = `
    <tr class="test-row">
      <td class="mono-space">${name}</td>
      <td class="td-result">
        <span class="result-value ${cls}">${value}</span>
      </td>
    </tr>
  `;
  if (isCombined) combinedHTML += rowHTML;
  else html += rowHTML;

  const config = field[1] || {};
  config.after?.forEach(line => {
    const rowHTML2 = `
      <tr class="bio-sub-row">
        <td colspan="2">${line}</td>
      </tr>
    `;
    if (isCombined) combinedHTML += rowHTML2;
    else html += rowHTML2;
  });

  // 🔹 ONLY AUSTRALIA ANTIGEN & HCV section me separator
  if (
    section.name === "AUSTRALIA ANTIGEN & HCV" &&
    fieldIndex < section.fields.length - 1
  ) {
    const sepRow = `
      <tr class="bio-sub-row">
        <td colspan="2"><hr style="border:1px dashed #000000; margin:2px 0;"></td>
      </tr>
    `;
    if (isCombined) combinedHTML += sepRow;
    else html += sepRow;
  }
});


        if (
          section.name?.toUpperCase().includes("WIDAL") &&
          hasValue &&
          (selectedSerology[testKey] || []).includes(index)
        ) {
          section.fixedFields?.forEach(([name, fixedValue]) => {
            const rowHTML = `
              <tr class="test-row">
                <td class="mono-space">${name}</td>
                <td class="td-result">
                  <span class="result-value">${fixedValue}</span>
                </td>
              </tr>
            `;
            if (isCombined) combinedHTML += rowHTML;
            else html += rowHTML;
          });
        }

        (section.result || []).forEach(r => {
          if (!r) return;

          const name = r.name || "Result";
          const key = makeKey(testKey, name);
          const value = report[key];
          if (!value) return;

          const isAbnormal = isPositiveSerology(value);
          const cls = isAbnormal ? "serology-positive" : "";

          const rowHTML = `
            <tr class="test-row">
              <td class="mono-space">${name}</td>
              <td class="td-result">
                <span class="result-value ${cls}">${value}</span>
              </td>
            </tr>
          `;
          if (isCombined) combinedHTML += rowHTML;
          else html += rowHTML;
        });

        section.sub?.forEach(s => {
          const rowHTML = `
            <tr class="bio-sub-row">
              <td colspan="2">${s}</td>
            </tr>
          `;
          if (isCombined) combinedHTML += rowHTML;
          else html += rowHTML;
        });

       section.para?.forEach(p => {
  p.split(/\n|<br\s*\/?>/i).forEach(line => {
    if (!line.trim()) return;

    const isHIV = section.name.toUpperCase().includes("HIV");
    const style = isHIV
      ? "text-align:justify; line-height:1.4;font-size:13.5px;"
      : "";

    const rowHTML = `
      <tr class="bio-para-row">
        <td colspan="2" style="${style}">
          ${line.trim()}
        </td>
      </tr>
    `;
    if (isCombined) combinedHTML += rowHTML;
    else html += rowHTML;
  });
});


        section.para2?.forEach(p => {
          p.split(/\n|<br\s*\/?>/i).forEach(line => {
            if (!line.trim()) return;
            const rowHTML = `
              <tr class="bio-para-row">
                <td colspan="2">${line.trim()}</td>
              </tr>
            `;
            if (isCombined) combinedHTML += rowHTML;
            else html += rowHTML;
          });
        });
      }

      if (!isCombined) {
  html += `</table>`;
  block.innerHTML = html;
  currentTestsBox.appendChild(block);
}


      // 🔹 Separator after each combined section
      if (isCombined) {
        combinedHTML += `
          <tr class="bio-sub-row">
            <td colspan="2"><hr style="border:1px dashed #000000; margin:4px 0;"></td>
          </tr>
        `;
      }

      if (isTestOverflow() && !isCombined) {
        currentTestsBox.removeChild(block);
        newPage();
        window.serologyHeaderPrinted = false;
        currentTestsBox.appendChild(block);
      }
    });
  });

 // 🔹 AFTER final combined table is ready
if (combinedTableOpen) {
  combinedHTML += `</table>`;

  // Measure height
  const tempBlock = document.createElement("div");
  tempBlock.style.position = "absolute";
  tempBlock.style.visibility = "hidden";
  tempBlock.innerHTML = combinedHTML;
  document.body.appendChild(tempBlock);
  const tableHeight = tempBlock.offsetHeight;
  document.body.removeChild(tempBlock);

  // Check if current page can fit table
  if (currentTestsBox.offsetTop + currentTestsBox.offsetHeight + tableHeight > currentPage.querySelector(".page-content").offsetHeight - mmToPx(60)) {
    newPage(); // move to next page
  }

  const block = document.createElement("div");
  block.className = "test-block serology-block";
  block.innerHTML = combinedHTML;
  currentTestsBox.appendChild(block);

  combinedTableOpen = false;
  combinedHTML = "";
}

}





import Tests from "../tests/index.js";

function checkFlag(result, refList, gender) {
  if (!result || !refList || refList.length === 0) {
    return { flag: "" };
  }

  const value = parseFloat(String(result).replace(/,/g, ""));
  if (isNaN(value)) return { flag: "" };

  /* 🔥 ref ko jaisa aaye waisa hi combine */
  let ref = refList.join(" | ").trim();

  /* ===================================================
     🔥 STEP 1: NORMALIZE GENDER
  =================================================== */
  const genderNorm = String(gender || "").toLowerCase().trim();
  const isMale = genderNorm === "male" || genderNorm === "m";
  const isFemale = genderNorm === "female" || genderNorm === "f";

  /* ===================================================
     🔥 STEP 2A: CBC STYLE →  F : ... | M : ...
  =================================================== */
  if ((isMale || isFemale) && /[MF]\s*:/i.test(ref)) {
    const parts = ref.split("|").map(p => p.trim());

    for (const p of parts) {
      if (isMale && /^M\s*:/i.test(p)) {
        ref = p.replace(/^M\s*:\s*/i, "");
        break;
      }
      if (isFemale && /^F\s*:/i.test(p)) {
        ref = p.replace(/^F\s*:\s*/i, "");
        break;
      }
    }
  }

  /* ===================================================
     🔥 STEP 2B: LIPID STYLE →  M - < 3.55, F - < 3.22
  =================================================== */
  if ((isMale || isFemale) && /[MF]\s*-\s*</i.test(ref)) {
    const parts = ref.split(",").map(p => p.trim());

    for (const p of parts) {
      if (isMale && /^M\s*-\s*</i.test(p)) {
        ref = p.replace(/^M\s*-\s*/i, "");
        break;
      }
      if (isFemale && /^F\s*-\s*</i.test(p)) {
        ref = p.replace(/^F\s*-\s*/i, "");
        break;
      }
    }
  }

  // commas hatao
  ref = ref.replace(/,/g, "");

    /* ===================================================
     🔥 STEP 3: HBA1c SPECIAL LOGIC
     Non-Diabetic | Pre Diabetic | Diabetic
  =================================================== */
  if (/non\s*[- ]?diabetic|pre\s*[- ]?diabetic|diabetic/i.test(ref)) {

    // Extract numbers safely
    // ≤ 5.6
    const nonMatch = ref.match(/≤\s*([\d.]+)/);
    // 5.7 - 6.4
    const preMatch = ref.match(/(\d+[\d.]*)\s*-\s*(\d+[\d.]*)/);
    // ≥ 6.5
    const diaMatch = ref.match(/≥\s*([\d.]+)/);

    if (nonMatch) {
      const nonMax = parseFloat(nonMatch[1]);
      if (value <= nonMax) {
        return { flag: "" }; // ✅ normal
      }
    }

    if (preMatch) {
      const preMin = parseFloat(preMatch[1]);
      const preMax = parseFloat(preMatch[2]);
      if (value >= preMin && value <= preMax) {
        return { flag: "PRE" }; // ⚠️ pre-diabetic
      }
    }

    if (diaMatch) {
      const diaMin = parseFloat(diaMatch[1]);
      if (value >= diaMin) {
        return { flag: "H" }; // 🔥 diabetic
      }
    }

    return { flag: "" };
  }


  /* ================= RANGE: min - max ================= */
  let match = ref.match(/(\d+[\d.]*)\s*-\s*(\d+[\d.]*)/);
  if (match) {
    const min = parseFloat(match[1]);
    const max = parseFloat(match[2]);

    if (value < min) return { flag: "L" };
    if (value > max) return { flag: "H" };
    return { flag: "" };
  }


  
  /* ================= RANGE: Upto ================= */
  match = ref.match(/upto\s*-?\s*([\d.]+)/i);
  if (match) {
    const max = parseFloat(match[1]);
    if (value > max) return { flag: "H" };
    return { flag: "" };
  }

  /* ================= RANGE: < ================= */
  match = ref.match(/<\s*([\d.]+)/);
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
lipidHeaderPrinted = false;
window.serologyHeaderPrinted = false;
window.kidneyHeaderPrinted = false;
    window.COAGUHeaderPrinted = false;
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
 const { flag } = checkFlag(
  result,
  [f[2]],          // 🔥 full ref string
  patient.gender
);

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
    <tr class="test-title"><th colspan="4">${test.title}</th></tr>
    <tr class="test-head">
      <th>INVESTIGATION</th>
      <th>RESULT</th>
      <th>UNIT</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;

  if (test.subtitle) {
  html += `
    <tr class="subtitle-row">
      <td class="subtitle-cell" style="
    font-weight: 600;
">${test.subtitle}</td>

      <td></td>
      <td></td>
      <td></td>
    </tr>
  `;
}

const postUrineKey = makeKey(testKey, "BLOOD SUGAR POSTMEAL");
const hasPostUrineValue = report[postUrineKey] && report[postUrineKey] !== "";


  test.fields.forEach(f => {
    const fieldKey = makeKey(testKey, f.name);
    const result = report[fieldKey];

    // 🔹 skip if empty AND no sub
    if (!result && !f.sub) return;

    // ✅ Sub-label first (AFTER 1 & 1/2 HOURS)
   if (f.sub && hasPostUrineValue) {
  html += `
    <tr class="sub-row">
      <td colspan="4" class="sub-label" style="padding-left:7%">${f.sub}</td>
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
/* ================= LIPID PROFILE  ================= */
else if (test.class === "LIPID REPORT") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.name);
    return report[k];
  });

  if (!hasValue) return "";

  if (!lipidHeaderPrinted) {
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
        <th colspan="4">LIPID PROFILE</th>
      </tr>
    `;
    lipidHeaderPrinted = true;
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

  const electrolyteFields = [
  "SR. SODIUM",
  "SR. POTASSIUM",
  "SR. IONIC CALCIUM",
  "SR. CHLORIDE"
];

const hasElectrolyteValue = electrolyteFields.some(name => {
  const k = makeKey(testKey, name);
  return report[k] && report[k] !== "";
});

  test.fields.forEach(f => {

  if (f.sub) {
  if (!hasElectrolyteValue) return;

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
/* ================= COAGULATION PROFILE REPORT ================= */
else if (test.class === "COAGULATION") {

  const hasValue = test.fields.some(f => {
    if (f.sub) return false;
    const k = makeKey(testKey, f.name);
    return report[k];
  });

  if (!hasValue) return "";

  // ✅ Independent header flag for KFT
  if (!window.COAGUHeaderPrinted) {
    html += `
      <tr class="test-title">
        <th colspan="4">COAGULATION PROFILE REPORT</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
        <th>RESULT</th>
        <th>UNIT</th>
        <th>REFERENCE RANGE</th>
      </tr>
    
    `;
    window.COAGUHeaderPrinted = true;
  }

  const PROTHROMBINFields = [
  "Patient Value (PT)",
"Control Value (CT)",
"Prothrombin Index",
"Prothrombin Ratio",
"I.S.I. Value",
"International Normalised Ratio (INR)",
];

const hasPROTHROMBINeValue = PROTHROMBINFields.some(name => {
  const k = makeKey(testKey, name);
  return report[k] && report[k] !== "";
});

  test.fields.forEach(f => {

  if (f.sub) {
  if (!hasPROTHROMBINeValue) return;

  html += `
    <tr class="bio-sub-row">
      <td colspan="4" class="bio-sub-left" style="font-weight:700;">
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
/* ================= GHb/HBA1c ================= */
/* ================= GHb/HBA1c ================= */
else if (test.class === "GHb/HBA1c") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key || f.name);
    return report[k];
  });
  if (!hasValue) return "";

  /* ===== TITLE + SUBTITLE ===== */
  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
  `;



  html += `
    <tr class="test-head">
      <th>INVESTIGATION</th>
      <th>RESULT</th>
      <th>UNIT</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;
  if (test.subtitle) {
    html += `
      <tr class="bio-subtitle">
        <th colspan="4">${test.subtitle}</th>
      </tr>
    `;
  }
  /* ===== FIELDS ===== */
  test.fields.forEach(f => {

    const key = makeKey(testKey, f.key || f.name);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    // ✅ SIMPLE RANGE CHECK (NO GENDER)
    if (f.ref) {
      const { flag } = checkFlag(result, [f.ref]);
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
        <td>${f.unit || ""}</td>
        <td class="td-ref">
          ${f.ref || ""}
        </td>
      </tr>
      
    `;
   
  });

  /* ===== AFTER / NOTES SECTION ===== */
  if (Array.isArray(test.after) && test.after.length) {
    html += `
      <tr class="no-page-break">
       <tr class="bio-sub-row">
        <td colspan="4"><hr style="border-bottom:1px dashed #000000; margin:2px 0;"></td>
      </tr>
        <td colspan="4" style="padding-top:6px">
          ${test.after
            .map(line => `<div style="line-height:1.35; padding-top: 4px;">${line}</div>`)
            .join("")}
        </td>
      </tr>
      
    `;
  }
}

/* ================= SERUM CALCIUM ================= */
/* ================= SERUM CALCIUM ================= */
else if (test.class === "SERUM CALCIUM") {

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
      const { flag } = checkFlag(
        result,
        [f.ref],          // 🔥 direct string
        patient.gender
      );

      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    html += `

    <td style="
    FONT-WEIGHT: 700;
">  ${test.subtitle}</td>
      <tr class="test-row">
     
       
        <td>${f.name}</td>
        <td class="td-result ${rowClass}">
          <span class="result-value">${result}</span>
          ${flagHTML}
        </td>
        <td>${f.unit}</td>
        <td>${f.ref}</td>
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
        <th style="
    width: 9%;">UNIT</th>
        <th style="
    width: 24%;">REFERENCE RANGE</th>
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
          <tr class="bio-para-row" style="text-align:justify; line-height:1.4;">
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

   // ❌ WIDAL NEVER RENDER HERE
  if (
    test.sections?.some(sec =>
      sec.name?.toUpperCase().includes("WIDAL")
    )
  ) {
    return ""; // 🔥 full stop
  }

  let hasAnyData = false;
  let htmlParts = [];

  const selectedIndexes = selectedSerology[testKey] || [];

  selectedIndexes.forEach(index => {

    const section = test.sections[index];
    if (!section) return;

    // 🔎 check any value entered
const hasValue =
  section.fields.some(([name]) => {
    const v = report[makeKey(testKey, name)];
    return v && v !== "";
  }) ||
  (section.result || []).some(r => {
    const v = report[makeKey(testKey, r.name || "Result")];
    return v && v !== "";
  });

// ❌ fixedFields WIDAL ke liye value proof nahi hoga

if (
  section.name.toUpperCase().includes("WIDAL") &&
  !(selectedSerology[testKey] || []).includes(index)
) {
  return;
}



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

/* ================= FIXED FIELDS (WIDAL CONTEXT) ================= */
if (section.name.toUpperCase().includes("WIDAL") && hasValue) {
  section.fixedFields?.forEach(([name, fixedValue]) => {
    html += `
      <tr class="test-row">
        <td class="mono-space">${name}</td>
        <td class="td-result">
          <span class="result-value">${fixedValue}</span>
        </td>
      </tr>
    `;
  });
}



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
else if ( test.class === "HEMATOLOGY" && ( test.testname === "PS FOR MP"))
   {

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
     
      <tr class="test-head">
        <th style="
    width: 25%;
">PS FOR MP</th>
       <th style="
    width: 90%;
"></th>
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
        <th style="width:50%">RESULT</th>
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

let psForMpKey = null; // 🔥 PS FOR MP ko last ke liye store

selectedTests.forEach(testKey => {

  const test = Tests[testKey];

  // 🔥 PS FOR MP ko abhi skip karo, baad me render hoga
  if (
    test.class === "HEMATOLOGY" &&
    test.testname === "PS FOR MP"
  ) {
    psForMpKey = testKey;
    return;
  }

  // 🔹 serology grouping as-is
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
    window.lipidHeaderPrinted = false;
    window.serologyHeaderPrinted = false;
    window.kidneyHeaderPrinted = false;
    window.COAGUHeaderPrinted = false;
    window.crpHeaderPrinted = false;
  }
});




// ✅ IMPORTANT
window.serologyHeaderPrinted = false;
window.crpHeaderPrinted = false;

renderSerologyGroup();

/* ================= PS FOR MP (ALWAYS LAST) ================= */

if (psForMpKey) {

  if (!currentPage) newPage();

  const block = document.createElement("div");
  block.className = "test-block serology-block category-block";

  const html = renderTest(psForMpKey);
  if (html) {
    block.innerHTML = html;
    currentTestsBox.appendChild(block);

    if (isTestOverflow()) {
      currentTestsBox.removeChild(block);
      newPage();
      currentTestsBox.appendChild(block);
    }
  }
}


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

