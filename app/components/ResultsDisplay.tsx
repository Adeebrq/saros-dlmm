// src/components/ResultsDisplay.tsx - WITH POOL INFO HEADER & TOKEN PAIR PROP

import { BacktestResult, StrategyType } from '../types/index';
import PerformanceChart from '../components/PerformanceChart';
import ComparisonChart from '../components/ComparisonChart';
import RangeVisualization from '../components/RangeVisualization';

interface PoolHealthData {
  totalLiquidity: number;
  volume24h: number;
  isActive: boolean;
  warning?: string;
  poolAddress: string;
}

interface ResultsDisplayProps {
  results: BacktestResult[];
  strategyNames: string[];
  strategyTypes?: StrategyType[];
  concentrationRanges?: Array<{ min: number; max: number } | undefined>;
  poolHealthData?: PoolHealthData;
  tokenPair?: string; // ← ADDED THIS PROP
}

export default function ResultsDisplay({ 
  results, 
  strategyNames, 
  strategyTypes = [],
  concentrationRanges = [],
  poolHealthData,
  tokenPair = 'Unknown Pair' // ← ADDED THIS WITH DEFAULT
}: ResultsDisplayProps) {
  if (results.length === 0) return null;

  const getBestStrategy = () => {
    return results.reduce((best, current, index) => 
      current.roi > best.result.roi ? { result: current, index } : best,
      { result: results[0], index: 0 }
    );
  };

  const bestStrategy = getBestStrategy();
  const isComparison = results.length > 1;
  const isSingle = results.length === 1;

  // FIXED: Use tokenPair prop instead of trying to extract from results
  const [baseToken, quoteToken] = tokenPair.split('/');

  const getPoolStatus = () => {
    if (!poolHealthData) return { type: 'unknown', message: 'Pool data unavailable' };
    
    const { totalLiquidity, volume24h, isActive } = poolHealthData;
    
    if (totalLiquidity < 1000 && volume24h < 100) {
      return { 
        type: 'dead', 
        message: `Pool appears inactive (${totalLiquidity < 100 ? '<$100' : '$' + totalLiquidity.toLocaleString()} liquidity, $${volume24h.toLocaleString()} volume)` 
      };
    }
    
    if (totalLiquidity < 10000) {
      return { 
        type: 'low-liquidity', 
        message: `Small pool ($${totalLiquidity.toLocaleString()} liquidity) - returns may be less predictable` 
      };
    }
    
    const largestInvestment = Math.max(...results.map(r => r.totalInvestment));
    if (largestInvestment > totalLiquidity * 0.05) {
      return { 
        type: 'large-position', 
        message: `Your investment ($${largestInvestment.toLocaleString()}) is ${((largestInvestment/totalLiquidity)*100).toFixed(1)}% of pool - results may be unrealistic` 
      };
    }
    
    return { 
      type: 'healthy', 
      message: `Healthy pool ($${totalLiquidity > 1000000 ? (totalLiquidity/1000000).toFixed(1) + 'M' : totalLiquidity.toLocaleString()} liquidity, $${volume24h > 1000000 ? (volume24h/1000000).toFixed(1) + 'M' : volume24h.toLocaleString()} volume)` 
    };
  };

  const poolStatus = getPoolStatus();
  const shouldShowWarnings = poolStatus.type !== 'healthy' && poolStatus.type !== 'unknown';
  const hasReallyLowReturns = results.some(result => result.totalFees < 0.10);

  return (
    <div className="space-y-6 text-black">
      {/* NEW: Pool Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 poolHeader transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{baseToken}/{quoteToken}</h2>
              <p className="text-gray-600">Saros DLMM Pool Analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Pool Address</div>
            <div className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border">
              {poolHealthData?.poolAddress ? `${poolHealthData.poolAddress.slice(0, 8)}...${poolHealthData.poolAddress.slice(-8)}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Pool Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 rounded-lg p-4 border border-purple-300">
            <div className="text-sm text-gray-500 mb-1">Total Liquidity</div>
            <div className="text-lg font-semibold text-gray-900">
              {poolHealthData?.totalLiquidity ? 
                `$${poolHealthData.totalLiquidity > 1000000 ? 
                  (poolHealthData.totalLiquidity / 1000000).toFixed(2) + 'M' : 
                  poolHealthData.totalLiquidity.toLocaleString()}` 
                : 'N/A'}
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-4 border border-purple-300">
            <div className="text-sm text-gray-500 mb-1">24h Volume</div>
            <div className="text-lg font-semibold text-gray-900">
              {poolHealthData?.volume24h ? 
                `$${poolHealthData.volume24h > 1000000 ? 
                  (poolHealthData.volume24h / 1000000).toFixed(2) + 'M' : 
                  poolHealthData.volume24h.toLocaleString()}` 
                : 'N/A'}
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-purple-300">

            <div className="text-sm text-gray-500 mb-1">Pool Status</div>
            <div className={`text-lg font-semibold flex items-center ${
              poolStatus.type === 'healthy' ? 'text-green-600' :
              poolStatus.type === 'dead' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {poolStatus.type === 'healthy' ? 'Active' : 
               poolStatus.type === 'dead' ? 'Inactive' : 
               '⚠️ Warning'}
            </div>
          </div>

        </div>

        {/* Pool Status Message */}
        {poolHealthData && (
          <div className="mt-4 p-3 bg-white/60 rounded-lg border-l-4 border-purple-400">
            <p className="text-sm text-gray-700">
              <strong>Pool Analysis:</strong> {poolStatus.message}
            </p>
          </div>
        )}
      </div>



      {/* Summary Cards */}
      <div className={`${isSingle ? 'grid grid-cols-1 ' : 'grid grid-cols-1 md:grid-cols-3'} gap-6`}>
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`${
              isSingle 
                ? 'rounded-xl p-6 border backdrop-blur poolHeader bg-white/60 border-purple-300 shadow-xl w-full'
                : 'bg-white rounded-lg shadow-lg p-6 border-2'
            } ${!isSingle && index === bestStrategy.index ? 'border-green-500' : !isSingle ? 'border-transparent' : ''}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {strategyNames[index]}
              </h3>
              <div className="flex flex-col items-end space-y-1">
                {index === bestStrategy.index && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Best ROI
                  </span>
                )}
                {result.totalFees < 0.10 && poolStatus.type !== 'dead' && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    Low Fees
                  </span>
                )}
                {result.timeInRange < 5 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Low Range
                  </span>
                )}
              </div>
            </div>
            
            {isSingle ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">Investment</div>
                  <div className="text-lg font-semibold text-gray-900">${result.totalInvestment.toLocaleString()}</div>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">Net Profit</div>
                  <div className={`text-lg font-bold ${result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netProfit.toFixed(2)}</div>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">ROI</div>
                  <div className={`text-lg font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.roi.toFixed(2)}%</div>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">Time in Range</div>
                  <div className={`text-lg font-semibold ${result.timeInRange < 5 ? 'text-red-600' : result.timeInRange < 20 ? 'text-yellow-600' : 'text-green-600'}`}>{result.timeInRange.toFixed(1)}%</div>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-purple-200 col-span-2">
                  <div className="grid grid-cols-3 gap-4 text-sm items-stretch relative">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Fees</span>
                      <span className={`flex items-center gap-1 ${result.totalFees < 0.10 ? 'text-red-600' : 'text-green-600'}`}>
                        +${result.totalFees.toFixed(2)}
                        {result.totalFees < 0.10 && poolStatus.type !== 'dead' && (
                          <span className="text-xs text-red-500 align-middle">⚠️</span>
                        )}
                      </span>
                    </div>
                    {/* Vertical separator */}
                    <div className="absolute left-1/3 top-0 h-full w-px bg-purple-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">IL</span>
                      <span className="text-red-600">-${result.impermanentLoss.toFixed(2)}</span>
                    </div>
                    {/* Vertical separator */}
                    <div className="absolute left-2/3 top-0 h-full w-px bg-purple-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Gas</span>
                      <span className={`${result.summary.totalGasCosts && result.summary.totalGasCosts > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        -${(result.summary.totalGasCosts ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment:</span>
                  <span className="font-medium">${result.totalInvestment.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className={`font-bold text-lg ${
                    result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${result.netProfit.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className={`font-bold text-lg ${
                    result.roi >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.roi.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time in Range:</span>
                  <span className={`font-medium ${
                    result.timeInRange < 5 ? 'text-red-600' : 
                    result.timeInRange < 20 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {result.timeInRange.toFixed(1)}%
                  </span>
                </div>
                
                <hr className="my-3" />
                
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fee Earnings:</span>
                    <span className={`${
                      result.totalFees < 0.10 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      +${result.totalFees.toFixed(2)}
                      {result.totalFees < 0.10 && poolStatus.type !== 'dead' && (
                        <span className="ml-1 text-xs text-red-500">⚠️</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Impermanent Loss:</span>
                    <span className="text-red-600">-${result.impermanentLoss.toFixed(2)}</span>
                  </div>
                  
                  {result.summary.totalGasCosts && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gas Costs:</span>
                      <span className="text-red-600">-${result.summary.totalGasCosts.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {shouldShowWarnings && (
        <div className={`border-l-4 p-4 rounded-lg ${
          poolStatus.type === 'dead' ? 'bg-red-50 border-red-400' :
          'bg-yellow-50 border-yellow-400'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                poolStatus.type === 'dead' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                Pool Notice
              </h3>
              <p className={`mt-1 text-sm ${
                poolStatus.type === 'dead' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {poolStatus.message}
              </p>
              
              {hasReallyLowReturns && (
                <div className="mt-2 text-sm text-red-700">
                  <strong>Additional concern:</strong> Very low fee earnings may indicate calculation issues or market conditions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="space-y-6">
        {isComparison && (
          <ComparisonChart results={results} strategyNames={strategyNames} />
        )}

        {results.map((result, index) => (
          <div key={index} className="space-y-4">
            <PerformanceChart 
              dailyResults={result.dailyBreakdown}
              strategyName={strategyNames[index]}
            />
            
            <RangeVisualization 
              dailyResults={result.dailyBreakdown}
              strategyType={strategyTypes[index] || StrategyType.CONCENTRATED}
              concentrationRange={concentrationRanges[index]}
              strategyName={strategyNames[index]}
            />
          </div>
        ))}
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 poolHeader">
        <h3 className="text-xl font-semibold mb-4">Performance Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Strategy</th>
                <th className="px-4 py-2 text-right">ROI</th>
                <th className="px-4 py-2 text-right">Profit</th>
                <th className="px-4 py-2 text-right">Fees</th>
                <th className="px-4 py-2 text-right">IL</th>
                <th className="px-4 py-2 text-right">Time in Range</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 font-medium">{strategyNames[index]}</td>
                  <td className={`px-4 py-2 text-right font-medium ${
                    result.roi >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.roi.toFixed(2)}%
                  </td>
                  <td className={`px-4 py-2 text-right ${
                    result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${result.netProfit.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2 text-right ${
                    result.totalFees < 0.10 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${result.totalFees.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-red-600">
                    ${result.impermanentLoss.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2 text-right ${
                    result.timeInRange < 5 ? 'text-red-600' : 
                    result.timeInRange < 20 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {result.timeInRange.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
