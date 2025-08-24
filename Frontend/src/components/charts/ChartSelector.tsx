import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

interface ChartSelectorProps {
  selectedChart: string;
  selectedPeriod: string;
  onChartChange: (chart: string) => void;
  onPeriodChange: (period: string) => void;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({
  selectedChart,
  selectedPeriod,
  onChartChange,
  onPeriodChange,
}) => {
  const chartOptions = [
    { id: 'all', label: 'All Charts', icon: BarChart3 },
    { id: 'growth', label: 'Growth Trends', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'distribution', label: 'Distribution', icon: PieChart },
    { id: 'contributors', label: 'Contributors', icon: BarChart3 },
  ];

  const periodOptions = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surfaceElevated border border-border rounded-xl">
      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-textSecondary mr-2">Chart Type:</span>
        {chartOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onChartChange(option.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedChart === option.id
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'bg-surface text-textSecondary hover:bg-surfaceElevated hover:text-textPrimary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-textSecondary">Period:</span>
        <div className="flex bg-surface rounded-lg p-1">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onPeriodChange(option.id)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPeriod === option.id
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartSelector;
