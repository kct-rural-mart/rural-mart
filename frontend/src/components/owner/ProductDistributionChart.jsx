import React from 'react';

const COLOR_PALETTE = ['#2D5A27', '#487A41', '#6B9B63', '#93BF8B', '#C1E2BA', '#2F6B4F', '#12291E'];

export default function ProductDistributionChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  if (!data.length || total === 0) {
    return (
      <div className="pip-chart-empty">
        <div className="pip-chart-header">
          <h3 className="pip-chart-title">Product Sales Distribution</h3>
        </div>
        <div className="pip-empty-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No inventory sales data available yet.</p>
        </div>
      </div>
    );
  }

  // Calculate SVG stroke slice offsets
  let cumulativePercent = 0;

  return (
    <div className="pip-chart-container">
      <div className="pip-chart-header">
        <h3 className="pip-chart-title">Product Sales Distribution</h3>
      </div>
      <div className="pip-chart-content">
        <div className="pip-svg-wrap">
          <svg viewBox="0 0 36 36" className="pip-donut-chart">
            {data.map((item, index) => {
              const slicePercent = (item.revenue / total) * 100;
              const strokeDasharray = `${slicePercent} ${100 - slicePercent}`;
              const strokeDashoffset = 100 - cumulativePercent + 25;
              cumulativePercent += slicePercent;

              return (
                <circle
                  key={item.category}
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                  strokeWidth="3.8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
        </div>

        <div className="pip-legend">
          {data.map((item, index) => (
            <div className="pip-legend-item" key={item.category}>
              <span
                className="pip-legend-dot"
                style={{ backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length] }}
              />
              <span className="pip-legend-label">{item.category}</span>
              <span className="pip-legend-value">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}