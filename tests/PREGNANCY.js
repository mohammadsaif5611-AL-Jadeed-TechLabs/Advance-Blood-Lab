export default {
  key: "PREG",
  title: "PREGNANCY TEST",
  class: "PREGNANCY",
  testname: "PREGNANCY TEST",

  fields: [
    {
      name: "URINE PREGNANCY TEST",
      type: "select",
      options: ["", "POSITIVE", "NEGATIVE"],
    },
    {
      name: "REMARK",
      type: "text",
    }
  ]
};