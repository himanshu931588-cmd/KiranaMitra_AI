import React from 'react';
import { Brain, TrendingUp, HelpCircle, Truck, ShoppingCart } from 'lucide-react';
import { hasRecommendations, getRiskSummary } from '../utils/recommendations.js';

export default function Recommendations({
  recommendations = [],
  onExplainOrder,
  onCompareSuppliers,
  onAddPurchaseItem,
  fetchError,
  isLoading,
}) {
  const riskSummary = getRiskSummary(recommendations);
  const showEmptyState = !hasRecommendations(recommendations);

  return (
    <div className="glass-panel p-5">
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
            <p className="text-xs text-gray-400">
              AI predicts stockout risks & recommends precise reorder quantities based on historical shop sales
            </p>
          </div>
        </div>

        {!showEmptyState && (
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-300">
            <span className="badge-red">{riskSummary.high} High</span>
            <span className="badge-yellow">{riskSummary.moderate} Medium</span>
          </div>
        )}
      </div>

      {fetchError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {fetchError}
        </div>
      )}

      {isLoading && !showEmptyState && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Loading demand predictions...
        </div>
      )}

      {showEmptyState ? (
        <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
            <Brain className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">No demand recommendations yet</h3>
          <p className="mt-2 text-sm text-gray-400">
            Add or update inventory data to generate AI purchasing suggestions for your shop.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isHigh = rec.urgency === 'HIGH';

            return (
              <div
                key={rec.product_id}
                className={`recommendation-card ${isHigh ? 'recommendation-card--high' : 'recommendation-card--normal'}`}
              >
                <div className="recommendation-header">
                  <div className="recommendation-title-wrap">
                    <h3 className="recommendation-title">
                      {rec.product_name}
                      <span className="recommendation-hindi">({rec.hindi_name})</span>
                    </h3>
                    <p className="recommendation-supplier">Supplier: {rec.supplier}</p>
                  </div>

                  {isHigh ? (
                    <span className="badge-red animate-pulse">⚠️ STOCKOUT RISK: HIGH</span>
                  ) : (
                    <span className="badge-yellow">🟡 MODERATE RISK</span>
                  )}
                </div>

                <div className="recommendation-stats">
                  <div className="recommendation-metric">
                    <div className="recommendation-metric-label-row">
                      <span>Current Stock:</span>
                      <span className="recommendation-metric-value accent-amber">
                        {rec.current_stock} {rec.unit}
                      </span>
                    </div>
                    <div className="recommendation-bar-track">
                      <div
                        className="recommendation-bar recommendation-bar-amber"
                        style={{ width: `${Math.min(100, (rec.current_stock / (rec.avg_daily_sales * 5)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="recommendation-metric">
                    <div className="recommendation-metric-label-row">
                      <span className="recommendation-meta-inline">
                        <TrendingUp className="w-3.5 h-3.5 text-red-400" /> Expected 3-Day Demand:
                      </span>
                      <span className="recommendation-metric-value accent-red">
                        {round1(rec.avg_daily_sales * 3 * 1.28)} {rec.unit}
                      </span>
                    </div>
                    <div className="recommendation-bar-track">
                      <div
                        className="recommendation-bar recommendation-bar-red"
                        style={{ width: `${Math.min(100, ((rec.avg_daily_sales * 3 * 1.28) / (rec.avg_daily_sales * 5)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="recommendation-summary-row">
                    <span>
                      Avg Daily Sales: <strong>{rec.avg_daily_sales} {rec.unit}/day</strong>
                    </span>
                    <span>
                      Stock Runway: <strong className="accent-red">~{rec.days_remaining} days left</strong>
                    </span>
                  </div>
                </div>

                <div className="recommendation-order-box">
                  <div>
                    <span className="recommendation-order-label">AI Recommended Purchase:</span>
                    <span className="recommendation-order-total">
                      Buy {rec.recommended_order} {rec.unit}
                      <span className="recommendation-order-cost">(Est. ₹{rec.estimated_cost})</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onAddPurchaseItem(rec.product_id, rec.recommended_order, rec.unit)}
                    className="recommendation-order-btn"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Order Now
                  </button>
                </div>

                <div className="recommendation-actions">
                  <button
                    onClick={() => onExplainOrder(rec.product_id)}
                    className="recommendation-action-btn recommendation-action-btn--primary"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Why this order?
                  </button>

                  <button
                    onClick={() => onCompareSuppliers(rec.product_id)}
                    className="recommendation-action-btn recommendation-action-btn--secondary"
                  >
                    <Truck className="w-3.5 h-3.5" /> Compare Suppliers
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function round1(num) {
  return Math.round(num * 10) / 10;
}
