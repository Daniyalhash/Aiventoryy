"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "@/styles/Features.css"; // Import your CSS styles
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
const features = [
    {
        title: "Demand Forecasting hidden",
        description: "Predict future sales trends using AI to ensure optimal stock levels",
        graphData: [
          { name: "Jan", value: 40 },
          { name: "Feb", value: 50 },
          { name: "Mar", value: 30 },
          { name: "Apr", value: 70 },
          { name: "May", value: 90 }
        ]
      },
      {
        title: "Demand Forecasting",
        description: "Predict future sales trends using AI to ensure optimal stock levels",
        graphData: [
          { name: "Jan", sales: 4000, forecast: 3800 },
          { name: "Feb", sales: 3000, forecast: 3500 },
          { name: "Mar", sales: 5000, forecast: 5200 },
          { name: "Apr", sales: 2780, forecast: 3000 },
          { name: "May", sales: 3890, forecast: 4000 },
          { name: "Jun", sales: 2390, forecast: 2500 }
        ],
        graphStyle: [
          { dataKey: "sales", stroke: "#8884d8", name: "Actual Sales" },
          { dataKey: "forecast", stroke: "#82ca9d", strokeDasharray: "5 5", name: "AI Forecast" }
        ]
      },
      {
        title: "Auto Replenishment",
        description: "Automatically restock items based on demand patterns and sales data",
        graphData: [
          { name: "Mon", stock: 100, threshold: 30, order: 0 },
          { name: "Tue", stock: 80, threshold: 30, order: 0 },
          { name: "Wed", stock: 60, threshold: 30, order: 0 },
          { name: "Thu", stock: 40, threshold: 30, order: 60 },
          { name: "Fri", stock: 100, threshold: 30, order: 0 },
          { name: "Sat", stock: 70, threshold: 30, order: 0 }
        ],
        graphStyle: [
          { dataKey: "stock", stroke: "#ff7300", name: "Current Stock" },
          { dataKey: "threshold", stroke: "#ff0000", name: "Reorder Threshold" },
          { dataKey: "order", stroke: "#0088FE", name: "Auto Order" }
        ]
      },
      {
        title: "Stock Optimization",
        description: "Ensure optimal stock levels by analyzing trends and reducing waste",
        graphData: [
          { name: "Product A", current: 150, optimal: 120, waste: 30 },
          { name: "Product B", current: 90, optimal: 100, waste: 0 },
          { name: "Product C", current: 200, optimal: 150, waste: 50 },
          { name: "Product D", current: 80, optimal: 80, waste: 0 }
        ],
        graphStyle: [
          { dataKey: "current", stroke: "#8884d8", name: "Current Stock" },
          { dataKey: "optimal", stroke: "#82ca9d", name: "Optimal Level" },
          { dataKey: "waste", stroke: "#ff0000", name: "Excess/Waste" }
        ]
      },{
        title: "Seasonal Trends",
        description: "Identify and adapt to seasonal demand fluctuations",
        graphData: [
          { name: "Jan", value: 4000 },
          { name: "Feb", value: 3000 },
          { name: "Mar", value: 5000 },
          { name: "Apr", value: 2780 },
          { name: "May", value: 3890 },
          { name: "Jun", value: 2390 },
          { name: "Jul", value: 3490 },
          { name: "Aug", value: 4590 },
          { name: "Sep", value: 5600 },
          { name: "Oct", value: 6800 },
          { name: "Nov", value: 7500 },
          { name: "Dec", value: 8200 }
        ],
        graphStyle: [
          { dataKey: "value", stroke: "#0088FE", name: "Seasonal Demand" }
        ]
      }, {
    title: "Demand Forecasting hidden",
    description: "Predict future sales trends using AI to ensure optimal stock levels",
    graphData: [
      { name: "Jan", value: 40 },
      { name: "Feb", value: 50 },
      { name: "Mar", value: 30 },
      { name: "Apr", value: 70 },
      { name: "May", value: 90 }
    ]
  }
];

export default function Features() {
    const [selectedFeature, setSelectedFeature] = useState(1);
    const pathname = usePathname();
    const featureListRef = useRef(null);

    useEffect(() => {
      if (featureListRef.current) {
        const selectedItem = featureListRef.current.children[selectedFeature];
        if (selectedItem) {
          featureListRef.current.scrollTo({
            top: selectedItem.offsetTop - featureListRef.current.offsetHeight / 2 + selectedItem.offsetHeight / 2,
            behavior: "smooth",
          });
        }
      }
    }, [selectedFeature]);
  

  return (
    <div className="features-section">
        <div className="features-heading">
            <div className="features-heading-left">
                <h2>
                Explore <span className="features-span">AI-powered</span> tools that transform your business management
                </h2>
            </div>
            <div className="features-heading-right">
                <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
                    GO DEMO
                    <FontAwesomeIcon icon={faArrowUp} className="icon" />
                </Link>
            </div>
           
        </div>
        <div className="features-container">
        <div className="graph-container">
          <ResponsiveContainer 
            width="90%" 
            height={300} 
            style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              padding: "1rem"
            }}
          >
            <LineChart data={features[selectedFeature].graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {features[selectedFeature].graphStyle.map((style, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={style.dataKey}
                  stroke={style.stroke}
                  strokeDasharray={style.strokeDasharray || "0"}
                  strokeWidth={2}
                  name={style.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
    
        <div className="feature-list" ref={featureListRef}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              onClick={() => setSelectedFeature(index)}
              className={`feature-item ${
                selectedFeature === index ? "selected" : "unselected"
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}