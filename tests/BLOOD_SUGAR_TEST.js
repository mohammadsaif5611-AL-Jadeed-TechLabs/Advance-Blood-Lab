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
      name: "PARALLEL URINE SUGAR.",
      unit: "",
      ref: "Nil",
      type: "select",
      options: ["Absent","Traces","Present +","Present ++","Present +++"]
    },

    // BLOOD SUGAR POSTMEAL WITH SUB-LABEL
   
    {
      name: "BLOOD SUGAR POSTMEAL",
      unit: "mg/dl",
      ref: "70 - 140",
      type: "decimal"
    },
     {
      sub: "(AFTER 1 & 1/2 HOURS)"  // 🟢 Sub label for next row
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

