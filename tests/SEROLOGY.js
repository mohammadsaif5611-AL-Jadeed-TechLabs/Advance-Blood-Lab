export default {
  key: "SEROLOGY",
  title: "SEROLOGY REPORT",
  subtitle: "SEROLOGY TEST",
  class: "SEROLOGY TEST",
  testname: "SEROLOGY TEST",

  sections: [

    /* ================= WIDAL ================= */
 {
  name: "WIDAL SLIDE METHOD",
  fields: [
    ["S TYPHI               'O'", {
      type: "select",
      options: [
        "No Agglutination",
        "Agglutination seen in 1:80",
        "Agglutination seen in 1:120",
        "Agglutination seen in 1:160"
      ]
    }],
    ["S TYPHI               'H'", {
      type: "select",
      options: [
        "No Agglutination",
        "Agglutination seen in 1:80",
        "Agglutination seen in 1:120",
        "Agglutination seen in 1:160"
      ]
    }],
   
  ],

  // ✅ FORM SE HIDDEN — PREVIEW ONLY
  fixedFields: [
    ["S PARATYPHI       A (H)", "No Agglutination"],
    ["S PARATYPHI       B (H)", "No Agglutination"]
  ],
 result:[, { type: "text", default: "NEGATIVE" }],
  para: [
    "Note : Agglutinin titre greater than 1:80 is considered significant & is usually suggestive of infection, whereas low titres are often found in normal individuals."
  ]
}

,

    /* ================= VDRL ================= */
    {
      name: "VDRL / TPHA TEST",
      fields: [
        ["VDRL / TPHA TEST", {
          type: "select",
          options: ["NEGATIVE", "POSITIVE"]
        }]
      ]
    },


/* ================= HBsAg ================= */
{
  name: "AUSTRALIA ANTIGEN",

  fields: [
    [
      "AUSTRALIA ANTIGEN TEST (S.HBsAg)",
      {
        type: "select",
        options: ["NEGATIVE", "POSITIVE"],
        after: [
          "Method:- Rapid Immunochromatography",
          "This is screening test. Kindly confirm by ELSISA METHOD"
        ]
      }
    ]
  ]
},

/* ================= HCV ================= */
{
  name: "HCV",

  fields: [
    [
      "ANTI HCV ANTIBODIES",
      {
        type: "select",
        options: ["NEGATIVE", "POSITIVE"],
        after: [
          "Method:- Rapid Immunochromatography Test"
        ]
      }
    ]
  ]
},



    /* ================= HIV ================= */
    {
      name: "REPORT ON HIV",
      fields: [
        ["Blood for Antibodies HIV (I & II)", {
          type: "select",
          options: ["NEGATIVE", "POSITIVE"]
        }]
      ],
      sub: [
        "Test done by Rapid Screening Card Method"
      ],
      para: [
        "Note: The above test is screening test detection of HIV I and II antibodies In human serum or plasma immobilized on an immunofiltration Membrane. HIV I and HIV II viruses share many morphological and biological characteristics. It is likely that due to the reason their antibodiesRecombinant proteins. Appearance of dots of HIV I and HIV II antibodies On the test device does not necessanly imply co-infection from HIV I and II. This is only a Screening test. All positive detected sample shall be Reconfirmed by using WESTERN BLOT techniques. Negative test result does not exclude the possibility of infection or exposure to HIV"
      ]
    },

    /* ================= DENGUE ================= */
   {
  name: "DENGUE SEROLOGY",

  fields: [
    // ===== MAIN NS1 RESULT =====
    ["NS1 Antigen", {
      type: "select",
      options: ["NEGATIVE", "POSITIVE"]
    }]
  ],

  sub: [
    
    "Test done by J. Mitra Dengue Day 1 Rapid Screening Card Method, DONE BY AVANTOR Benesphera Card Test"
  ],

  para: [
    "NOTE :-",
    "1. This test detects presence of Dengue NS1 antigen and is a Rapid Immunochromatic Screening Test. Positive result should be confirmed with ELISA method for Confirmatory diagnosis.",
    "2. Serological cross-reactivity across the Flavivirus group is common.",
    "3. All results must be correlated with other clinical findings. A negative result does not preclude the possibility of an early infection of Dengue virus.",
    "4. In case of suspected Dengue case with Negative NS1 test, Dengue antibody testing is advised."
  ],

  // ===== SECOND BLOCK (IgG / IgM) =====
  sub2: [
    "DENGUE IgG & IgM Antibody Immunochromatography"
  ],

  fields2: [
    ["Anti Dengue – IgG", {
      type: "select",
      options: ["NEGATIVE", "POSITIVE"]
    }],
    ["Anti Dengue – IgM", {
      type: "select",
      options: ["NEGATIVE", "POSITIVE"]
    }]
  ],

para2: [
  "Note - Serological data must always be interpreted with the clinicaal findings.",
"Note :- Dengue viruses are mosquito-borne viruses. Infections may lead to Dengue fever or denguenhaemorrhagic fever and dengue shock syndrome. In the extreme cases, IgM antibodies appear around the 5th day of a Dengue infection, rise for 1-3 weeks and last for 60-90 days.IgG antibodies appear by the 14th day in primary infections and on the 2nd day in secondaryinfections and can usually be detected for life.Both ZDengue fever IgM & IgG are useful in the early detection of primary and secondary Dengue infections."
]

}


  ]
};
