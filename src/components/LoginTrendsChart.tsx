'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { api } from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LoginTrendData {
  hour: number;
  loginCount: number;
}

interface ChartJSData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
    pointHoverRadius: number;
  }[];
}

const LoginTrendsChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartJSData>({
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2023-12-29');
  const [dateToApply, setDateToApply] = useState<string>('2023-12-29');

  const fetchLoginTrends = useCallback(async (dateToFetch?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateToFetch) params.append('date', dateToFetch);

      const response = await api.get(`/customers/trends/login?${params.toString()}`);
      const rawData: LoginTrendData[] = response.data.data;
      const defaultDateHeader = response.headers['x-default-date'] as string;

      if (defaultDateHeader && dateToFetch === undefined) {
        setSelectedDate(defaultDateHeader);
        setDateToApply(defaultDateHeader);
      }

      const processedData: number[] = Array(24).fill(0);

      rawData.forEach(item => {
        if (item.hour >= 0 && item.hour < 24) {
          processedData[item.hour] = item.loginCount;
        }
      });

      const datasets = [{
        label: `Logins on ${dateToApply || 'Selected Date'}`,
        data: processedData,
        borderColor: '#008000',
        backgroundColor: '#00800040',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      }];

      setChartData({
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: datasets,
      });

    } catch (err: any) {
      setError("Failed to fetch login trends: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateToApply]);

  useEffect(() => {
    fetchLoginTrends(dateToApply);
  }, [fetchLoginTrends, dateToApply]);

  const handleApplyFilter = () => {
    setDateToApply(selectedDate);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: (chartData.datasets.length === 0 || chartData.datasets.every(ds => ds.data.every(d => d === 0))) ? 'No data' : `Customer Login Trends for ${dateToApply || 'Selected Date'}`,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      legend: {
        display: false,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hour of Day',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Logins',
        },
      },
    },
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mt-6">
      <h2 className="text-md text-gray-600 font-semibold mb-4">
        Login Trends
      </h2>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <label htmlFor="selectedDate" className="text-gray-700">Date:</label>
        <input
          type="date"
          id="selectedDate"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1 text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleApplyFilter}
          className="px-3 py-1 text-gray-700 border rounded-md hover:bg-gray-600 hover:text-gray-100 transition-colors"
          disabled={!selectedDate}
        >
          Apply Filter
        </button>
      </div>

      <div className="h-96">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading data...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">{error}</p>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default LoginTrendsChart;