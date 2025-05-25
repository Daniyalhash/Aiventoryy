import React from "react";
import "@/styles/DemandScoreBar.css"


const DemandScoreBar = ({ score }: { score: number }) => {
  const getColorClass = (score: number) => {
    if (score >= 75) return "green-bar";
    if (score >= 50) return "yellow-bar";
    return "red-bar";
  };

  const getLabel = (score: number) => {
    if (score >= 75) return "High Demand 🔥";
    if (score >= 50) return "Medium Demand ⚠️";
    return "Low Demand ❄️";
  };

  return (
    <div className="demand-score-container">
      <div className="demand-score-header">
        <span>Demand Score</span>
        <span>{score}/100</span>
      </div>
      <div className="progress-bar-background">
        <div
          className={`progress-bar-fill ${getColorClass(score)}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <div className="demand-score-label">{getLabel(score)}</div>
    </div>
  );
};

export default DemandScoreBar;
