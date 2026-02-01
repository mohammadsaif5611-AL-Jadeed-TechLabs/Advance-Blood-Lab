export default {
  title: "BIOCHEMISTRY REPORT",
  testname: "BLOOD SUGAR TEST",
  subtitle: "BLOOD SUGAR TEST",
  fields: [
    {
      name: "BLOOD SUGAR FASTING",
      unit: "mg/dl",
      ref: "70 - 110",
      type: "decimal"
    },

    // ✅ PARALLEL URINE SUGAR (FASTING)
  {
  name: "PARALLEL URINE SUGAR (FASTING)",
  unit: "",
  ref: "Nil",
  type: "select",
  options: ["Absent","Traces","Present +","Present ++","Present +++"]
},

    {
      name: "BLOOD SUGAR POSTMEAL",
      sub: "(AFTER 1 & 1/2 HOURS)",
      unit: "mg/dl",
      ref: "70 - 160",
      type: "decimal"
    },

    // ✅ PARALLEL URINE SUGAR (POSTMEAL)
  {
  name: "PARALLEL URINE SUGAR (POSTMEAL)",
  unit: "",
  ref: "Nil",
  type: "select",
  options: ["Absent","Traces","Present +","Present ++","Present +++"]
}
  ]
};
