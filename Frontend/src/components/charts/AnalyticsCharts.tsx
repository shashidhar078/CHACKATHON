import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import ChartSelector from './ChartSelector';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

interface AnalyticsData {
  totalUsers: number;
  totalThreads: number;
  totalReplies: number;
  activeUsers: number;
  newUsersToday: number;
  newThreadsToday: number;
  newRepliesToday: number;
  flaggedContent: number;
  userGrowth: number;
  threadGrowth: number;
  replyGrowth: number;
  topUsers: Array<{ username: string; threads: number; replies: number }>;
  recentActivity: Array<{ type: string; user: string; content: string; timestamp: string }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  // Growth Trends Chart
  const growthChartData = {
    labels: ['Users', 'Threads', 'Replies'],
    datasets: [
      {
        label: 'Growth %',
        data: [data.userGrowth, data.threadGrowth, data.replyGrowth],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const growthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Growth Trends (vs Yesterday)',
        color: '#9ca3af',
        font: {
          size: 14,
          weight: '600',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const sign = value >= 0 ? '+' : '';
            return `${context.label}: ${sign}${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            weight: '600',
          },
        },
      },
    },
  };

  // Today's Activity Chart
  const todayActivityData = {
    labels: ['Users', 'Threads', 'Replies'],
    datasets: [
      {
        label: 'Today',
        data: [data.newUsersToday, data.newThreadsToday, data.newRepliesToday],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const todayActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Today's Activity",
        color: '#9ca3af',
        font: {
          size: 14,
          weight: '600',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            weight: '600',
          },
        },
      },
    },
  };

  // Content Distribution Chart
  const contentDistributionData = {
    labels: ['Threads', 'Replies', 'Flagged Content'],
    datasets: [
      {
        data: [data.totalThreads, data.totalReplies, data.flaggedContent],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const contentDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Content Distribution',
        color: '#9ca3af',
        font: {
          size: 14,
          weight: '600',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Top Contributors Chart
  const topContributorsData = {
    labels: data.topUsers.slice(0, 8).map(user => user.username),
    datasets: [
      {
        label: 'Threads',
        data: data.topUsers.slice(0, 8).map(user => user.threads),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Replies',
        data: data.topUsers.slice(0, 8).map(user => user.replies),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const topContributorsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Top Contributors',
        color: '#9ca3af',
        font: {
          size: 14,
          weight: '600',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  // Activity Radar Chart
  const activityRadarData = {
    labels: ['Users', 'Threads', 'Replies', 'Active Users', 'Flagged Content'],
    datasets: [
      {
        label: 'Current Metrics',
        data: [
          data.totalUsers,
          data.totalThreads,
          data.totalReplies,
          data.activeUsers,
          data.flaggedContent,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const activityRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Platform Overview',
        color: '#9ca3af',
        font: {
          size: 14,
          weight: '600',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        pointLabels: {
          color: '#9ca3af',
          font: {
            weight: '600',
          },
        },
        ticks: {
          color: '#9ca3af',
          backdropColor: 'transparent',
        },
      },
    },
  };

  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'growth':
        return (
          <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-80">
              <Line data={growthChartData} options={growthChartOptions} />
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="h-80">
                <Bar data={todayActivityData} options={todayActivityOptions} />
              </div>
            </div>
            <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="h-80">
                <Radar data={activityRadarData} options={activityRadarOptions} />
              </div>
            </div>
          </div>
        );
      case 'distribution':
        return (
          <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-80">
              <Doughnut data={contentDistributionData} options={contentDistributionOptions} />
            </div>
          </div>
        );
      case 'contributors':
        return (
          <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-80">
              <Bar data={topContributorsData} options={topContributorsOptions} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <ChartSelector
        selectedChart={selectedChart}
        selectedPeriod={selectedPeriod}
        onChartChange={setSelectedChart}
        onPeriodChange={setSelectedPeriod}
      />

      {/* Selected Chart */}
      {renderSelectedChart()}

      {/* All Charts View (when no specific chart is selected) */}
      {selectedChart === 'all' && (
        <div className="space-y-8">
          {/* Growth Trends Chart */}
          <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-80">
              <Line data={growthChartData} options={growthChartOptions} />
            </div>
          </div>

          {/* Today's Activity and Content Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="h-80">
                <Bar data={todayActivityData} options={todayActivityOptions} />
              </div>
            </div>
            <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="h-80">
                <Doughnut data={contentDistributionData} options={contentDistributionOptions} />
              </div>
            </div>
          </div>

          {/* Top Contributors Chart */}
          <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-80">
              <Bar data={topContributorsData} options={topContributorsOptions} />
            </div>
          </div>

          {/* Platform Overview Radar Chart */}
          <div className="bg-surfaceElevated border border-border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-80">
              <Radar data={activityRadarData} options={activityRadarOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
