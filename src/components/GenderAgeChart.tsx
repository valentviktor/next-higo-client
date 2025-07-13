"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GenderAgeData {
  gender: string;
  ageGroup: string;
  count: number;
}

interface ChartJSData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

const GenderAgeChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartJSData>({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenderAgeSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get("/customers/summary/gender-age");
        const rawData: GenderAgeData[] = response.data.data;

        const ageGroupMap: {
          [key: string]: {
            Male?: number;
            Female?: number;
            [key: string]: number | undefined;
          };
        } = {};
        const uniqueAgeGroups = new Set<string>();
        const uniqueGenders = new Set<string>();

        rawData.forEach((item) => {
          uniqueAgeGroups.add(item.ageGroup);
          uniqueGenders.add(item.gender);
          if (!ageGroupMap[item.ageGroup]) {
            ageGroupMap[item.ageGroup] = {};
          }
          ageGroupMap[item.ageGroup][item.gender] = item.count;
        });

        const sortedAgeGroups = Array.from(uniqueAgeGroups).sort((a, b) => {
          const getAgeRangeStart = (group: string) => {
            if (group === "0-19") return 0;
            if (group === "20-29") return 20;
            if (group === "30-39") return 30;
            if (group === "40-49") return 40;
            if (group === "50-59") return 50;
            if (group === "60+") return 60;
            return 999;
          };
          return getAgeRangeStart(a) - getAgeRangeStart(b);
        });

        const datasets = Array.from(uniqueGenders).map((gender) => {
          const dataPoints = sortedAgeGroups.map((ageGroup) => {
            return ageGroupMap[ageGroup]?.[gender] || 0;
          });

          let backgroundColor = "";
          let borderColor = "";

          if (gender === "Male") {
            backgroundColor = "#36A2EB";
            borderColor = "#2A72B8";
          } else if (gender === "Female") {
            backgroundColor = "#FF6384";
            borderColor = "#C94E6F";
          } else {
            backgroundColor = "#FFCE56";
            borderColor = "#D3A44E";
          }

          return {
            label: gender,
            data: dataPoints,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
          };
        });

        setChartData({
          labels: sortedAgeGroups,
          datasets: datasets,
        });
      } catch (err: any) {
        setError("Failed to fetch gender-age summary: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenderAgeSummary();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
        text: "Gender Distribution by Age Group",
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: "Age Group",
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Customers",
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-md text-gray-600 font-semibold mb-4">
        Customers Gender Distribution by Age Group
      </h2>
      <div className="h-80 mx-auto">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading chart...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">{error}</p>
        ) : chartData.labels.length === 0 ||
          chartData.datasets[0].data.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No gender summary data available.
          </p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default GenderAgeChart;
