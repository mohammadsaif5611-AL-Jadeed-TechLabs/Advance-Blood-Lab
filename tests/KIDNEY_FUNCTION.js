export default {
  key: "KIDNEY_FUNCTION_TEST",
  title: "BIOCHEMISTRY REPORT",
  subtitle: "KIDNEY FUNCTION TEST",
  class: "KIDNEY FUNCTION TEST",
  testname: "KIDNEY FUNCTION TEST",

  fields: [
    { name: "BLOOD UREA", unit: "mg/dl", ref: "10 - 40" },
    { name: "BUN", unit: "mg/dl", ref: "2 - 20" }, // 🔥 AUTO
    { name: "SERUM CREATININE", unit: "mg/dl", ref: "0.40 - 1.40" },

    { sub: "ELECTROLYTES" },

    { name: "SERUM SODIUM", unit: "mEq/L", ref: "130 - 149" },
    { name: "SERUM POTASSIUM", unit: "mEq/L", ref: "3.5 - 5.5" },
    { name: "SERUM CHLORIDE", unit: "mEq/L", ref: "98 - 107" },
    { name: "SERUM BICARBONATE", unit: "mEq/L", ref: "23 - 28" },
    { name: "IONIC CALCIUM", unit: "mmol/L", ref: "3.5 - 5.5" }
  ]
};
