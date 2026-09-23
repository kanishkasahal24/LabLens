/**
 * Pure helper function to determine if a parameter value is normal, low, or high.
 * @param {number|string} value - The parameter numerical value
 * @param {number|string|null} low - Low threshold of normal reference range
 * @param {number|string|null} high - High threshold of normal reference range
 * @returns {'normal' | 'low' | 'high'}
 */
const getParameterStatus = (value, low, high) => {
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

module.exports = {
  getParameterStatus
};
