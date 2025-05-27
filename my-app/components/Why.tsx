"use client"
import React, { useEffect } from 'react';
import "@/styles/Why.css";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Why = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div id="solution-section" className="whyContainer">
      <h2>
        Why <span className="brand">A</span>
        <span className="brandSub">iventory</span>
        <span className="brandSub2">?</span>
      </h2>

      <p>
        Our system ensures efficient stock management by automating tasks, predicting demand, and optimizing
        inventory levels with <span className="highlight">AI-driven</span> insights.
      </p>

      {/* Keywords Section */}
      {/* <div className="keywords">
        <span className="keyword yellow keyword-fall-1" data-aos="fade-down">Integration</span>
        <span className="keyword red keyword-fall-2" data-aos="fade-down">Simplicity</span>
        <span className="keyword purple keyword-fall-3" data-aos="fade-down">Security</span>
        <span className="keyword blue keyword-fall-4" data-aos="fade-down">Insights</span>
        <span className="keyword white keyword-fall-5" data-aos="fade-down">Compliance</span>
        <span className="keyword white keyword-fall-6" data-aos="fade-down">Visibility</span>
        <span className="keyword yellow keyword-fall-7" data-aos="fade-down">Optimization</span>
        <span className="keyword pink keyword-fall-8" data-aos="fade-down">Scalability</span>
        <span className="keyword yellow keyword-fall-9" data-aos="fade-down">Reliability</span>
        <span className="keyword green keyword-fall-10" data-aos="fade-down">Autoamtion</span>
        <span className="keyword black keyword-fall-11" data-aos="fade-down">Replenishment</span>
        <span className="keyword pink keyword-fall-12" data-aos="fade-down">Efficiency</span>
        <span className="keyword green keyword-fall-13" data-aos="fade-down">Accuracy</span>
        <span className="keyword blue keyword-fall-14" data-aos="fade-down">Forecasting</span>
        <span className="keyword yellow keyword-fall-15" data-aos="fade-down">Stock Control</span>
        <span className="keyword blue keyword-fall-16" data-aos="fade-down">Real-time Tracking</span>
        <span className="keyword black keyword-fall-17" data-aos="fade-down">Supply Chain</span>

      </div> */}
       <div className="keywords">
        <span className="keyword yellow keyword-fall-1" >Integration</span>
        <span className="keyword red keyword-fall-2" >Simplicity</span>
        <span className="keyword purple keyword-fall-3" >Security</span>
        <span className="keyword blue keyword-fall-4">Insights</span>
        <span className="keyword white keyword-fall-5">Compliance</span>
        <span className="keyword white keyword-fall-6">Visibility</span>
        <span className="keyword yellow keyword-fall-7">Optimization</span>
        <span className="keyword pink keyword-fall-8">Scalability</span>
        <span className="keyword yellow keyword-fall-9">Reliability</span>
        <span className="keyword green keyword-fall-10">Autoamtion</span>
        <span className="keyword black keyword-fall-11" >Replenishment</span>
        <span className="keyword pink keyword-fall-12" >Efficiency</span>
        <span className="keyword green keyword-fall-13" >Accuracy</span>
        <span className="keyword blue keyword-fall-14" >Forecasting</span>
        <span className="keyword yellow keyword-fall-15" >Stock Control</span>
        <span className="keyword blue keyword-fall-16">Real-time Tracking</span>
        <span className="keyword black keyword-fall-17">Supply Chain</span>

      </div>
    </div>
  );
};

export default Why;
