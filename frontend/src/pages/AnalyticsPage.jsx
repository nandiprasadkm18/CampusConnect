import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx';

const AnalyticsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 border-l-4 border-slate-900 pl-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase font-serif">Institutional Intelligence</h1>
        <p className="text-slate-500 mt-2 font-medium text-lg font-serif">Real-time data aggregation and engagement performance metrics.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
