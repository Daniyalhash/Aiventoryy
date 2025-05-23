"use client";
import { useState } from 'react';
import InsightsOver from "@/components/InsightsOver";
import Product_Benchmark_Section from "@/components/ProductBenchmarkSection";
import LowStockSuggestionSection from "@/components/LowStockSuggestionSection";
import "@/styles/insights.css";

export default function Insights() {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'lowstock'>('benchmark');
  const [transition, setTransition] = useState<'left' | 'right' | null>(null);

 
  const switchTab = (tab: 'benchmark' | 'lowstock') => {
    if (tab === activeTab) return;
    
    setTransition(tab === 'benchmark' ? 'right' : 'left');
    setTimeout(() => {
      setActiveTab(tab);
      setTransition(null);
    }, 300);
  };

  return (
    <div className="InsightPage">
      <InsightsOver />
      
      <div className="feature-selector">
        <button 
          className={`feature-tab ${activeTab === 'benchmark' ? 'active' : ''}`}
          onClick={() => switchTab('benchmark')}
        >
          Product Benchmarking
        </button>
        <button 
          className={`feature-tab ${activeTab === 'lowstock' ? 'active' : ''}`}
          onClick={() => switchTab('lowstock')}
        >
          Low Stock Management
        </button>
      </div>

      <div className={`feature-container ${transition ? `slide-${transition}` : ''}`}>
        {activeTab === 'benchmark' ? (
          <Product_Benchmark_Section />
        ) : (
          <LowStockSuggestionSection />
        )}
      </div>
    </div>
  );
}