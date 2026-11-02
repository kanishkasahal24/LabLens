import React from 'react';
import { UploadCloud, Cpu, LineChart, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    icon: UploadCloud,
    title: 'Upload or Enter Your Lab Report',
    description: 'Simply drag and drop your clinical blood test PDF or enter measurements using our intuitive panel templates (CBC, Lipid, Metabolic, Thyroid, Liver, etc.).'
  },
  {
    stepNumber: '02',
    icon: Cpu,
    title: 'Smart Extraction & Clinical Scoring',
    description: 'LabLens instantly extracts biomarker values, normalizes units, maps age- and sex-adjusted reference intervals, and computes an overall 100-point Health Score.'
  },
  {
    stepNumber: '03',
    icon: LineChart,
    title: 'Track Progression & Consult Confidently',
    description: 'Visualize long-term biomarker trajectory lines, compare consecutive lab tests side by side, and share structured records directly with your healthcare provider.'
  }
];

const HowItWorks = () => {
  return (
    <section className="landing-how-it-works-section" id="how-it-works" aria-labelledby="how-heading">
      <div className="section-header text-center">
        <span className="section-pill">Simple 3-Step Process</span>
        <h2 id="how-heading" className="section-title">
          How LabLens Works
        </h2>
        <p className="section-subtitle">
          From a confusing pile of lab papers to a clear, interactive health dashboard in under 60 seconds.
        </p>
      </div>

      <div className="steps-container">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="step-card">
              <div className="step-card-header">
                <span className="step-number-badge">{s.stepNumber}</span>
                <div className="step-icon-wrapper">
                  <Icon size={28} aria-hidden="true" />
                </div>
              </div>
              <h3 className="step-card-title">{s.title}</h3>
              <p className="step-card-desc">{s.description}</p>
              <div className="step-checklist">
                <div className="step-check-item">
                  <CheckCircle2 size={14} className="text-success" aria-hidden="true" />
                  <span>{idx === 0 ? 'Supports major diagnostic labs' : idx === 1 ? 'Age & sex specific reference ranges' : 'Export & doctor link ready'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
