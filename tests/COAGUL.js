export default {
  key: "COAGULATION",
  title: "COAGULATION PROFILE REPORT",
  subtitle: "COAGULATION",
  class: "COAGULATION",
  testname: "COAGULATION",

  fields: [
    { name: "Bleeding Time", unit: "m/s", ref: "2 - 5 min." },
    { name: "Clotting Time", unit: "m/s", ref: "3 - 7 min." },

    // ✅ ELECTROLYTES SUB HEADING
    {
      sub: "PROTHROMBIN TIME (PT)"
    },

    { name: "Patient Value (PT)", unit: "seconds", ref: "11 - 16" },
    { name: "Control Value (CT)", unit: "seconds", ref: "" },
    { name: "Prothrombin Index", unit: "%", ref: ""  },
    { name: "Prothrombin Ratio", unit: "", ref: "" },
    { name: "I.S.I. Value",  unit: "", ref: ""  },
    { name: "International Normalised Ratio (INR)",  unit: "", ref: "" },
  ]
};

