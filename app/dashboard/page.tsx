// src/pages/index.tsx - FIXED VERSION

"use client"

import { useState, useEffect } from 'react';
import { DLMMBacktester } from '../lib/backtester';
import { StrategyType, BacktestResult, PriceData } from '../types/index';
import BacktesterForm from '../components/BacktesterForm';
import ResultsDisplay from '../components/ResultsDisplay';
import { sarosService } from '../lib/sarosService';
import { cn } from "../lib/utils";
import {PanelTitle, Panel, PanelContent , PanelHeader} from "../components/panel"
import Header from '../components/Header';

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
  const [selectedTokenPair, setSelectedTokenPair] = useState<string>('');

  // Update runStrategyComparison to accept FormData:
  
  // Add strategy metadata for charts
  const [strategyMetadata, setStrategyMetadata] = useState<{
    types: StrategyType[];
    ranges: Array<{ min: number; max: number } | undefined>;
  }>({ types: [], ranges: [] });

  // FIXED: Test connection when token pair changes
  useEffect(() => {
    const testRealSarosIntegration = async () => {
      try {
        const success = await sarosService.testConnection(selectedTokenPair); // ← NOW DYNAMIC
        
        if (success) {
          // Test getting real pool metadata for the selected pair
          const metadata = await sarosService.getPoolMetadata(selectedTokenPair); // ← NOW DYNAMIC
        }
      } catch (error) {
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
      // Fetch real price data
      const priceData = await fetchPriceData(formData.tokenPair, formData.timePeriod);
      
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
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runStrategyComparison = async (formData: FormData) => { // ← Accept form data
    setLoading(true);
    setError('');
    setSelectedTokenPair(formData.tokenPair);
    
    try {
      const comparisonTokenPair = formData.tokenPair; // ← Use form data
      
      const priceData = await fetchPriceData(comparisonTokenPair, formData.timePeriod); // ← Use form data
      
      const backtester = new DLMMBacktester();
      
      // Use form data for concentrated range if available
      let concentratedRange = { min: priceData[0].price * 0.96, max: priceData[0].price * 1.04 };
      if (formData.strategyType === StrategyType.CONCENTRATED) {
        const startPrice = priceData[0]?.price;
        const userMin = formData.concentrationMin;
        const userMax = formData.concentrationMax;
        const userRangeValid = Number.isFinite(startPrice) && userMin < userMax && startPrice >= userMin && startPrice <= userMax;
        const autoMin = Number.isFinite(startPrice) ? startPrice * 0.96 : userMin;
        const autoMax = Number.isFinite(startPrice) ? startPrice * 1.04 : userMax;
        concentratedRange = userRangeValid ? { min: userMin, max: userMax } : { min: autoMin, max: autoMax };
      }
      
      const strategies = [
        {
          investmentAmount: formData.investmentAmount, // ← Use form data
          priceData: priceData,
          strategyType: StrategyType.CONCENTRATED,
          concentrationRange: concentratedRange,
          tokenPair: comparisonTokenPair
        },
        {
          investmentAmount: formData.investmentAmount, // ← Use form data
          priceData: priceData,
          strategyType: StrategyType.WIDE,
          tokenPair: comparisonTokenPair
        },
        {
          investmentAmount: formData.investmentAmount, // ← Use form data
          priceData: priceData,
          strategyType: StrategyType.ACTIVE_REBALANCING,
          rebalanceThreshold: formData.rebalanceThreshold, // ← Use form data
          tokenPair: comparisonTokenPair
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

  function Separator({ className }: { className?: string }) {
    return (
      <div
        className={cn(
          "relative flex h-8 w-full overflow-hidden border-y border-edge",
          "before:absolute before:left-0 before:z-10 before:h-8 before:w-full",
          "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56",
          className
        )}
      />
    );
  }
  function SeparatorHeader({ className }: { className?: string }) {
    return (
      <div
        className={cn(
          "relative flex h-3 w-full overflow-hidden border-y border-edge",
          "before:absolute before:left-0 before:z-10 before:h-8 before:w-full",
          "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56",
          className
        )}
      />
    );
  }
  function VerticalSeparator({ className }: { className?: string }) {
    return (
      <div
        className={cn(
          "relative flex w-8 self-stretch overflow-hidden border-x border-edge", // Use self-stretch instead of height
          "before:content-[''] before:absolute before:top-0 before:z-10 before:w-8 before:h-full",
          "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]",
          "before:opacity-56",
          className
        )}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Header */}
      <Header/>

      <div className="max-w-7xl mx-auto px-0 my-6 border-x border-edge screen-line-after screen-line-before">
        <Separator/>
        <div className="flex screen-line-after screen-line-before">
          {/* Left edge vertical separator */}
          <VerticalSeparator/>
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Form */}
            <div className="lg:col-span-1">
              <BacktesterForm 
                onSubmit={handleFormSubmit} 
                loading={loading}
                onCompare={runStrategyComparison}
                selectedTokenPair={selectedTokenPair}
                onTokenPairChange={setSelectedTokenPair}
              />
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
    <Panel className="bg-white text-black shadow-lg transition-all duration-300">
      <PanelHeader>
        <PanelTitle className="text-2xl font-semibold mb-0">
          Strategy Analysis Dashboard
        </PanelTitle>
      </PanelHeader>

      <PanelContent className="space-y-6 border-x border-edge">
        <div className="text-center border-x border-y border-edge py-1 -mx-1 px-1">
          {/* Welcome Icon */}
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 border-b border-edge py-1 -mx-1 px-1">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>

          {/* Welcome Message Section */}
          <div className="border-b border-edge py-1 -mx-1 px-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-3 border-y border-edge py-1 -mx-1 px-1">
              Ready to Optimize Your LP Strategy? 
            </h3>
            
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
              Get started by selecting your investment amount, token pair, and strategy type on the left
            </p>
          </div>

          {/* How it Works Section */}
          <div className="border-b border-edge py-1 -mx-1 px-1">
            <div className="bg-white/20 rounded-lg p-6 mb-6 border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-4 border-y border-edge py-1 -mx-1 px-1">
                How it works:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center border-r border-edge pr-4">
                  <div className="w-8 h-8 bg-purple-400 text-white rounded-full flex items-center justify-center mb-2 font-bold">1</div>
                  <span className="text-gray-600">Choose investment & token pair</span>
                </div>
                <div className="flex flex-col items-center border-r border-edge pr-4">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mb-2 font-bold">2</div>
                  <span className="text-gray-600">Select strategy & time period</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mb-2 font-bold">3</div>
                  <span className="text-gray-600">Analyze results & optimize</span>
                </div>
              </div>
            </div>
          </div>

{/* Feature Highlights Section */}
<div className="border-b border-edge py-1 -mx-1 px-1">
  <h4 className="font-semibold text-gray-800 mb-4 border-y border-edge py-1 -mx-1 px-1">
    Platform Features:
  </h4>
  
  <div className="relative">
    <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-2 gap-3 text-sm mb-6">
      <div className="border-r border-edge"></div>
      <div className="border-l border-edge"></div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm mb-6">
      <div className="flex items-start justify-start space-x-2 text-green-700 border-b border-edge py-2">
        <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Real Saros Pool Data</span>
      </div>
      <div className="flex items-start justify-start space-x-2 text-green-700 border-b border-edge py-2">
        <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Historical Analysis</span>
      </div>
      <div className="flex items-start justify-start space-x-2 text-green-700 border-b border-edge py-2">
        <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Interactive Charts</span>
      </div>
      <div className="flex items-start justify-start space-x-2 text-green-700 border-b border-edge py-2">
        <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Multiple Strategies</span>
      </div>
    </div>
  </div>
</div>

        </div>
      </PanelContent>
    </Panel>
  )}
</div>

          </div>
          
          {/* Right edge vertical separator */}
          <VerticalSeparator/>
        </div>
      </div>
    </div>
  );
}
