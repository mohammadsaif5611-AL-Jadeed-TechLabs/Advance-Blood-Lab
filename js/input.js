
import Tests from "../tests/index.js";


document.addEventListener("DOMContentLoaded", () => {

  const patient = JSON.parse(localStorage.getItem("patient"));
  const selected = JSON.parse(localStorage.getItem("tests")) || [];
  const form = document.getElementById("testForm");

  document.getElementById("patientInfo").innerText =
    `${patient.name} | Age: ${patient.age} | ${patient.gender}`;

  const data = {};

  selected.forEach(testKey => {
    const test = Tests[testKey];

    // ================= CBC =================
    if (test.fields) {
      form.innerHTML += `
        <h5 class="mt-4">${test.title}</h5>
        <table class="table table-bordered">
          <tr>
            <th>Investigation</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Reference</th>
          </tr>
      `;

      test.fields.forEach(f => {
        const key = `${testKey}_${f[0]}`;
        form.innerHTML += `
          <tr>
            <td>${f[0]}</td>
            <td><input class="form-control" id="${key}"></td>
            <td>${f[1]}</td>
            <td>${f[2]}</td>
          </tr>
        `;
      });

      form.innerHTML += `</table>`;
    }

    // ================= URINE =================
    if (test.sections) {
      form.innerHTML += `<h5 class="mt-4">${test.title}</h5>`;

      test.sections.forEach(section => {
        form.innerHTML += `
          <h6 class="mt-3">${section.name}</h6>
          <table class="table table-bordered">
            <tr>
              <th>Investigation</th>
              <th>Result</th>
            </tr>
        `;

        section.fields.forEach(f => {
          const key = `${testKey}_${f[0]}`;
          form.innerHTML += `
            <tr>
              <td>${f[0]}</td>
              <td><input class="form-control" id="${key}"></td>
            </tr>
          `;
        });

        form.innerHTML += `</table>`;
      });
    }
  });

  // ================= SAVE & NEXT =================
  window.next = () => {
    document.querySelectorAll("input").forEach(i => {
      data[i.id] = i.value;
    });

    localStorage.setItem("report", JSON.stringify(data));
    location.href = "preview.html";
  };

});
