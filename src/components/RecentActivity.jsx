import React from 'react';
import { Clock, BookOpen, Award, Upload, Brain } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { id: 1, action: 'Downloaded', item: 'Calculus Notes', time: '2 hours ago', icon: BookOpen },
    { id: 2, action: 'Completed', item: 'Physics Quiz', time: '5 hours ago', icon: Award },
    { id: 3, action: 'Uploaded', item: 'Chemistry Report', time: '1 day ago', icon: Upload },
    { id: 4, action: 'Asked', item: 'Thermodynamics Question', time: '2 days ago', icon: Brain },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
        </div>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Icon className="w-5 h-5 text-indigo-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {activity.action} <span className="text-slate-600 dark:text-slate-400">{activity.item}</span>
                </p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;