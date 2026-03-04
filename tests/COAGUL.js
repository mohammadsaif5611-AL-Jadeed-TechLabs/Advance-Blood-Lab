export default {
  key: "COAGULATION",
  title: "COAGULATION PROFILE REPORT",
  subtitle: "COAGULATION",
  class: "COAGULATION",
  testname: "COAGULATION",

  fields: [

    { name: "Bleeding Time", unit: "min", ref: "2 - 5" },
    { name: "Clotting Time", unit: "min", ref: "3 - 7" },

    { sub: "ACTIVATED PARTIAL THROMBOPLASTIN TIME (APTT)" },

    { name: "aPTT Patient Value", unit: "seconds", ref: "22 - 35" },
    { name: "aPTT Control Value", unit: "seconds", ref: "" },
    { name: "aPTT Ratio", unit: "", ref: "" },

    { sub: "PROTHROMBIN TIME (PT)" },

    { name: "Patient Value (PT)", unit: "seconds", ref: "11 - 16" },
    { name: "Control Value (CT)", unit: "seconds", ref: "" },
    { name: "Prothrombin Index", unit: "%", ref: "" },
    { name: "Prothrombin Ratio", unit: "", ref: "" },
    { name: "I.S.I. Value", unit: "", ref: "1.0 - 1.4" },
    { name: "International Normalised Ratio (INR)", unit: "", ref: "" },

    { sub: "PLATELET" },

    { name: "Platelet Count", unit: "/cumm", ref: "1,50,000 - 4,50,000" }
  ]
};