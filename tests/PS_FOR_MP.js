export default {
  title: "HEMATOLOGY",
  class: "HEMATOLOGY",
  testname: "PS FOR MP",

  sections: [
    {
      name: "PS FOR MP",
      fields: [
        [
          "PS FOR MP",
          {
            type: "select",
            options: [
              ": No malarial Parasite Seen", // ✅ normal
              "Positive",
              "OTHER" // 🔥 important
            ]
          }
        ]
      ]
    }
  ]
};
