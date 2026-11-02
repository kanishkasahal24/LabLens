import React, { useState } from 'react';
import { Activity, Calendar, Building2, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import StatusBadge from '../StatusBadge';

const samplePanels = {
  cbc: {
    name: 'CBC with Differential',
    labName: 'MetroPath Diagnostics',
    testDate: 'Oct 14, 2026',
    biomarkers: [
      { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', low: 13.5, high: 17.5, status: 'normal', impact: 'Oxygen carrying capacity of red cells' },
      { name: 'White Blood Cell (WBC)', value: 6.8, unit: 'x10^3/uL', low: 4.5, high: 11.0, status: 'normal', impact: 'Immune response and infection defense' },
      { name: 'Platelets', value: 245, unit: 'x10^3/uL', low: 150, high: 450, status: 'normal', impact: 'Blood clotting and wound healing' },
      { name: 'RBC Count', value: 4.9, unit: 'x10^6/uL', low: 4.3, high: 5.9, status: 'normal', impact: 'Total volume of circulating erythrocytes' }
    ]
  },
  lipids: {
    name: 'Lipid Profile',
    labName: 'Quest Diagnostics',
    testDate: 'Nov 02, 2026',
    biomarkers: [
      { name: 'Total Cholesterol', value: 218, unit: 'mg/dL', low: 125, high: 200, status: 'high', impact: 'Overall lipid level; elevated levels indicate cardiovascular risk' },
      { name: 'HDL Cholesterol', value: 54, unit: 'mg/dL', low: 40, high: 60, status: 'normal', impact: 'Beneficial cholesterol that helps remove LDL from arteries' },
      { name: 'LDL Cholesterol', value: 138, unit: 'mg/dL', low: 50, high: 100, status: 'high', impact: 'Primary carrier of atherogenic cholesterol' },
      { name: 'Triglycerides', value: 130, unit: 'mg/dL', low: 0, high: 150, status: 'normal', impact: 'Stored fat circulating in bloodstream' }
    ]
  },
  metabolic: {
    name: 'Metabolic & Thyroid',
    labName: 'Apex Health Systems',
    testDate: 'Nov 02, 2026',
    biomarkers: [
      { name: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', low: 70, high: 99, status: 'normal', impact: 'Key indicator for insulin sensitivity and metabolic health' },
      { name: 'HbA1c', value: 5.4, unit: '%', low: 4.0, high: 5.6, status: 'normal', impact: 'Average blood sugar control over previous 3 months' },
      { name: 'TSH (Thyroid Stimulating)', value: 2.1, unit: 'mIU/L', low: 0.4, high: 4.5, status: 'normal', impact: 'Pituitary signal regulating thyroid hormone output' },
      { name: 'Creatinine', value: 0.95, unit: 'mg/dL', low: 0.7, high: 1.3, status: 'normal', impact: 'Kidney filtration and muscular metabolism rate' }
    ]
  }
};

const SamplePreview = () => {
  const [activeTab, setActiveTab] = useState('lipids');
  const current = samplePanels[activeTab];

  return (
    <section className="landing-preview-section" aria-labelledby="preview-heading">
      <div className="section-header text-center">
        <span className="section-pill">Interactive Live Demo</span>
        <h2 id="preview-heading" className="section-title">
          See How Your Lab Report Appears in LabLens
        </h2>
        <p className="section-subtitle">
          Every parameter is parsed, classified against standard reference ranges, and mapped to clinical health categories.
        </p>
      </div>

      <div className="preview-container card">
        <div className="preview-top-bar">
          <div className="preview-meta">
            <div className="preview-lab-info">
              <Building2 size={18} className="text-primary" aria-hidden="true" />
              <span className="preview-lab-name">{current.labName}</span>
            </div>
            <div className="preview-date-info">
              <Calendar size={16} aria-hidden="true" />
              <span>{current.testDate}</span>
            </div>
          </div>

          <div className="preview-tab-pills" role="tablist" aria-label="Select sample laboratory panel">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'lipids'}
              className={`preview-tab-btn ${activeTab === 'lipids' ? 'active' : ''}`}
              onClick={() => setActiveTab('lipids')}
            >
              Lipid Profile
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cbc'}
              className={`preview-tab-btn ${activeTab === 'cbc' ? 'active' : ''}`}
              onClick={() => setActiveTab('cbc')}
            >
              CBC Panel
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'metabolic'}
              className={`preview-tab-btn ${activeTab === 'metabolic' ? 'active' : ''}`}
              onClick={() => setActiveTab('metabolic')}
            >
              Metabolic & Thyroid
            </button>
          </div>
        </div>

        <div className="clinical-table-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th scope="col">Biomarker</th>
                <th scope="col">Measured Value</th>
                <th scope="col">Reference Interval</th>
                <th scope="col">Status</th>
                <th scope="col" className="hide-on-mobile">Clinical Function</th>
              </tr>
            </thead>
            <tbody>
              {current.biomarkers.map((b, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="biomarker-name-cell">
                      <span className="biomarker-title">{b.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="number-cell" style={{ fontSize: '1rem' }}>
                      {b.value} <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{b.unit}</span>
                    </span>
                  </td>
                  <td>
                    <span className="number-cell" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {b.low} – {b.high} {b.unit}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="hide-on-mobile">
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {b.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="preview-footer-note">
          <span className="preview-indicator-dot" />
          <span>Showing real-time reference ranges calibrated to age and biological sex.</span>
        </div>
      </div>
    </section>
  );
};

export default SamplePreview;
