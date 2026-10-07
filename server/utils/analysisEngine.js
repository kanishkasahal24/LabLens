/**
 * Smart Report Analysis Engine
 * Calculates health scores, 10-system vitals grid, critical parameters, and rule-based advisories.
 */

const SYSTEM_IMPORTANCE = {
  cholesterol: 1.2,
  hba1c: 1.2,
  kidney: 1.2,
  thyroid: 1.0,
  liver: 1.0,
  cbc: 1.0,
  calcium: 0.8,
  vitamin_b12: 0.8,
  vitamin_d: 0.8,
  iron: 0.8,
  general: 0.8
};

const SEVERITY_POINTS = {
  marked: 15,
  moderate: 10,
  mild: 5,
  none: 0
};

/**
 * Calculate health score (0 - 100) with detailed breakdown
 */
const calculateHealthScore = (parameters = []) => {
  let score = 100;
  const deductions = [];

  parameters.forEach((param) => {
    if (param.status && param.status !== 'normal') {
      const sev = param.severity || 'mild';
      const basePoints = SEVERITY_POINTS[sev] || 5;
      const sysMultiplier = SYSTEM_IMPORTANCE[param.bodySystem || 'general'] || 1.0;
      const pointsDeducted = Math.round(basePoints * sysMultiplier);

      score -= pointsDeducted;
      deductions.push({
        parameterName: param.name,
        status: param.status,
        severity: sev,
        pointsDeducted
      });
    }
  });

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    healthScore: finalScore,
    breakdown: {
      initialScore: 100,
      totalDeduction: 100 - finalScore,
      deductions
    }
  };
};

/**
 * Map parameters to the 10 standard body systems grid
 */
const getVitalsGrid = (parameters = []) => {
  const systems = [
    { key: 'thyroid', label: 'Thyroid Panel', matchKeywords: ['tsh', 'thyroid', 't3', 't4'] },
    { key: 'cholesterol', label: 'Lipid / Cholesterol', matchKeywords: ['cholesterol', 'triglycerides', 'hdl', 'ldl', 'lipid'] },
    { key: 'kidney', label: 'Kidney Function', matchKeywords: ['creatinine', 'urea', 'egfr', 'bun', 'uric acid', 'kidney'] },
    { key: 'liver', label: 'Liver Function', matchKeywords: ['sgot', 'sgpt', 'ast', 'alt', 'bilirubin', 'alkaline phosphatase', 'lft'] },
    { key: 'calcium', label: 'Serum Calcium', matchKeywords: ['calcium', 'ca'] },
    { key: 'hba1c', label: 'Blood Glucose & HbA1c', matchKeywords: ['hba1c', 'glucose', 'sugar', 'fasting blood sugar'] },
    { key: 'cbc', label: 'Complete Blood Count', matchKeywords: ['hemoglobin', 'wbc', 'platelet', 'rbc', 'hematocrit', 'cbc'] },
    { key: 'vitamin_b12', label: 'Vitamin B12', matchKeywords: ['b12', 'vitamin b12', 'cobalamin'] },
    { key: 'vitamin_d', label: 'Vitamin D', matchKeywords: ['vitamin d', '25-oh', 'calciferol'] },
    { key: 'iron', label: 'Iron Profile', matchKeywords: ['iron', 'ferritin', 'tibc'] }
  ];

  return systems.map((sys) => {
    const matchedParams = parameters.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const panel = (p.panel || '').toLowerCase();
      const bodySys = (p.bodySystem || '').toLowerCase();
      return (
        bodySys === sys.key ||
        sys.matchKeywords.some((kw) => name.includes(kw) || panel.includes(kw))
      );
    });

    if (matchedParams.length === 0) {
      return {
        key: sys.key,
        label: sys.label,
        state: 'Test not taken',
        statusColor: 'grey',
        headlineValue: 'N/A'
      };
    }

    const hasConcern = matchedParams.some((p) => p.status !== 'normal');
    const primaryParam = matchedParams[0];
    const headline = primaryParam.resultType === 'text'
      ? primaryParam.textValue
      : `${primaryParam.value} ${primaryParam.unit}`;

    return {
      key: sys.key,
      label: sys.label,
      state: hasConcern ? 'Concern' : 'Looks good',
      statusColor: hasConcern ? 'red' : 'green',
      headlineValue: headline,
      parameterCount: matchedParams.length
    };
  });
};

/**
 * Filter and sort critical parameters by severity
 */
const getCriticalParameters = (parameters = [], paramRefsMap = {}) => {
  const abnormal = parameters.filter((p) => p.status && p.status !== 'normal');

  const severityOrder = { marked: 1, moderate: 2, mild: 3, none: 4 };

  abnormal.sort((a, b) => {
    const orderA = severityOrder[a.severity || 'mild'];
    const orderB = severityOrder[b.severity || 'mild'];
    return orderA - orderB;
  });

  return abnormal.map((p) => {
    const ref = paramRefsMap[p.name] || {};
    let arrow = '⚠️';
    if (p.status === 'high') arrow = '↑';
    if (p.status === 'low') arrow = '↓';

    return {
      name: p.name,
      panel: p.panel || 'General',
      value: p.resultType === 'text' ? p.textValue : p.value,
      unit: p.unit || '',
      status: p.status,
      severity: p.severity || 'mild',
      arrow,
      normalRange: p.resultType === 'text'
        ? (p.referenceText || 'Negative')
        : `${p.normalRangeLow ?? 'Min'} - ${p.normalRangeHigh ?? 'Max'}`,
      impact: p.impact || ref.impact || 'Parameter is outside optimal clinical bounds.',
      howToImprove: p.howToImprove || ref.howToImprove || 'Discuss with your primary care physician.'
    };
  });
};

/**
 * Generate rule-based static advisory based on patient profile & abnormal biomarkers
 */
const getRuleBasedAdvisory = (patientProfile = null, abnormalParameters = [], vitalsGrid = []) => {
  let bmi = null;
  let bmiCategory = 'Not calculated';

  if (patientProfile && patientProfile.heightCm && patientProfile.weightKg) {
    const hM = patientProfile.heightCm / 100;
    bmi = Number((patientProfile.weightKg / (hM * hM)).toFixed(1));
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25.0) bmiCategory = 'Normal weight';
    else if (bmi < 30.0) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
  }

  const dos = [];
  const donts = [];
  const retests = [];

  const concernKeys = vitalsGrid.filter((v) => v.state === 'Concern').map((v) => v.key);

  if (concernKeys.includes('cholesterol')) {
    dos.push('Increase dietary soluble fiber (oats, legumes, psyllium husk) and omega-3 fatty acids.');
    dos.push('Engage in 150 minutes of moderate aerobic activity per week.');
    donts.push('Avoid trans fats, fried foods, and excessive saturated animal fats.');
    retests.push({ test: 'Comprehensive Lipid Profile', frequency: 'In 8 - 12 weeks' });
  }

  if (concernKeys.includes('hba1c')) {
    dos.push('Adopt a low glycemic index diet with complex carbohydrates and high protein.');
    dos.push('Monitor postprandial glucose levels regularly.');
    donts.push('Avoid refined sugars, sugary beverages, and processed carbohydrates.');
    retests.push({ test: 'Fasting Blood Sugar & HbA1c', frequency: 'In 3 months' });
  }

  if (concernKeys.includes('thyroid')) {
    dos.push('Maintain consistent timing for thyroid medications on an empty stomach if prescribed.');
    donts.push('Do not take calcium or iron supplements within 4 hours of thyroid medication.');
    retests.push({ test: 'Thyroid Function Panel (TSH, Free T3, Free T4)', frequency: 'In 6 - 8 weeks' });
  }

  if (concernKeys.includes('kidney')) {
    dos.push('Maintain adequate hydration (2 - 2.5 liters of water daily unless restricted).');
    donts.push('Avoid frequent unprescribed NSAID painkiller use.');
    retests.push({ test: 'Renal Function Test (Serum Creatinine & eGFR)', frequency: 'In 4 - 6 weeks' });
  }

  if (concernKeys.includes('cbc') || concernKeys.includes('iron')) {
    dos.push('Include iron-rich foods (spinach, lentils, dark poultry) accompanied by Vitamin C for absorption.');
    donts.push('Avoid drinking tea or coffee immediately after meals as tannins inhibit iron absorption.');
    retests.push({ test: 'Complete Blood Count & Ferritin', frequency: 'In 8 weeks' });
  }

  // Default fallback guidance if no specific concern or empty
  if (dos.length === 0) {
    dos.push('Maintain a balanced diet rich in whole foods, vegetables, and lean proteins.');
    dos.push('Stay adequately hydrated with 2-3 liters of water daily.');
    donts.push('Avoid sedentary routines and excessive ultra-processed food intake.');
    retests.push({ test: 'Annual Routine Health Screening', frequency: 'In 12 months' });
  }

  return {
    bmiSummary: {
      bmi,
      category: bmiCategory,
      details: patientProfile
        ? `Height: ${patientProfile.heightCm} cm, Weight: ${patientProfile.weightKg} kg`
        : 'Patient body measurements required for BMI calculation.'
    },
    nutritionAndLifestyle: {
      dos: [...new Set(dos)],
      donts: [...new Set(donts)]
    },
    suggestedRetests: retests
  };
};

module.exports = {
  calculateHealthScore,
  getVitalsGrid,
  getCriticalParameters,
  getRuleBasedAdvisory
};
