// src/pages/index.tsx - FIXED VERSION

"use client"

import { useState, useEffect } from 'react';
import { DLMMBacktester } from './lib/backtester';
import { StrategyType, BacktestResult, PriceData } from './types/index';
import BacktesterForm from './components/BacktesterForm';
import ResultsDisplay from './components/ResultsDisplay';
import { sarosService } from './lib/sarosService';

interface FormData {
  investmentAmount: number;
  strategyType: StrategyType;
  tokenPair: string;
  concentrationMin: number;
  concentrationMax: number;
  rebalanceThreshold: number;
  timePeriod: string;
}

export default function Home() {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedTokenPair, setSelectedTokenPair] = useState<string>('SOL/USDC');
  
  // Add strategy metadata for charts
  const [strategyMetadata, setStrategyMetadata] = useState<{
    types: StrategyType[];
    ranges: Array<{ min: number; max: number } | undefined>;
  }>({ types: [], ranges: [] });

  // FIXED: Test connection when token pair changes
  useEffect(() => {
    const testRealSarosIntegration = async () => {
      console.log(`🚀 Testing REAL Saros DLMM SDK integration for ${selectedTokenPair}...`);
      
      try {
        const success = await sarosService.testConnection(selectedTokenPair); // ← NOW DYNAMIC
        
        if (success) {
          console.log(`🎉 SUCCESS: Real Saros SDK integration working for ${selectedTokenPair}!`);
          
          // Test getting real pool metadata for the selected pair
          const metadata = await sarosService.getPoolMetadata(selectedTokenPair); // ← NOW DYNAMIC
          console.log(`📊 Real pool metadata for ${selectedTokenPair}:`, metadata);
        }
      } catch (error) {
        console.error(`❌ Real Saros integration test failed for ${selectedTokenPair}:`, error);
      }
    };
    
    testRealSarosIntegration();
  }, [selectedTokenPair]); // ← DEPENDENCY ON selectedTokenPair

  const fetchPriceData = async (tokenPair: string, timePeriod: string): Promise<PriceData[]> => {
    const response = await fetch(`/api/price-data?tokenPair=${tokenPair}&timePeriod=${timePeriod}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch price data');
    }

    const data = await response.json();
    return data.data;
  };

  const handleFormSubmit = async (formData: FormData) => {
    setLoading(true);
    setResults([]);
    setError('');
    setSelectedTokenPair(formData.tokenPair);
    
    try {
      console.log('Fetching real price data for:', formData.tokenPair, formData.timePeriod);
      
      // Fetch real price data
      const priceData = await fetchPriceData(formData.tokenPair, formData.timePeriod);
      
      console.log(`Got ${priceData.length} price data points`);
      
      const backtester = new DLMMBacktester();

      // Auto-correct concentrated range if it doesn't include the current price
      let concentrationRange = undefined as undefined | { min: number; max: number };
      if (formData.strategyType === StrategyType.CONCENTRATED) {
        const startPrice = priceData[0]?.price;
        const userMin = formData.concentrationMin;
        const userMax = formData.concentrationMax;
        const userRangeValid = Number.isFinite(startPrice) && userMin < userMax && startPrice >= userMin && startPrice <= userMax;
        const autoMin = Number.isFinite(startPrice) ? startPrice * 0.96 : userMin;
        const autoMax = Number.isFinite(startPrice) ? startPrice * 1.04 : userMax;
        concentrationRange = userRangeValid ? { min: userMin, max: userMax } : { min: autoMin, max: autoMax };
      }

      const result = await backtester.simulateStrategy({
        investmentAmount: formData.investmentAmount,
        priceData: priceData,
        strategyType: formData.strategyType,
        concentrationRange,
        rebalanceThreshold: formData.rebalanceThreshold,
        tokenPair: formData.tokenPair
      });

      setResults([result]);
      setCurrentStrategy(formData.strategyType);
      
      // Set metadata for charts
      setStrategyMetadata({
        types: [formData.strategyType],
        ranges: [concentrationRange]
      });
      
    } catch (error) {
      console.error('Backtest failed:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runStrategyComparison = async () => {
    setLoading(true);
    setError('');
    setSelectedTokenPair('SOL/USDC');
    
    try {
      // Use the currently selected token pair for comparison
      const comparisonTokenPair = selectedTokenPair; // ← USE CURRENT SELECTION
      const defaultTimePeriod = '90d';
      
      console.log(`Fetching price data for strategy comparison on ${comparisonTokenPair}...`);
      const priceData = await fetchPriceData(comparisonTokenPair, defaultTimePeriod);
      
      const backtester = new DLMMBacktester();
      const concentratedRange = { min: priceData[0].price * 0.96, max: priceData[0].price * 1.04 };
      
      const strategies = [
        {
          investmentAmount: 5000,
          priceData: priceData,
          strategyType: StrategyType.CONCENTRATED,
          concentrationRange: concentratedRange,
          tokenPair: comparisonTokenPair // ← USE CURRENT SELECTION
        },
        {
          investmentAmount: 5000,
          priceData: priceData,
          strategyType: StrategyType.WIDE,
          tokenPair: comparisonTokenPair // ← USE CURRENT SELECTION
        },
        {
          investmentAmount: 5000,
          priceData: priceData,
          strategyType: StrategyType.ACTIVE_REBALANCING,
          rebalanceThreshold: 0.05,
          tokenPair: comparisonTokenPair // ← USE CURRENT SELECTION
        }
      ];

      const comparisonPromises = strategies.map(strategy => 
        backtester.simulateStrategy(strategy)
      );
      
      const comparisonResults = await Promise.all(comparisonPromises);

      setResults(comparisonResults);
      setCurrentStrategy('comparison');
      
      // Set metadata for charts
      setStrategyMetadata({
        types: [StrategyType.CONCENTRATED, StrategyType.WIDE, StrategyType.ACTIVE_REBALANCING],
        ranges: [concentratedRange, undefined, undefined]
      });
      
    } catch (error) {
      console.error('Comparison failed:', error);
      setError(error instanceof Error ? error.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const getStrategyNames = () => {
    if (currentStrategy === 'comparison') {
      return ['Concentrated', 'Wide Range', 'Active Rebalancing'];
    }
    return [currentStrategy.replace('_', ' ')];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Saros DLMM Strategy Backtester
          </h1>
          <p className="text-gray-600 mt-2">
            Analyze liquidity provider strategies with real historical data
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Form */}
          <div className="lg:col-span-1">
            <BacktesterForm 
              onSubmit={handleFormSubmit} 
              loading={loading}
              onCompare={runStrategyComparison}
              selectedTokenPair={selectedTokenPair}
            />

            {/* Status Messages */}
            {loading && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-blue-700 text-sm">
                  🔄 Fetching real price data for {selectedTokenPair} and running backtest...
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-red-700 text-sm">
                  ❌ {error}
                </p>
              </div>
            )}
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-2">
            {results.length > 0 ? (
              <ResultsDisplay 
                results={results} 
                strategyNames={getStrategyNames()}
                strategyTypes={strategyMetadata.types}
                concentrationRanges={strategyMetadata.ranges}
                poolHealthData={results[0]?.poolHealth}
                tokenPair={selectedTokenPair}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <h3 className="text-xl text-gray-500 mb-4">
                  No backtest results yet
                </h3>
                <p className="text-gray-400 mb-4">
                  Configure your strategy settings and run a backtest to see results
                </p>
                <div className="text-sm text-gray-500">
                  <p>✅ Real price data integration ready</p>
                  <p>✅ Multiple token pairs supported</p>
                  <p>✅ Historical periods: 7d to 1y</p>
                  <p>✅ Interactive charts enabled</p>
                  <p className="text-blue-600">🔍 Testing pool: {selectedTokenPair}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
