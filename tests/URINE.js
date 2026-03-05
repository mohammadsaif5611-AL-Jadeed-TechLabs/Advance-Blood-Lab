
export default {
  title: "URINE ANALYSIS REPORT",
  testname: "URINE ANALYSIS REPORT",

  sections: [
    {
      name: "PHYSICAL EXAMINATION",
      fields: [
        ["QUANTITY", { type: "text", default: "10 ML" }],

        ["COLOUR", {
          type: "select",
          options: ["Pale Yellow", "Yellow", "Reddish", "Colorless", "Hard Colored", "Light Yellow", "Dark Yellow", "Whitish"]
        }],

      

        ["NATURE", {
          type: "select",
          options: ["Random", "Morning", "Post Meal", "Fasting"]
        }],
        ["APPEARANCE", {
          type: "select",
          options: ["Clear", "TURBID", "S TURBID", "Hazy", "Cloudy"]
        }],

        ["REACTION", { type: "select",
           options: ["Acidic", "Acidic pH 5.0",, "Acidic pH 5.5", "Acidic pH 6.0", "Acidic pH 6.5", "Neutral pH 7.0", "Alkaline pH 7.5", "Alkaline pH 8.0", "Alkaline pH 8.5", "Alkaline", "Neutral", "pH 5.0", "pH 5.5", "pH 6.0", "pH 6.5", "pH 7.0", "pH 7.5", "pH 8.0"]
          }]
      ]
    },

    {
      name: "CHEMICAL EXAMINATION",
      fields: [
        ["ALBUMIN", {
          type: "select",
          options: ["NIL", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        }],
        ["SUGAR", {
          type: "select",
           options: ["NIL", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        }],
        ["BILE SALT", {
          type: "select",
           options: ["Absent", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        }],
        ["BILE PIGMENT", {
          type: "select",
           options: ["Absent", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        }],
        ["KETONE BODIES", {
          type: "select",
           options: ["NIL", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        }],
        ["BILIRUBIN", {
          type: "select",
           options: ["NIL", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        }],
        // ["UROBILINOGEN", {
        //   type: "select",
        //    options: ["NIL", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        // }],
        // ["REDUCING SUBSTANCE", {
        //   type: "select",
        //    options: ["NIL", "Increased","Traces", "Present +", "Present ++", "Present +++","Present 0.5%","Present 1%","Present 1.5%","Present 2%","Present 0.5 gm %","Present 1 gm %","Present 1.5 gm %","Present 2 gm %"]
        // }]
      ]
    },

    {
      name: "MICROSCOPIC EXAMINATION",
      fields: [
        ["R.B.C.", {
          type: "select",
          options: ["NIL", "Occasional/hpf", "Present", "1-2/hpf", "2-4/hpf", "5-10/hpf", "10-15/hpf", "15-20/hpf", "Plenty"]
        }],
        ["PUS CELLS", {
          type: "select",
          options: ["NIL", "Occasional/hpf", "Present", "1-2/hpf", "2-4/hpf", "5-10/hpf", "10-15/hpf", "15-20/hpf", "Plenty"]
        }],
        ["EPITHELIAL CELLS", {
          type: "select",
          options: ["NIL", "Occasional/hpf", "Present", "1-2/hpf", "2-4/hpf", "5-10/hpf", "10-15/hpf", "15-20/hpf", "Plenty"]
        }],
        ["AMORPHOUS MATERIAL", {
          type: "select",
          options: ["Absent", "Traces", "Present"]
        }],
        ["BACTERIA", {
          type: "select",
          options: ["NIL", "Present"]
        }],
        ["CAST", {
          type: "select",
          options: ["NIL", "Absent"]
        }],
        ["CRYSTALS", {
          type: "select",
           options: ["NIL", "Occasional/hpf", "Present", "1-2/hpf", "2-4/hpf", "5-10/hpf", "10-15/hpf", "15-20/hpf", "Plenty"]
        }],
        ["OTHER FINDINGS", {
          type: "select",
          options: ["NIL", "Absent"]
        }]
      ]
    }
  ]
};
