import React, { useEffect } from 'react';
import { Hero, Features, HowItWorks, SamplePreview, LandingFooter } from '../components/landing';

const LandingPage = () => {
  useEffect(() => {
    document.title = 'LabLens - Understand Your Blood Reports & Biomarkers';
  }, []);

  return (
    <div className="landing-page-container">
      <main id="main-content">
        <Hero />
        <Features />
        <HowItWorks />
        <SamplePreview />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
