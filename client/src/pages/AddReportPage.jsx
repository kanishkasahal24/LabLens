import React, { useReducer, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Trash2, Save, ArrowLeft, AlertCircle, Sparkles, FileSpreadsheet } from 'lucide-react';
import api from '../api/axios';

// Coursework Requirement: useReducer for dynamic parameter list management
const initialState = {
  labName: '',
  testDate: new Date().toISOString().split('T')[0],
  notes: '',
  parameters: [
    { name: 'Hemoglobin', value: '', unit: 'g/dL', normalRangeLow: '12.0', normalRangeHigh: '15.5' },
    { name: 'Fasting Blood Sugar', value: '', unit: 'mg/dL', normalRangeLow: '70', normalRangeHigh: '99' },
    { name: 'Total Cholesterol', value: '', unit: 'mg/dL', normalRangeLow: '125', normalRangeHigh: '200' }
  ]
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_PARAM':
      return {
        ...state,
        parameters: [
          ...state.parameters,
          { name: '', value: '', unit: '', normalRangeLow: '', normalRangeHigh: '' }
        ]
      };

    case 'REMOVE_PARAM':
      if (state.parameters.length <= 1) return state; // Keep at least one row
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

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Preset clinical test panels for quick student testing
const CLINICAL_TEMPLATES = {
  CBC: [
    { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRangeLow: '12.0', normalRangeHigh: '15.5' },
    { name: 'WBC Count', value: '6.5', unit: 'x10^3/µL', normalRangeLow: '4.5', normalRangeHigh: '11.0' },
    { name: 'Platelet Count', value: '250', unit: 'x10^3/µL', normalRangeLow: '150', normalRangeHigh: '450' }
  ],
  LIPID: [
    { name: 'Total Cholesterol', value: '185', unit: 'mg/dL', normalRangeLow: '125', normalRangeHigh: '200' },
    { name: 'Triglycerides', value: '130', unit: 'mg/dL', normalRangeLow: '40', normalRangeHigh: '150' }
  ],
  METABOLIC: [
    { name: 'Fasting Blood Sugar', value: '95', unit: 'mg/dL', normalRangeLow: '70', normalRangeHigh: '99' },
    { name: 'Creatinine', value: '0.9', unit: 'mg/dL', normalRangeLow: '0.6', normalRangeHigh: '1.2' },
    { name: 'Serum Calcium', value: '9.4', unit: 'mg/dL', normalRangeLow: '8.5', normalRangeHigh: '10.2' }
  ]
};

const AddReportPage = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();

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

      if (param.value === '' || isNaN(Number(param.value))) {
        err.value = 'Numeric value required';
      }

      if (param.normalRangeLow !== '' && isNaN(Number(param.normalRangeLow))) {
        err.normalRangeLow = 'Must be number';
      }

      if (param.normalRangeHigh !== '' && isNaN(Number(param.normalRangeHigh))) {
        err.normalRangeHigh = 'Must be number';
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
        notes: state.notes,
        parameters: state.parameters.map((p) => ({
          name: p.name,
          value: Number(p.value),
          unit: p.unit,
          normalRangeLow: p.normalRangeLow !== '' ? Number(p.normalRangeLow) : null,
          normalRangeHigh: p.normalRangeHigh !== '' ? Number(p.normalRangeHigh) : null
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
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="page-title">Add Manual Blood Report</h1>
          <p className="page-subtitle">Enter lab test results manually with numerical reference ranges</p>
        </div>
      </div>

      {serverError && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      <div className="card">
        {/* Preset Templates Quick Autofill */}
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--primary-teal-light)', borderRadius: 'var(--radius-md)', border: '1px solid #B2DDDD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-teal)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>
            <Sparkles size={18} />
            <span>Quick Sample Templates (Click to Auto-fill Parameter Rows)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch({ type: 'LOAD_TEMPLATE', parameters: CLINICAL_TEMPLATES.CBC })}
            >
              <FileSpreadsheet size={14} />
              <span>Complete Blood Count (CBC)</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch({ type: 'LOAD_TEMPLATE', parameters: CLINICAL_TEMPLATES.LIPID })}
            >
              <FileSpreadsheet size={14} />
              <span>Lipid Panel</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch({ type: 'LOAD_TEMPLATE', parameters: CLINICAL_TEMPLATES.METABOLIC })}
            >
              <FileSpreadsheet size={14} />
              <span>Metabolic Panel</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
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
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="notes">Clinical Notes or Physician Comments (Optional)</label>
            <input
              id="notes"
              type="text"
              className="form-input"
              placeholder="e.g. Fasting 12 hrs prior to blood draw, routine annual screening"
              value={state.notes}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
            />
          </div>

          {/* Dynamic Parameters List Managed by useReducer */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Test Parameters & Reference Ranges
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch({ type: 'ADD_PARAM' })}
              >
                <PlusCircle size={16} />
                <span>Add Parameter Row</span>
              </button>
            </div>

            {/* Header row labels */}
            <div className="param-row" style={{ background: 'var(--bg-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <div>Biomarker Name *</div>
              <div>Measured Value *</div>
              <div>Unit</div>
              <div>Ref Low</div>
              <div>Ref High</div>
              <div>Action</div>
            </div>

            {state.parameters.map((param, index) => {
              const rowErr = validationErrors.parameters?.[index] || {};

              return (
                <div key={index} className="param-row">
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Hemoglobin"
                      value={param.name}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_PARAM',
                          index,
                          field: 'name',
                          value: e.target.value
                        })
                      }
                    />
                    {rowErr.name && <p className="form-error">{rowErr.name}</p>}
                  </div>

                  <div>
                    <input
                      type="number"
                      step="any"
                      className="form-input number-cell"
                      placeholder="e.g. 13.5"
                      value={param.value}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_PARAM',
                          index,
                          field: 'value',
                          value: e.target.value
                        })
                      }
                    />
                    {rowErr.value && <p className="form-error">{rowErr.value}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. g/dL"
                      value={param.unit}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_PARAM',
                          index,
                          field: 'unit',
                          value: e.target.value
                        })
                      }
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="any"
                      className="form-input number-cell"
                      placeholder="12.0"
                      value={param.normalRangeLow}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_PARAM',
                          index,
                          field: 'normalRangeLow',
                          value: e.target.value
                        })
                      }
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="any"
                      className="form-input number-cell"
                      placeholder="15.5"
                      value={param.normalRangeHigh}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_PARAM',
                          index,
                          field: 'normalRangeHigh',
                          value: e.target.value
                        })
                      }
                    />
                  </div>

                  <div>
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
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={18} />
              <span>{isSubmitting ? 'Saving Lab Report...' : 'Save Blood Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportPage;
