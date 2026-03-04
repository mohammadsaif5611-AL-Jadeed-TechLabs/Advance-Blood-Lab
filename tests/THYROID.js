export default {
  key: "THYROID2",
  title: "CLINICAL BIOCHEMISTRY",
    class: "THYROID PROFILE-II",
  testname: "THYROID PROFILE-II",
  subtitle: "THYROID PROFILE-II",

  fields: [
    {
      name: "Triiodothyronine Total (TT3)",
      key: "tt3",
      unit: "ng/dL",
      ref: `80 - 253 : 1 Yr - 10 Yr
76 - 199 : 11 Yr - 15 Yr
69 - 201 : 16 Yr - 18 Yr
60 - 181 : > 18 years`
    },
    {
      name: "Triiodothyronine Free (FT3)",
      key: "ft3",
      unit: "pg/mL",
      ref: "2.0 - 4.4"
    },
    {
      name: "Thyroxine - Total (TT4)",
      key: "tt4",
      unit: "ug/dL",
      ref: "4.6 - 12.5"
    },
    {
      name: "Thyroxine - Free (FT4)",
      key: "ft4",
      unit: "ng/dL",
      ref: "1.0 - 1.7"
    },
    {
      name: "Thyroid Stimulating Hormone (ultrasensitive)",
      key: "tsh",
      unit: "uIU/mL",
      method: "Method: CLIA",
      ref: "0.27 - 4.2"
    }
  ],

  interpretation: {
    importantNote: [
      "A TSH value of up to 15 µIU/ml needs clinical correlation or repeat testing with a new sample, as physiological factors can give falsely high TSH.",
      "Transiently Raised TSH can occur due to non-thyroid illnesses like severe infections liver, cardiac, and kidney diseases, burns, surgery, and trauma."
    ],

    diurnal: "TSH follows a diurnal rhythm and is at maximum between 2 am to 4 am and a minimum between 6 to 10 pm. Variation is about 50-206%.",

    limitations: [
      "Patients receiving High Biotin Dose treatment should have a gap of a minimum of 8 hrs before giving the blood sample.",
      "Heterophile Antibodies can react in Immunoassay procedures giving erroneous results. The assay is designed to minimize heterophile antibody interference."
    ],

    note: "FT3 and FT4 measure the free 'unbound' fraction of the T3 and T4 and are considered more sensitive compared to the Total T3 and T4 to assess thyroid status.",

    associated: "Anti-thyroid Antibodies, USG thyroid, TSH receptor Antibody, Thyroglobulin, Calcitonin."
  }
};
