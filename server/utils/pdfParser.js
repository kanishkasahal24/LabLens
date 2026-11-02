const pdfParseModule = require('pdf-parse');
const Tesseract = require('tesseract.js');
const ParameterReference = require('../models/ParameterReference');
const { getParameterStatus, getSeverity, getRangeForAgeSex } = require('./parameterStatus');

/**
 * Normalizes text to assist in biomarker matching
 */
const normalizeText = (text) => {
  return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Extracts raw text from a PDF Buffer
 * Supports both v1 (function) and v2+ (PDFParse class instance) of pdf-parse
 */
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    if (typeof pdfParseModule === 'function') {
      const data = await pdfParseModule(pdfBuffer);
      return data.text || '';
    } else if (pdfParseModule.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: pdfBuffer });
      const result = await parser.getText();
      return result?.text || '';
    } else if (typeof pdfParseModule.default === 'function') {
      const data = await pdfParseModule.default(pdfBuffer);
      return data.text || '';
    }
    return '';
  } catch (err) {
    console.error('PDF parsing error:', err.message);
    throw err;
  }
};

/**
 * Optical Character Recognition (OCR) for scanned PDFs and image files (PNG, JPG, etc.)
 */
const extractTextWithOCR = async (imageBuffer) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {} // quiet mode
    });
    return text || '';
  } catch (err) {
    console.error('Tesseract OCR error:', err.message);
    throw err;
  }
};

/**
 * Heuristic metadata extraction (Lab Name, Dates, Sample Type)
 */
const extractMetadata = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let labName = '';
  let testDate = null;
  let sampleType = 'Venous Blood';

  // Common lab brand keywords
  const knownLabs = [
    'Quest Diagnostics',
    'LabCorp',
    'Metropolis',
    'Apex Health',
    'Dr. Lal PathLabs',
    'Thyrocare',
    'SRL Diagnostics',
    'City Diagnostics'
  ];

  for (const lab of knownLabs) {
    if (new RegExp(lab, 'i').test(text)) {
      labName = lab;
      break;
    }
  }

  // If lab name not matched, look for common lines with "Pathology", "Diagnostics", "Laboratory", "Hospital", "Clinic"
  if (!labName) {
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i];
      if (/laboratory|pathology|diagnostic|clinic|hospital/i.test(line) && line.length < 60) {
        labName = line;
        break;
      }
    }
  }

  if (!labName && lines.length > 0) {
    // First non-empty header line
    labName = lines[0].substring(0, 50);
  }

  // Detect Sample Date
  // Formats: DD/MM/YYYY, YYYY-MM-DD, DD-MMM-YYYY, etc.
  const dateRegex = /\b(\d{1,2}[-/.](?:[A-Za-z]{3}|\d{1,2})[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/g;
  const dateMatches = text.match(dateRegex);
  if (dateMatches && dateMatches.length > 0) {
    for (const dStr of dateMatches) {
      const parsed = new Date(dStr);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000 && parsed.getFullYear() <= new Date().getFullYear() + 1) {
        testDate = parsed;
        break;
      }
    }
  }

  if (!testDate) {
    testDate = new Date();
  }

  // Specimen Detection
  if (/urine/i.test(text)) {
    sampleType = 'Urine Sample';
  } else if (/capillary/i.test(text)) {
    sampleType = 'Capillary Blood';
  }

  return {
    labName: labName || 'Diagnostic Laboratory',
    testDate,
    sampleType
  };
};

/**
 * Core clinical extraction engine that maps PDF lines to ParameterReferences
 */
const parseBiomarkersFromText = async (text, patientProfile = null) => {
  const references = await ParameterReference.find({});
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const age = patientProfile ? calculateAge(patientProfile.dateOfBirth) : null;
  const sex = patientProfile?.sex || 'male';

  const extractedParams = [];
  const matchedRefIds = new Set();

  for (const ref of references) {
    // Names to check: canonicalName + all aliases
    const aliases = [ref.canonicalName, ...(ref.aliases || [])];

    let foundLine = null;
    let matchedAlias = '';

    for (const line of lines) {
      for (const alias of aliases) {
        // Match word boundaries or clean token match
        const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const pattern = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');

        if (pattern.test(line)) {
          foundLine = line;
          matchedAlias = alias;
          break;
        }
      }
      if (foundLine) break;
    }

    if (!foundLine) continue;

    // Check if we already added this canonical parameter
    if (matchedRefIds.has(ref._id.toString())) continue;

    const range = getRangeForAgeSex(ref, age, sex);

    if (ref.resultType === 'text') {
      // Look for text indicators like Negative, Nil, Positive, Present, Trace
      const textMatch = foundLine.match(/\b(negative|nil|positive|present|trace|absent|reactive|non-reactive|normal|abnormal)\b/i);
      const textVal = textMatch ? textMatch[0] : 'Negative';
      const status = getParameterStatus(null, null, null, 'text', textVal, range.referenceText || 'Negative');
      const severity = getSeverity(null, null, null, status, 'text', textVal);

      extractedParams.push({
        name: ref.canonicalName,
        panel: ref.panel,
        bodySystem: ref.bodySystem,
        resultType: 'text',
        value: null,
        textValue: textVal,
        unit: ref.unit || '',
        normalRangeLow: null,
        normalRangeHigh: null,
        referenceText: range.referenceText || 'Negative / Nil',
        status,
        severity,
        confidence: 'high'
      });
      matchedRefIds.add(ref._id.toString());
    } else {
      // Numeric Biomarker
      // Extract numeric values from the line
      // E.g.: "Hemoglobin 13.8 g/dL (12.0 - 15.5)" or "Total Cholesterol : 215 mg/dL"
      // Remove the matched alias from the line to avoid matching numbers in the parameter name (like T3, T4, B12)
      const sanitizedLine = foundLine.replace(new RegExp(matchedAlias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), '');
      
      // Find all floating point or integer numbers in the line
      const numMatches = sanitizedLine.match(/\b\d+(\.\d+)?\b/g);

      if (numMatches && numMatches.length > 0) {
        // Typically the first number following the name is the patient's measured value
        const measuredVal = parseFloat(numMatches[0]);

        // If there are more numbers, check if low and high ranges can be extracted
        let detectedLow = range.low;
        let detectedHigh = range.high;

        if (numMatches.length >= 3) {
          const possibleLow = parseFloat(numMatches[1]);
          const possibleHigh = parseFloat(numMatches[2]);
          if (!isNaN(possibleLow) && !isNaN(possibleHigh) && possibleLow < possibleHigh) {
            detectedLow = possibleLow;
            detectedHigh = possibleHigh;
          }
        }

        const status = getParameterStatus(measuredVal, detectedLow, detectedHigh, 'numeric');
        const severity = getSeverity(measuredVal, detectedLow, detectedHigh, status, 'numeric');

        extractedParams.push({
          name: ref.canonicalName,
          panel: ref.panel,
          bodySystem: ref.bodySystem,
          resultType: 'numeric',
          value: measuredVal,
          textValue: '',
          unit: ref.unit || '',
          normalRangeLow: detectedLow,
          normalRangeHigh: detectedHigh,
          referenceText: '',
          status,
          severity,
          confidence: 'high'
        });
        matchedRefIds.add(ref._id.toString());
      }
    }
  }

  return extractedParams;
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

module.exports = {
  extractTextFromPDF,
  extractTextWithOCR,
  extractMetadata,
  parseBiomarkersFromText
};
