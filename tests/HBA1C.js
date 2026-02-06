export default {
  key: "HBA",
  title: "CLINICAL BIOCHEMISTRY",
  subtitle: "Glycosylated Hemoglobin (GHb/HBA1c)",
  class: "GHb/HBA1c",
  testname: "GHb/HBA1c",

  fields: [
    {
      name: "HbA1c",
      unit: "%",
      ref: "Non-Diabetic: ≤ 5.6 | Pre Diabetic: 5.7 - 6.4 | Diabetic: ≥ 6.5"
    },
    {
      name: "Estimated Average Glucose (eAG)",
      unit: "%",
      ref: "70 - 136"
    }
  ],

  after: [
    "Note: Glucose combines with hemoglobin continuously and nearly irreversibly during the life-span of red blood corpuscles (120 days); thus glycated hemoglobin is proportional to mean plasma glucose level during the previous 6–12 weeks.",

  
    "REFERENCE RANGE—",
    "NON-DIABETIC: 4.4 - 6.0%",
    "EXCELLENT CONTROL: 4.4 - 6.7%",
    "GOOD CONTROL: 6.7 - 7.3%",
    "FAIR CONTROL: 7.3 - 9.1%",
    "POOR CONTROL: > 9.1%",
   
    "NYCOCARD HbA1c is standardised according to the recommendations of the ERL (European Reference Laboratory). Measurement of glycosylated haemoglobin has proven to be an important tool in determining the quality of metabolic control."
  ]
};
