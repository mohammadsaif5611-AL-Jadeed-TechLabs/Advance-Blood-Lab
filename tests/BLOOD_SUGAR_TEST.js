const urineOptions = [
  "Absent","Traces","F.Traces","Present +","Present ++","Present +++",
  "Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"
];

export default {
  title: "BIOCHEMISTRY REPORT",
  testname: "BLOOD SUGAR TEST",
  subtitle: "BLOOD SUGAR TEST",
  fields: [

    { section: "FASTING" },

    {
      name: "BLOOD SUGAR FASTING",
      unit: "mg/dl",
      ref: "70 - 110",
      type: "decimal"
    },
    {
      name: "PARALLEL URINE SUGAR (FASTING)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: urineOptions
    },
    {
      name: "PARALLEL URINE KETONE (FASTING)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: urineOptions
    },

    { section: "POST BREAKFAST" },

    {
      name: "BLOOD SUGAR POST BREAKFAST",
      unit: "mg/dl",
      ref: "Upto 150",
      type: "decimal"
    },

    { section: "POSTMEAL" },

    {
      name: "BLOOD SUGAR POSTMEAL",
      unit: "mg/dl",
      ref: "70 - 160",
      type: "decimal"
    },
    { sub: "(AFTER 1 & 1/2 HOURS)" },

    {
      name: "PARALLEL URINE SUGAR (POSTMEAL)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: urineOptions
    },
    {
      name: "PARALLEL URINE KETONE (POSTMEAL)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: urineOptions
    },

    { section: "RANDOM" },

    {
      name: "BLOOD SUGAR RANDOM",
      unit: "mg/dl",
      ref: "70 - 140",
      type: "decimal"
    },
    {
      name: "PARALLEL URINE SUGAR (RANDOM)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: urineOptions
    },
    {
      name: "PARALLEL URINE KETONE (RANDOM)",
      unit: "",
      ref: "Nil",
      type: "select",
      options: urineOptions
    }

  ]
};