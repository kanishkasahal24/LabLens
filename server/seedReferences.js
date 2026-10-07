const ParameterReference = require('./models/ParameterReference');

const canonicalReferences = [
  // Lipid Profile
  {
    canonicalName: 'Total Cholesterol',
    aliases: ['Cholesterol', 'Serum Cholesterol'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    defaultRange: { low: 125, high: 200 },
    genderRanges: {},
    impact: 'Elevated cholesterol can contribute to plaque build-up in arterial walls, increasing cardiovascular risks.',
    howToImprove: 'Adopt a diet low in saturated fats, increase soluble fiber intake, and exercise regularly.'
  },
  {
    canonicalName: 'Triglycerides',
    aliases: ['Serum Triglycerides', 'TG'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    defaultRange: { low: 40, high: 150 },
    genderRanges: {},
    impact: 'High triglycerides are associated with metabolic syndrome, fatty liver disease, and heart risk.',
    howToImprove: 'Limit simple sugars, alcohol, and refined carbohydrates. Increase aerobic activity.'
  },
  {
    canonicalName: 'HDL Cholesterol',
    aliases: ['HDL', 'High-Density Lipoprotein'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    defaultRange: { low: 40, high: 60 },
    genderRanges: {
      male: { low: 40, high: 60 },
      female: { low: 50, high: 60 }
    },
    impact: 'HDL helps transport excess cholesterol out of the arteries back to the liver for excretion.',
    howToImprove: 'Engage in aerobic exercise, consume healthy fats (olive oil, nuts), and avoid smoking.'
  },
  {
    canonicalName: 'LDL Cholesterol',
    aliases: ['LDL', 'Low-Density Lipoprotein'],
    unit: 'mg/dL',
    panel: 'Lipid Profile',
    bodySystem: 'cholesterol',
    resultType: 'numeric',
    defaultRange: { low: 50, high: 100 },
    genderRanges: {},
    impact: 'LDL carries cholesterol into peripheral tissues and arterial walls.',
    howToImprove: 'Reduce trans fats, replace saturated fats with unsaturated fats, and increase plant sterols.'
  },

  // Liver Function Test (LFT)
  {
    canonicalName: 'SGPT / ALT',
    aliases: ['Alanine Aminotransferase', 'ALT', 'SGPT'],
    unit: 'U/L',
    panel: 'Liver Function',
    bodySystem: 'liver',
    resultType: 'numeric',
    defaultRange: { low: 7, high: 56 },
    genderRanges: {
      male: { low: 10, high: 50 },
      female: { low: 7, high: 35 }
    },
    impact: 'ALT is an enzyme found primarily in liver cells. Elevated levels suggest hepatocellular inflammation or stress.',
    howToImprove: 'Limit alcohol consumption, avoid unnecessary medications, and maintain a healthy weight.'
  },
  {
    canonicalName: 'SGOT / AST',
    aliases: ['Aspartate Aminotransferase', 'AST', 'SGOT'],
    unit: 'U/L',
    panel: 'Liver Function',
    bodySystem: 'liver',
    resultType: 'numeric',
    defaultRange: { low: 8, high: 40 },
    genderRanges: {
      male: { low: 10, high: 40 },
      female: { low: 9, high: 32 }
    },
    impact: 'AST is present in liver, heart, and muscle tissue. High levels indicate potential tissue stress.',
    howToImprove: 'Avoid alcohol, reduce processed dietary intake, and consult your doctor.'
  },
  {
    canonicalName: 'Total Bilirubin',
    aliases: ['Bilirubin Total', 'Serum Bilirubin'],
    unit: 'mg/dL',
    panel: 'Liver Function',
    bodySystem: 'liver',
    resultType: 'numeric',
    defaultRange: { low: 0.2, high: 1.2 },
    genderRanges: {},
    impact: 'Bilirubin is a byproduct of red blood cell breakdown processed by the liver.',
    howToImprove: 'Ensure proper hydration and avoid liver stress factors.'
  },

  // Kidney Function Test (KFT)
  {
    canonicalName: 'Serum Creatinine',
    aliases: ['Creatinine', 'Blood Creatinine'],
    unit: 'mg/dL',
    panel: 'Kidney Function',
    bodySystem: 'kidney',
    resultType: 'numeric',
    defaultRange: { low: 0.6, high: 1.2 },
    genderRanges: {
      male: { low: 0.7, high: 1.3 },
      female: { low: 0.6, high: 1.1 }
    },
    impact: 'Creatinine is a waste product of muscle metabolism cleared by healthy kidneys.',
    howToImprove: 'Stay well-hydrated, avoid excessive protein supplementation, and minimize NSAID use.'
  },
  {
    canonicalName: 'eGFR',
    aliases: ['Estimated GFR', 'Glomerular Filtration Rate'],
    unit: 'mL/min/1.73m2',
    panel: 'Kidney Function',
    bodySystem: 'kidney',
    resultType: 'numeric',
    defaultRange: { low: 90, high: 120 },
    genderRanges: {},
    impact: 'eGFR measures how efficiently your kidneys filter waste from the bloodstream.',
    howToImprove: 'Control blood pressure, manage blood sugar levels, and drink adequate water.'
  },
  {
    canonicalName: 'Blood Urea Nitrogen',
    aliases: ['BUN', 'Urea'],
    unit: 'mg/dL',
    panel: 'Kidney Function',
    bodySystem: 'kidney',
    resultType: 'numeric',
    defaultRange: { low: 7, high: 20 },
    genderRanges: {},
    impact: 'BUN measures nitrogenous waste in blood derived from dietary protein metabolism.',
    howToImprove: 'Drink plenty of water and balance dietary protein.'
  },

  // Complete Blood Count (CBC)
  {
    canonicalName: 'Hemoglobin',
    aliases: ['Hb', 'HGB'],
    unit: 'g/dL',
    panel: 'CBC with Differential',
    bodySystem: 'cbc',
    resultType: 'numeric',
    defaultRange: { low: 12.0, high: 16.5 },
    genderRanges: {
      male: { low: 13.5, high: 17.5 },
      female: { low: 12.0, high: 15.5 }
    },
    impact: 'Hemoglobin carries oxygen from lungs to rest of the body tissue.',
    howToImprove: 'Consume iron-rich foods (leafy greens, legumes, dark meat) alongside Vitamin C.'
  },
  {
    canonicalName: 'WBC Count',
    aliases: ['White Blood Cell Count', 'WBC', 'Leukocytes'],
    unit: 'x10^3/uL',
    panel: 'CBC with Differential',
    bodySystem: 'cbc',
    resultType: 'numeric',
    defaultRange: { low: 4.5, high: 11.0 },
    genderRanges: {},
    impact: 'White blood cells defend against infections and cellular stress.',
    howToImprove: 'Support immune system with adequate sleep, balanced nutrition, and stress management.'
  },
  {
    canonicalName: 'Platelet Count',
    aliases: ['Platelets', 'PLT'],
    unit: 'x10^3/uL',
    panel: 'CBC with Differential',
    bodySystem: 'cbc',
    resultType: 'numeric',
    defaultRange: { low: 150, high: 450 },
    genderRanges: {},
    impact: 'Platelets are essential blood components responsible for normal blood clotting.',
    howToImprove: 'Avoid heavy alcohol consumption and follow medical advice if low.'
  },

  // Thyroid Panel
  {
    canonicalName: 'Thyroid Stimulating Hormone (TSH)',
    aliases: ['TSH', 'Serum TSH'],
    unit: 'uIU/mL',
    panel: 'Thyroid Panel',
    bodySystem: 'thyroid',
    resultType: 'numeric',
    defaultRange: { low: 0.4, high: 4.0 },
    genderRanges: {},
    impact: 'TSH is released by pituitary gland to stimulate thyroid hormone production.',
    howToImprove: 'Ensure sufficient dietary iodine and selenium. Take thyroid medications as prescribed.'
  },
  {
    canonicalName: 'Free T3',
    aliases: ['FT3', 'Triiodothyronine Free'],
    unit: 'pg/mL',
    panel: 'Thyroid Panel',
    bodySystem: 'thyroid',
    resultType: 'numeric',
    defaultRange: { low: 2.0, high: 4.4 },
    genderRanges: {},
    impact: 'Free T3 is active thyroid hormone regulating metabolic rate.',
    howToImprove: 'Consult an endocrinologist for thyroid hormone optimization.'
  },
  {
    canonicalName: 'Free T4',
    aliases: ['FT4', 'Thyroxine Free'],
    unit: 'ng/dL',
    panel: 'Thyroid Panel',
    bodySystem: 'thyroid',
    resultType: 'numeric',
    defaultRange: { low: 0.8, high: 1.8 },
    genderRanges: {},
    impact: 'Free T4 is primary pro-hormone produced by the thyroid gland.',
    howToImprove: 'Follow prescribed treatment guidelines.'
  },

  // Glucose & HbA1c
  {
    canonicalName: 'Fasting Blood Sugar',
    aliases: ['Fasting Glucose', 'FBS', 'Glucose Fasting'],
    unit: 'mg/dL',
    panel: 'Glucose & HbA1c',
    bodySystem: 'hba1c',
    resultType: 'numeric',
    defaultRange: { low: 70, high: 99 },
    genderRanges: {},
    impact: 'Measures blood glucose after an 8-12 hour fast.',
    howToImprove: 'Limit refined sugars, increase physical activity, and control calorie intake.'
  },
  {
    canonicalName: 'HbA1c',
    aliases: ['Glycated Hemoglobin', 'A1C'],
    unit: '%',
    panel: 'Glucose & HbA1c',
    bodySystem: 'hba1c',
    resultType: 'numeric',
    defaultRange: { low: 4.0, high: 5.6 },
    genderRanges: {},
    impact: 'HbA1c reflects average blood sugar control over the past 2 to 3 months.',
    howToImprove: 'Adopt a low-carb, fiber-rich diet, exercise daily, and maintain healthy weight.'
  },

  // Urine Routine
  {
    canonicalName: 'Urine Protein',
    aliases: ['Protein Urine', 'Albumin Urine'],
    unit: '',
    panel: 'Urine Routine',
    bodySystem: 'kidney',
    resultType: 'text',
    defaultRange: { low: null, high: null, referenceText: 'Negative / Nil' },
    genderRanges: {},
    impact: 'Presence of protein in urine may signal glomerular filtering stress in the kidneys.',
    howToImprove: 'Manage blood pressure, reduce dietary sodium, and consult a nephrologist.'
  },
  {
    canonicalName: 'Urine Glucose',
    aliases: ['Glucose Urine', 'Sugar Urine'],
    unit: '',
    panel: 'Urine Routine',
    bodySystem: 'hba1c',
    resultType: 'text',
    defaultRange: { low: null, high: null, referenceText: 'Negative / Nil' },
    genderRanges: {},
    impact: 'Glucose spills into urine when serum blood sugar exceeds renal threshold.',
    howToImprove: 'Control systemic blood sugar levels.'
  }
];

const seedParameterReferences = async () => {
  console.log('Seeding canonical ParameterReference collection...');
  await ParameterReference.deleteMany({});
  await ParameterReference.insertMany(canonicalReferences);
  console.log(`Successfully seeded ${canonicalReferences.length} canonical parameter references!`);
};

module.exports = {
  canonicalReferences,
  seedParameterReferences
};
