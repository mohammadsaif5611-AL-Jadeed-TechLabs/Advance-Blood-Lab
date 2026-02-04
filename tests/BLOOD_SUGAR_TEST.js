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
    // {
    //   name: "BLOOD SUGAR RANDOM",
    //   unit: "mg/dl",
    //   ref: "70 - 140",
    //   type: "decimal"
    // },

    // PARALLEL URINE SUGAR (FASTING)
    {
      name: "PARALLEL URINE SUGAR (FASTING)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: ["Absent","Traces","Present +","Present ++","Present +++"]
    },

    // BLOOD SUGAR POSTMEAL WITH SUB-LABEL
    {
      sub: "(AFTER 1 & 1/2 HOURS)"  // 🟢 Sub label for next row
    },
    {
      name: "BLOOD SUGAR POSTMEAL",
      unit: "mg/dl",
      ref: "70 - 160",
      type: "decimal"
    },

    // PARALLEL URINE SUGAR (POSTMEAL)
    {
      name: "PARALLEL URINE SUGAR",
      unit: "",
      ref: "Nil",
      type: "select",
      options: ["Absent","Traces","Present +","Present ++","Present +++"]
    }
  ]
};
