import { supabase } from "./supabase.js";
import Tests from "../tests/index.js";
// console.log(test.class);

async function getNextLRN(userId) {

  const { data, error } = await supabase
    .from("report_history")
    .select("lrn")
    .eq("user_id", userId)
    .order("lrn", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return 1;
  }

  const maxLRN = data?.lrn || 0;

  return maxLRN + 1;
}



let generatedLRN = null;

document.addEventListener("DOMContentLoaded", async () => {

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return;

  const userId = sessionData.session.user.id;

  // 🔥 CHECK IF OPENED FROM HISTORY
  const fromHistory = localStorage.getItem("fromHistory");

  if (fromHistory === "1") {

    // ✅ USE OLD PATIENT DATA (DO NOT GENERATE NEW LRN)
    const savedPatient = JSON.parse(localStorage.getItem("patient"));

    generatedLRN = savedPatient?.lrn || 1;

    patient.lrn = generatedLRN;

    console.log("History preview LRN:", generatedLRN);

    // ✅ clear flag so next new report generates fresh LRN
    // localStorage.removeItem("fromHistory");

  } else {

    // ✅ NORMAL FLOW → GENERATE NEW LRN
    generatedLRN = await getNextLRN(userId);

    patient.lrn = generatedLRN;

    console.log("New preview LRN:", generatedLRN);

  }

  renderPreview();
});







// export async function saveReport(patientData, reportData, tests) {

//   const { data: sessionData } = await supabase.auth.getSession();

//   if (!sessionData.session) return;

//   const userId = sessionData.session.user.id;

//   // ✅ CRITICAL FIX: ALWAYS FETCH FRESH LRN FROM DB BEFORE INSERT
//   const freshLRN = await getNextLRN(userId);

//   // ✅ update global + patient also
//   generatedLRN = freshLRN;
//   patient.lrn = freshLRN;

//   const { data, error } = await supabase
//     .from("report_history")
//     .insert({
//       user_id: userId,
//       patient: { ...patientData, lrn: freshLRN },
//       report: reportData,
//       tests: tests,
//       lrn: freshLRN
//     });

//   if (error) {
//     alert(error.message);
//     return;
//   }

//   console.log("Saved LRN:", freshLRN);
// }

export async function saveReport(patientData, reportData, tests) {

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { success: false };

  const userId = sessionData.session.user.id;

  const freshLRN = await getNextLRN(userId);

  generatedLRN = freshLRN;
  patient.lrn = freshLRN;

  const { data, error } = await supabase
    .from("report_history")
    .insert({
      user_id: userId,
      patient: { ...patientData, lrn: freshLRN },
      report: reportData,
      tests: tests,
      lrn: freshLRN
    })
    .select(); // 🔥 ADD THIS (important for confirmation)

  if (error) {
    alert(error.message);
    return { success: false };
  }

  if (data && data.length > 0) {
    console.log("Saved LRN:", freshLRN);
    return { success: true, lrn: freshLRN };
  }

  return { success: false };
}




function savePdfHistory(type, userId) {
  if (!userId) return;

  const key = `pdfHistory_${userId}`;
  const history = JSON.parse(localStorage.getItem(key)) || [];

  history.push({
    type,
    patient: patient.name,
    date: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(history));
}


// old ==================
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
              <th style="width:50%;">RESULT</th>
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







function checkFlag(result, refList, gender, age)
 {

   result = String(result || "");
  if (!Array.isArray(refList)) return { flag: "" };

  refList = refList.filter(r => typeof r === "string");

  if (!refList.length) return { flag: "" };
  
  if (!result || !refList || refList.length === 0) {
    return { flag: "" };
  }

  const value = parseFloat(String(result).replace(/,/g, ""));
  if (isNaN(value)) return { flag: "" };

    /* 🔥 ref ko jaisa aaye waisa hi combine */
  let ref = refList.join(" | ").trim();

  /* ===================================================
   🔥 STEP X: AGE BASED RANGE SELECTOR
=================================================== */

const ageNum = parseInt(age);

/* ===============================================
   🔥 NEW FORMAT: 80 - 253 : 1 Yr - 10 Yr
================================================ */

if (!isNaN(ageNum) && /:\s*\d+\s*Yr/i.test(ref)) {

  const lines = ref.split("\n").map(l => l.trim());

  for (let line of lines) {

    // 80 - 253 : 1 Yr - 10 Yr
    let match = line.match(/([\d.]+\s*-\s*[\d.]+)\s*:\s*(\d+)\s*Yr\s*-\s*(\d+)\s*Yr/i);
    if (match) {
      const range = match[1];
      const minAge = parseInt(match[2]);
      const maxAge = parseInt(match[3]);

      if (ageNum >= minAge && ageNum <= maxAge) {
        ref = range.trim();
        break;
      }
    }

    // 60 - 181 : > 18 years
    match = line.match(/([\d.]+\s*-\s*[\d.]+)\s*:\s*>\s*(\d+)/i);
    if (match) {
      const range = match[1];
      const minAge = parseInt(match[2]);

      if (ageNum > minAge) {
        ref = range.trim();
        break;
      }
    }
  }
}


if (!isNaN(ageNum) && /\d+\s*-\s*\d+\s*Years/i.test(ref)) {

  const lines = ref.split("\n").map(l => l.trim());

  for (let line of lines) {

    // 4 - 11 Years: 8.6 - 37.7
    let match = line.match(/(\d+)\s*-\s*(\d+)\s*Years\s*:\s*(.+)/i);
    if (match) {
      const minAge = parseInt(match[1]);
      const maxAge = parseInt(match[2]);
      const range = match[3];

      if (ageNum >= minAge && ageNum <= maxAge) {
        ref = range.trim();
        break;
      }
    }

    // >60 Years: 5.6 - 45.8
    match = line.match(/>\s*(\d+)\s*Years\s*:\s*(.+)/i);
    if (match) {
      const minAge = parseInt(match[1]);
      const range = match[2];

      if (ageNum > minAge) {
        ref = range.trim();
        break;
      }
    }
  }
}




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

  /* ===================================================
     🔥 LIPID SPECIAL: Goal < 130 (High Risk > 130)
  =================================================== */

  if (/goal\s*</i.test(ref) && /high\s*risk\s*>/i.test(ref)) {

    // Goal < 130
    let goalMatch = ref.match(/<\s*([\d.]+)/);
    if (goalMatch) {
      const max = parseFloat(goalMatch[1]);
      if (value >= max) {
        return { flag: "H" };  // High risk
      }
      return { flag: "" };
    }
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
  // match = ref.match(/upto\s*-?\s*([\d.]+)/i);
  match = ref.match(/^\s*upto\s*-?\s*([\d.]+)/i);
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

  console.log("Rendering LRN:", patient.lrn);

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
        <div class="p-row"><span class="p-label">LRN</span><span class="p-colon">:</span>
      <span class="p-value">
 ${patient.lrn ? String(patient.lrn).padStart(2, "0") : "01"}

</span>

</div>
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

// const reportData = JSON.parse(localStorage.getItem("report")) || {};
  // const test = Tests[testKey];

  const test = Array.isArray(Tests)
  ? Tests.find(t => t.key === testKey)
  : Tests[testKey];

if (!test) {
  console.error("Test not found:", testKey);
  return;
}

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

      if (!result) return;

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
  ${f[2].replace(/\|/g, " | ")}
</td>

        </tr>
      `;
    });

//       <td class="td-ref">
//   ${f[2].split("|").map(r => `<div>${r.trim()}</div>`).join("")}
// </td>
  }

  // ====================== PREVIEW troponin ======================
// ====================== PREVIEW troponin ======================
else if (test.class === "TROPONIN") {

  let hasAnyData = false;

  // 🔎 First check: koi bhi section me data hai kya?
  test.sections.forEach(section => {
    const hasData = section.fields.some(f => {
      if (f.type === "heading") return false;
      const key = makeKey(testKey, f.name);
      return report[key] && report[key] !== "";
    });

    if (hasData) hasAnyData = true;
  });

  if (!hasAnyData) return; // ❌ agar pura test empty hai toh skip

  /* ================= MAIN TITLE (ONLY ONCE) ================= */
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

  /* ================= LOOP SECTIONS ================= */
  test.sections.forEach(section => {

    const hasData = section.fields.some(f => {
      if (f.type === "heading") return false;
      const key = makeKey(testKey, f.name);
      return report[key] && report[key] !== "";
    });

    if (!hasData) return; // skip empty section

    /* 🔹 Section Title */
    // html += `
    //   <tr>
    //     <td colspan="4" class="sub-main-heading">
    //       ${section.title}
    //     </td>
    //   </tr>
    // `;

    section.fields.forEach(f => {

      if (f.type === "heading") return;

      const key = makeKey(testKey, f.name);
      const result = report[key];
      if (!result) return;

      let flagHTML = "";
let rowClass = "";

if (result && f.ref) {
  const { flag } = checkFlag(
    result,
    [f.ref],
    patient?.gender || ""
  );

  if (flag) {
    flagHTML = ` <span class="flag shift-flag">${flag}</span>`;
    rowClass = "abnormal-value";
  }
}

      html += `
        <tr>
          <td>${f.name}</td>
         <td class="td-result ${rowClass}">
  <span class="result-value">${result}</span>
  ${flagHTML}
</td>
          <td>${f.unit || ""}</td>
          <td>${f.ref || ""}</td>
        </tr>
      `;
    });

  });

  /* ================= TROPO I EXTRA CONTENT ================= */

  const hasTroponinI = test.sections[1]?.fields.some(f => {
    if (f.type === "heading") return false;
    const key = makeKey(testKey, f.name);
    return report[key] && report[key] !== "";
  });

  if (hasTroponinI) {

    html += `
      <tr>
        <td colspan="4" class="section-divider"></td>
      </tr>

      <tr>
        <td colspan="4" class="small-title">
          ONE STEP Troponin I-TEST
        </td>
      </tr>
    `;

    if (test.note) {
      html += `
        <tr>
          <td colspan="4" class="text-block" style="font-size:12px;    text-align: justify;">
            ${test.note}
          </td>
        </tr>
      `;
    }

    if (test.comments) {
      html += `
        <tr>
          <td colspan="4" class="text-block"style="font-size:12px;    text-align: justify;">
            <strong>COMMENTS</strong><br>
            ${test.comments}
          </td>
        </tr>
      `;
    }

    if (test.increasedLevels) {
      html += `
        <tr>
          <td colspan="4" class="text-block"style="font-size:12px;    text-align: justify;">
            <strong>INCREASED LEVELS</strong><br>
            ${test.increasedLevels}
          </td>
        </tr>
      `;
    }

    if (test.uses) {
      html += `
        <tr>
          <td colspan="4" class="text-block"style="font-size:12px;    text-align: justify;">
            <strong>USES</strong><br>
            ${test.uses.replace(/\n/g, "<br>")}
          </td>
        </tr>
      `;
    }
  }
}
/* ================= BIOCHEMISTRY / SUGAR ================= */
/* ================= BIOCHEMISTRY / SUGAR ================= */
else if (test.title === "BIOCHEMISTRY REPORT" && test.subtitle && !test.class) {

  const hasAnyValue = test.fields.some(f => {
    if (!f.name) return false;
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
    <tr class="subtitle-row">
      <td class="subtitle-cell" style="font-weight:600;">
        ${test.subtitle}
      </td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  `;

  test.fields.forEach(f => {

    // ❌ SECTION preview me nahi dikhana
    if (f.section) return;

    // ✅ SUB LABEL (exact jagah)
   // ✅ SUB LABEL — only after POSTMEAL blood row
if (f.sub) {

  const postMealKey = makeKey(testKey, "BLOOD SUGAR POSTMEAL");
  const hasPostMealValue = report[postMealKey] && report[postMealKey] !== "";

  if (hasPostMealValue) {
    html += `
      <tr class="sub-row">
        <td colspan="4" style="padding-left:15px; font-weight:600;">
          ${f.sub}
        </td>
      </tr>
    `;
  }

  return;
}

    if (!f.name) return;

    const fieldKey = makeKey(testKey, f.name);
    const result = report[fieldKey];

    if (!result) return;

    const isUrine = f.name.toUpperCase().includes("URINE");

    let resultClass = "";
    let flagHTML = "";

    // ✅ SAME OLD URINE LOGIC
    if (isUrine) {
      const val = String(result).trim().toUpperCase();
      resultClass = val === "ABSENT" ? "normal-value" : "abnormal-value";
    }

    // ✅ SAME OLD FLAG FUNCTION (UNCHANGED)
    else if (f.ref) {
      const { flag } = checkFlag(result, [f.ref], patient.gender);
      if (flag) {
        resultClass = "abnormal-value";
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
      }
    }

    // remove (FASTING) etc from preview
    const cleanName = f.name.replace(/\(.*?\)/g, "").trim();

    html += `
      <tr class="test-row">
        <td style="${isUrine ? "padding-left:25px;" : "padding-left:0;"}">
          ${cleanName}
        </td>
        <td class="td-result">
          <span class="result-value ${resultClass}">
            ${result}
          </span>
          ${flagHTML}
        </td>
        <td class="td-unit">
          ${isUrine ? "" : (f.unit || "")}
        </td>
        <td class="td-ref">
          ${f.ref || "Nil"}
        </td>
      </tr>
    `;

  });
}
// ====================== PREVIEW : SICKLING ======================
else if (test.class === "SICKLING") {

  const hasAnyValue = test.fields.some(f => {
    const key = makeKey(testKey, f.name);
    return report[key] && report[key] !== "";
  });

  if (!hasAnyValue) return "";

  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
    <tr class="test-head">
      <th>INVESTIGATION</th>
      <th>RESULT</th>
      <th></th>
      <th></th>
    </tr>
  `;

  test.fields.forEach(f => {

    const key = makeKey(testKey, f.name);
    const timeKey = makeKey(testKey, f.name + "_TIME");

    const result = report[key];
    const timeValue = report[timeKey];

    if (!result) return;

    html += `
      <tr class="test-row">
        <td>
          SICKLING - ${f.name} -
        </td>
        <td class="td-result">
          <span class="result-value">
            ${result}
          </span>
        </td>
        <td>
          ${timeValue ? `( After ${timeValue} hrs )` : ""}
        </td>
        <td></td>
      </tr>
    `;
  });
}
// ====================== PREVIEW : COOMBS TEST ======================
else if (test.class === "COOMBS TEST") {

  const hasAnyValue = test.fields.some(f => {
    const key = makeKey(testKey, f.name);
    return report[key] && report[key] !== "";
  });

  if (!hasAnyValue) return "";

  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
    <tr class="test-head">
      <th>INVESTIGATION</th>
      <th>RESULT</th>
      <th></th>
      <th></th>
    </tr>
  `;

  test.fields.forEach(f => {

    const key = makeKey(testKey, f.name);
    const result = report[key];

    if (!result) return;   // ✅ Only selected row show hogi

    html += `
      <tr class="test-row">
        <td>${f.name}</td>
        <td class="td-result">
          <span class="result-value">
            ${result}
          </span>
        </td>
        <td></td>
        <td></td>
      </tr>
    `;
  });
}
// ====================== PREVIEW : BGA ======================
else if (test.class === "BGA") {

  // ✅ check at least one valid value (0 allowed)
  const hasAnyValue = test.fields.some(f => {
    if (!f.name) return false;
    const key = makeKey(testKey, f.name);
    const value = report[key];
    return value !== undefined && value !== null && value !== "";
  });

  if (!hasAnyValue) return "";

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

  test.fields.forEach(f => {

    // ✅ Section row
    if (f.section) {
      html += `
        <tr class="sub-row">
          <td colspan="4" style="font-weight:600; padding-top:10px;">
            ${f.section}
          </td>
        </tr>
      `;
      return;
    }

    if (!f.name) return;

    const key = makeKey(testKey, f.name);
    const result = report[key];

    // ✅ Allow 0
    if (result === undefined || result === null || result === "") return;

    let resultClass = "";
    let flagHTML = "";

    // ✅ Run flag only if reference exists
    if (f.ref && f.ref.trim() !== "") {

      const { flag } = checkFlag(
        result,
        [f.ref],
        patient?.gender || "",
        patient?.age || ""
      );

      if (flag) {
        resultClass = "abnormal-value";
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
      }
    }

    html += `
      <tr class="test-row">
        <td>${f.name}</td>
        <td class="td-result">
          <span class="result-value ${resultClass}">
            ${result}
          </span>
          ${flagHTML}
        </td>
        <td>${f.unit || ""}</td>
        <td>${f.ref || ""}</td>
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
     const { flag } = checkFlag(result, [f.ref], patient.gender, patient.age);
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
  "SERUM SODIUM",
  "SERUM POTASSIUM",
  "SERUM CHLORIDE",
  "SERUM BICARBONATE",
  "IONIC CALCIUM"
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

for (let i = 0; i < test.fields.length; i++) {
  const f = test.fields[i];

  // ===== SUB HEADING =====
  if (f.sub) {

    // 🔥 Check next fields until next sub heading
    let hasSubValue = false;

    for (let j = i + 1; j < test.fields.length; j++) {
      if (test.fields[j].sub) break;

      const k = makeKey(testKey, test.fields[j].name);
      if (report[k]) {
        hasSubValue = true;
        break;
      }
    }

    if (!hasSubValue) continue;

    html += `
      <tr class="bio-sub-row">
        <td colspan="4" class="bio-sub-left" style="font-weight:700;">
          ${f.sub}
        </td>
      </tr>
    `;
    continue;
  }

  // ===== NORMAL FIELD =====
  const key = makeKey(testKey, f.name);
  const result = report[key];
  if (!result) continue;

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
};
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

/* ================= IRON PROFILE ================= */
else if (test.class === "IRON PROFILE") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key || f.name);
    return report[k];
  });
  if (!hasValue) return "";

  /* ===== TITLE ===== */
  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
  `;

  /* ===== TABLE HEAD ===== */
  html += `
    <tr class="test-head">
      <th>TEST DESCRIPTION</th>
      <th>RESULT</th>
      <th>UNITS</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;

  /* ===== SUBTITLE ===== */
  if (test.subtitle) {
    html += `
      <tr class="bio-subtitle">
        <th colspan="4">${test.subtitle}</th>
      </tr>
    `;
  }

 
/* ===== FIELDS (FROM iron.js) ===== */
test.fields.forEach(f => {

  const key = makeKey(testKey, f.key || f.name);
  const result = report[key];
  if (!result) return;

  let flagHTML = "";
  let rowClass = "";

  if (f.ref) {
    const { flag } = checkFlag(result, [f.ref]);
    if (flag) {
      flagHTML = `<span class="flag shift-flag">${flag}</span>`;
      rowClass = "abnormal-value";
    }
  }

  /* ===== MAIN RESULT ROW ===== */
  html += `
    <tr class="test-row">
      <td>${f.name}</td>
      <td class="td-result ${rowClass}">
        <span class="result-value">${result}</span>
        ${flagHTML}
      </td>
      <td>${f.unit || ""}</td>
      <td class="td-ref">${f.ref || ""}</td>
    </tr>
  `;

  /* ===== METHOD ROW (Separate, Clean) ===== */
  if (f.method) {
    html += `
      <tr class="method-row">
        <td colspan="4" style="padding:2px 6px; font-size:12px; color:#555;">
          ${f.method}
        </td>
      </tr>
    `;
  }

});



 /* ===== AFTER SECTION (Proper Single Table) ===== */
if (Array.isArray(test.after) && test.after.length) {

  const headerIndex = test.after.findIndex(line =>
    line.includes("Disease |")
  );

  html += `
    <tr>
      <td colspan="4" style="padding-top:6px">
  `;

  test.after.forEach((line, index) => {

    // Plain text lines (Interpretation etc.)
    if (!line.includes("|")) {
      html += `
        <div style="line-height:1.4; padding-top:4px;">
          ${line}
        </div>
      `;
    }

    // Header line -> start table
    if (index === headerIndex) {

      const headers = line.split("|").map(c => c.trim());

      html += `
        <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:6px;">
          <tr style="background:#f2f2f2; font-weight:bold;">
            ${headers.map(h =>
              `<th style="border:1px solid #000; padding:4px;">${h}</th>`
            ).join("")}
          </tr>
      `;
    }

    // Data rows (after header)
    if (index > headerIndex && line.includes("|")) {

      const cols = line.split("|").map(c => c.trim());

      html += `
        <tr>
          ${cols.map(c =>
            `<td style="border:1px solid #000; padding:4px;">${c}</td>`
          ).join("")}
        </tr>
      `;
    }

  });

  // Close table
  if (headerIndex !== -1) {
    html += `</table>`;
  }

  html += `
      </td>
    </tr>
  `;
}

}

/* ================= CALCIUM & PHOSPHORUS ================= */
else if (test.class === "CALCIUM & PHOSPHORUS") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.name);
    return report[k];
  });
  if (!hasValue) return "";

  /* ===== TITLE ===== */
  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
  `;

  /* ===== TABLE HEAD ===== */
  html += `
    <tr class="test-head">
      <th>TEST DESCRIPTION</th>
      <th>RESULT</th>
      <th>UNITS</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;

  /* ===== SUBTITLE ===== */
  html += `
    <tr class="bio-subtitle">
      <th colspan="4">${test.subtitle}</th>
    </tr>
  `;

  /* ===== FIELDS ===== */
  test.fields.forEach(f => {

    const key = makeKey(testKey, f.name);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    if (f.ref) {
      const { flag } = checkFlag(result, [f.ref]);
      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    /* Main Row */
    html += `
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

    /* Method Row */
    html += `
      <tr class="method-row">
        <td colspan="4" style="font-size:12px; padding:2px 6px; color:#555;">
          ${f.method}
        </td>
      </tr>
    `;
  });

  /* ===== INTERPRETATION ===== */
  if (Array.isArray(test.after) && test.after.length) {

    html += `
      <tr>
        <td colspan="4" style="padding-top:8px;">
    `;

    test.after.forEach(line => {
      html += `
        <div style="line-height:1.5; margin-bottom:4px;font-size:13.5px;">
          ${line}
        </div>
      `;
    });

    html += `
        </td>
      </tr>
    `;
  }
}


/* ================= other BIOCHEM  ================= */
else if (test.class === "SERUM CALCIUM") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key || f.name);
    return report[k];
  });
  if (!hasValue) return "";

  /* ===== TITLE (only once) ===== */
  if (!window.esrHeaderPrinted) {
    html += `
      <tr class="test-title">
        <th colspan="4">${test.title}</th>
      </tr>
      <tr class="test-head">
        <th>TEST DESCRIPTION</th>
        <th>RESULT</th>
        <th>UNITS</th>
        <th>REFERENCE RANGE</th>
      </tr>
    `;
    window.esrHeaderPrinted = true;
  }

  /* ===== SUBTITLE (single row like reference) ===== */
  html += `
    <tr class="bio-subtitle">
      <th colspan="4">${test.subtitle}</th>
    </tr>
  `;

  /* ===== FIELDS ===== */
  test.fields.forEach(f => {

    const key = makeKey(testKey, f.key || f.name);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    if (f.ref) {
      const { flag } = checkFlag(
        result,
        [f.ref],
        patient.gender
      );

      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    /* MAIN ROW (not red whole row) */
    html += `
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

    /* METHOD ROW (optional) */
    if (f.method) {
      html += `
        <tr class="method-row">
          <td colspan="4" style="font-size:12px; padding:2px 6px; color:#555;">
            ${f.method}
          </td>
        </tr>
      `;
    }
  });
}
/* ================= cardiac PROFILE   ================= */
else if (test.class === "CARDIAC PROFILE") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key || f.name);
    return report[k];
  });
  if (!hasValue) return "";

  /* ===== TITLE (only once) ===== */
  if (!window.esrHeaderPrinted) {
    html += `
      <tr class="test-title">
        <th colspan="4">${test.title}</th>
      </tr>
      <tr class="test-head">
        <th>INVESTIGATION</th>
        <th>RESULT</th>
        <th>UNITS</th>
        <th>REFERENCE RANGE</th>
      </tr>
    `;
    window.esrHeaderPrinted = true;
  }

  /* ===== SUBTITLE (single row like reference) ===== */
  html += `
    <tr class="bio-subtitle">
      <th colspan="4">${test.subtitle}</th>
    </tr>
  `;

  /* ===== FIELDS ===== */
  test.fields.forEach(f => {

    const key = makeKey(testKey, f.key || f.name);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    if (f.ref) {
      const { flag } = checkFlag(
        result,
        [f.ref],
        patient.gender
      );

      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    /* MAIN ROW (not red whole row) */
    html += `
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

    /* METHOD ROW (optional) */
    if (f.method) {
      html += `
        <tr class="method-row">
          <td colspan="4" style="font-size:12px; padding:2px 6px; color:#555;">
            ${f.method}
          </td>
        </tr>
      `;
    }
  });
}
/* ================= VITAMIN D PROFILE ================= */
else if (test.key === "VITD") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key);
    return report[k];
  });
  if (!hasValue) return "";

  /* ===== TITLE ===== */
  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
  `;

  /* ===== TABLE HEAD ===== */
  html += `
    <tr class="test-head">
      <th>TEST DESCRIPTION</th>
      <th>RESULT</th>
      <th>UNITS</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;

  /* ===== SUBTITLE ===== */
  html += `
    <tr class="bio-subtitle">
      <th colspan="4">${test.subtitle}</th>
    </tr>
  `;

  /* ===== MAIN TEST ROWS ===== */
  test.fields.forEach(f => {

    const key = makeKey(testKey, f.key);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

   if (f.ref && f.ref !== "Refer Interpretation") {

  const { flag } = checkFlag(
    result,
    [f.ref],
    patient.gender,
    patient.age
  );

  if (flag) {
    flagHTML = `<span class="flag shift-flag">${flag}</span>`;
    rowClass = "abnormal-value";
  }
}


    /* MAIN ROW */
    html += `
      <tr class="test-row">
        <td>${f.name}</td>
        <td class="td-result ${rowClass}">
          <span class="result-value">${result}</span>
          ${flagHTML}
        </td>
        <td>${f.unit || ""}</td>
        <td style="white-space: pre-line;">${f.ref || ""}</td>
      </tr>
    `;

    /* METHOD ROW */
    if (f.method) {
      html += `
        <tr class="method-row">
          <td colspan="4" style="font-size:12px; padding:2px 6px; color:#555;">
            (${f.method})
          </td>
        </tr>
      `;
    }

  });

  /* ================= INTERPRETATION TABLE ================= */

  if (Array.isArray(test.interpretationTable)) {

    html += `
      <tr>
        <td colspan="4" style="padding-top:10px;">
          <b>Interpretation :</b>
          <table style="width:100%; border-collapse:collapse; margin-top:5px;">
            <tr style="border:1px solid #000; padding:5px; font-size: 12px;">
              <th style="border:1px solid #000; padding:5px;">LEVEL</th>
              <th style="border:1px solid #000; padding:5px;">REFERENCE RANGE</th>
            </tr>
    `;

    test.interpretationTable.forEach(row => {
      html += `
        <tr>
          <td style="border:1px solid #000; padding:5px; font-size: 12px;">
            ${row.level}
          </td>
          <td style="border:1px solid #000; padding:5px;  font-size: 12px;">
            ${row.range}
          </td>
        </tr>
      `;
    });

    html += `
          </table>
        </td>
      </tr>
    `;
  }

  /* ================= DECREASED LEVELS ================= */

  if (Array.isArray(test.decreasedLevels)) {
    html += `
      <tr>
        <td colspan="4" style="padding-top:8px; font-size:10.5px; font-weight: 300;">
          <b>DECREASED LEVELS:</b><br>
          ${test.decreasedLevels.map(i => `- ${i}`).join("<br>")}
        </td>
      </tr>
    `;
  }

  /* ================= INCREASED LEVELS ================= */

  if (Array.isArray(test.increasedLevels)) {
    html += `
      <tr>
        <td colspan="4" style="padding-top:6px; font-size:10px; font-weight: 300;">
          <b>INCREASED LEVELS:</b><br>
          ${test.increasedLevels.map(i => `- ${i}`).join("<br>")}
        </td>
      </tr>
    `;
  }

  /* ================= COMMENTS ================= */

  if (Array.isArray(test.comments)) {
    html += `
      <tr>
        <td colspan="4" style="padding-top:6px; font-size:10.5px; font-weight: 300;
}">
          <b>COMMENTS:</b><br>
          ${test.comments.map(i => `- ${i}`).join("<br>")}
        </td>
      </tr>
    `;
  }
}

/* ================= THYROID PROFILE-II ================= */
else if (test.key === "THYROID2") {

  const hasValue = test.fields.some(f => {
    const k = makeKey(testKey, f.key);
    return report[k];
  });
  if (!hasValue) return "";

  /* TITLE */
  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
  `;

  /* HEAD */
  html += `
    <tr class="test-head">
      <th>TEST DESCRIPTION</th>
      <th>RESULT</th>
      <th>UNITS</th>
      <th>REFERENCE RANGE</th>
    </tr>
  `;

  /* SUBTITLE */
  html += `
    <tr class="bio-subtitle">
      <th colspan="4">${test.subtitle}</th>
    </tr>
  `;

  /* FIELDS */
  test.fields.forEach(f => {

    const key = makeKey(testKey, f.key);
    const result = report[key];
    if (!result) return;

    let flagHTML = "";
    let rowClass = "";

    if (f.ref) {
      const { flag } = checkFlag(
        result,
        [f.ref],
        patient.gender,
        patient.age
      );

      if (flag) {
        flagHTML = `<span class="flag shift-flag">${flag}</span>`;
        rowClass = "abnormal-value";
      }
    }

    html += `
      <tr class="test-row">
        <td style="vertical-align: top !important;" >${f.name}</td>
        <td class="td-result ${rowClass}" style="vertical-align: top !important;" >
          ${result} ${flagHTML}
        </td>
        <td style="vertical-align: top !important;" >${f.unit}</td>
        <td style="white-space:pre-line;">${f.ref}</td>
      </tr>
    `;

    if (f.method) {
      html += `
        <tr class="method-row">
          <td colspan="4" style="font-size:12px; color:#555;">
            (${f.method})
          </td>
        </tr>
      `;
    }

  });

  /* ================= INTERPRETATION ================= */

  const i = test.interpretation;

  html += `
    <tr>
      <td colspan="4" style="padding-top:10px; font-size:12px;">
        <b>Interpretation:</b><br><br>

        <b>Important Note:</b><br>
        ${i.importantNote.map(x => x + "<br>").join("")}
        <br>

        <b>Diurnal Variability:</b> ${i.diurnal}
        <br><br>

        <b>Limitations:</b><br>
        ${i.limitations.map(x => "• " + x + "<br>").join("")}
        <br>

        <b>Please Note:</b> ${i.note}
        <br><br>

        <b>Associated tests:</b> ${i.associated}
      </td>
    </tr>
  `;
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
else if (test.class === "PREGNANCY") {

  const testKey = test.key;

  const pregnancyKey = makeKey(testKey, "URINE PREGNANCY TEST");
  const remarkKey = makeKey(testKey, "REMARK");

  const result = report[pregnancyKey];
  const remark = report[remarkKey];

  // ✅ Hide test if both empty
  if (
    (result === undefined || result === null || result === "") &&
    (remark === undefined || remark === null || remark === "")
  ) {
    return "";
  }

  html += `
    <tr class="test-title">
      <th colspan="2">${test.title}</th>
    </tr>
    <tr class="test-head">
      <th style="width:4%" >Investigation</th>
      <th>Finding</th>
    </tr>
  `;

  if (result) {
    html += `
      <tr class="test-row">
        <td>URINE PREGNANCY TEST</td>
        <td>
          ${result}
          ${result === "POSITIVE" ? '( + )' : result === "NEGATIVE" ? '( - )' : ""}
        </td>
      </tr>
    `;
  }

  if (remark) {
    html += `
      <tr class="test-row">
        <td>REMARK</td>
        <td>: ${remark}</td>
      </tr>
    `;
  }
}
/* ====================== PREVIEW MXMAL ======================*/
 
else if (test.class === "MXMAL") {
console.log(report);
  const testKey = test.key;

  // 🔹 Get values safely
  const getVal = (name) => {
    const v = report[makeKey(testKey, name)];
    return (v !== undefined && v !== null && v !== "") ? v : "";
  };

  const mantoux = getVal("Mantoux Test");
  const induration = getVal("Induration");

  const malariaMain = getVal("Malarial Antigen Detection Test");
  const vivax = getVal("Plasmodium - VIVAX");
  const falci = getVal("Plasmodium - FALCIPARUM");

  const hasMantoux = mantoux || induration;
  const hasMalaria = malariaMain || vivax || falci;

  if (!hasMantoux && !hasMalaria) return;   // ✅ no return ""

  html += `
    <tr class="test-title">
      <th colspan="4">${test.title}</th>
    </tr>
  `;

  // ================= MANTOUX =================
  if (hasMantoux) {

    html += `
      <tr class="test-head">
        <th>TEST</th>
        <th>FINDING</th>
        <th></th>
        <th></th>
      </tr>
      <tr>
        <td>Mantoux Test</td>
        <td><strong>${mantoux}</strong></td>
        <td></td>
        <td>Induration : ${induration} After 48/72 hrs</td>
      </tr>
    `;
  }

  // ================= MALARIA =================
  if (hasMalaria) {

    html += `
      <tr>
        <td colspan="4" style="padding-top:10px; font-weight:600;">
          RAPID MALARIAL ANTIGEN DETECTION TEST
        </td>
      </tr>
    `;

    if (malariaMain) {
      html += `
        <tr>
          <td>Malarial Antigen Detection Test</td>
          <td colspan="3">${malariaMain}</td>
        </tr>
      `;
    }

    if (vivax) {
      html += `
        <tr>
          <td>Plasmodium - VIVAX</td>
          <td colspan="3">${vivax}</td>
        </tr>
      `;
    }

    if (falci) {
      html += `
        <tr>
          <td>Plasmodium - FALCIPARUM</td>
          <td colspan="3">${falci}</td>
        </tr>
      `;
    }

    html += `
      <tr>
        <td colspan="4" style="font-size:12px; padding-top:5px;">
          * Chromatographic Immunoassay to detect P Vivax and P Falciparum Antigens.
        </td>
      </tr>
    `;
  }
}

// ====================== PREVIEW ADA ======================
else if (test.class === "ADA") {

  const testKey = test.key;

  const adaKey = makeKey(testKey, "ADA");
  const sampleKey = makeKey(testKey, "Sample Type");

  const valueRaw = report[adaKey];
  const sampleType = report[sampleKey] || "Serum";

  if (!valueRaw) return;

  const value = parseFloat(valueRaw);

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

    <tr class="test-row">
      
      <td>ADA ( Adenosine Deaminase )</td>
      <td><strong>${value}</strong></td>
      <td>U/L</td>
      <td style="white-space:pre-line;">
Normal - Less than 30
Suspect - 30 - 40
Strong Suspect - 40 - 60
Positive - More than 60
CSF - Normal - Less than 10.00
Positive - More than 10.00
      </td>
    </tr>
  `;
}
// ====================== PREVIEW BETA HCG ======================
else if (test.class === "BHCG") {

  const hcgKey = makeKey(testKey, "β - HCG");
  const sampleKey = makeKey(testKey, "Sample Type");

  const value = report[hcgKey];
  const sample = report[sampleKey] || "";

  if (!value) return;

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

    <tr class="test-row">
     
      <td>β - HCG</td>
       <td><strong>${value}</strong></td>
      <td>mIU/ml</td>
      <td style="white-space:pre-line;">${test.referenceText}</td>
    </tr>

    <tr>
      <td colspan="4"><strong>Sample Type :</strong> ${sample}</td>
    </tr>

    <!-- Week Table Heading -->
    <tr>
      <td colspan="4" style="padding-top:15px;">
        <strong>Weeks post LMP (Last Menstrual Period)</strong>
      </td>
    </tr>

    <tr>
      <td colspan="4">

        <table style="width:100%; border-collapse:collapse;">

          <tr>
            <td style="width:50%; font-weight:bold;">Week of Amenorrhea</td>
            <td style="width:50%; font-weight:bold;">Concentration (mIU/ml)</td>
          </tr>

          ${test.weekTable.map(row => `
            <tr>
              <td>${row.week}</td>
              <td>${row.concentration}</td>
            </tr>
          `).join("")}

        </table>

      </td>
    </tr>
  `;
}

// ====================== PREVIEW FLUID ======================
else if (test.class === "FLUID") {

  const testKey = test.key;

  const heading = report[makeKey(testKey, "Heading")];
  if (!heading) return;

  // 🔹 Main Title
  html += `
    <tr class="test-title">
      <th colspan="2">${heading}</th>
    </tr>

    <tr class="test-head">
      <th style="width:33%">INVESTIGATION</th>
      <th style="width:40%">RESULT</th>
    </tr>
  `;

 
// JSON.parse(localStorage.getItem("report"))
  function addSection(title) {
    html += `
      <tr>
        <td colspan="2" style="padding-top:10px;    line-height: 0.8;">
          <strong>${title}</strong>
        </td>
      </tr>
    `;
  }

  function addRow(name, value, unit = "") {
    if (!value || value.trim() === "") return;

    html += `
      <tr>
        <td style="    line-height: 0.8;" >${name}</td>
        <td style="    line-height: 0.8;">${value} ${unit}</td>
      </tr>
    `;
  }

  // 🔹 GROSS EXAMINATION
  // addSection("GROSS EXAMINATION");

  addRow("Quantity", report[makeKey(testKey,"Quantity")]);
  addRow("Colour", report[makeKey(testKey,"Colour")]);
  addRow("Appearance", report[makeKey(testKey,"Appearance")]);
  addRow("Reaction", report[makeKey(testKey,"Reaction")]);
  addRow("Coagulum", report[makeKey(testKey,"Coagulum")]);

  // 🔹 CHEMICAL EXAMINATION
  addSection("CHEMICAL EXAMINATION");

  addRow("Sugar", report[makeKey(testKey,"Sugar")], "mg/dl");
  addRow("Proteins", report[makeKey(testKey,"Proteins")], "mg/dl");
  addRow("Chlorides", report[makeKey(testKey,"Chlorides")], "m Eq/L");

  // 🔹 MICROSCOPICAL EXAMINATION
  addSection("MICROSCOPICAL EXAMINATION");

  addRow("Total RBC Count", report[makeKey(testKey,"Total RBC Count")]);
  addRow("Total Leucocyte Count", report[makeKey(testKey,"Total Leucocyte Count")], "/cumm");

  // 🔹 DIFFERENTIAL LEUCOCYTE COUNT
  addSection("DIFFERENTIAL LEUCOCYTE COUNT");

  addRow("Lymphocytes", report[makeKey(testKey,"Lymphocytes")], "%");
  addRow("Eosinophils", report[makeKey(testKey,"Eosinophils")], "%");
  addRow("Monocytes", report[makeKey(testKey,"Monocytes")], "%");
  addRow("Basophils", report[makeKey(testKey,"Basophils")], "%");
  addRow("Band Forms", report[makeKey(testKey,"Band Forms")], "%");
  addRow("White Blood Cells", report[makeKey(testKey,"White Blood Cells")]);

  // 🔹 OTHER EXAMINATION
  addSection("OTHER EXAMINATION");

  addRow("Wet Preparation", report[makeKey(testKey,"Wet Preparation")]);
  addRow("Gram Staining", report[makeKey(testKey,"Gram Staining")]);
  addRow("Other", report[makeKey(testKey,"Other")]);
  addRow("India Ink Preparation", report[makeKey(testKey,"India Ink Preparation")]);

// 🔹 IMPRESSION (ALWAYS LAST)
// 🔹 IMPRESSION (ALWAYS LAST)
const impression = report[makeKey(testKey, "Impression")];

if (impression && impression.trim() !== "") {

  html += `
    <tr>
      <td>
        <strong>IMPRESSION :</strong>
      </td>
      <td style="white-space:pre-line;">
        ${impression}
      </td>
    </tr>
  `;
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

  // 🔎 check if this section has any value
  const sectionHasValue = section.fields.some(f => {
    const key = makeKey(testKey, f[0]);
    return report[key];
  });

  // ❌ skip section if no values
  if (!sectionHasValue) return;

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

// baadme 

function renderPreview() {

  // 🔥 IMPORTANT: clear old preview
  pdf.innerHTML = "";

  // reset state
  currentPage = null;
  currentTestsBox = null;
  serologyGroup.length = 0;
  psForMpKey = null;

  /* ================= PAGINATION ================= */



// yaha tk  
selectedTests.forEach(testKey => {

  // const test = Tests[testKey];
  const test = Array.isArray(Tests)
  ? Tests.find(t => t.key === testKey)
  : Tests[testKey];

if (!test) {
  console.error("Test not found:", testKey);
  return;
}

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

}


function downloadColoredPDF() {
  pdf.classList.remove("plain-mode");

  return html2pdf()
    .from(pdf)
    .set({
      margin: 0,
      filename: `${patient.name}_COLORED.pdf`,
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      },
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
      savePdfHistory("COLORED");
    });
}


function downloadPlainPDF() {
  pdf.classList.add("plain-mode");

  return html2pdf()
    .from(pdf)
    .set({
      margin: 0,
      filename: `${patient.name}_PLAIN.pdf`,
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      },
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
      savePdfHistory("PLAIN");
      pdf.classList.remove("plain-mode");
    });
}


/* ================= PDF ================= */

// window.download = async () => {
//   downloadColoredPDF();

//   // small delay so DOM state switches cleanly
//   setTimeout(() => {
//     downloadPlainPDF();
//   }, 600);
// };

window.download = async () => {

  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    alert("Session expired. Please login again.");
    return;
  }

  const userId = sessionData.session.user.id;
  const fromHistory = localStorage.getItem("fromHistory");

  /* ================= NEW REPORT FLOW ================= */

  if (fromHistory !== "1") {

    const result = await saveReport(patient, report, selectedTests);

    if (!result || !result.success) {
      alert("❌ Report save failed. PDF cancelled.");
      return;
    }

    // 🔥 DIRECT DATABASE VERIFICATION
    const { data: verifyData, error } = await supabase
      .from("report_history")
      .select("id")
      .eq("user_id", userId)
      .eq("lrn", result.lrn)
      .maybeSingle();

    if (error || !verifyData) {
      alert("❌ Database verification failed.");
      return;
    }

    alert("✅ Report successfully saved in database (LRN: " + result.lrn + ")");
  }
  else {
    console.log("Opened from history → skip saving");
  }

  /* ================= PDF DOWNLOAD ================= */

  try {
    await downloadColoredPDF();
    alert("🟢 Colored PDF downloaded successfully");
  } catch (e) {
    alert("❌ Colored PDF download failed");
    return;
  }

  try {
    await downloadPlainPDF();
    alert("⚪ Plain PDF downloaded successfully");
  } catch (e) {
    alert("❌ Plain PDF download failed");
    return;
  }

  localStorage.removeItem("fromHistory");
};





document.getElementById("downloadBtn")
  ?.addEventListener("click", download);

