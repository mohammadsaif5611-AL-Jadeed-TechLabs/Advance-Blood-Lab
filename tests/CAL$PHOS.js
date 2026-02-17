export default {
  key: "CALCIUM_PHOS",
  title: "CLINICAL BIOCHEMISTRY",
  subtitle: "Calcium & Phosphorus",
  class: "CALCIUM & PHOSPHORUS",
  testname: "CALCIUM & PHOSPHORUS",

//   note: "NOTE : This sample is processed at HealthMap Diagnostics Pvt Ltd (Nagpur) Lab.",

  fields: [
    {
      name: "Calcium",
      method: "Method: NM-Bapta complex",
      unit: "mg/dL",
      ref: "8.6 - 10.3",
      type: "number"
    },
    {
      name: "Phosphorus",
      method: "Method: Phosphomolybdate - UV",
      unit: "mg/dL",
      ref: "2.5 - 4.5",
      type: "number"
    }
  ],

  after: [
    "Interpretation:",
    "The diagnosis and monitoring of a wide range of disorders including diseases of bone, kidney, parathyroid gland, or gastrointestinal tract. Calcium levels may also reflect abnormal vitamin D or protein levels. Calcium ions affect the contractility of the heart and the skeletal musculature, and are essential for the function of the nervous system.",
    "In addition, calcium ions play an important role in blood clotting and bone mineralization.",
    "Hypocalcemia is due to the absence or impaired function of the parathyroid glands or impaired vitamin-D synthesis.Chronic renal failure is also frequently associated with hypocalcemia due to decreased vitamin-D synthesis as well as hyperphosphatemia and skeletal resistance to the action of parathyroid hormone (PTH). A characteristic symptom of hypocalcemia is latent or manifest tetany and osteomalacia."
  ]
};
