// src/components/charts/RangeVisualization.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DailyResult, StrategyType } from '../types/index';

interface RangeVisualizationProps {
  dailyResults: DailyResult[];
  strategyType: StrategyType;
  concentrationRange?: { min: number; max: number };
  strategyName: string;
}

export default function RangeVisualization({ 
  dailyResults, 
  strategyType, 
  concentrationRange, 
  strategyName 
}: RangeVisualizationProps) {
  const chartData = dailyResults.map((day, index) => ({
    day: index + 1,
    price: day.price,
    inRange: day.inRange,
    date: day.date
  }));

  const minPrice = Math.min(...dailyResults.map(d => d.price));
  const maxPrice = Math.max(...dailyResults.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  const yAxisMin = minPrice - (priceRange * 0.1);
  const yAxisMax = maxPrice + (priceRange * 0.1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg poolHeader">
      <h3 className="text-lg font-semibold mb-4">{strategyName} - Price vs Liquidity Range</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
          <YAxis 
            domain={[yAxisMin, yAxisMax]}
            label={{ 
              value: 'Price ($)', 
              angle: -90, 
              position: 'insideLeft',
              style: { 
                textAnchor: 'middle',
                fontSize: '12px',
                fill: '#6b7280'
              }
            }} 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${value.toFixed(3)}`} // ← LIMIT TO 3 DECIMAL PLACES
          />
          
          <Tooltip 
            labelFormatter={(value) => `Day ${value}`}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'price') {
                const isInRange = props.payload.inRange;
                return [`$${value.toFixed(3)}`, `Price ${isInRange ? '(In Range)' : '(Out of Range)'}`]; // ← ALSO 3 DECIMALS IN TOOLTIP
              }
              return [value, name];
            }}
          />
          
          {/* Price line with conditional coloring */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={4} 
                  fill={payload.inRange ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  stroke={payload.inRange ? '#16a34a' : '#dc2626'}
                />
              );
            }}
            name="Token Price"
          />
          
          {/* Concentration range lines for concentrated strategy */}
          {strategyType === StrategyType.CONCENTRATED && concentrationRange && (
            <>
              <ReferenceLine 
                y={concentrationRange.min} 
                stroke="#22c55e" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <ReferenceLine 
                y={concentrationRange.max} 
                stroke="#22c55e" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </>
          )}
          
          {/* Wide range lines */}
          {strategyType === StrategyType.WIDE && dailyResults.length > 0 && (
            <>
              <ReferenceLine 
                y={dailyResults[0].price * 0.8} 
                stroke="#3b82f6" 
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <ReferenceLine 
                y={dailyResults[0].price * 1.2} 
                stroke="#3b82f6" 
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span>In Range (Earning Fees)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>Out of Range (No Fees)</span>
        </div>
        {strategyType === StrategyType.CONCENTRATED && (
          <div className="flex items-center">
            <div className="w-4 h-1 bg-green-500 mr-2"></div>
            <span>Concentration Range</span>
          </div>
        )}
      </div>
    </div>
  );
}
