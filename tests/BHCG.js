export default {
  key: "BHCG",
  title: "β - HCG REPORT",
  class: "BHCG",
  testname: "BETA HCG",

  fields: [
    { name: "β - HCG", unit: "mIU/ml" },
    { 
      name: "Sample Type",
      type: "select",
      options: ["Random", "Morning", "Afternoon", "Evening"]
    }
  ],

  referenceText: `
Negative - Less than 5.0
Sample - MORNING Early Preg. - 5 - 25
Positive - More than 25
`,

  weekTable: [
    { week: "1 - 10 weeks", concentration: "201.64 - More than 225000 mIU/ml" },
    { week: "11 - 15 weeks", concentration: "22536 - More than 225000 mIU/ml" },
    { week: "16 - 22 weeks", concentration: "8006.62 - 50238.60 mIU/ml" },
    { week: "23 - 40 weeks", concentration: "1599.80 - 49412.65 mIU/ml" }
  ]
};