/**
 * Biomarker Reference Fallback Dataset
 * Educational and factual reference dataset for routine clinical laboratory parameters.
 * Note: Reference intervals vary across laboratories, testing instruments, and methodologies.
 * Always consult a qualified medical professional for diagnosis or treatment decisions.
 */

export const biomarkerFallbackData = [
  // Complete Blood Count (CBC)
  {
    id: 'ref-hemo',
    canonicalName: 'Hemoglobin',
    aliases: ['Hb', 'HGB', 'Hgb'],
    unit: 'g/dL',
    panel: 'CBC with Differential',
    bodySystem: 'blood',
    resultType: 'numeric',
    range: { low: 13.5, high: 17.5 },
    genderRanges: {
      male: { low: 13.5, high: 17.5 },
      female: { low: 12.0, high: 15.5 }
    },
    whatItMeasures: 'The iron-rich protein in red blood cells that binds and carries oxygen from the lungs to tissues throughout the body.',
    whatHighMayIndicate: 'Dehydration, chronic low blood oxygen levels (e.g., smoking, high altitude, respiratory conditions), or increased red blood cell production.',
    whatLowMayIndicate: 'Iron deficiency anemia, chronic blood loss, vitamin deficiencies (B12/folate), or reduced bone marrow production.',
    impact: 'Crucial for cellular energy and oxygen delivery throughout the entire body.',
    howToImprove: 'Incorporate iron-rich foods (spinach, beans, lean meats), vitamin C for absorption, and review persistent fatigue with your physician.'
  },
  {
    id: 'ref-wbc',
    canonicalName: 'WBC Count',
    aliases: ['White Blood Cell Count', 'WBC', 'Leukocytes', 'White Blood Cell (WBC)'],
    unit: 'x10^3/uL',
    panel: 'CBC with Differential',
    bodySystem: 'blood',
    resultType: 'numeric',
    range: { low: 4.5, high: 11.0 },
    genderRanges: {
      male: { low: 4.5, high: 11.0 },
      female: { low: 4.5, high: 11.0 }
    },
    whatItMeasures: 'The total number of defensive immune cells that circulate in the bloodstream to combat viral, bacterial, and fungal infections.',
    whatHighMayIndicate: 'Active infection, physical stress, tissue inflammation, smoking, or allergic responses.',
    whatLowMayIndicate: 'Viral illnesses, medication reactions, autoimmune activity, or immune system suppression.',
    impact: 'Primary defense mechanism of human immunity and infection response.',
    howToImprove: 'Prioritize adequate sleep, balanced nutrition, stress management, and prompt medical care for persistent infections.'
  },
  {
    id: 'ref-platelets',
    canonicalName: 'Platelet Count',
    aliases: ['Thrombocytes', 'PLT', 'Platelets'],
    unit: 'x10^3/uL',
    panel: 'CBC with Differential',
    bodySystem: 'blood',
    resultType: 'numeric',
    range: { low: 150, high: 450 },
    genderRanges: {
      male: { low: 150, high: 450 },
      female: { low: 150, high: 450 }
    },
    whatItMeasures: 'Small disk-shaped cell fragments in blood essential for forming clots and stopping bleeding at injury sites.',
    whatHighMayIndicate: 'Reactive thrombocytosis from chronic inflammation, acute blood loss, or iron deficiency.',
    whatLowMayIndicate: 'Viral infections, certain medications, autoimmune conditions, or vitamin deficiencies.',
    impact: 'Vital for normal blood coagulation, hemostasis, and wound repair.',
    howToImprove: 'Avoid excessive alcohol consumption and review all ongoing medications with your physician.'
  },

  // Lipid Profile
  {
    id: 'ref-cholesterol',
    canonicalName: 'Total Cholesterol',
    aliases: ['Cholesterol', 'Serum Cholesterol'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    range: { low: 125, high: 200 },
    genderRanges: {
      male: { low: 125, high: 200 },
      female: { low: 125, high: 200 }
    },
    whatItMeasures: 'The total amount of cholesterol circulating in your bloodstream, comprising HDL, LDL, and VLDL particles.',
    whatHighMayIndicate: 'Elevated dietary saturated fats, genetic predisposition, sedentary lifestyle, or metabolic changes.',
    whatLowMayIndicate: 'Malnutrition, liver dysfunction, severe hyperthyroidism, or chronic digestive malabsorption.',
    impact: 'Excess cholesterol can accumulate on arterial walls as atherogenic plaque, increasing cardiovascular risk.',
    howToImprove: 'Focus on a Mediterranean-style diet high in soluble fiber, replace saturated fats with healthy oils, and maintain regular physical activity.'
  },
  {
    id: 'ref-triglycerides',
    canonicalName: 'Triglycerides',
    aliases: ['Serum Triglycerides', 'TG'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    range: { low: 40, high: 150 },
    genderRanges: {
      male: { low: 40, high: 150 },
      female: { low: 40, high: 150 }
    },
    whatItMeasures: 'The most common form of circulating lipid fat used for energy storage in adipose tissue.',
    whatHighMayIndicate: 'High simple sugar intake, excessive alcohol consumption, obesity, or uncontrolled blood glucose.',
    whatLowMayIndicate: 'Extremely low-fat diet, malnutrition, or hyperthyroidism.',
    impact: 'Strongly correlated with insulin resistance, non-alcoholic fatty liver disease, and heart health.',
    howToImprove: 'Reduce refined sugars and alcohol, increase omega-3 fatty acids, and incorporate regular aerobic cardio.'
  },
  {
    id: 'ref-hdl',
    canonicalName: 'HDL Cholesterol',
    aliases: ['HDL', 'High-Density Lipoprotein'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    range: { low: 40, high: 60 },
    genderRanges: {
      male: { low: 40, high: 60 },
      female: { low: 50, high: 60 }
    },
    whatItMeasures: 'Commonly known as "good" cholesterol; scavenges surplus cholesterol from peripheral tissues and returns it to the liver.',
    whatHighMayIndicate: 'Generally cardioprotective, though genetic variants or certain medications can produce extremely elevated levels.',
    whatLowMayIndicate: 'Sedentary habits, smoking, obesity, or diets high in trans fats.',
    impact: 'Higher HDL levels help keep coronary arteries clear of atherosclerotic plaque.',
    howToImprove: 'Engage in regular aerobic exercise, quit smoking, and consume healthy fats such as avocados and extra virgin olive oil.'
  },
  {
    id: 'ref-ldl',
    canonicalName: 'LDL Cholesterol',
    aliases: ['LDL', 'Low-Density Lipoprotein'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    range: { low: 50, high: 100 },
    genderRanges: {
      male: { low: 50, high: 100 },
      female: { low: 50, high: 100 }
    },
    whatItMeasures: '"Bad" cholesterol responsible for delivering lipids to peripheral tissues; primary carrier of atherogenic particles.',
    whatHighMayIndicate: 'Elevated intake of saturated and trans fats, familial hypercholesterolemia, or low physical activity.',
    whatLowMayIndicate: 'Nutritional deficit, severe chronic infection, or aggressive lipid-lowering therapy.',
    impact: 'Major risk factor for coronary artery disease, stroke, and vascular narrowing.',
    howToImprove: 'Reduce saturated animal fats, avoid processed foods, increase soluble dietary fiber (oats, legumes), and maintain a healthy weight.'
  },

  // Glucose & Diabetes
  {
    id: 'ref-fbs',
    canonicalName: 'Fasting Blood Sugar',
    aliases: ['Fasting Glucose', 'Blood Sugar Fasting', 'FBS', 'Glucose Fasting'],
    unit: 'mg/dL',
    panel: 'Glucose & HbA1c',
    bodySystem: 'glucose',
    resultType: 'numeric',
    range: { low: 70, high: 99 },
    genderRanges: {
      male: { low: 70, high: 99 },
      female: { low: 70, high: 99 }
    },
    whatItMeasures: 'The concentration of glucose present in the blood after an overnight fast of at least 8 to 12 hours.',
    whatHighMayIndicate: 'Impaired fasting glucose (prediabetes), insulin resistance, acute physiological stress, or diabetes mellitus.',
    whatLowMayIndicate: 'Excessive fasting, reactive hypoglycemia, insulin medication mismatch, or strenuous endurance exertion without fuel.',
    impact: 'Primary benchmark for carbohydrate metabolism, insulin regulation, and cellular fuel availability.',
    howToImprove: 'Moderate refined carbohydrates, increase dietary fiber and protein, and engage in post-meal walking.'
  },
  {
    id: 'ref-hba1c',
    canonicalName: 'HbA1c',
    aliases: ['Glycated Hemoglobin', 'Hemoglobin A1c', 'A1c', 'A1C'],
    unit: '%',
    panel: 'Glucose & HbA1c',
    bodySystem: 'glucose',
    resultType: 'numeric',
    range: { low: 4.0, high: 5.6 },
    genderRanges: {
      male: { low: 4.0, high: 5.6 },
      female: { low: 4.0, high: 5.6 }
    },
    whatItMeasures: 'The percentage of hemoglobin bound to glucose, reflecting weighted average blood sugar over the preceding 2 to 3 months.',
    whatHighMayIndicate: 'Consistent chronic elevation of blood glucose, prediabetes (5.7–6.4%), or diabetes mellitus (6.5%+).',
    whatLowMayIndicate: 'Frequent hypoglycemic episodes, recent blood loss, or shortened red blood cell lifespan.',
    impact: 'Gold standard clinical biomarker for long-term glycemic control and diabetes monitoring.',
    howToImprove: 'Adopt structured low-glycemic meal planning, participate in resistance training, and optimize sleep.'
  },

  // Liver Function
  {
    id: 'ref-alt',
    canonicalName: 'SGPT / ALT',
    aliases: ['ALT', 'Alanine Aminotransferase', 'SGPT'],
    unit: 'U/L',
    panel: 'Liver Function',
    bodySystem: 'liver',
    resultType: 'numeric',
    range: { low: 7, high: 56 },
    genderRanges: {
      male: { low: 10, high: 50 },
      female: { low: 7, high: 35 }
    },
    whatItMeasures: 'An intracellular enzyme concentrated within hepatocytes (liver cells) released into circulation upon liver cell irritation or injury.',
    whatHighMayIndicate: 'Fatty liver changes, viral hepatitis, heavy alcohol consumption, or medication-related liver strain.',
    whatLowMayIndicate: 'Generally a healthy baseline, though extreme vitamin B6 deficiency may lower values.',
    impact: 'Highly sensitive and specific marker for hepatocellular integrity.',
    howToImprove: 'Eliminate or strictly limit alcohol, review medications with a clinician, and reduce visceral abdominal fat.'
  },
  {
    id: 'ref-ast',
    canonicalName: 'SGOT / AST',
    aliases: ['AST', 'Aspartate Aminotransferase', 'SGOT'],
    unit: 'U/L',
    panel: 'Liver Function',
    bodySystem: 'liver',
    resultType: 'numeric',
    range: { low: 8, high: 40 },
    genderRanges: {
      male: { low: 10, high: 40 },
      female: { low: 9, high: 32 }
    },
    whatItMeasures: 'An enzyme found in the liver, heart, and skeletal muscle tissue that aids in amino acid metabolism.',
    whatHighMayIndicate: 'Liver tissue inflammation, strenuous muscle breakdown, heart strain, or alcohol-related liver injury.',
    whatLowMayIndicate: 'Normal healthy clinical baseline.',
    impact: 'Evaluated alongside ALT to determine the nature and tissue source of cellular stress.',
    howToImprove: 'Avoid hepatotoxins, maintain adequate hydration, and moderate intense unaccustomed muscular strain.'
  },
  {
    id: 'ref-bili',
    canonicalName: 'Total Bilirubin',
    aliases: ['Bilirubin Total', 'Serum Bilirubin'],
    unit: 'mg/dL',
    panel: 'Liver Function',
    bodySystem: 'liver',
    resultType: 'numeric',
    range: { low: 0.2, high: 1.2 },
    genderRanges: {
      male: { low: 0.2, high: 1.2 },
      female: { low: 0.2, high: 1.2 }
    },
    whatItMeasures: 'A yellow-orange pigment produced during the normal breakdown of red blood cells, processed by the liver and excreted in bile.',
    whatHighMayIndicate: 'Bile duct blockage, liver disease, accelerated red blood cell hemolysis, or benign Gilbert syndrome.',
    whatLowMayIndicate: 'Generally of no clinical concern.',
    impact: 'Key indicator of biliary excretion, liver clearance, and red blood cell turnover rate.',
    howToImprove: 'Ensure adequate daily hydration, avoid prolonged fasting if Gilbert syndrome is suspected, and consult your doctor.'
  },

  // Kidney Function
  {
    id: 'ref-creat',
    canonicalName: 'Serum Creatinine',
    aliases: ['Creatinine', 'Blood Creatinine', 'Cr'],
    unit: 'mg/dL',
    panel: 'Kidney Function',
    bodySystem: 'kidney',
    resultType: 'numeric',
    range: { low: 0.7, high: 1.3 },
    genderRanges: {
      male: { low: 0.7, high: 1.3 },
      female: { low: 0.5, high: 1.1 }
    },
    whatItMeasures: 'A waste byproduct of normal muscle energy breakdown filtered out of blood by healthy kidneys and excreted in urine.',
    whatHighMayIndicate: 'Reduced renal filtration efficiency, dehydration, high dietary protein/creatine intake, or acute kidney stress.',
    whatLowMayIndicate: 'Low muscle mass, pregnancy, or low-protein malnutrition.',
    impact: 'Fundamental biomarker used to compute estimated Glomerular Filtration Rate (eGFR) and assess kidney function.',
    howToImprove: 'Maintain optimal hydration, manage blood pressure, and minimize routine non-steroidal anti-inflammatory (NSAID) drug use.'
  },
  {
    id: 'ref-bun',
    canonicalName: 'Blood Urea Nitrogen',
    aliases: ['BUN', 'Blood Urea Nitrogen (BUN)', 'Urea', 'Urea Nitrogen'],
    unit: 'mg/dL',
    panel: 'Kidney Function',
    bodySystem: 'kidney',
    resultType: 'numeric',
    range: { low: 7, high: 20 },
    genderRanges: {
      male: { low: 7, high: 20 },
      female: { low: 7, high: 20 }
    },
    whatItMeasures: 'The amount of nitrogen in your blood derived from urea, a waste compound synthesized by the liver from protein breakdown.',
    whatHighMayIndicate: 'Dehydration, high-protein diet, kidney impairment, or gastrointestinal bleeding.',
    whatLowMayIndicate: 'Low-protein intake, severe liver disease, or overhydration.',
    impact: 'Reflects protein turnover, fluid volume status, and renal clearance capacity.',
    howToImprove: 'Ensure balanced water intake throughout the day and moderate extreme protein overconsumption.'
  },
  {
    id: 'ref-egfr',
    canonicalName: 'eGFR',
    aliases: ['Estimated GFR', 'Glomerular Filtration Rate'],
    unit: 'mL/min/1.73m2',
    panel: 'Kidney Function',
    bodySystem: 'kidney',
    resultType: 'numeric',
    range: { low: 90, high: 120 },
    genderRanges: {
      male: { low: 90, high: 120 },
      female: { low: 90, high: 120 }
    },
    whatItMeasures: 'An estimate of how efficiently the microscopic filters (glomeruli) in the kidneys clean waste from blood each minute.',
    whatHighMayIndicate: 'Generally indicates healthy kidney filtration, though very high values can occur in early hyperfiltration phases.',
    whatLowMayIndicate: 'Reduced kidney filtration capacity, dehydration, chronic kidney disease (CKD), or age-related decline.',
    impact: 'Standard clinical yardstick for determining overall kidney function stage and health.',
    howToImprove: 'Manage blood pressure, keep blood sugar in range, drink adequate fluids, and avoid nephrotoxic drugs.'
  },

  // Thyroid Profile
  {
    id: 'ref-tsh',
    canonicalName: 'Thyroid Stimulating Hormone (TSH)',
    aliases: ['TSH', 'Serum TSH', 'Thyrotropin', 'TSH (Thyroid Stimulating)'],
    unit: 'uIU/mL',
    panel: 'Thyroid Panel',
    bodySystem: 'thyroid',
    resultType: 'numeric',
    range: { low: 0.4, high: 4.0 },
    genderRanges: {
      male: { low: 0.4, high: 4.0 },
      female: { low: 0.4, high: 4.0 }
    },
    whatItMeasures: 'Pituitary gland hormone that directs the thyroid gland to synthesize and release thyroxine (T4) and triiodothyronine (T3).',
    whatHighMayIndicate: 'Hypothyroidism (underactive thyroid gland), iodine insufficiency, or autoimmune Hashimoto thyroiditis.',
    whatLowMayIndicate: 'Hyperthyroidism (overactive thyroid), thyroiditis, or excessive thyroid hormone medication.',
    impact: 'Master regulator of basal metabolic rate, body temperature, cardiovascular pacing, and energy balance.',
    howToImprove: 'Ensure adequate dietary iodine and selenium, minimize chronic stress, and review persistent fatigue symptoms with your doctor.'
  },
  {
    id: 'ref-ft3',
    canonicalName: 'Free T3',
    aliases: ['FT3', 'Triiodothyronine Free', 'T3 Free'],
    unit: 'pg/mL',
    panel: 'Thyroid Panel',
    bodySystem: 'thyroid',
    resultType: 'numeric',
    range: { low: 2.0, high: 4.4 },
    genderRanges: {
      male: { low: 2.0, high: 4.4 },
      female: { low: 2.0, high: 4.4 }
    },
    whatItMeasures: 'The unbound, biologically active form of triiodothyronine circulating in the bloodstream that enters target cells.',
    whatHighMayIndicate: 'Hyperthyroidism, Graves disease, or autonomous thyroid nodules.',
    whatLowMayIndicate: 'Hypothyroidism, non-thyroidal illness syndrome (euthyroid sick), or starvation.',
    impact: 'Directly influences cellular oxygen consumption, cardiac output, and energy expenditure.',
    howToImprove: 'Manage systemic inflammation, maintain balanced micronutrient intake, and follow endocrinology guidance.'
  },
  {
    id: 'ref-ft4',
    canonicalName: 'Free T4',
    aliases: ['FT4', 'Thyroxine Free', 'T4 Free'],
    unit: 'ng/dL',
    panel: 'Thyroid Panel',
    bodySystem: 'thyroid',
    resultType: 'numeric',
    range: { low: 0.8, high: 1.8 },
    genderRanges: {
      male: { low: 0.8, high: 1.8 },
      female: { low: 0.8, high: 1.8 }
    },
    whatItMeasures: 'The unbound active reservoir hormone produced by the thyroid gland, converted into active T3 in peripheral tissues.',
    whatHighMayIndicate: 'Hyperthyroidism, acute thyroiditis, or excess thyroid hormone replacement.',
    whatLowMayIndicate: 'Primary hypothyroidism or pituitary gland underactivity (secondary hypothyroidism).',
    impact: 'Essential pro-hormone providing steady peripheral hormone supply for whole-body metabolism.',
    howToImprove: 'Consult an endocrinologist for personalized medication calibration and nutritional support.'
  },

  // Urine Routine
  {
    id: 'ref-uprot',
    canonicalName: 'Urine Protein',
    aliases: ['Protein Urine', 'Albumin Urine'],
    unit: '',
    panel: 'Urine Routine',
    bodySystem: 'kidney',
    resultType: 'text',
    range: { low: null, high: null, referenceText: 'Negative / Nil' },
    genderRanges: {
      male: { low: null, high: null, referenceText: 'Negative / Nil' },
      female: { low: null, high: null, referenceText: 'Negative / Nil' }
    },
    whatItMeasures: 'The presence of protein molecules (primarily albumin) in a random or 24-hour urine sample.',
    whatHighMayIndicate: 'Glomerular kidney barrier stress, high blood pressure, diabetes, strenuous exercise, or urinary tract infection.',
    whatLowMayIndicate: 'Expected normal healthy physiological state (negative or trace).',
    impact: 'Important early screening biomarker for renal microvascular integrity and cardiorenal health.',
    howToImprove: 'Control blood pressure, limit excess dietary sodium, maintain healthy hydration, and consult a physician.'
  },
  {
    id: 'ref-ugluc',
    canonicalName: 'Urine Glucose',
    aliases: ['Glucose Urine', 'Sugar Urine'],
    unit: '',
    panel: 'Urine Routine',
    bodySystem: 'glucose',
    resultType: 'text',
    range: { low: null, high: null, referenceText: 'Negative / Nil' },
    genderRanges: {
      male: { low: null, high: null, referenceText: 'Negative / Nil' },
      female: { low: null, high: null, referenceText: 'Negative / Nil' }
    },
    whatItMeasures: 'The concentration of glucose spilled over into urine when circulating blood glucose exceeds the renal threshold (typically ~180 mg/dL).',
    whatHighMayIndicate: 'Uncontrolled blood sugar, diabetes mellitus, or benign renal glycosuria.',
    whatLowMayIndicate: 'Expected normal healthy baseline (negative or nil).',
    impact: 'Sign of elevated systemic blood sugar exceeding kidney reabsorption capabilities.',
    howToImprove: 'Monitor fasting and postprandial blood glucose, follow low-glycemic dietary advice, and consult your doctor.'
  },

  // Vitamins & Minerals
  {
    id: 'ref-vitd',
    canonicalName: 'Vitamin D (25-OH)',
    aliases: ['25-Hydroxyvitamin D', 'Vit D', 'Calcidiol'],
    unit: 'ng/mL',
    panel: 'Vitamins & Minerals',
    bodySystem: 'general',
    resultType: 'numeric',
    range: { low: 30, high: 100 },
    genderRanges: {
      male: { low: 30, high: 100 },
      female: { low: 30, high: 100 }
    },
    whatItMeasures: 'The major circulating form of vitamin D, synthesized in skin upon sun exposure and absorbed from dietary sources.',
    whatHighMayIndicate: 'Excessive high-dose supplementation over extended periods.',
    whatLowMayIndicate: 'Insufficient sunlight exposure, dark skin pigmentation, malabsorption, or low dietary intake.',
    impact: 'Essential for intestinal calcium absorption, skeletal bone density, immune modulation, and mood regulation.',
    howToImprove: 'Safe moderate sun exposure, consumption of fatty fish and fortified foods, and physician-guided supplementation if deficient.'
  },
  {
    id: 'ref-vitb12',
    canonicalName: 'Vitamin B12',
    aliases: ['Cobalamin', 'Cyanocobalamin', 'B12'],
    unit: 'pg/mL',
    panel: 'Vitamins & Minerals',
    bodySystem: 'general',
    resultType: 'numeric',
    range: { low: 200, high: 900 },
    genderRanges: {
      male: { low: 200, high: 900 },
      female: { low: 200, high: 900 }
    },
    whatItMeasures: 'A water-soluble vitamin necessary for neurological function, nerve myelin sheath maintenance, and DNA synthesis in red blood cells.',
    whatHighMayIndicate: 'High-dose supplementation, liver disease, or rare myeloproliferative conditions.',
    whatLowMayIndicate: 'Strict vegan diets without fortification, pernicious anemia, gastric surgery, or prolonged antacid use.',
    impact: 'Crucial for brain function, peripheral nerve signaling, and preventing megaloblastic anemia.',
    howToImprove: 'Include animal protein or fortified plant foods, and take B12 supplements if following a vegetarian or vegan lifestyle.'
  }
];
