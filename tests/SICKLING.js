export default {
  key: "SICK",
  title: "HEMATOLOGY REPORT",
  subtitle: "SICKLING TEST",
  class: "SICKLING",
  testname: "SICKLING TEST",

  fields: [
    {
      name: "EARLY",
      type: "select",
      options: ["POSITIVE", "NEGATIVE", "Few Tactoid Form Seen"]
    },
    {
      name: "LATE",
      type: "select",
      options: ["POSITIVE", "NEGATIVE", "Few Tactoid Form Seen"]
    },
    {
      name: "SOLUBILITY",
      type: "select",
      options: ["POSITIVE", "NEGATIVE", "Few Tactoid Form Seen"]
    }
  ]
};