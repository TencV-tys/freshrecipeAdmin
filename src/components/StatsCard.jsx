import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-card-icon" style={{ backgroundColor: `${color}10` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stats-card-content">
        <p className="stats-card-title">{title}</p>
        <p className="stats-card-value">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default StatsCard;