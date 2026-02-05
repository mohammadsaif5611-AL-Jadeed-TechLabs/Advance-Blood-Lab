import Tests from "../tests/index.js";

function makeKey(testKey, name) {
  return `${testKey}_${name}`
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase();
}



// function makeKey(testKey, name) {
//   return `${testKey}_${name}`
//     .replace(/[^\w]/g, "_")
//     .replace(/_+/g, "_")
//     .toUpperCase();
// }

function renderSerologyFields(fields = [], subtitles = []) {

  // 🔹 subtitles
  (subtitles || []).forEach(s => {
    html += `
      <div class="full-row bio-subtitle">${s}</div>
    `;
  });

  // 🔹 fields
  fields.forEach(f => {

    const name   = f.name || f[0];
    const config = f.type ? f : (f[1] || {});
    const key = makeKey(testKey, name);

    if (config.type === "select") {
      html += `
        <label>${name}</label>
        <select class="input full-row" id="${key}">
          <option value=""></option>
          ${(config.options || []).map(o =>
            `<option value="${o}">${o}</option>`
          ).join("")}
        </select>
      `;
    } else {
      html += `
        <label>${name}</label>
        <input type="text"
               class="input full-row"
               id="${key}">
      `;
    }
  });

  // 🔹 paragraphs
  const paraKey = fields === arguments[0] ? "para" : "para2";
  (section[paraKey] || []).forEach(p => {
    html += `
      <div class="full-row bio-para">${p}</div>
    `;
  });
}


document.addEventListener("DOMContentLoaded", () => {

  // ====================== BASIC DATA ======================
  const patient = JSON.parse(localStorage.getItem("patient"));
  const selected = JSON.parse(localStorage.getItem("tests")) || [];
  const form = document.getElementById("testForm");

  document.getElementById("patientInfo").innerText =
    `${patient.name} | Age: ${patient.age} | ${patient.gender}`;

  const data = {};

  // ====================== STRICT INPUT HANDLERS (CBC) ======================

  // TLC & Platelets → numbers + commas
  // window.onlyIntWithComma = function (input) {
  //   let value = input.value.replace(/[^0-9]/g, '');
  //   if (value) {
  //     value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //   }
  //   input.value = value;
  // };

  // CBC float fields → numbers + single dot
window.onlyIntWithComma = function (input) {
  let value = input.value.replace(/[^0-9]/g, "");

  if (value.length <= 3) {
    input.value = value;
    return;
  }

  const lastThree = value.slice(-3);
  const otherNumbers = value.slice(0, -3);

  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    "," +
    lastThree;

  input.value = formatted;
};

window.onlyFloatDot = function (input) {
  let value = input.value;

  value = value.replace(/[^0-9.]/g, "");

  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  if (value.startsWith(".")) {
    value = "0" + value;
  }

  input.value = value;
};


function sanitizeSGOT(value) {
  if (!value) return "";

  // remove everything except digits & dot
  value = value.replace(/[^0-9.]/g, "");

  // allow only one dot
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  // dot se start na ho
  if (value.startsWith(".")) value = "0" + value;

  return value;
}



  // ====================== TOGGLE OTHER INPUT (URINE) ======================
  window.toggleOther = function (select) {
    const otherInput = document.getElementById(select.id + "_other");
    if (!otherInput) return;

    if (select.value === "OTHER") {
      otherInput.style.display = "block";
    } else {
      otherInput.style.display = "none";
      otherInput.value = "";
    }
  };

  // ====================== FIELD TYPE HELPERS ======================
// sugar test 
const isSugarTest = test =>
  test.title?.toLowerCase().includes("biochemistry") &&
  test.subtitle?.toLowerCase().includes("sugar");


  // BIOCHEM---LIVERFUNCTION
const isLFT = test =>
  String(test.class || "").toUpperCase() === "LIVER FUNCTION TEST";

  // BIOCHEM---KIDNEYFUNCTION
const isKFT = test =>
  String(test.class || "").toUpperCase() === "KIDNEY FUNCTION TEST";

  // SEROLOGY ---CRP
const isCRP = test =>
  String(test.class || "").toUpperCase() === "CRP SEROLOGY TEST";

  // SEROLOGY ---CRP
const isSEROLOGY = test =>
  String(test.class || "").toUpperCase() === "SEROLOGY TEST";

  //HEMATOLOGYESR
const isESR = test =>
  String(test.key || "").toUpperCase() === "ESR";



  // CBC test detection
  const isCBC = title =>
    title.toLowerCase().includes("cbc") ||
    title.toLowerCase().includes("complete blood count");

  // CBC fields needing comma format
  const isCommaField = field =>
    field.includes("leuco") ||
    field.includes("platelet");


// function makeFieldKey(testKey, fieldName) {
//   return `${testKey}_${fieldName
//     .replace(/\./g, "")
//     .replace(/\s+/g, "_")
//     .toUpperCase()}`;
// }

  // ====================== RENDER TESTS ======================

  selected.forEach(testKey => {
    const test = Tests[testKey];
    if (!test) return;

    // Main test heading
    form.insertAdjacentHTML(
      "beforeend",
      `<h3 class="mt-4 mb-2">${test.title}</h3>`
    );

    let html = `<div class="card p-3">`;

    // ====================== SEROLOGY : CRP & RA TEST (FORM) ======================
if (isCRP(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5>
           <div class="grid">`;

 test.fields.forEach(f => {
  if (!f.name) return;
  const key = makeKey(testKey, f.name);


    html += `
      <label>${f.name}</label>
      <input
        type="text"
        class="input full-row lft-input"
        id="${key}"
        inputmode="decimal"
      />
    `;
  });

  html += `</div>`;
}

    // ====================== TEST SECTIONS ======================
  else if (test.sections && !isSEROLOGY(test)) {

      test.sections.forEach(section => {
        html += `<h5 class="mt-3 mb-2">${section.name}</h5><div class="grid">`;

        section.fields.forEach(f => {
          html += renderField(test, testKey, f);
        });

        html += `</div>`;
      });
    }


// ====================== BIOCHEMISTRY: BLOOD SUGAR TEST ======================
else if  (isSugarTest(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

 test.fields.forEach(f => {

  // ❌ skip sub-only rows in FORM
  if (!f.name) return;

  const name = f.name;
  const sub = f.sub || "";
  const key = makeKey(testKey, f.name);


    // ✅ PARALLEL URINE SUGAR → SELECT
if (f.type === "select") {
  html += `
    <label>${name}</label>
    <select class="input full-row" id="${key}">
      <option value="">Select</option>
      ${f.options.map(opt =>
        `<option value="${opt}">${opt}</option>`
      ).join("")}
    </select>
  `;
}


    // ✅ BLOOD SUGAR INPUT
    else {
      html += `
        <label>
          ${name}
          ${sub ? `<br><span class="sub-label">${sub}</span>` : ""}
        </label>
        <input
          type="text"
          class="input full-row"
          id="${key}"
           inputmode="decimal"
           oninput="onlyFloatDot(this)""
        >
      `;
    }
  });

  html += `</div>`;
}

// ====================== BIOCHEMISTRY : LIVER FUNCTION TEST ======================
else if (isLFT(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {
    const key = makeKey(testKey, f.name);

    html += `
      <label>${f.name}</label>
     <input
  type="text"
  class="input full-row lft-input"
  id="${key}"
  inputmode="decimal"
/>

    `;
  });

  html += `</div>`;
}
// ====================== HEMATOLOGY : ESR TEST ======================
else if (isESR(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {

    // ✅ SUB HEADING (ELECTROLYTES)
    if (f.sub) {
      html += `
        <div class="full-row sub-heading">
          ${f.sub}
        </div>
      `;
      return; // 🔥 important: input mat banao
    }

    const key = makeKey(testKey, f.name);

    html += `
      <label>${f.name}</label>
      <input
        type="text"
        class="input full-row lft-input"
        id="${key}"
        inputmode="decimal"
      />
    `;
  });

  html += `</div>`;
}
// ====================== BIOCHEMISTRY : KIDNEY FUNCTION TEST ======================
else if (isKFT(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {

    // ✅ SUB HEADING (ELECTROLYTES)
    if (f.sub) {
      html += `
        <div class="full-row sub-heading">
          ${f.sub}
        </div>
      `;
      return; // 🔥 important: input mat banao
    }

    const key = makeKey(testKey, f.name);

    html += `
      <label>${f.name}</label>
      <input
        type="text"
        class="input full-row lft-input"
        id="${key}"
        inputmode="decimal"
      />
    `;
  });

  html += `</div>`;
}

   
   // ====================== SEROLOGY : ALL TEST (FORM) ===============
   // ====================== SEROLOGY : MULTI CHECKBOX FORM =========

else if (isSEROLOGY(test)) {

  html += `
    <h5 class="mt-3 mb-2">${test.subtitle}</h5>
    <div class="full-row"><b>Select Serology Tests</b></div>
  `;

  // 🔹 checkbox list
 test.sections.forEach((section, index) => {
  html += `
    <label class="full-row sero-checkbox">
      <input type="checkbox"
             class="sero-check"
             data-test="${testKey}"
             data-index="${index}">
      ${section.name}
    </label>

    <div class="full-row sero-divider"></div>
  `;
});


  html += `<div class="">`;

// 🔹 hidden forms
test.sections.forEach((section, index) => {
  html += `
   <div class="serology-section"
     data-test="${testKey}"
     data-index="${index}"
     style="display:none">

  <div class="full-row sub-heading sero-title">
    ${section.name}
  </div>

  <div class="full-row sero-line"></div>

  `;

  (section.fields || []).forEach(f => {
    const name   = f.name || f[0];
    const config = f.type ? f : (f[1] || {});

    // 🔹 Skip fixed fields PARATYPHI A/B
    const skipFixed = section.name.toUpperCase().includes("WIDAL") &&
                      (name.toUpperCase().includes("PARATYPHI       A") ||
                       name.toUpperCase().includes("PARATYPHI       B"));
    if (skipFixed) return;

    const key = makeKey(testKey, name);

    if (config.type === "select") {
      html += `
        <label>${name}</label>
        <select class="input full-row" id="${key}">
          <option value=""></option>
          ${(config.options || []).map(o => `<option value="${o}">${o}</option>`).join("")}
        </select>
      `;
    } else {
      html += `
        <label>${name}</label>
        <input type="text" class="input full-row" id="${key}">
      `;
    }
  });

  // 🔹 Add WIDAL RESULT input
  (section.result || []).forEach(r => {
    if (!r) return;
    const name  = r.name || "Result";
    const key   = makeKey(testKey, name);
    const value = r.default || "";

    html += `
      <label>${name}</label>
      <input type="text" class="input full-row" id="${key}" value="${value}">
    `;
  });




/* ===== DENGUE IgG / IgM SECOND BLOCK ===== */
if (section.fields2 && section.fields2.length) {

  // subtitle
  (section.sub2 || []).forEach(s => {
    html += `
      <div class="full-row bio-subtitle">${s}</div>
    `;
  });

  section.fields2.forEach(f => {

    const name   = f.name || f[0];
    const config = f.type ? f : (f[1] || {});
    const key = makeKey(testKey, name);

    if (config.type === "select") {
      html += `
        <label>${name}</label>
        <select class="input full-row" id="${key}">
          <option value=""></option>
          ${(config.options || []).map(o =>
            `<option value="${o}">${o}</option>`
          ).join("")}
        </select>
      `;
    } else {
      html += `
        <label>${name}</label>
        <input
          type="text"
          class="input full-row"
          id="${key}">
      `;
    }
  });
}



    html += `</div>`;
  });

  html += `</div>`;
}


// ====================== NORMAL TESTS (CBC etc.) ======================
else if (test.fields && !isCRP(test)) {

  html += `<h5 class="mt-3 mb-2">${test.testname} Values</h5><div class="grid">`;

  test.fields.forEach(f => {
    html += renderField(test, testKey, f);
  });

  html += `</div>`;
}


    html += `</div>`;
    form.insertAdjacentHTML("beforeend", html);
  });

  // ====================== FIELD RENDERER (CORE LOGIC) ======================
  function renderField(test, testKey, f) {

      // SUPPORT BOTH ARRAY & OBJECT
  const fieldName = f.name || f[0];
  const unit = f.unit || f[1];
  const type = f.type || "text";

 const key = makeKey(testKey, fieldName);


    // const key = `${testKey}_${f[0]}`;
    // const fieldName = f[0].toLowerCase();

    // ====================== CBC TEST FIELDS ======================
    if (isCBC(test.title)) {

  const lname = fieldName.toLowerCase();

  if (isCommaField(lname)) {
    return `
      <label>${fieldName}</label>
      <input type="text"
             class="input full-row"
             id="${key}"
             inputmode="numeric"
            oninput="onlyIntWithComma(this)">
    `;
  }

  return `
    <label>${fieldName}</label>
    <input type="text"
           class="input full-row"
           id="${key}"
           inputmode="decimal"
           oninput="onlyFloatDot(this)">
  `;
}



    // ====================== URINE ANALYSIS FIELDS ======================
    if (test.title.toLowerCase().includes("urine")) {
const fieldKey = makeKey(testKey, f[0]);

      // If URINE.js field is defined as SELECT with options
      if (typeof f[1] === "object" && f[1].type === "select") {
        return `
          <label>${f[0]}</label>
          <select class="input full-row" id="${fieldKey}" onchange="toggleOther(this)">
            ${f[1].options.map(opt =>
              `<option value="${opt}">${opt}</option>`
            ).join("")}
            <option value="OTHER">Other</option>
          </select>
         <input
  type="text"
  class="input full-row"
  id="${fieldKey}_other"
  placeholder="Specify ${f[0]}"
  style="display:none">

        `;
      }

      // Text-type urine fields (Quantity, Nature, Reaction etc.)
      return `
        <label>${f[0]}</label>
        <input type="text"
               class="input full-row"
               id="${fieldKey}"
  value="${f[1]?.default || ""}">
      `;
    }

    // ====================== PS FOR MP (HEMATOLOGY) ======================
if (
  test.title?.toUpperCase().includes("HEMATOLOGY") &&
  (
    fieldName.toUpperCase().includes("PS FOR MP") ||
    fieldName.toUpperCase().includes("BLOOD GROUP")
  ) &&
  f[1]?.type === "select"
) {
  return `
    <label>${fieldName}</label>
    <select
      class="input full-row"
      id="${key}"
      onchange="toggleOther(this)"
    >
      ${f[1].options.map(opt =>
        `<option value="${opt}">${opt}</option>`
      ).join("")}
    </select>

    <input
      type="text"
      class="input full-row"
      id="${key}_other"
      placeholder="Specify PS For MP"
      style="display:none"
    >
  `;
}


    // ====================== DEFAULT TEST FIELDS ======================
    return `
      <label>${f[0]}</label>
      <input type="text"
             class="input full-row"
             id="${key}"
             placeholder="${f[0]}">
    `;
  }

// 🔒 SGOT hard lock (typing + paste + mobile safe)
document.addEventListener("input", e => {
  const el = e.target;

  if (!el.classList.contains("lft-input")) return;

  let v = el.value;

  // ✅ ONLY digits + single dot
  v = v.replace(/[^0-9.]/g, "");

  const parts = v.split(".");
  if (parts.length > 2) {
    v = parts[0] + "." + parts.slice(1).join("");
  }

  if (v.startsWith(".")) v = "0" + v;

  el.value = v;
});



document.addEventListener("change", e => {

  let selectedSerology =
  JSON.parse(localStorage.getItem("selectedSerology")) || {};


  if (!e.target.classList.contains("sero-check")) return;

  const testKey = e.target.dataset.test;
  const index = e.target.dataset.index;

  selectedSerology[testKey] = selectedSerology[testKey] || [];

  const section = document.querySelector(
    `.serology-section[data-test="${testKey}"][data-index="${index}"]`
  );

  if (e.target.checked) {
    section.style.display = "grid";

    if (!selectedSerology[testKey].includes(index)) {
      selectedSerology[testKey].push(index);
    }

  } else {
    section.style.display = "none";

    // ❌ data clear
    section.querySelectorAll("input, select").forEach(el => {
      el.value = "";
    });

    selectedSerology[testKey] =
      selectedSerology[testKey].filter(i => i !== index);
  }

  localStorage.setItem(
    "selectedSerology",
    JSON.stringify(selectedSerology)
  );
});


  // ====================== SAVE & NEXT ======================
  window.next = () => {
   document.querySelectorAll("select").forEach(sel => {
  if (!sel.id) return;

  if (sel.value === "OTHER") {
    const otherInput = document.getElementById(sel.id + "_other");
    if (otherInput && otherInput.value.trim() !== "") {
      data[sel.id] = otherInput.value.trim(); // ✅ REAL VALUE
    } else {
      data[sel.id] = "OTHER";
    }
  } else {
    data[sel.id] = sel.value;
  }
});

document.querySelectorAll("input").forEach(inp => {
  if (
    inp.id &&
    !inp.id.endsWith("_other") &&
    inp.type !== "select-one"   // 🔥 IMPORTANT
  ) {
    data[inp.id] = inp.value;
  }
});

// 🔥 WIDAL FIXED VALUES (AUTO)
// Object.keys(Tests).forEach(testKey => {
//   const test = Tests[testKey];
//   if (!test?.sections) return;

//   test.sections.forEach(section => {
//     if (!section.name.toUpperCase().includes("WIDAL")) return;

//     section.fields.forEach(f => {
//       const name = f.name || f[0];

//       if (
//         name.toUpperCase().includes("PARATYPHI       A") ||
//         name.toUpperCase().includes("PARATYPHI       B")
//       ) {
//         const key = makeKey(testKey, name);
//         data[key] = "No Agglutination"; // ✅ permanent value
//       }
//     });
//   });
// });


localStorage.setItem(
  "selectedSerology",
  JSON.stringify(
    JSON.parse(localStorage.getItem("selectedSerology")) || {}
  )
);

    localStorage.setItem("report", JSON.stringify(data));
    location.href = "preview.html";
  };

});
