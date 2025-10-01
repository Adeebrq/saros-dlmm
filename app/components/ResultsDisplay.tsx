// src/components/ResultsDisplay.tsx - CONVERTED TO PANELS

import { BacktestResult, StrategyType } from '../types/index';
import PerformanceChart from '../components/PerformanceChart';
import ComparisonChart from '../components/ComparisonChart';
import RangeVisualization from '../components/RangeVisualization';
import { Panel, PanelContent, PanelHeader, PanelTitle } from './panel';
import toast from 'react-hot-toast';

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
  tokenPair?: string;
}

export default function ResultsDisplay({ 
  results, 
  strategyNames, 
  strategyTypes = [],
  concentrationRanges = [],
  poolHealthData,
  tokenPair = 'Unknown Pair'
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


  const getPoolStatus = () => {
    if (!poolHealthData) return { type: 'unknown', message: 'Pool data unavailable' };
    
    const { totalLiquidity, volume24h } = poolHealthData;
    
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
    <div className="space-y-6 text-black z-20 border-x border-edge bg-white">
      {/* Pool Info Header Panel */}
      <Panel className="bg-white text-black  transition-all duration-300">
        <PanelHeader>
          <PanelTitle className="text-2xl font-semibold mb-0">
          {tokenPair} Pool Analysis
          </PanelTitle>
        </PanelHeader>

        <PanelContent className="space-y-6 border-x border-edge">
          <div className="border-x border-y border-edge py-1 -mx-1 px-1">
            {/* Pool Header Info */}
            <div className="border-b border-edge py-1 -mx-1 px-1">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-y border-edge py-1 -mx-1 px-1">
    <div className="flex items-center space-x-3">
      <div className="bg-blue-100 p-2 rounded-lg border border-edge">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div>
        <p className="text-gray-600 font-semibold">{tokenPair}</p>
      </div>
    </div>
    
    <div className="text-left sm:text-right">
      <div className="text-sm text-gray-500 mb-1">Pool Address</div>
      <div 
        className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-edge cursor-pointer hover:bg-gray-50 transition-colors duration-200 active:scale-95 break-all sm:break-normal max-w-full overflow-hidden"
        onClick={() => {
          if (poolHealthData?.poolAddress) {
            navigator.clipboard.writeText(poolHealthData.poolAddress);
            toast.success("Pool Address Copied!")
          }
        }}
        title="Click to copy full address"
      >
        <span className="hidden sm:inline">
          {poolHealthData?.poolAddress ? `${poolHealthData.poolAddress.slice(0, 8)}...${poolHealthData.poolAddress.slice(-8)}` : 'N/A'}
        </span>
        <span className="sm:hidden">
          {poolHealthData?.poolAddress ? `${poolHealthData.poolAddress.slice(0, 6)}...${poolHealthData.poolAddress.slice(-6)}` : 'N/A'}
        </span>
      </div>
    </div>
  </div>
</div>


            {/* Pool Metrics Grid */}
            <div className="border-b border-edge py-1 -mx-1 px-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border-r border-edge"></div>
                  <div className="border-x border-edge hidden md:block"></div>
                  <div className="border-x border-edge hidden md:block"></div>
                  <div className="border-l border-edge"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-edge">
                    <div className="text-sm text-gray-500 mb-1 border-b border-edge py-1">Total Liquidity</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {poolHealthData?.totalLiquidity ? 
                        `$${poolHealthData.totalLiquidity > 1000000 ? 
                          (poolHealthData.totalLiquidity / 1000000).toFixed(2) + 'M' : 
                          poolHealthData.totalLiquidity.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-edge">
                    <div className="text-sm text-gray-500 mb-1 border-b border-edge py-1">24h Volume</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {poolHealthData?.volume24h ? 
                        `$${poolHealthData.volume24h > 1000000 ? 
                          (poolHealthData.volume24h / 1000000).toFixed(2) + 'M' : 
                          poolHealthData.volume24h.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-edge">
                    <div className="text-sm text-gray-500 mb-1 border-b border-edge py-1">Pool Status</div>
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
              </div>
            </div>

            {/* Pool Status Message */}
            {poolHealthData && (
              <div className="py-1 -mx-1 px-1">
                <div className="bg-white p-3 rounded-lg border-l-4 border-edge">
                  <p className="text-sm text-gray-700 border-b border-edge py-1">
                    <strong>Pool Analysis:</strong> {poolStatus.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </PanelContent>
      </Panel>

      {/* Strategy Results Panels */}
      <div className={`${isSingle ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-3'} gap-6`}>
        {results.map((result, index) => (
          <Panel key={index} className={`bg-white text-black  transition-all duration-300 ${
            !isSingle && index === bestStrategy.index ? 'border-2 border-green-500' : ''
          }`}>
            <PanelHeader>
              <PanelTitle className="text-xl font-semibold mb-0">
                {strategyNames[index]}
              </PanelTitle>
            </PanelHeader>

            <PanelContent className="space-y-6 border-x border-edge">
              <div className="border-x border-y border-edge py-1 -mx-1 px-1">
                {/* Strategy Badges */}
                <div className="border-b border-edge py-1 -mx-1 px-1">
                  <div className="flex flex-wrap gap-2 justify-end border-y border-edge py-1 -mx-1 px-1">
                    {index === bestStrategy.index && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium border border-edge">
                        Best ROI
                      </span>
                    )}
                    {result.totalFees < 0.10 && poolStatus.type !== 'dead' && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-edge">
                        Low Fees
                      </span>
                    )}
                    {result.timeInRange < 5 && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium border border-edge">
                        Low Range
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Display */}
                {isSingle ? (
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-2 gap-4">
                      <div className="border-r border-edge"></div>
                      <div className="border-l border-edge"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-edge">
                        <div className="text-xs text-gray-500 mb-1 border-b border-edge py-1">Investment</div>
                        <div className="text-lg font-semibold text-gray-900">${result.totalInvestment.toLocaleString()}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-edge">
                        <div className="text-xs text-gray-500 mb-1 border-b border-edge py-1">Net Profit</div>
                        <div className={`text-lg font-bold ${result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netProfit.toFixed(2)}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-edge">
                        <div className="text-xs text-gray-500 mb-1 border-b border-edge py-1">ROI</div>
                        <div className={`text-lg font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.roi.toFixed(2)}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-edge">
                        <div className="text-xs text-gray-500 mb-1 border-b border-edge py-1">Time in Range</div>
                        <div className={`text-lg font-semibold ${result.timeInRange < 5 ? 'text-red-600' : result.timeInRange < 20 ? 'text-yellow-600' : 'text-green-600'}`}>{result.timeInRange.toFixed(1)}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-edge col-span-2">
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-3 gap-4">
                            <div className="border-r border-edge"></div>
                            <div className="border-x border-edge"></div>
                            <div className="border-l border-edge"></div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex flex-col items-center border-b border-edge py-2">
                              <span className="text-gray-500">Fees</span>
                              <span className={`flex items-center gap-1 ${result.totalFees < 0.10 ? 'text-red-600' : 'text-green-600'}`}>
                                +${result.totalFees.toFixed(2)}
                                {result.totalFees < 0.10 && poolStatus.type !== 'dead' && (
                                  <span className="text-xs text-red-500">⚠️</span>
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col items-center border-b border-edge py-2">
                              <span className="text-gray-500">IL</span>
                              <span className="text-red-600">-${result.impermanentLoss.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col items-center border-b border-edge py-2">
                              <span className="text-gray-500">Gas</span>
                              <span className={`${result.summary.totalGasCosts && result.summary.totalGasCosts > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                -${(result.summary.totalGasCosts ?? 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 border-b border-edge py-1 -mx-1 px-1">
                    <div className="flex justify-between border-b border-edge py-1">
                      <span className="text-gray-600">Investment:</span>
                      <span className="font-medium">${result.totalInvestment.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-edge py-1">
                      <span className="text-gray-600">Net Profit:</span>
                      <span className={`font-bold text-lg ${
                        result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${result.netProfit.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-b border-edge py-1">
                      <span className="text-gray-600">ROI:</span>
                      <span className={`font-bold text-lg ${
                        result.roi >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.roi.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-b border-edge py-1">
                      <span className="text-gray-600">Time in Range:</span>
                      <span className={`font-medium ${
                        result.timeInRange < 5 ? 'text-red-600' : 
                        result.timeInRange < 20 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {result.timeInRange.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between border-b border-edge py-1">
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
                      
                      <div className="flex justify-between border-b border-edge py-1">
                        <span className="text-gray-500">Impermanent Loss:</span>
                        <span className="text-red-600">-${result.impermanentLoss.toFixed(2)}</span>
                      </div>
                      
                      {result.summary.totalGasCosts && (
                        <div className="flex justify-between border-b border-edge py-1">
                          <span className="text-gray-500">Gas Costs:</span>
                          <span className="text-red-600">-${result.summary.totalGasCosts.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </PanelContent>
          </Panel>
        ))}
      </div>

      {/* Warning Panel */}
      {shouldShowWarnings && (
        <Panel className={`${
          poolStatus.type === 'dead' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
        }  transition-all duration-300`}>
          <PanelHeader>
            <PanelTitle className="text-lg font-semibold mb-0">
              Pool Notice
            </PanelTitle>
          </PanelHeader>

          <PanelContent className="border-x border-edge">
            <div className="border-x border-y border-edge py-1 -mx-1 px-1">
              <div className="flex border-b border-edge py-1 -mx-1 px-1">
                <div className="flex-shrink-0 border-r border-edge pr-3">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    poolStatus.type === 'dead' ? 'text-red-700' : 'text-yellow-700'
                  } border-b border-edge py-1`}>
                    {poolStatus.message}
                  </p>
                  
                  {hasReallyLowReturns && (
                    <div className="mt-2 text-sm text-red-700 border-b border-edge py-1">
                      <strong>Additional concern:</strong> Very low fee earnings may indicate calculation issues or market conditions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      )}

      {/* Charts Section */}
      <div className="space-y-6">
        {isComparison && (
          <Panel className="bg-white text-black transition-all duration-300">
            <PanelHeader>
              <PanelTitle className="text-xl font-semibold mb-0">
                Strategy Comparison
              </PanelTitle>
            </PanelHeader>
            <PanelContent className="border-x border-edge">
              <div className="border-x border-y border-edge py-1 -mx-1 px-1">
                <ComparisonChart results={results} strategyNames={strategyNames} />
              </div>
            </PanelContent>
          </Panel>
        )}

        {results.map((result, index) => (
          <div key={index} className="space-y-4">
            <Panel className="bg-white text-black transition-all duration-300">
              <PanelHeader>
                <PanelTitle className="text-xl font-semibold mb-0">
                  {strategyNames[index]} Performance
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="border-x border-edge">
                <div className="border-x border-y border-edge py-1 -mx-1 px-1">
                  <PerformanceChart 
                    dailyResults={result.dailyBreakdown}
                    strategyName={strategyNames[index]}
                  />
                </div>
              </PanelContent>
            </Panel>
            
            <Panel className="bg-white text-black  transition-all duration-300">
              <PanelHeader>
                <PanelTitle className="text-xl font-semibold mb-0">
                  {strategyNames[index]} Range Visualization
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="border-x border-edge">
                <div className="border-x border-y border-edge py-1 -mx-1 px-1">
                  <RangeVisualization 
                    dailyResults={result.dailyBreakdown}
                    strategyType={strategyTypes[index] || StrategyType.CONCENTRATED}
                    concentrationRange={concentrationRanges[index]}
                    strategyName={strategyNames[index]}
                  />
                </div>
              </PanelContent>
            </Panel>
          </div>
        ))}
      </div>

      {/* Performance Table Panel */}
      <Panel className="bg-white text-black  transition-all duration-300">
        <PanelHeader>
          <PanelTitle className="text-xl font-semibold mb-0">
            Performance Comparison
          </PanelTitle>
        </PanelHeader>

        <PanelContent className="border-x border-edge">
          <div className="border-x border-y border-edge py-1 -mx-1 px-1">
            <div className="overflow-x-auto border-b border-edge py-1 -mx-1 px-1">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b border-edge">
                    <th className="px-4 py-2 text-left border-r border-edge">Strategy</th>
                    <th className="px-4 py-2 text-right border-r border-edge">ROI</th>
                    <th className="px-4 py-2 text-right border-r border-edge">Profit</th>
                    <th className="px-4 py-2 text-right border-r border-edge">Fees</th>
                    <th className="px-4 py-2 text-right border-r border-edge">IL</th>
                    <th className="px-4 py-2 text-right">Time in Range</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="border-t border-edge">
                      <td className="px-4 py-2 font-medium border-r border-edge">{strategyNames[index]}</td>
                      <td className={`px-4 py-2 text-right font-medium border-r border-edge ${
                        result.roi >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.roi.toFixed(2)}%
                      </td>
                      <td className={`px-4 py-2 text-right border-r border-edge ${
                        result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${result.netProfit.toFixed(2)}
                      </td>
                      <td className={`px-4 py-2 text-right border-r border-edge ${
                        result.totalFees < 0.10 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${result.totalFees.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right text-red-600 border-r border-edge">
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
        </PanelContent>
      </Panel>
    </div>
  );
}
