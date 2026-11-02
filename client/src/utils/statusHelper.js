/**
 * Helper to compute biomarker status on the client matching the clinical server logic.
 */
export const getParameterStatus = (value, low, high, resultType = 'numeric', textValue = '', referenceText = '') => {
  if (resultType === 'text') {
    if (!textValue) return 'normal';
    const cleanText = textValue.trim().toLowerCase();
    const cleanRef = (referenceText || 'negative, nil, absent, clear').toLowerCase();

    const abnormalWords = ['positive', 'present', 'trace', '1+', '2+', '3+', '4+', 'reactive', 'abnormal', 'detected', 'cloudy', 'turbid'];
    const isAbnormal = abnormalWords.some((w) => cleanText.includes(w)) && !cleanRef.includes(cleanText);

    return isAbnormal ? 'abnormal' : 'normal';
  }

  const numValue = Number(value);
  if (value === '' || isNaN(numValue)) return 'normal';

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

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
