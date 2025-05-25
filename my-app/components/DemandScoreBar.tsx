import React from "react";

const DemandScoreBar = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  const getLabel = (score: number) => {
    if (score >= 75) return "High Demand 🔥";
    if (score >= 50) return "Medium Demand ⚠️";
    return "Low Demand ❄️";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
        <span>Demand Score</span>
        <span>{score}/100</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <div className="mt-1 text-sm text-gray-600">{getLabel(score)}</div>
    </div>
  );
};

export default DemandScoreBar;
