"use client";

import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { api } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface BrandData {
  brand: string;
  count: number;
}

interface ChartJSData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const BrandDeviceChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartJSData>({
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
    const fetchBrandDeviceData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/customers/summary/brand-device");
        const data: BrandData[] = response.data.data;

        const labels = data.map((item) => item.brand || "Unknown");
        const counts = data.map((item) => item.count);

        const colors = [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#83FF83",
          "#C9CBCE",
          "#A3A2EB",
          "#FFD1DC",
        ];

        setChartData({
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: colors
                .slice(0, labels.length)
                .map((color) => color + "C0"),
              borderWidth: 1,
            },
          ],
        });
      } catch (err: any) {
        setError("Failed to load brand device data: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandDeviceData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
        text: "Customer Device Brand Distribution",
      },
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label +=
                context.parsed +
                " (" +
                (
                  (context.parsed /
                    context.dataset.data.reduce(
                      (a: number, b: number) => a + b,
                      0
                    )) *
                  100
                ).toFixed(2) +
                "%)";
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-md text-gray-600 font-semibold mb-4">
        Customers Brand Device Distribution
      </h2>
      <div className="h-80 mx-auto">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading chart...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">{error}</p>
        ) : chartData.labels.length === 0 ||
          chartData.datasets[0].data.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No brand device summary data available.
          </p>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default BrandDeviceChart;
