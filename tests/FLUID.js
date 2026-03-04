export default {
  key: "FLUID",
  title: "FLUID EXAMINATION",
  class: "FLUID",
  testname: "FLUID EXAMINATION",

  headings: [
    "REPORT ON CEREBROSPINAL FLUID",
    "REPORT ON ABDOMINAL FLUID EXAMINATION",
    "REPORT ON PLEURAL FLUID EXAMINATION",
    "REPORT ON PERITONEAL FLUID EXAMINATION",
    "REPORT ON PERICARDIAL FLUID EXAMINATION",
    "REPORT ON SYNOVIAL FLUID EXAMINATION"
  ],

  fields: [

    // 🔹 Report Type
    { name: "Heading", type: "select", source: "headings" },

    // 🔹 GROSS
    { name: "Quantity" },
    { name: "Colour", type: "select", options: [
      "Colorless","Dark Pink","Dark Yellow","Pink","Red","Straw","Whitish","Yellow"
    ]},
    { name: "Appearance", type: "select", options: [
      "Clear","Hazy","Slightly Hazy","Turbid"
    ]},
    { name: "Reaction", type: "select", options: [
      "Acidic","Acidic pH 5.0","Acidic pH 5.5","Acidic pH 6.0","Acidic pH 6.5",
      "Neutral pH 7.0","Alkaline pH 7.5","Alkaline pH 8.0",
      "pH 6","Neutral","Alkaline"
    ]},
    { name: "Coagulum" },

    // 🔹 CHEMICAL
    { name: "Sugar", unit: "mg/dl" },
    { name: "Proteins", unit: "mg/dl" },
    { name: "Chlorides", unit: "m Eq/L" },

    // 🔹 MICRO
    { name: "Total RBC Count" },
    { name: "Total Leucocyte Count", unit: "/cumm" },

    // 🔹 DLC
    { name: "Lymphocytes", unit: "%" },
    { name: "Eosinophils", unit: "%" },
    { name: "Monocytes", unit: "%" },
    { name: "Basophils", unit: "%" },
    { name: "Band Forms", unit: "%" },
    { name: "White Blood Cells" },

    // 🔹 OTHER
    { name: "Wet Preparation" },
    { name: "Gram Staining" },
    { name: "Other" },
    { name: "India Ink Preparation" },

    // 🔹 Impression
    { name: "Impression", type: "textarea" }

  ]
};