export default {
  key: "COOMBS",
  title: "HEMATOLOGY REPORT",
  subtitle: "COOMBS TEST",
  class: "COOMBS TEST",
  testname: "COOMBS TEST",

  fields: [
    {
      name: "DIRECT COOMBS TEST",
      type: "select",
      options: ["POSITIVE", "NEGATIVE"]
    },
    {
      name: "INDIRECT COOMBS TEST",
      type: "select",
      options: ["POSITIVE", "NEGATIVE"]
    }
  ]
};