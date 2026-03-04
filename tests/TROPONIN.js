export default {
  key: "TROPONIN",
  title: "TROPONIN",
  class: "TROPONIN",
   testname: "TROPONIN",

  sections: [

    // 🔹 TROPONIN T
    {
      title: "REPORT ON TROPONIN T",
      fields: [
        {
          name: "TROPONIN T (Qualitative)",
          type: "select",
          options: ["NEGATIVE", "POSITIVE", "WEAKLY POSITIVE", "WEAKLY REACTIVE", "REACTIVE", "NON REACTIVE"]
        }
      ]
    },

    // 🔹 TROPONIN I
    {
      title: "REPORT ON TROPONIN I",
      fields: [
        {
          name: "TROPONIN I - (Qualitative)",
          type: "select",
           options: ["NEGATIVE", "POSITIVE", "WEAKLY POSITIVE", "WEAKLY REACTIVE", "REACTIVE", "NON REACTIVE"]
        },
        {
          name: "Troponin I Plasma (CLIA)",
          type: "text",
          unit: "ng/ml",
          ref: "< 0.3"
        }
      ]
    }

  ],


  note: `NOTE: False negative / positive results are observed in patients receiving mouse monoclonal antibodies for diagnosis or therapy.`,

  comments: `Troponin is a regulatory complex of 3 proteins that resides at regular intervals in the thin filament of striated muscle. Cardiac Troponin is a cardiospecific, highly sensitive marker of myocardial damage and has never shown to be expressed in normal, regenerating or diseased skeletal muscle. In cases of acute myocardial damage, Troponin I levels rise in serum about 3-4 hours after appearance of cardiac symptoms and remain elevated upto 10 days. It is an independent prognostic marker which can predict near, mid and long term outcome in patients with Acute Coronary Syndrome (ACS).`,

  increasedLevels: `Congestive Heart Failure, Cardiomyopathy, Myocarditis, Heart contusion, Interventional therapy like cardiac surgery and drug induced cardiotoxicity`,

  uses: `
• To differentiate patients with Non ST elevation Myocardial Infarction ( NSTMI) from Unstable angina - patients with ACS with elevated Troponin
 I and / or CK-MB are considered to have NSTMI whereas the diagnosis of Unstable angina is established if Troponin I and CK-MB are Ideally
 Troponin I within the normal range. Ideally Troponin I should be measured at presentation ( 0 hour) and repeated after 6-9 hours & 12-24 hours
 if earlier specimens are normal and the clinical suspicion is high.
• Risk stratification of patients presenting with ACS and for cardiac risk in patients with Chronic Renal Failure. As it offers powerful risk
 assessment, in ACS, Troponin I monitoring should be included in practice guidelines.
• For selection of more intensive therapy and intervention in patients with elevated Troponin I.
`
};