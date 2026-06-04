// client/src/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, description, trend, trendType = 'success' }) => {
  return (
    <div className="glass-panel p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/20 group">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
          {value}
        </p>
        
        {(description || trend) && (
          <div className="flex items-center gap-1.5 text-xs">
            {trend && (
              <span className={`font-semibold ${
                trendType === 'success' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {trend}
              </span>
            )}
            <span className="text-gray-400 dark:text-gray-500">{description}</span>
          </div>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 text-blue-600 dark:text-accent-cyan group-hover:bg-gradient-to-tr group-hover:from-accent-cyan group-hover:to-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
