"use client"; // Mark as Client Component

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { api } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface GenderData {
  gender: string;
  count: number;
}

const GenderChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/customers/summary/gender");
        const data: GenderData[] = response.data.data;

        const labels = data.map((item) => item.gender || "Unknown");
        const counts = data.map((item) => item.count);
        const backgroundColors = [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ];
        const borderColors = backgroundColors.map((color) =>
          color.replace("1)", "0.8)")
        );

        setChartData({
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: backgroundColors.slice(0, labels.length),
              borderColor: borderColors.slice(0, labels.length),
              borderWidth: 1,
            },
          ],
        });
      } catch (err: any) {
        setError("Failed to load gender data: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenderData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-md text-gray-600 font-semibold mb-4">
        Customers Gender Distribution
      </h2>
      <div className="h-80 w-64 mx-auto">
        {loading ? (
          <p className="text-center py-8 text-gray-500">
            Loading chart...
          </p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">{error}</p>
        ) : chartData.labels.length === 0 ||
          chartData.datasets[0].data.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No gender summary data available.
          </p>
        ) : (
          <Pie
            data={chartData}
            options={{ maintainAspectRatio: false, responsive: true }}
          />
        )}
      </div>
    </div>
  );
};

export default GenderChart;
