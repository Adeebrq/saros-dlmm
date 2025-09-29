// src/components/charts/PerformanceChart.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyResult } from '../types/index';

interface PerformanceChartProps {
  dailyResults: DailyResult[];
  strategyName: string;
}

export default function PerformanceChart({ dailyResults, strategyName }: PerformanceChartProps) {
  const chartData = dailyResults.map((day, index) => ({
    date: day.date,
    dayIndex: index + 1,
    price: day.price,
    cumulativePL: day.netPL,
    cumulativeFees: day.cumulativeFees,
    inRange: day.inRange ? day.price : null,
    outOfRange: !day.inRange ? day.price : null
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">{strategyName} - Performance Timeline</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="dayIndex" 
            label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
          />
          <YAxis yAxisId="price" orientation="left" label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="pl" orientation="right" label={{ value: 'P&L ($)', angle: 90, position: 'insideRight' }} />
          
          <Tooltip 
            labelFormatter={(value) => `Day ${value}`}
            formatter={(value: number, name: string) => {
              if (name === 'cumulativePL') return [`$${value.toFixed(2)}`, 'Cumulative P&L'];
              if (name === 'cumulativeFees') return [`$${value.toFixed(2)}`, 'Cumulative Fees'];
              if (name === 'price') return [`$${value.toFixed(2)}`, 'Token Price'];
              if (name === 'inRange') return [`$${value?.toFixed(2)}`, 'In Range Price'];
              if (name === 'outOfRange') return [`$${value?.toFixed(2)}`, 'Out of Range Price'];
              return [value, name];
            }}
          />
          
          <Legend />
          
          {/* Price line */}
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
            name="Token Price"
          />
          
          {/* In Range indicators */}
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="inRange" 
            stroke="#22c55e" 
            strokeWidth={0}
            dot={{ r: 4, fill: '#22c55e' }}
            connectNulls={false}
            name="In Range"
          />
          
          {/* Out of Range indicators */}
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="outOfRange" 
            stroke="#ef4444" 
            strokeWidth={0}
            dot={{ r: 4, fill: '#ef4444' }}
            connectNulls={false}
            name="Out of Range"
          />
          
          {/* P&L line */}
          <Line 
            yAxisId="pl"
            type="monotone" 
            dataKey="cumulativePL" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={false}
            name="Cumulative P&L"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
