import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ResponsiveContainer,
} from "recharts";

export default function ProfitMarginChart({ data, targetProduct }) {
  // Process the data to assign colors based on whether it's the target product
  const processedData = data.map((item) => ({
    ...item,
    color: item.name === targetProduct ? "#28a745" : "#000000", // Green for target, black for others
    size: item.name === targetProduct ? 8 : 5, // Larger size for target
  }));

  // Custom shape for the scatter points
  const CustomScatterPoint = (props) => {
    const { cx, cy, payload, fill, r } = props;
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={payload.size}
          fill={payload.color}
          stroke={payload.name === targetProduct ? "#17412D" : "none"} // Darker border for target
          strokeWidth={payload.name === targetProduct ? 2 : 0}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          bottom: 50,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip 
          formatter={(value, name, props) => [
            `${value.toFixed(2)}%`, 
            props.payload.name === targetProduct ? "Target Product" : "Comparison Product"
          ]}
          labelFormatter={(label) => `Product: ${label}`}
        />
        <Legend />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80} // Add more space for rotated labels
        />
        <YAxis
          unit="%"
          tick={{ fontSize: 12 }}
          label={{
            value: "Profit Margin (%)",
            angle: -90,
            position: "insideLeft",
            fontSize: 14,
          }}
        />
        <Scatter
          name="Profit Margin"
          dataKey="value"
          shape={<CustomScatterPoint />}
          data={processedData}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
