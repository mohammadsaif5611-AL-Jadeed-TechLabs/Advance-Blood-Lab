import Tests from "../tests/index.js";

function makeKey(testKey, name) {
  return `${testKey}_${name}`
    .replace(/\./g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
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
  window.onlyIntWithComma = function (input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value) {
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    input.value = value;
  };

  // CBC float fields → numbers + single dot
window.onlyIntWithComma = function (input) {
  let value = input.value.replace(/[^0-9]/g, "");
  if (value.length > 3) {
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  input.value = value;
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

// serum sgot test
const isSerumSgotTest = test =>
  test.title?.toLowerCase().includes("biochemistry") &&
  test.subtitle
    ?.toLowerCase()
    .replace(/\./g, "")   // 🔥 dots remove
    .includes("sgot");
// serum sgpt test
const isSerumSgptTest = test =>
  test.title?.toLowerCase().includes("biochemistry") &&
  test.subtitle
    ?.toLowerCase()
    .replace(/\./g, "")   // 🔥 dots remove
    .includes("sgpt");
// serum bilirubin test
const isSerumBilirubinTest = test =>
  test.title?.toLowerCase().includes("biochemistry") &&
  test.subtitle
    ?.toLowerCase()
    .replace(/\./g, "")   // 🔥 dots remove
    .includes("bilirubin");




  // CBC test detection
  const isCBC = title =>
    title.toLowerCase().includes("cbc") ||
    title.toLowerCase().includes("complete blood count");

  // CBC fields needing comma format
  const isCommaField = field =>
    field.includes("leuco") ||
    field.includes("platelet");


function makeFieldKey(testKey, fieldName) {
  return `${testKey}_${fieldName
    .replace(/\./g, "")
    .replace(/\s+/g, "_")
    .toUpperCase()}`;
}

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

    // ====================== TEST SECTIONS ======================
    if (test.sections) {
      test.sections.forEach(section => {
        html += `<h5 class="mt-3 mb-2">${section.name}</h5><div class="grid">`;

        section.fields.forEach(f => {
          html += renderField(test, testKey, f);
        });

        html += `</div>`;
      });
    }


// ====================== BIOCHEMISTRY : BLOOD SUGAR TEST ======================
else if  (isSugarTest(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {
    const name = f.name;
    const sub = f.sub || "";
   const key = makeKey(testKey, f.name);


    // ✅ PARALLEL URINE SUGAR → SELECT
if (f.type === "select") {
  html += `
    <label>${name}</label>
    <select class="input full-row" id="${key}">
      ${f.options.map((opt, i) =>
        `<option value="${opt}" ${i === 0 ? "selected" : ""}>${opt}</option>`
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
          oninput="onlyFloat(this)"
        >
      `;
    }
  });

  html += `</div>`;
}
// ====================== BIOCHEMISTRY : SERUM S G O T TEST ======================
else if (isSerumSgotTest(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {
    const key = makeKey(testKey, f.name);

    html += `
  <label>${f.name}</label>

 <input
  type="text"
  class="input full-row"
  id="${key}"
  inputmode="decimal"
/>


`;

  });

  html += `</div>`;
}
// ====================== BIOCHEMISTRY : SERUM S G P T TEST ======================
else if (isSerumSgptTest(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {
    const key = makeKey(testKey, f.name);

    html += `
  <label>${f.name}</label>

 <input
  type="text"
  class="input full-row"
  id="${key}"
  inputmode="decimal"
/>


`;

  });

  html += `</div>`;
}
// ====================== BIOCHEMISTRY : SERUM BILIRUBIN TEST ======================
else if (isSerumBilirubinTest(test)) {

  html += `<h5 class="mt-3 mb-2">${test.subtitle}</h5><div class="grid">`;

  test.fields.forEach(f => {
    const key = makeKey(testKey, f.name);

    html += `
  <label>${f.name}</label>

 <input
  type="text"
  class="input full-row"
  id="${key}"
  inputmode="decimal"
/>


`;

  });

  html += `</div>`;
}


// ====================== NORMAL TESTS (CBC etc.) ======================
else if (test.fields) {
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

  const key = `${testKey}_${fieldName}`.replace(/\s+/g, "_");

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
const fieldKey = makeFieldKey(testKey, f[0]);
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
  if (!el.id) return;

  const id = el.id.toLowerCase();

  if (id.includes("sgot") || id.includes("sgpt") || id.includes("bilirubin")) {
    let v = el.value;

    // numbers + one dot only
    v = v.replace(/[^0-9.]/g, "");

    const parts = v.split(".");
    if (parts.length > 2) {
      v = parts[0] + "." + parts.slice(1).join("");
    }

    if (v.startsWith(".")) v = "0" + v;

    el.value = v;
  }
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


    localStorage.setItem("report", JSON.stringify(data));
    location.href = "preview.html";
  };

});
