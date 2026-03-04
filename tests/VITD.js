export default {
  key: "VITD",
  title: "CLINICAL BIOCHEMISTRY",


 
  class: "VITD",
  testname: "FOLATE, VITAMIN B-12,D2,D3",

  subtitle:
    "Folate, Vitamin - B12 & 25-Hydroxy Vitamin D Total (D2 & D3)",

  fields: [
    {
      name: "Folate Serum (Folic Acid)",
      key: "folate",
      unit: "ng/mL",
      ref: `4 - 11 Years: 8.6 - 37.7
12 - 19 Years: 5.0 - 27.2
20 - 59 Years: 4.4 - 31.0
>60 Years: 5.6 - 45.8`
    },
    {
      name: "Vitamin - B12",
      key: "b12",
      unit: "pg/mL",
     
      ref: "200 - 911"
    },
    {
      name: "25-Hydroxy Vitamin D Total (D2,D3)",
      key: "vitd",
      unit: "ng/mL",
      method: "Method: ECLIA",
      ref: "Refer Interpretation"
    }
  ],

  interpretationTable: [
    {
      level: "Deficiency (serious deficient)",
      range: "< 10 ng/ml"
    },
    {
      level: "Insufficiency (Deficient)",
      range: "10 - 30 ng/ml"
    },
    {
      level: "Sufficient (adequate)",
      range: "30 - 70 ng/ml"
    },
    {
      level: "Toxicity",
      range: "> 100 ng/ml"
    }
  ],

  decreasedLevels: [
    "Deficiency in children causes Rickets and in adults leads to Osteomalacia. It can also lead to Hypocalcemia and Tetany.",
    "Inadequate exposure to sunlight.",
    "Dietary deficiency.",
    "Vitamin D malabsorption.",
    "Severe Hepatocellular disease.",
    "Drugs like Anticonvulsants.",
    "Nephrotic syndrome."
  ],

  increasedLevels: [
    "Vitamin D intoxication."
  ],

  comments: [
    "Vitamin D (Cholecalciferol) promotes absorption of calcium and phosphorus and mineralization of bones and teeth. Vitamin D status is best determined by measurement of 25 hydroxy vitamin D, as it is the major circulating form and has longer half life (2-3 weeks) than 1, 25 Dihydronxy vitamin D (5-8 hrs).",
    "The assay measures D3 (Cholecaciferol) metabolites of vitamin D.",
    "25 (OH) D is influenced by sunlight, latitude, skin pigmentation, sunscreen use and hepatic function.",
    "This is the recommended test for evaluation of vitamin D intoxication."
  ]
};
