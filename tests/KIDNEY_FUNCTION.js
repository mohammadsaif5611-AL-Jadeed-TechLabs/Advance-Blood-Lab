export default {
  key: "KIDNEY_FUNCTION_TEST",
  title: "BIOCHEMISTRY REPORT",
  subtitle: "KIDNEY FUNCTION TEST",
  class: "KIDNEY FUNCTION TEST",
  testname: "KIDNEY FUNCTION TEST",

  fields: [
    { name: "SR. BLOOD UREA", unit: "mg/dl", ref: "10 - 50" },
    { name: "BLOOD UREA NITROGEN", unit: "mg/dl", ref: "7 - 18" },
    { name: "SR. CREATININE", unit: "mg/dl", ref: "0.6 - 1.2" },
    { name: "SR. URIC ACID", unit: "mg/dl", ref: "2.5 - 6.8" },

    // ✅ ELECTROLYTES SUB HEADING
    {
      sub: "ELECTROLYTES"
    },

    { name: "SR. SODIUM", unit: "mmol/L", ref: "135 - 155" },
    { name: "SR. POTASSIUM", unit: "mmol/L", ref: "3.5 - 5.3" },
    { name: "SR. IONIC CALCIUM", unit: "mmol/L", ref: "1.1 - 1.3" },
    { name: "SR. CHLORIDE", unit: "mmol/L", ref: "98 - 106" }
  ]
};
