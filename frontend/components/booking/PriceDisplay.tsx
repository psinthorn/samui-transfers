/**
 * Price Display Component
 * 
 * Shows price breakdown and multipliers
 */

'use client';

import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface PriceDisplayProps {
  basePrice?: number;
  finalPrice?: number;
  breakdown?: {
    label: string;
    value: string;
    isMultiplier?: boolean;
  }[];
  appliedRules?: string[];
  isLoading?: boolean;
  error?: string | null;
}

export function PriceDisplay({
  basePrice,
  finalPrice,
  breakdown,
  appliedRules,
  isLoading = false,
  error,
}: PriceDisplayProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!finalPrice) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main Price Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-indigo-200">
        <div className="flex justify-between items-baseline gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Estimated Fare</p>
            <p className="text-3xl font-bold text-slate-900">
              ฿{finalPrice.toFixed(2)}
            </p>
          </div>
          {basePrice && finalPrice > basePrice && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-orange-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  +{((finalPrice - basePrice) / basePrice * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Peak/Seasonal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Price Breakdown</h3>
          <div className="space-y-2">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  {item.label}
                </span>
                <span className={`font-medium ${
                  item.label === 'Total' ? 'text-base font-bold text-slate-900' : 
                  item.isMultiplier ? 'text-orange-600' :
                  'text-slate-900'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applied Rules */}
      {appliedRules && appliedRules.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <h4 className="text-xs font-semibold text-amber-900 mb-2">Applied Modifiers</h4>
          <ul className="space-y-1">
            {appliedRules.map((rule, idx) => (
              <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info Note */}
      <p className="text-xs text-slate-500 text-center">
        ℹ️ Price may vary based on traffic, distance, and current demand
      </p>
    </div>
  );
}
