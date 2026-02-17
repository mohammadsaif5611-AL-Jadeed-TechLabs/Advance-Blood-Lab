export default {
  key: "IRON",
  title: "CLINICAL BIOCHEMISTRY",
  subtitle: "IRON PROFILE",
  class: "IRON PROFILE",
  testname: "IRON PROFILE",

  note: "NOTE : This sample is processed at HealthMap Diagnostics Pvt Ltd (Nagpur) Lab.",

  fields: [
    {
      name: "Iron",
      method: "Method: Ferrozine – without Deproteinization",
      unit: "µg/dL",
      ref: "33 - 193",
      type: "number"
    },
    {
      name: "UIBC",
      method: "Method: Nitroso-PSAP",
      unit: "µg/dL",
      ref: "155 - 355",
      type: "number"
    },
    {
      name: "Iron Binding Capacity - Total (TIBC)",
      method: "Method: Calculated",
      unit: "µg/dL",
      ref: "240 - 450",
      type: "number"
    },
    {
      name: "Transferrin %",
      method: "Method: Calculated",
      unit: "%",
      ref: "20 - 50",
      type: "number"
    }
  ],

  after: [
    "Interpretation:",
    "",
    "Disease | Iron | TIBC | UIBC | %Transferrin Saturation | Ferritin",
    "Iron Deficiency | Low | High | High | Low | Low",
    "Hemochromatosis | High | Low | Low | High | High",
    "Chronic Illness | Low | Low | Low/Normal | Low | Normal/High",
    "Hemolytic Anemia | High | Normal/Low | Low/Normal | High | High",
    "Sideroblastic Anemia | Normal/High | Normal/Low | Low/Normal | High | High",
    "Iron Poisoning | High | Normal | Low | High | Normal"
  ]
};
