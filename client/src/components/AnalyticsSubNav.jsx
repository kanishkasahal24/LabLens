import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, GitCompare } from 'lucide-react';

const AnalyticsSubNav = () => {
  return (
    <div className="analytics-sub-nav" role="tablist" aria-label="Analytics view selection">
      <NavLink
        to="/trends"
        end
        className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}
        role="tab"
      >
        <TrendingUp size={18} aria-hidden="true" />
        <span>Biomarker Trends</span>
      </NavLink>

      <NavLink
        to="/compare"
        className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}
        role="tab"
      >
        <GitCompare size={18} aria-hidden="true" />
        <span>Compare Reports</span>
      </NavLink>
    </div>
  );
};

export default AnalyticsSubNav;
