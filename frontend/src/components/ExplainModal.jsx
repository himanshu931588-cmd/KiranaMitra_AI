import React from 'react';
import { X, Brain, CheckCircle2, TrendingUp, Calendar, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function ExplainModal({ explanationData, onClose }) {
  if (!explanationData) return null;

  const { product_name, hindi_name, unit, current_stock, explainable_reasoning } = explanationData;
  const { 
    average_daily_sales, 
    sales_7d_history, 
    sales_trend, 
    weekend_demand_bump_pct,
    expected_3day_demand,
    supplier_lead_time_days,
    stockout_risk,
    days_stock_remaining,
    recommended_order,
    ai_formula_explanation
  } = explainable_reasoning;

  return (
    <div className="modal-overlay">
      <div className="glass-panel p-6 max-w-2xl w-full border border-amber-500/40 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Brain className="w-6 h-6 text-gray-950" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-100 flex items-center gap-2">
                Why am I buying this?
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                Explainable AI Reasoning for {product_name} ({hindi_name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gray-900 to-gray-900 border border-amber-500/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-300 font-semibold block">AI Decision Output:</span>
              <span className="text-2xl font-black text-amber-400">
                Buy {recommended_order} {unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Stockout Risk:</span>
              <span className="badge-red font-bold text-sm">
                🔴 {stockout_risk} (Runs out in ~{days_stock_remaining} days)
              </span>
            </div>
          </div>
        </div>

        {/* Step-by-Step AI Reasoning Chain */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Step-by-Step Proof:
          </h3>

          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-200">1. Average Daily Sales Memory</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Over the past 7 days, your store sold an average of <strong className="text-amber-400">{average_daily_sales} {unit}/day</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-200">2. Weekend & Sales Trend Surge</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Historical sales show a <strong className="text-amber-400">+{weekend_demand_bump_pct}% sales bump</strong> on weekends for this item. Trend is <strong className="text-emerald-400">{sales_trend}</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-200">3. Supplier Delivery Window & Buffer</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Supplier delivery takes <strong className="text-blue-300">{supplier_lead_time_days} days</strong>. Current stock ({current_stock} {unit}) will run out before supplier arrives.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">4. Final AI Mathematical Formula</h4>
              <p className="text-xs font-mono text-gray-300 mt-1 bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                {ai_formula_explanation}
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Sales History Visual */}
        <div className="mt-5 pt-4 border-t border-gray-800">
          <h4 className="text-xs font-bold text-gray-400 mb-2">7-Day Sales Breakdown (Units Sold):</h4>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {sales_7d_history.map((qty, idx) => (
              <div key={idx} className="bg-gray-950 p-2 rounded-lg border border-gray-800">
                <span className="text-[10px] text-gray-500 block">Day {idx+1}</span>
                <span className="text-xs font-bold text-amber-400">{qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
}
