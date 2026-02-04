export default {
  title: "HEMATOLOGY",
  class: "HEMATOLOGY",
  testname: "BLOOD GROUP",

  sections: [
    {
      name: "BLOOD GROUP & RH TYPE",
      fields: [
        [
          "BLOOD GROUP & RH TYPE",
          {
            type: "select",
            options: [
              "'A'  Rh  POSITIVE",
              "'A'  Rh  NEGATIVE",
              "'B'  Rh  POSITIVE",
              "'B'  Rh  NEGATIVE",
              "'AB' Rh  POSITIVE",
              "'AB' Rh  NEGATIVE",
              "'O'  Rh  POSITIVE",
              "'O'  Rh  NEGATIVE",
              "OTHER" // 🔥 manual typing
            ]
          }
        ]
      ]
    }
  ]
};
