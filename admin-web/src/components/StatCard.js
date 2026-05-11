import React from 'react';

function StatCard({ number, label, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <h2>{number || 0}</h2>
      <p>{label}</p>
    </div>
  );
}

export default StatCard;