
export default {
  key: "CRP_RA",
  title: "SEROLOGY REPORT",
  subtitle: "CRP & RA SEROLOGY TEST",
  class: "CRP SEROLOGY TEST",
  testname: "CRP & RA SEROLOGY TEST",

  fields: [
    // ✅ CRP
    {
      name: "'C' Reactive Proteins ( CRP )",
      unit: "mg/dl",
      // ref: "0 - 6"
      ref: "Upto 6.0"
    },

    // ✅ CRP SUB INFO (PREVIEW ONLY)
    { sub: "(Quantitative)" },
    { sub: "Method - Immunoturbidometry" },
    {
      para:
        "Diagnostic reagent kit for detection of C-Reactive Protein (CRP) in human serum by Quantitative and Semi Quantitative method. " +
        "Note: CRP are acute phase reactant proteins and rise early in any inflammation. " +
        "CRP levels above 10 mg/dl are usually considered pathological. " +
        "Viral and mild bacterial infections generally give low to moderate increase in CRP concentration (up to 50 mg/dl), " +
        "while extensive bacterial infections usually show a pronounced increase more than 50 mg/dl."
    },

    // ✅ RA
    {
      name: "S Rheumatoid Factor (RA)",
      unit: "IU/ml",
      // ref: "0 - 30"
      
      ref: "Upto 30 "
    },

    // ✅ RA METHOD
    // { sub: "Method - Immunoturbidometry" }
  ]
};
