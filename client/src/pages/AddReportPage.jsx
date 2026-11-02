import React, { useReducer, useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import api from '../api/axios';
import PdfDropzone from '../components/PdfDropzone';
import StatusBadge from '../components/StatusBadge';
import { getParameterStatus } from '../utils/statusHelper';

const initialManualState = {
  labName: '',
  testDate: new Date().toISOString().split('T')[0],
  collectionDate: new Date().toISOString().split('T')[0],
  sampleType: 'Venous Blood',
  notes: '',
  parameters: [
    { name: 'Hemoglobin', panel: 'CBC with Differential', resultType: 'numeric', value: '', textValue: '', unit: 'g/dL', normalRangeLow: '13.5', normalRangeHigh: '17.5', referenceText: '' },
    { name: 'Fasting Blood Sugar', panel: 'Glucose & HbA1c', resultType: 'numeric', value: '', textValue: '', unit: 'mg/dL', normalRangeLow: '70', normalRangeHigh: '99', referenceText: '' },
    { name: 'Total Cholesterol', panel: 'Lipid Profile', resultType: 'numeric', value: '', textValue: '', unit: 'mg/dL', normalRangeLow: '125', normalRangeHigh: '200', referenceText: '' }
  ]
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_ALL_FIELDS':
      return { ...state, ...action.payload };

    case 'ADD_PARAM':
      return {
        ...state,
        parameters: [
          ...state.parameters,
          { name: '', panel: 'General', resultType: 'numeric', value: '', textValue: '', unit: '', normalRangeLow: '', normalRangeHigh: '', referenceText: '', status: 'normal' }
        ]
      };

    case 'REMOVE_PARAM':
      if (state.parameters.length <= 1) return state;
      return {
        ...state,
        parameters: state.parameters.filter((_, idx) => idx !== action.index)
      };

    case 'UPDATE_PARAM': {
      const updatedParams = [...state.parameters];
      const target = { ...updatedParams[action.index], [action.field]: action.value };
      
      // Auto-recalculate status when value, range or type changes
      if (['value', 'normalRangeLow', 'normalRangeHigh', 'resultType', 'textValue', 'referenceText'].includes(action.field)) {
        target.status = getParameterStatus(
          target.value,
          target.normalRangeLow,
          target.normalRangeHigh,
          target.resultType,
          target.textValue,
          target.referenceText
        );
      }

      updatedParams[action.index] = target;
      return { ...state, parameters: updatedParams };
    }

    case 'LOAD_TEMPLATE':
      return {
        ...state,
        parameters: action.parameters
      };

    default:
      return state;
  }
}

const AddReportPage = () => {
  const [activeMode, setActiveMode] = useState('pdf'); // 'pdf' | 'manual'
  const [state, dispatch] = useReducer(formReducer, initialManualState);
  const [references, setReferences] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // PDF Upload & Extraction States
  const [pdfFile, setPdfFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const res = await api.get('/reports/references/all');
        setReferences(res.data || []);
      } catch (err) {
        console.error('Failed to load canonical reference list:', err);
      }
    };
    fetchReferences();
  }, []);

  // PDF Upload & Extraction Handler
  const handlePdfSelected = useCallback(async (selectedFile) => {
    setPdfFile(selectedFile);
    setUploadError('');
    setServerError('');
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append('reportPdf', selectedFile);

      const res = await api.post('/reports/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = res.data;
      setExtractionResult(data);

      const metadata = data.metadata || {};
      const extractedParams = (data.parameters || []).map((p) => {
        const status = p.status || getParameterStatus(
          p.value,
          p.normalRangeLow,
          p.normalRangeHigh,
          p.resultType,
          p.textValue,
          p.referenceText
        );

        return {
          name: p.name || '',
          panel: p.panel || 'General',
          resultType: p.resultType || 'numeric',
          value: p.value !== null && p.value !== undefined ? String(p.value) : '',
          textValue: p.textValue || '',
          unit: p.unit || '',
          normalRangeLow: p.normalRangeLow !== null && p.normalRangeLow !== undefined ? String(p.normalRangeLow) : '',
          normalRangeHigh: p.normalRangeHigh !== null && p.normalRangeHigh !== undefined ? String(p.normalRangeHigh) : '',
          referenceText: p.referenceText || '',
          status,
          confidence: p.confidence || 'high'
        };
      });

      // Synchronize into state
      dispatch({
        type: 'SET_ALL_FIELDS',
        payload: {
          labName: metadata.labName || 'Diagnostic Laboratory',
          testDate: metadata.testDate || new Date().toISOString().split('T')[0],
          collectionDate: metadata.collectionDate || metadata.testDate || new Date().toISOString().split('T')[0],
          sampleType: metadata.sampleType || 'Venous Blood',
          notes: `Uploaded from ${selectedFile.name} on ${new Date().toLocaleDateString()}. Extracted ${extractedParams.length} biomarkers.`,
          parameters: extractedParams.length > 0 ? extractedParams : [
            { name: '', panel: 'General', resultType: 'numeric', value: '', textValue: '', unit: '', normalRangeLow: '', normalRangeHigh: '', referenceText: '', status: 'normal' }
          ]
        }
      });
    } catch (err) {
      console.error('PDF extraction failed:', err);
      let errMsg = 'Failed to extract biomarkers from this PDF document.';
      if (err.response?.status === 422) {
        errMsg = err.response.data?.message || 'No extractable text found in this PDF. It may be a scanned image without OCR text or password-protected.';
      } else if (err.response?.status === 400) {
        errMsg = err.response.data?.message || 'Please upload a valid lab report PDF.';
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message && !err.response) {
        errMsg = 'Network error: Unable to reach the server. Please check your connection and retry.';
      }
      setUploadError(errMsg);
      setExtractionResult(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleClearPdf = () => {
    setPdfFile(null);
    setExtractionResult(null);
    setUploadError('');
    setServerError('');
    setValidationErrors({});
    dispatch({ type: 'SET_ALL_FIELDS', payload: initialManualState });
  };

  const loadPanelTemplate = (panelName) => {
    const panelRefs = references.filter((r) => r.panel.toLowerCase() === panelName.toLowerCase());
    if (panelRefs.length > 0) {
      const templateParams = panelRefs.map((r) => ({
        name: r.canonicalName,
        panel: r.panel,
        resultType: r.resultType || 'numeric',
        value: '',
        textValue: '',
        unit: r.unit || '',
        normalRangeLow: r.range?.low !== null && r.range?.low !== undefined ? String(r.range.low) : '',
        normalRangeHigh: r.range?.high !== null && r.range?.high !== undefined ? String(r.range.high) : '',
        referenceText: r.range?.referenceText || '',
        status: 'normal'
      }));
      dispatch({ type: 'LOAD_TEMPLATE', parameters: templateParams });
    }
  };

  const handleNameBlur = (index, nameValue) => {
    if (!nameValue) return;
    const match = references.find(
      (r) =>
        r.canonicalName.toLowerCase() === nameValue.toLowerCase() ||
        (Array.isArray(r.aliases) && r.aliases.some((a) => a.toLowerCase() === nameValue.toLowerCase()))
    );

    if (match) {
      const currentParam = state.parameters[index];
      dispatch({
        type: 'UPDATE_PARAM',
        index,
        field: 'panel',
        value: match.panel || currentParam.panel
      });
      if (!currentParam.unit && match.unit) {
        dispatch({ type: 'UPDATE_PARAM', index, field: 'unit', value: match.unit });
      }
      if (!currentParam.normalRangeLow && match.range?.low !== null && match.range?.low !== undefined) {
        dispatch({ type: 'UPDATE_PARAM', index, field: 'normalRangeLow', value: String(match.range.low) });
      }
      if (!currentParam.normalRangeHigh && match.range?.high !== null && match.range?.high !== undefined) {
        dispatch({ type: 'UPDATE_PARAM', index, field: 'normalRangeHigh', value: String(match.range.high) });
      }
      if (match.resultType) {
        dispatch({ type: 'UPDATE_PARAM', index, field: 'resultType', value: match.resultType });
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!state.labName || !state.labName.trim()) {
      errors.labName = 'Laboratory name is required';
    }

    if (!state.testDate) {
      errors.testDate = 'Test date is required';
    }

    if (!state.parameters || state.parameters.length === 0) {
      errors.general = 'At least one biomarker parameter is required';
    }

    const paramErrors = [];
    state.parameters.forEach((param, idx) => {
      const err = {};
      if (!param.name || !param.name.trim()) {
        err.name = 'Biomarker name is required';
      }

      if (param.resultType === 'numeric') {
        if (param.value === '' || param.value === null || isNaN(Number(param.value))) {
          err.value = 'Valid number is required';
        }
      } else {
        if (!param.textValue || !param.textValue.trim()) {
          err.textValue = 'Text result required';
        }
      }

      if (Object.keys(err).length > 0) {
        paramErrors[idx] = err;
      }
    });

    if (paramErrors.length > 0) {
      errors.parameters = paramErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        labName: state.labName.trim(),
        testDate: state.testDate,
        collectionDate: state.collectionDate || state.testDate,
        sampleType: state.sampleType || 'Venous Blood',
        notes: state.notes ? state.notes.trim() : '',
        parameters: state.parameters.map((p) => ({
          name: p.name.trim(),
          panel: p.panel ? p.panel.trim() : 'General',
          resultType: p.resultType || 'numeric',
          value: p.resultType === 'numeric' && p.value !== '' ? Number(p.value) : null,
          textValue: p.textValue ? p.textValue.trim() : '',
          unit: p.unit ? p.unit.trim() : '',
          normalRangeLow: p.normalRangeLow !== '' && p.normalRangeLow !== null ? Number(p.normalRangeLow) : null,
          normalRangeHigh: p.normalRangeHigh !== '' && p.normalRangeHigh !== null ? Number(p.normalRangeHigh) : null,
          referenceText: p.referenceText ? p.referenceText.trim() : ''
        }))
      };

      const res = await api.post('/reports', payload);
      navigate(`/reports/${res.data._id}`);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setServerError(err.response?.data?.message || 'Failed to save blood report. Please verify all entries.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="page-title">Add Blood Test Report</h1>
          <p className="page-subtitle">Upload your lab report PDF for automatic extraction or fill in biomarker values manually</p>
        </div>
      </div>

      {serverError && (
        <div className="error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      {/* Entry Mode Selector Tabs */}
      <div className="tab-selector-bar" role="tablist" aria-label="Report entry method">
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'pdf'}
          className={`tab-selector-btn ${activeMode === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveMode('pdf')}
        >
          <UploadCloud size={18} />
          <span>Upload PDF (Recommended)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'manual'}
          className={`tab-selector-btn ${activeMode === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveMode('manual')}
        >
          <FileSpreadsheet size={18} />
          <span>Manual Form Entry</span>
        </button>
      </div>

      {/* MODE 1: PDF UPLOAD ZONE & EXTRACTION PREVIEW */}
      {activeMode === 'pdf' && (
        <div>
          <PdfDropzone
            file={pdfFile}
            onFileSelected={handlePdfSelected}
            onClearFile={handleClearPdf}
            isLoading={isExtracting}
            error={uploadError}
            disabled={isExtracting || isSubmitting}
          />

          {uploadError && !isExtracting && (
            <div className="card" style={{ marginBottom: '24px', backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
                    Extraction Encountered an Issue
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#B91C1C', marginBottom: '12px' }}>
                    {uploadError}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleClearPdf}
                    >
                      <RefreshCw size={14} />
                      <span>Try Another PDF</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveMode('manual')}
                    >
                      <span>Switch to Manual Form</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EXTRACTION PREVIEW COMPONENT */}
          {extractionResult && !isExtracting && (
            <div className="extraction-preview-container card">
              <div className="extraction-header-banner">
                <div className="extraction-banner-left">
                  <CheckCircle2 size={22} className="flex-shrink-0" />
                  <div>
                    <h3 className="extraction-banner-title">
                      {extractionResult.message || `Extracted ${state.parameters.length} biomarkers successfully`}
                    </h3>
                    <p className="extraction-banner-sub">
                      Review detected parameters and laboratory metadata below. You can edit values, add missing rows, or remove parameters before confirming.
                    </p>
                  </div>
                </div>

                {extractionResult.preliminaryHealthScore !== undefined && (
                  <div className="preliminary-score-badge">
                    <Sparkles size={16} />
                    <span>Est. Score: {extractionResult.preliminaryHealthScore}/100</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Editable Metadata Fields */}
                <div className="extraction-meta-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="preview-labName">Laboratory / Clinic Name *</label>
                    <input
                      id="preview-labName"
                      type="text"
                      className={`form-input ${validationErrors.labName ? 'has-error' : ''}`}
                      placeholder="e.g. Dr. Lal PathLabs / Quest Diagnostics"
                      value={state.labName}
                      onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'labName', value: e.target.value })}
                    />
                    {validationErrors.labName && <p className="form-error">{validationErrors.labName}</p>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="preview-testDate">Test Date *</label>
                    <input
                      id="preview-testDate"
                      type="date"
                      className={`form-input ${validationErrors.testDate ? 'has-error' : ''}`}
                      value={state.testDate}
                      onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'testDate', value: e.target.value })}
                    />
                    {validationErrors.testDate && <p className="form-error">{validationErrors.testDate}</p>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="preview-sampleType">Specimen / Sample Type</label>
                    <select
                      id="preview-sampleType"
                      className="form-select"
                      value={state.sampleType}
                      onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'sampleType', value: e.target.value })}
                    >
                      <option value="Venous Blood">Venous Blood</option>
                      <option value="Capillary Blood">Capillary Blood</option>
                      <option value="Arterial Blood">Arterial Blood</option>
                      <option value="Urine Sample">Urine Sample</option>
                    </select>
                  </div>
                </div>

                {/* Editable Parameters Preview Table */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Extracted Biomarkers ({state.parameters.length})
                  </h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Status automatically recomputed as you edit
                  </span>
                </div>

                <div className="extraction-table-wrapper">
                  <table className="extraction-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Biomarker Name</th>
                        <th style={{ width: '16%' }}>Measured Value</th>
                        <th style={{ width: '12%' }}>Unit</th>
                        <th style={{ width: '22%' }}>Normal Range</th>
                        <th style={{ width: '14%' }}>Live Status</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.parameters.map((param, idx) => {
                        const paramErr = validationErrors.parameters?.[idx];
                        const isRecognized = references.some((r) =>
                          r.canonicalName.toLowerCase() === (param.name || '').toLowerCase() ||
                          (Array.isArray(r.aliases) && r.aliases.some((a) => a.toLowerCase() === (param.name || '').toLowerCase()))
                        );

                        return (
                          <tr key={idx} className={!isRecognized && param.name ? 'row-flagged' : ''}>
                            {/* Biomarker Name */}
                            <td>
                              <input
                                type="text"
                                className={`param-input-sm ${paramErr?.name ? 'has-error' : ''}`}
                                placeholder="Biomarker Name"
                                value={param.name}
                                onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'name', value: e.target.value })}
                                onBlur={(e) => handleNameBlur(idx, e.target.value)}
                              />
                              {!isRecognized && param.name && (
                                <div className="confidence-warning-badge" title="This biomarker was not matched against the canonical database. Values will still be saved.">
                                  <AlertCircle size={12} />
                                  <span>Custom Biomarker</span>
                                </div>
                              )}
                              {paramErr?.name && <p className="form-error" style={{ fontSize: '0.75rem' }}>{paramErr.name}</p>}
                            </td>

                            {/* Measured Value */}
                            <td>
                              <input
                                type="text"
                                className={`param-input-sm number-cell ${paramErr?.value ? 'has-error' : ''}`}
                                placeholder="e.g. 14.2"
                                value={param.value}
                                onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'value', value: e.target.value })}
                              />
                              {paramErr?.value && <p className="form-error" style={{ fontSize: '0.75rem' }}>{paramErr.value}</p>}
                            </td>

                            {/* Unit */}
                            <td>
                              <input
                                type="text"
                                className="param-input-sm"
                                placeholder="unit"
                                value={param.unit}
                                onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'unit', value: e.target.value })}
                              />
                            </td>

                            {/* Reference Ranges */}
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="param-input-sm number-cell"
                                  placeholder="Low"
                                  style={{ maxWidth: '75px' }}
                                  value={param.normalRangeLow}
                                  onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'normalRangeLow', value: e.target.value })}
                                />
                                <span style={{ color: 'var(--text-muted)' }}>–</span>
                                <input
                                  type="text"
                                  className="param-input-sm number-cell"
                                  placeholder="High"
                                  style={{ maxWidth: '75px' }}
                                  value={param.normalRangeHigh}
                                  onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'normalRangeHigh', value: e.target.value })}
                                />
                              </div>
                            </td>

                            {/* Live Status Badge */}
                            <td>
                              <StatusBadge status={param.status} />
                            </td>

                            {/* Delete Action */}
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => dispatch({ type: 'REMOVE_PARAM', index: idx })}
                                disabled={state.parameters.length <= 1}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', border: 'none', color: 'var(--text-light)' }}
                                title="Delete this biomarker row"
                                aria-label={`Delete biomarker row ${idx + 1}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Row Button */}
                <div style={{ marginBottom: '24px' }}>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'ADD_PARAM' })}
                    className="btn btn-secondary btn-sm"
                  >
                    <PlusCircle size={16} />
                    <span>Add Missing Biomarker Row</span>
                  </button>
                </div>

                {/* Confirm / Reset Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={handleClearPdf}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    Cancel / Choose Another File
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Saving Analysis Report...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Confirm and Save Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MANUAL ENTRY FORM */}
      {activeMode === 'manual' && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="manual-labName">Laboratory Name *</label>
                <input
                  id="manual-labName"
                  type="text"
                  className={`form-input ${validationErrors.labName ? 'has-error' : ''}`}
                  placeholder="e.g. MetroPath Diagnostics"
                  value={state.labName}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'labName', value: e.target.value })}
                />
                {validationErrors.labName && <p className="form-error">{validationErrors.labName}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="manual-testDate">Test Date *</label>
                <input
                  id="manual-testDate"
                  type="date"
                  className={`form-input ${validationErrors.testDate ? 'has-error' : ''}`}
                  value={state.testDate}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'testDate', value: e.target.value })}
                />
                {validationErrors.testDate && <p className="form-error">{validationErrors.testDate}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="manual-collectionDate">Collection Date</label>
                <input
                  id="manual-collectionDate"
                  type="date"
                  className="form-input"
                  value={state.collectionDate}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'collectionDate', value: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="manual-sampleType">Specimen / Sample Type</label>
                <select
                  id="manual-sampleType"
                  className="form-select"
                  value={state.sampleType}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'sampleType', value: e.target.value })}
                >
                  <option value="Venous Blood">Venous Blood</option>
                  <option value="Capillary Blood">Capillary Blood</option>
                  <option value="Arterial Blood">Arterial Blood</option>
                  <option value="Urine Sample">Urine Sample</option>
                </select>
              </div>
            </div>

            {/* Quick Panel Preset Templates */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="var(--primary-teal)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Load Routine Panel Preset:
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['CBC with Differential', 'Glucose & HbA1c', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Panel'].map((panel) => (
                  <button
                    key={panel}
                    type="button"
                    onClick={() => loadPanelTemplate(panel)}
                    className="btn btn-secondary btn-sm"
                  >
                    {panel}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Biomarkers Table */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Biomarkers & Results ({state.parameters.length})
              </h3>
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_PARAM' })}
                className="btn btn-secondary btn-sm"
              >
                <PlusCircle size={16} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="extraction-table-wrapper">
              <table className="extraction-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Biomarker Name</th>
                    <th style={{ width: '16%' }}>Measured Value</th>
                    <th style={{ width: '12%' }}>Unit</th>
                    <th style={{ width: '22%' }}>Normal Range</th>
                    <th style={{ width: '14%' }}>Status</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.parameters.map((param, idx) => {
                    const paramErr = validationErrors.parameters?.[idx];
                    return (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className={`param-input-sm ${paramErr?.name ? 'has-error' : ''}`}
                            placeholder="e.g. Hemoglobin"
                            value={param.name}
                            onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'name', value: e.target.value })}
                            onBlur={(e) => handleNameBlur(idx, e.target.value)}
                          />
                          {paramErr?.name && <p className="form-error" style={{ fontSize: '0.75rem' }}>{paramErr.name}</p>}
                        </td>

                        <td>
                          <input
                            type="text"
                            className={`param-input-sm number-cell ${paramErr?.value ? 'has-error' : ''}`}
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'value', value: e.target.value })}
                          />
                          {paramErr?.value && <p className="form-error" style={{ fontSize: '0.75rem' }}>{paramErr.value}</p>}
                        </td>

                        <td>
                          <input
                            type="text"
                            className="param-input-sm"
                            placeholder="unit"
                            value={param.unit}
                            onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'unit', value: e.target.value })}
                          />
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="param-input-sm number-cell"
                              placeholder="Low"
                              style={{ maxWidth: '75px' }}
                              value={param.normalRangeLow}
                              onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'normalRangeLow', value: e.target.value })}
                            />
                            <span style={{ color: 'var(--text-muted)' }}>–</span>
                            <input
                              type="text"
                              className="param-input-sm number-cell"
                              placeholder="High"
                              style={{ maxWidth: '75px' }}
                              value={param.normalRangeHigh}
                              onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index: idx, field: 'normalRangeHigh', value: e.target.value })}
                            />
                          </div>
                        </td>

                        <td>
                          <StatusBadge status={param.status} />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'REMOVE_PARAM', index: idx })}
                            disabled={state.parameters.length <= 1}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', border: 'none', color: 'var(--text-light)' }}
                            title="Delete this biomarker row"
                            aria-label={`Delete biomarker row ${idx + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving Analysis Report...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Blood Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddReportPage;
