export default {
  key: "ESR",
  title: "HEMATOLOGY",
  subtitle: "ESR",
  class: "HEMATOLOGYESR",   // ✅ SAME AS RENDERER
  testname: "ESR",
  fields: [
    {
      name: "ESR (end of 1 hr.) Westergren",
      unit: "mm",
      ref: {
        M: "0 - 10",
        F: "0 - 20"
      }
    }
  ]
};
