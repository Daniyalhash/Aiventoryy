import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
  import type { BarProps } from "recharts";


interface ComparisonChartData {
  name: string;
  value: number;
}

interface ComparisonChartProps {
  data: ComparisonChartData[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>No data available to display.</p>
      </div>
    );
  }
  // const truncateName = (name, length = 10) =>
  //   name.length > length ? `${name.substring(0, length)}...` : name;
  // Custom shape for the bars to highlight the first (target) product

  const CustomBar = (props: BarProps & { name?: string | number }) => {
    const { fill, x, y, width, height, name } = props;
    const nameStr = name !== undefined ? String(name) : "";
    const isTarget = data[0].name === nameStr;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isTarget ? "#4CAF50" : fill} // Green for target, black for others
          rx={25} // Rounded corners
        />
        {isTarget && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="none"
            stroke="#2E7D32" // Darker green border
            strokeWidth={2}
            rx={25}
          />
        )}
      </g>
    );
  }; // Check if this is the first (target) product
  return (
    <div
      className="chart-container"
      style={{
        backgroundColor: "transparent",
        border: "none",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%",
        paddingRight: "0px",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}
           margin={{ 
            top: 20,    /* Increased top margin */
            right: 20, 
            left: 20, 
            bottom: 60  /* Increased bottom margin for labels */
          }}
           /* Optional: Switch to vertical layout if names are long */
>
          <XAxis
            dataKey="name" tick={{ fontSize: "15px", fill: "black" }}
            angle={-6} // Rotate the labels
            textAnchor="end" // Align the labels properly
            interval={0} />
          <YAxis
            tick={{ fontSize: "15px", fill: "black" }}
            label={{
              value: "Selling Price",
              angle: -90,
              position: "insideLeft",
              offset: 15,  /* Adjusted offset */
              fontSize: 15,
              fontWeight: 500,
              fill: "black",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f5f5",
              fontSize: "14px",
            }}
            labelStyle={{
              fontSize: "14px",
              color: "#555",
            }}
            formatter={(value, name) => {
              // Highlight target product in tooltip
              const isTarget = data[0].name === name;
              return [
                value,
                isTarget ? "Target Product" : "Comparison Product",
              ];
            }}
          />


          <Bar
            dataKey="value"
            shape={(barProps: BarProps) => <CustomBar {...barProps} />}
            fill="black"
          />              </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default ComparisonChart;

