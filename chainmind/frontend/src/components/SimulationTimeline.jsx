import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function SimulationTimeline({ data }) {
  // Try to use true data if it exists and looks like an array, otherwise mock
  const simData = Array.isArray(data) && data.length > 0 ? data : Array.from({ length: 50 }, (_, i) => ({
    block: i + 1,
    normal: Math.floor(Math.random() * 20) + 5,
    attack: Math.floor(Math.random() * 5)
  }));

  const chartData = {
    labels: simData.map(d => `Tx ${d.block || d.id || ''}`),
    datasets: [
      {
        label: 'Normal Txs',
        data: simData.map(d => d.normal || 0),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4
      },
      {
        label: 'Attack Attempts',
        data: simData.map(d => d.attack || d.malicious || 0),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af' }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(31, 41, 55, 0.5)' },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', maxTicksLimit: 10 }
      }
    }
  };

  return (
    <div className="w-full h-[300px]">
      <Line options={options} data={chartData} />
    </div>
  )
}
