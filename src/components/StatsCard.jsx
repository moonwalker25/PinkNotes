import React from 'react'; 
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ icon: Icon, title, value, change, color }) => {
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {change && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4" />
            {change > 0 ? '+' : ''}{change}% from last week
          </p>
        )}
      </div>
      <div className={`p-4 ${color} rounded-xl`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
};


export default StatsCard;