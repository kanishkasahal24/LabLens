import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'normal').toLowerCase();

  let statusClass = 'status-normal';
  let label = 'Normal';

  if (normalized === 'low') {
    statusClass = 'status-low';
    label = 'Low';
  } else if (normalized === 'high') {
    statusClass = 'status-high';
    label = 'High';
  } else if (normalized === 'abnormal') {
    statusClass = 'status-abnormal';
    label = 'Abnormal';
  }

  return (
    <span className={`status-badge ${statusClass}`}>
      <span className="status-badge-dot"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
