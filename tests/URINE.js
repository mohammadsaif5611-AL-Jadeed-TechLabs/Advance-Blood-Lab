export default {
  title: "URINE ANALYSIS REPORT",

  sections: [
    {
      name: "PHYSICAL EXAMINATION",
      fields: [
        ["QUANTITY", { type: "text", default: "10 ML" }],

        ["COLOUR", {
          type: "select",
          options: ["Pale Yellow", "Yellow", "Reddish"]
        }],

        ["NATURE", { type: "text", default: "Random" }],

        ["APPEARANCE", {
          type: "select",
          options: ["Clear", "TURBID", "S TURBID", "Hazy", "Traces"]
        }],

        ["REACTION", { type: "text", default: "Acidic" }]
      ]
    },

    {
      name: "CHEMICAL EXAMINATION",
      fields: [
        ["ALBUMIN", {
          type: "select",
          options: ["NIL", "Traces", "Present +", "Present ++", "Present +++"]
        }],
        ["SUGAR", {
          type: "select",
          options: ["NIL", "Traces", "Present +", "Present ++", "Present +++"]
        }],
        ["BILE SALT", {
          type: "select",
          options: ["Absent", "Present"]
        }],
        ["BILE PIGMENT", {
          type: "select",
          options: ["Absent", "Present"]
        }]
      ]
    },

    {
      name: "MICROSCOPIC EXAMINATION",
      fields: [
        ["R.B.C.", {
          type: "select",
          options: ["NIL", "1 - 2 /hpf", "2 - 4 /hpf", "5 - 10 /hpf"]
        }],
        ["PUS CELLS", {
          type: "select",
          options: ["Occasional /hpf", "1 - 2 /hpf", "5 - 10 /hpf"]
        }],
        ["EPITHELIAL CELLS", {
          type: "select",
          options: ["Occasional /hpf", "1 - 2 /hpf", "5 - 10 /hpf"]
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
          options: ["NIL", "Absent"]
        }],
        ["OTHER FINDINGS", {
          type: "select",
          options: ["NIL", "Absent"]
        }]
      ]
    }
  ]
};
