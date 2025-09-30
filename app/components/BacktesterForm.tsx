"use client";
import { useState } from "react";
import { StrategyType } from "../types/index";
import { PanelTitle, Panel, PanelContent, PanelHeader } from "../components/panel";
import toast from 'react-hot-toast';

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

  const validateForm = (): string | null => {
    if (formData.investmentAmount < 100) {
      return "Investment amount must be at least $100";
    }
    
    if (formData.strategyType === StrategyType.CONCENTRATED) {
      if (formData.concentrationMin >= formData.concentrationMax) {
        return "Minimum price must be less than maximum price";
      }
      if (formData.concentrationMin <= 0 || formData.concentrationMax <= 0) {
        return "Price ranges must be greater than 0";
      }
    }
    
    if (formData.strategyType === StrategyType.ACTIVE_REBALANCING) {
      if (formData.rebalanceThreshold <= 0 || formData.rebalanceThreshold > 1) {
        return "Rebalance threshold must be between 0 and 100%";
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError, {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    // Show loading toast and handle the submission
    const loadingToastId = toast.loading('Running backtest...', {
      position: 'top-right',
    });

    try {
      // Call the onSubmit function
      await onSubmit(formData);
      
      // Update loading toast to success
      toast.success('Backtest completed successfully!', {
        id: loadingToastId,
        duration: 3000,
      });
    } catch (error) {
      // Update loading toast to error
      toast.error('Failed to run backtest. Please try again.', {
        id: loadingToastId,
        duration: 4000,
      });
    }
  };

  const handleCompareAll = async () => {
    if (!onCompare) return;

    // Validation before comparison
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError, {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    // Show loading toast for comparison
    const loadingToastId = toast.loading('Comparing all strategies...', {
      position: 'top-right',
    });

    try {
      await onCompare();
      
      // Success toast
      toast.success('Strategy comparison completed!', {
        id: loadingToastId,
        duration: 3000,
      });
    } catch (error) {
      // Error toast
      toast.error('Failed to compare strategies. Please try again.', {
        id: loadingToastId,
        duration: 4000,
      });
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Optional: Show info toasts for certain field updates
    if (field === 'strategyType') {
      toast.success(`Strategy changed to ${value.replace('_', ' ').toLowerCase()}`, {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };

  // Handle input validation with instant feedback
  const handleInvestmentAmountChange = (value: number) => {
    updateFormData("investmentAmount", value);
    
    if (value < 100 && value > 0) {
      toast.error('Minimum investment amount is $100', {
        duration: 2000,
        position: 'top-right',
      });
    }
  };

  const handleConcentrationChange = (field: 'concentrationMin' | 'concentrationMax', value: number) => {
    updateFormData(field, value);
    
    // Validate concentration range
    const newFormData = { ...formData, [field]: value };
    if (newFormData.concentrationMin >= newFormData.concentrationMax && newFormData.concentrationMax > 0) {
      toast.error('Minimum price must be less than maximum price', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  return (
    <Panel className="bg-white text-black shadow-lg transition-all duration-300">
      <PanelHeader>
        <PanelTitle className="text-2xl font-semibold mb-0">
          Backtest Configuration
        </PanelTitle>
      </PanelHeader>

      <PanelContent className="space-y-6 border-x border-edge">
        <form onSubmit={handleSubmit} className="space-y-6 border-x border-y border-edge py-1 -mx-1 px-1">
          {/* Investment Amount */}
          <div className="border-b border-edge py-1 -mx-1 px-1">
            <label className="block text-sm font-medium border-y border-edge py-1 -mx-1 px-1 text-gray-700 mb-2">
              Investment Amount (USD)
            </label>
            <input
              type="number"
              value={formData.investmentAmount || ""}
              onChange={(e) => handleInvestmentAmountChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              step="100"
              required
            />
          </div>

          {/* Token Pair */}
          <div className="border-b border-edge py-1 -mx-1 px-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 border-y border-edge py-1 -mx-1 px-1">
              Token Pair
            </label>
            <select
              value={formData.tokenPair}
              onChange={(e) => {
                updateFormData("tokenPair", e.target.value);
                toast.success(`Token pair changed to ${e.target.value}`, {
                  duration: 2000,
                  position: 'bottom-right',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="border-b border-edge py-1 -mx-1 px-1">
            <label className="block text-sm border-y border-edge py-1 -mx-1 px-1 font-medium text-gray-700 mb-0">
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
                      updateFormData("strategyType", e.target.value as StrategyType)
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
            <Panel className="bg-white/30">
              <PanelHeader>
                <PanelTitle asChild>
                  <h4 className="font-medium mb-0">Concentration Range</h4>
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={formData.concentrationMin || ""}
                    onChange={(e) =>
                      handleConcentrationChange("concentrationMin", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={formData.concentrationMax || ""}
                    onChange={(e) =>
                      handleConcentrationChange("concentrationMax", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
              </PanelContent>
            </Panel>
          )}

          {/* Active Strategy Settings */}
          {formData.strategyType === StrategyType.ACTIVE_REBALANCING && (
            <Panel className="bg-gray-50">
              <PanelHeader>
                <PanelTitle asChild>
                  <h4 className="font-medium mb-3">Rebalancing Settings</h4>
                </PanelTitle>
              </PanelHeader>
              <PanelContent>
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
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      updateFormData("rebalanceThreshold", value);
                      toast.success(`Rebalance threshold set to ${(value * 100).toFixed(1)}%`, {
                        duration: 1500,
                        position: 'bottom-right',
                      });
                    }}
                    className="w-full"
                  />
                </div>
              </PanelContent>
            </Panel>
          )}

          {/* Time Period */}
          <div className="border-b border-edge py-1 -mx-1 px-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 border-y border-edge py-1 -mx-1 px-1">
              Backtest Period
            </label>
            <select
              value={formData.timePeriod}
              onChange={(e) => {
                updateFormData("timePeriod", e.target.value);
                const periodLabels: { [key: string]: string } = {
                  '7d': '7 days',
                  '30d': '30 days',
                  '90d': '90 days',
                  '180d': '6 months',
                  '1y': '1 year'
                };
                toast.success(`Backtest period set to ${periodLabels[e.target.value]}`, {
                  duration: 2000,
                  position: 'bottom-right',
                });
              }}
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
            className={`
              w-full
              px-4 py-3 sm:px-6 sm:py-3
              rounded-md
              text-white font-semibold
              text-sm sm:text-base
              active:scale-95
              transform
              bg-gradient-to-b from-[#1A0E70] to-[#2D1B85] 
              hover:from-[#2D1B85] hover:to-[#4A2F9A]
              transition-all duration-300 hover:scale-105
              shadow-[inset_0_0_18px_0_rgb(123,97,255),inset_0_0_6px_0_rgba(147,125,255,0.8)]
              hover:shadow-[inset_0_0_6px_0_rgb(123,97,255),inset_0_0_3px_0_rgba(147,125,255,0.6)]
              ${loading 
                ? "pointer-events-none opacity-60 cursor-not-allowed" 
                : "cursor-pointer"
              }
            `}
          >
            {loading ? "Running Backtest..." : "Run Backtest"}
          </button>

          {/* Compare All Strategies Button */}
          <div className="mt-0">
            <button
              type="button"
              onClick={handleCompareAll}
              disabled={loading || !onCompare}
              className={`
                w-full
                px-4 py-3 sm:px-6 sm:py-3
                rounded-md
                text-white font-semibold
                text-sm sm:text-base
                active:scale-95
                transform
                bg-gradient-to-b from-[#1A0E70] to-[#2D1B85] 
                hover:from-[#2D1B85] hover:to-[#4A2F9A]
                transition-all duration-300 hover:scale-105
                shadow-[inset_0_0_18px_0_rgb(123,97,255),inset_0_0_6px_0_rgba(147,125,255,0.8)]
                hover:shadow-[inset_0_0_6px_0_rgb(123,97,255),inset_0_0_3px_0_rgba(147,125,255,0.6)]
                ${loading || !onCompare
                  ? "pointer-events-none opacity-60 cursor-not-allowed" 
                  : "cursor-pointer"
                }
              `}
            >
              {loading ? 'Running...' : `Compare All Strategies${selectedTokenPair ? ` (${selectedTokenPair})` : ''}`}
            </button>
          </div>
        </form>
      </PanelContent>
    </Panel>
  );
}
