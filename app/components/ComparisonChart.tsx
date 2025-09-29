// src/components/charts/ComparisonChart.tsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BacktestResult } from '../types/index';

interface ComparisonChartProps {
  results: BacktestResult[];
  strategyNames: string[];
}

export default function ComparisonChart({ results, strategyNames }: ComparisonChartProps) {
  const chartData = results.map((result, index) => ({
    strategy: strategyNames[index],
    roi: parseFloat(result.roi.toFixed(2)),
    fees: parseFloat(result.totalFees.toFixed(2)),
    impermanentLoss: parseFloat(result.impermanentLoss.toFixed(2)),
    netProfit: parseFloat(result.netProfit.toFixed(2)),
    timeInRange: parseFloat(result.timeInRange.toFixed(1))
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg poolHeader">
      <h3 className="text-lg font-semibold mb-4">Strategy Performance Comparison</h3>
      
      <div className="space-y-6">
        {/* ROI Comparison */}
        <div>
          <h4 className="text-md font-medium mb-2">ROI Comparison (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strategy" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value}%`, 'ROI']} />
              <Bar dataKey="roi" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fees vs IL Comparison */}
        <div>
          <h4 className="text-md font-medium mb-2">Fees vs Impermanent Loss ($)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strategy" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value}`, '']} />
              <Legend />
              <Bar dataKey="fees" fill="#22c55e" name="Fee Earnings" />
              <Bar dataKey="impermanentLoss" fill="#ef4444" name="Impermanent Loss" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time in Range */}
        <div>
          <h4 className="text-md font-medium mb-2">Time in Range (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strategy" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Time in Range']} />
              <Bar dataKey="timeInRange" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
