export default {
  key: "BGA",
  title: "REPORT ON BLOOD GAS ANALYSIS",
  subtitle: "",
  class: "BGA",
  testname: "BLOOD GAS ANALYSIS",

  fields: [

    { name: "Temp", unit: "°C", ref: "" },
    { name: "pH", unit: "", ref: "7.20 - 7.60" },
    { name: "pCO2", unit: "mmHg", ref: "30 - 50" },
    { name: "PO2", unit: "mmHg", ref: "70 - 700" },
    { name: "BE", unit: "mmol/L", ref: "2.0 - 3.0" },
    { name: "tCO2", unit: "mmol/L", ref: "22 - 29" },
    { name: "HCO3", unit: "mmol/L", ref: "21 - 28" },
    { name: "BB", unit: "mmol/L", ref: "" },
    { name: "BE(act)", unit: "mmol/L", ref: "2.0 - 3.0" },
    { name: "BE(ecf)", unit: "%", ref: "96 - 97" },
    { name: "stHCO3", unit: "mmol/L", ref: "" },
    { name: "st.pH", unit: "", ref: "" },
    { name: "cH+", unit: "mmol/L", ref: "" },

    { section: "HEMOGLOBIN / OXYGEN STATUS" },

    { name: "tHb", unit: "g/dl", ref: "" },
    { name: "SO2", unit: "%", ref: "" },
    { name: "Hct (c)", unit: "%", ref: "" },
    { name: "SO2 (c)", unit: "%", ref: "" },
    { name: "AaDO2", unit: "mmHg", ref: "" },
    { name: "O2Ct", unit: "vol%", ref: "" },
    { name: "P50(c)", unit: "mmHg", ref: "" }

  ]
};