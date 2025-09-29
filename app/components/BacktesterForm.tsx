"use client";
import { useState } from "react";
import { StrategyType } from "../types/index";

interface FormData {
  investmentAmount: number;
  strategyType: StrategyType;
  tokenPair: string;
  concentrationMin: number;
  concentrationMax: number;
  rebalanceThreshold: number;
  timePeriod: string;
}

interface BacktesterFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
  onCompare?: () => void;
  selectedTokenPair?: string;
}

export default function BacktesterForm({
  onSubmit,
  loading,
  onCompare,
  selectedTokenPair = '',
}: BacktesterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    investmentAmount: 5000,
    strategyType: StrategyType.CONCENTRATED,
    tokenPair: "SOL/USDC",
    concentrationMin: 49,
    concentrationMax: 52,
    rebalanceThreshold: 0.05,
    timePeriod: "90d",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white text-black rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Backtest Configuration</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount (USD)
          </label>
          <input
            type="number"
            value={formData.investmentAmount || " "}
            onChange={(e) =>
              updateFormData("investmentAmount", Number(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            step="100"
          />
        </div>

        {/* Token Pair */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Pair
          </label>
          <select
            value={formData.tokenPair}
            onChange={(e) => updateFormData("tokenPair", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UNIBTC/XBTC">UNIBTC/XBTC</option>
            <option value="USDS/USDC">USDS/USDC</option>
            <option value="DZSOL/SOL">DZSOL/SOL</option>
            <option value="USDC/USDT">USDC/USDT</option>
            <option value="MSTRR/USD1">MSTRR/USD1</option>
            <option value="LAUNCHCOIN/USDC">LAUNCHCOIN/USDC</option>
            <option value="USD1/USDC">USD1/USDC</option>
          </select>
        </div>

        {/* Strategy Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strategy Type
          </label>
          <div className="space-y-2">
            {Object.values(StrategyType).map((strategy) => (
              <label key={strategy} className="flex items-center">
                <input
                  type="radio"
                  name="strategy"
                  value={strategy}
                  checked={formData.strategyType === strategy}
                  onChange={(e) =>
                    updateFormData(
                      "strategyType",
                      e.target.value as StrategyType
                    )
                  }
                  className="mr-2"
                />
                <span className="capitalize">{strategy.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Concentrated Strategy Settings */}
        {formData.strategyType === StrategyType.CONCENTRATED && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3">Concentration Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={formData.concentrationMin || " "}
                  onChange={(e) =>
                    updateFormData("concentrationMin", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={formData.concentrationMax || " "}
                  onChange={(e) =>
                    updateFormData("concentrationMax", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Strategy Settings */}
        {formData.strategyType === StrategyType.ACTIVE_REBALANCING && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3">Rebalancing Settings</h4>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Rebalance Threshold (
                {(formData.rebalanceThreshold * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={formData.rebalanceThreshold}
                onChange={(e) =>
                  updateFormData("rebalanceThreshold", Number(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Time Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backtest Period
          </label>
          <select
            value={formData.timePeriod}
            onChange={(e) => updateFormData("timePeriod", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Running Backtest..." : "Run Backtest"}
        </button>

        {/* Compare All Strategies Button (inside form) */}
        <div className="mt-0">
          <button
            type="button"
            onClick={onCompare}
            disabled={loading || !onCompare}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running...' : `Compare All Strategies${selectedTokenPair ? ` (${selectedTokenPair})` : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}
