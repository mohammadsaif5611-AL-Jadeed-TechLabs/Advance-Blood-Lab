// import * as Tests from "../tests/index.js";
import Tests from "../tests/index.js";

console.log("Tests object:", Tests);


document.addEventListener("DOMContentLoaded", () => {

  console.log("main.js loaded", Tests);

  const testBox = document.getElementById("tests");
  const form = document.getElementById("patientForm");

  if (!testBox || !form) {
    alert("HTML IDs missing");
    return;
  }

  Object.keys(Tests).forEach(key => {
    testBox.innerHTML += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${key}">
        <label class="form-check-label">
          ${Tests[key].title}
        </label>
      </div>`;
  });

form.addEventListener("submit", e => {
    e.preventDefault();

    const patient = {
      name: document.getElementById("patient_name").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("sex").value,
      doctor: document.getElementById("ref_by").value,
      sample: document.getElementById("sample").value,
      date: document.getElementById("date").value,
      lrn: document.getElementById("lrn").value
    };

    localStorage.setItem("patient", JSON.stringify(patient));

    const selected = [...document.querySelectorAll("#tests input:checked")]
      .map(i => i.value);

    if (selected.length === 0) {
      alert("Please select at least one test");
      return;
    }

    localStorage.setItem("tests", JSON.stringify(selected));
    window.location.href = "test-input.html";
  });



});
