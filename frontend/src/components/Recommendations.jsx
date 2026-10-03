import React from 'react';
import { Brain, AlertTriangle, TrendingUp, HelpCircle, Truck, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function Recommendations({ 
  recommendations, 
  onExplainOrder, 
  onCompareSuppliers,
  onAddPurchaseItem
}) {
  const highRiskItems = recommendations.filter(r => r.urgency === 'HIGH');

  return (
    <div className="glass-panel p-5">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Brain className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              "Dukaan Ka Dimaag" — AI Demand Prediction
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                7-Day Sales Memory
              </span>
            </h2>
            <p className="text-xs text-gray-400">AI predicts stockout risks & recommends precise reorder quantities based on historical shop sales</p>
          </div>
        </div>
      </div>

      {/* Grid of AI Recommended Purchases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isHigh = rec.urgency === 'HIGH';
          
          return (
            <div
              key={rec.product_id}
              className={`p-4 rounded-xl border transition-all ${
                isHigh 
                  ? 'bg-gradient-to-r from-red-500/10 via-gray-900 to-gray-900 border-red-500/40'
                  : 'bg-gray-900/60 border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    {rec.product_name}
                    <span className="text-xs font-medium text-amber-400">({rec.hindi_name})</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Supplier: {rec.supplier}</p>
                </div>

                {isHigh ? (
                  <span className="badge-red animate-pulse">
                    ⚠️ STOCKOUT RISK: HIGH
                  </span>
                ) : (
                  <span className="badge-yellow">
                    🟡 MODERATE RISK
                  </span>
                )}
              </div>

              {/* Stock vs Expected Demand Bars ("Dukaan Ka Dimaag" Visual Story) */}
              <div className="mt-4 bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                
                {/* Current Stock Line */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Current Stock:</span>
                    <span className="font-bold text-amber-400">{rec.current_stock} {rec.unit}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (rec.current_stock / (rec.avg_daily_sales * 5)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expected Demand Line */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-red-400" /> Expected 3-Day Demand:
                    </span>
                    <span className="font-bold text-red-400">{round1(rec.avg_daily_sales * 3 * 1.28)} {rec.unit}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((rec.avg_daily_sales * 3 * 1.28) / (rec.avg_daily_sales * 5)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between">
                  <span>Avg Daily Sales: <strong className="text-gray-200">{rec.avg_daily_sales} {rec.unit}/day</strong></span>
                  <span>Stock Runway: <strong className="text-red-400">~{rec.days_remaining} days left</strong></span>
                </div>
              </div>

              {/* AI Recommendation Banner */}
              <div className="mt-3 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-semibold block">AI Recommended Purchase:</span>
                  <span className="text-base font-extrabold text-amber-300">
                    Buy {rec.recommended_order} {rec.unit} <span className="text-xs font-normal text-gray-400">(Est. ₹{rec.estimated_cost})</span>
                  </span>
                </div>

                <button
                  onClick={() => onAddPurchaseItem(rec.product_id, rec.recommended_order, rec.unit)}
                  className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Order Now
                </button>
              </div>

              {/* Differentiator Buttons: "Why?" & "Supplier Compare" */}
              <div className="mt-3 flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => onExplainOrder(rec.product_id)}
                  className="text-xs text-amber-400 hover:text-amber-300 bg-gray-950 hover:bg-gray-800 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> 🧠 "Why am I buying this?" (Explain AI)
                </button>

                <button
                  onClick={() => onCompareSuppliers(rec.product_id)}
                  className="text-xs text-gray-400 hover:text-gray-200 bg-gray-950 hover:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" /> Compare Suppliers
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

function round1(num) {
  return Math.round(num * 10) / 10;
}
