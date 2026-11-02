import React, { useReducer, useState, useEffect, useRef } from 'react';
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
  Loader2
} from 'lucide-react';
import api from '../api/axios';

const initialState = {
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
          { name: '', panel: 'General', resultType: 'numeric', value: '', textValue: '', unit: '', normalRangeLow: '', normalRangeHigh: '', referenceText: '' }
        ]
      };

    case 'REMOVE_PARAM':
      if (state.parameters.length <= 1) return state;
      return {
        ...state,
        parameters: state.parameters.filter((_, idx) => idx !== action.index)
      };

    case 'UPDATE_PARAM':
      const updatedParams = [...state.parameters];
      updatedParams[action.index] = {
        ...updatedParams[action.index],
        [action.field]: action.value
      };
      return { ...state, parameters: updatedParams };

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
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [references, setReferences] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // PDF Upload & Extraction States
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
        referenceText: r.range?.referenceText || ''
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

  // PDF & Image OCR Extraction Handler
  const handlePdfUpload = async (file) => {
    if (!file) return;

    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    const fileNameLower = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileNameLower.endsWith(ext)) ||
      file.type === 'application/pdf' ||
      file.type.startsWith('image/');

    if (!isValid) {
      setServerError('Please select a valid PDF document or report image (.pdf, .png, .jpg, .jpeg, .webp).');
      return;
    }

    setServerError('');
    setUploadSuccessMessage('');
    setIsUploadingPdf(true);
    setPdfFile(file);

    try {
      const formData = new FormData();
      formData.append('reportPdf', file);

      const res = await api.post('/reports/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { metadata, parameters, message } = res.data;

      // Populate extracted metadata and biomarkers into form state
      dispatch({
        type: 'SET_ALL_FIELDS',
        payload: {
          labName: metadata.labName || state.labName,
          testDate: metadata.testDate || state.testDate,
          collectionDate: metadata.collectionDate || state.collectionDate,
          sampleType: metadata.sampleType || state.sampleType,
          notes: `Uploaded from ${metadata.fileName}. Automatically extracted ${parameters.length} biomarkers.`,
          parameters: parameters.length > 0 ? parameters.map((p) => ({
            name: p.name,
            panel: p.panel || 'General',
            resultType: p.resultType || 'numeric',
            value: p.value !== null && p.value !== undefined ? String(p.value) : '',
            textValue: p.textValue || '',
            unit: p.unit || '',
            normalRangeLow: p.normalRangeLow !== null && p.normalRangeLow !== undefined ? String(p.normalRangeLow) : '',
            normalRangeHigh: p.normalRangeHigh !== null && p.normalRangeHigh !== undefined ? String(p.normalRangeHigh) : '',
            referenceText: p.referenceText || ''
          })) : state.parameters
        }
      });

      setUploadSuccessMessage(message || `Extracted ${parameters.length} biomarkers from PDF. Review and edit values below before saving.`);
    } catch (err) {
      console.error('PDF extraction failed:', err);
      setServerError(err.response?.data?.message || 'Failed to extract biomarkers from this PDF. Please enter values manually.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!state.labName.trim()) {
      errors.labName = 'Laboratory name is required';
    }

    if (!state.testDate) {
      errors.testDate = 'Test date is required';
    }

    const paramErrors = [];
    state.parameters.forEach((param, idx) => {
      const err = {};
      if (!param.name.trim()) {
        err.name = 'Name required';
      }

      if (param.resultType === 'numeric') {
        if (param.value === '' || isNaN(Number(param.value))) {
          err.value = 'Numeric value required';
        }
      } else {
        if (!param.textValue.trim()) {
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

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        labName: state.labName,
        testDate: state.testDate,
        collectionDate: state.collectionDate || state.testDate,
        sampleType: state.sampleType,
        notes: state.notes,
        parameters: state.parameters.map((p) => ({
          name: p.name,
          panel: p.panel || 'General',
          resultType: p.resultType || 'numeric',
          value: p.resultType === 'numeric' && p.value !== '' ? Number(p.value) : null,
          textValue: p.textValue || '',
          unit: p.unit,
          normalRangeLow: p.normalRangeLow !== '' ? Number(p.normalRangeLow) : null,
          normalRangeHigh: p.normalRangeHigh !== '' ? Number(p.normalRangeHigh) : null,
          referenceText: p.referenceText || ''
        }))
      };

      const res = await api.post('/reports', payload);
      navigate(`/reports/${res.data._id}`);
    } catch (err) {
      console.error('Error adding report:', err);
      setServerError(err.response?.data?.message || 'Failed to save report. Please check input values.');
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
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      {uploadSuccessMessage && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'var(--status-normal-bg)', color: 'var(--status-normal-text)', border: '1px solid var(--status-normal-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* PDF Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary-teal)' : 'var(--border-color)'}`,
          backgroundColor: isDragging ? 'var(--primary-teal-light)' : 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 20px',
          textAlign: 'center',
          marginBottom: '24px',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handlePdfUpload(e.target.files[0]);
            }
          }}
        />

        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)', marginBottom: '12px' }}>
          {isUploadingPdf ? <Loader2 size={26} className="animate-spin" /> : <UploadCloud size={26} />}
        </div>

        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {isUploadingPdf ? 'Analyzing Report with OCR & Parser...' : 'Upload Blood Report (PDF or Scanned Image)'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '520px', margin: '4px auto 0' }}>
          Drag and drop your digital lab report PDF, scanned report, or lab photo (PNG, JPG) here, or <strong style={{ color: 'var(--primary-teal)' }}>browse files</strong>. LabLens uses OCR & smart parsing to automatically extract biomarker values.
        </p>

        {pdfFile && !isUploadingPdf && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '4px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
            <FileText size={14} style={{ color: 'var(--primary-teal)' }} />
            <span>{pdfFile.name}</span>
          </div>
        )}

        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <a
            href="/sample_blood_report.pdf"
            download="sample_blood_report.pdf"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--primary-teal)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)'
            }}
          >
            📥 Sample 1: Routine Health (PDF)
          </a>
          <a
            href="/sample_metabolic_diabetes_report.pdf"
            download="sample_metabolic_diabetes_report.pdf"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--primary-teal)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)'
            }}
          >
            📥 Sample 2: Diabetic & Metabolic (PDF)
          </a>
          <a
            href="/sample_cbc_thyroid_report.pdf"
            download="sample_cbc_thyroid_report.pdf"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--primary-teal)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)'
            }}
          >
            📥 Sample 3: CBC & Thyroid (PDF)
          </a>
        </div>
      </div>

      <div className="card">
        {/* Panel Templates */}
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--primary-teal-light)', borderRadius: 'var(--radius-md)', border: '1px solid #B2DDDD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-teal)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>
            <Sparkles size={18} />
            <span>Or Choose a Quick Panel Template (Auto-fills reference ranges for your profile)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Lipid Profile', 'Liver Function', 'Kidney Function', 'CBC with Differential', 'Thyroid Panel', 'Glucose & HbA1c', 'Urine Routine'].map((panel) => (
              <button
                key={panel}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loadPanelTemplate(panel)}
              >
                <FileSpreadsheet size={14} />
                <span>{panel}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="labName">Diagnostic Lab Name *</label>
              <input
                id="labName"
                type="text"
                className="form-input"
                placeholder="e.g. Quest Diagnostics, LabCorp"
                value={state.labName}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'labName', value: e.target.value })}
              />
              {validationErrors.labName && <p className="form-error">{validationErrors.labName}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="testDate">Sample Collection Date *</label>
              <input
                id="testDate"
                type="date"
                className="form-input"
                value={state.testDate}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'testDate', value: e.target.value })}
              />
              {validationErrors.testDate && <p className="form-error">{validationErrors.testDate}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="sampleType">Sample Specimen Type</label>
              <select
                id="sampleType"
                className="form-select"
                value={state.sampleType}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'sampleType', value: e.target.value })}
              >
                <option value="Venous Blood">Venous Blood</option>
                <option value="Capillary Blood">Capillary Blood</option>
                <option value="Urine Sample">Urine Sample</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="notes">Clinical Notes / Comments (Optional)</label>
            <input
              id="notes"
              type="text"
              className="form-input"
              placeholder="e.g. Fasted 12 hrs prior to blood draw, routine checkup"
              value={state.notes}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
            />
          </div>

          {/* Dynamic Parameters List */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Biomarkers & Reference Ranges
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch({ type: 'ADD_PARAM' })}
              >
                <PlusCircle size={16} />
                <span>Add Biomarker Row</span>
              </button>
            </div>

            {state.parameters.map((param, index) => {
              const rowErr = validationErrors.parameters?.[index] || {};

              return (
                <div key={index} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '12px', backgroundColor: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'start' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Biomarker Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Total Cholesterol"
                        value={param.name}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'name', value: e.target.value })}
                        onBlur={(e) => handleNameBlur(index, e.target.value)}
                      />
                      {rowErr.name && <p className="form-error">{rowErr.name}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Type</label>
                      <select
                        className="form-select"
                        value={param.resultType || 'numeric'}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'resultType', value: e.target.value })}
                      >
                        <option value="numeric">Numeric</option>
                        <option value="text">Text Result</option>
                      </select>
                    </div>

                    {param.resultType === 'numeric' ? (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Value</label>
                        <input
                          type="number"
                          step="any"
                          className="form-input number-cell"
                          placeholder="e.g. 185"
                          value={param.value}
                          onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'value', value: e.target.value })}
                        />
                        {rowErr.value && <p className="form-error">{rowErr.value}</p>}
                      </div>
                    ) : (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Text Result</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Negative, Trace"
                          value={param.textValue}
                          onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'textValue', value: e.target.value })}
                        />
                        {rowErr.textValue && <p className="form-error">{rowErr.textValue}</p>}
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Unit</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. mg/dL"
                        value={param.unit}
                        onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'unit', value: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ref Range / Text</label>
                      {param.resultType === 'numeric' ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="number"
                            step="any"
                            className="form-input number-cell"
                            placeholder="Low"
                            value={param.normalRangeLow}
                            onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'normalRangeLow', value: e.target.value })}
                          />
                          <input
                            type="number"
                            step="any"
                            className="form-input number-cell"
                            placeholder="High"
                            value={param.normalRangeHigh}
                            onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'normalRangeHigh', value: e.target.value })}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ref text (Negative)"
                          value={param.referenceText}
                          onChange={(e) => dispatch({ type: 'UPDATE_PARAM', index, field: 'referenceText', value: e.target.value })}
                        />
                      )}
                    </div>

                    <div style={{ paddingTop: '20px' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '10px' }}
                        onClick={() => dispatch({ type: 'REMOVE_PARAM', index })}
                        disabled={state.parameters.length <= 1}
                        title="Delete row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={18} />
              <span>{isSubmitting ? 'Saving Analysis Report...' : 'Save Blood Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportPage;
