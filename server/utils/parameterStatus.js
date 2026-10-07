/**
 * Pure helper function to determine if a parameter value is normal, low, high, or abnormal.
 */
const getParameterStatus = (value, low, high, resultType = 'numeric', textValue = '', referenceText = '') => {
  if (resultType === 'text') {
    if (!textValue) return 'normal';
    const cleanText = textValue.trim().toLowerCase();
    const cleanRef = (referenceText || 'negative, nil, absent, clear').toLowerCase();

    // Check for abnormal text indicators
    const abnormalWords = ['positive', 'present', 'trace', '1+', '2+', '3+', '4+', 'reactive', 'abnormal', 'detected', 'cloudy', 'turbid'];
    const isAbnormal = abnormalWords.some((w) => cleanText.includes(w)) && !cleanRef.includes(cleanText);

    return isAbnormal ? 'abnormal' : 'normal';
  }

  const numValue = Number(value);
  if (isNaN(numValue)) return 'normal';

  const numLow = low !== undefined && low !== null && low !== '' ? Number(low) : null;
  const numHigh = high !== undefined && high !== null && high !== '' ? Number(high) : null;

  if (numLow !== null && !isNaN(numLow) && numValue < numLow) {
    return 'low';
  }

  if (numHigh !== null && !isNaN(numHigh) && numValue > numHigh) {
    return 'high';
  }

  return 'normal';
};

/**
 * Pure helper function to calculate severity ('none', 'mild', 'moderate', 'marked')
 * <10% outside range = mild
 * 10-30% outside range = moderate
 * >30% outside range = marked
 */
const getSeverity = (value, low, high, status, resultType = 'numeric', textValue = '') => {
  if (status === 'normal') return 'none';

  if (resultType === 'text' || status === 'abnormal') {
    const text = (textValue || '').toLowerCase();
    if (text.includes('3+') || text.includes('4+') || text.includes('high')) {
      return 'marked';
    }
    return 'moderate';
  }

  const numVal = Number(value);
  const numLow = low !== null && low !== undefined ? Number(low) : null;
  const numHigh = high !== null && high !== undefined ? Number(high) : null;

  let percentDiff = 0;

  if (status === 'low' && numLow && numLow > 0) {
    percentDiff = (numLow - numVal) / numLow;
  } else if (status === 'high' && numHigh && numHigh > 0) {
    percentDiff = (numVal - numHigh) / numHigh;
  } else {
    return 'mild';
  }

  if (percentDiff < 0.10) {
    return 'mild';
  } else if (percentDiff <= 0.30) {
    return 'moderate';
  } else {
    return 'marked';
  }
};

/**
 * Pure helper to select appropriate reference ranges by age and sex
 */
const getRangeForAgeSex = (paramRef, age, sex) => {
  if (!paramRef) return { low: null, high: null, referenceText: '' };

  if (sex && paramRef.genderRanges && paramRef.genderRanges[sex]) {
    const gRange = paramRef.genderRanges[sex];
    if (gRange.low !== null || gRange.high !== null) {
      return {
        low: gRange.low,
        high: gRange.high,
        referenceText: paramRef.defaultRange?.referenceText || ''
      };
    }
  }

  return {
    low: paramRef.defaultRange?.low ?? null,
    high: paramRef.defaultRange?.high ?? null,
    referenceText: paramRef.defaultRange?.referenceText || ''
  };
};

module.exports = {
  getParameterStatus,
  getSeverity,
  getRangeForAgeSex
};
