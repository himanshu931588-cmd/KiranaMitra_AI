import React, { useState } from 'react';
import { HelpCircle, DollarSign, Package, TrendingUp, AlertTriangle, CheckCircle2, X, Sparkles } from 'lucide-react';

export default function WhatIfSimulator({ products, onSimulate, simulationResult, onClose }) {
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.name || 'Maggi 2-Min Noodles');
  const [scenarioType, setScenarioType] = useState('price_change');
  const [value, setValue] = useState(5.0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate(selectedProduct, scenarioType, parseFloat(value));
  };

  const handleQuickScenario = (productName, type, val) => {
    setSelectedProduct(productName);
    setScenarioType(type);
    setValue(val);
    onSimulate(productName, type, val);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel p-6 max-w-2xl w-full border border-amber-500/40 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <HelpCircle className="w-6 h-6 text-gray-950" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-100 flex items-center gap-2">
                "What if?" Decision Support Simulator
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                Simulate price elasticity, revenue impact, and overstock risk
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Scenario Chips */}
        <div className="my-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Preset Queries:
          </span>

          <button
            onClick={() => handleQuickScenario('Maggi 2-Min Noodles', 'price_change', 5.0)}
            className="bg-gray-800 hover:bg-amber-500/20 text-gray-200 text-xs px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1 cursor-pointer"
          >
            "Agar main Maggi ka price ₹5 badha du toh?"
          </button>

          <button
            onClick={() => handleQuickScenario('Maggi 2-Min Noodles', 'order_quantity', 100.0)}
            className="bg-gray-800 hover:bg-amber-500/20 text-gray-200 text-xs px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1 cursor-pointer"
          >
            "What if I buy 100 Maggi packets?"
          </button>

          <button
            onClick={() => handleQuickScenario('Sugar (Chini)', 'order_quantity', 10.0)}
            className="bg-gray-800 hover:bg-amber-500/20 text-gray-200 text-xs px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1 cursor-pointer"
          >
            "What if I buy only 10 kg Sugar?"
          </button>
        </div>

        {/* Simulator Controls Form */}
        <form onSubmit={handleSubmit} className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Product Selector */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Select Product:</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Scenario Type */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Simulation Type:</label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
              >
                <option value="price_change">Price Increase/Decrease (+/- ₹)</option>
                <option value="order_quantity">Simulate Order Quantity</option>
              </select>
            </div>

            {/* Input Value */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                {scenarioType === 'price_change' ? 'Price Increase Amount (₹):' : 'Order Quantity Amount:'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs py-2.5 rounded-lg transition-all shadow-md cursor-pointer"
          >
            🚀 Run AI Simulation
          </button>
        </form>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-gray-900 to-gray-900 border border-amber-500/40 fade-in">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" /> Simulation Output for {simulationResult.product_name}
            </h3>

            {simulationResult.scenario === 'Price Change Simulation' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block">Current Price:</span>
                  <span className="text-base font-bold text-gray-200">₹{simulationResult.current_price}</span>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-amber-500/40">
                  <span className="text-amber-400 block">Simulated Price:</span>
                  <span className="text-base font-bold text-amber-300">₹{simulationResult.simulated_price}</span>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block">Expected Weekly Demand:</span>
                  <span className="text-base font-bold text-emerald-400">{simulationResult.expected_demand_weekly}</span>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block">Weekly Revenue:</span>
                  <span className="text-base font-bold text-emerald-400">{simulationResult.expected_revenue_weekly}</span>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 col-span-2">
                  <span className="text-gray-400 block">Weekly Net Profit:</span>
                  <span className="text-base font-bold text-amber-400">{simulationResult.expected_profit_weekly}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block">Simulated Order Quantity:</span>
                  <span className="text-base font-bold text-amber-300">{simulationResult.simulated_order_qty} {simulationResult.unit}</span>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block">Stock Duration:</span>
                  <span className="text-base font-bold text-blue-400">~{simulationResult.stock_duration_days} days of stock</span>
                </div>
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 col-span-2">
                  <span className="text-gray-400 block">Capital Required:</span>
                  <span className="text-base font-bold text-emerald-400">{simulationResult.capital_required}</span>
                </div>
              </div>
            )}

            <div className="mt-3 p-3 rounded-lg bg-gray-950 border border-gray-800">
              <span className="text-xs font-bold text-gray-300 block mb-1">🧠 AI Observation:</span>
              <p className="text-xs text-gray-400">
                {simulationResult.ai_observation || simulationResult.risk_assessment}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
