import React from 'react';
import { X, Truck, Star, Clock, Tag, CheckCircle2, Sparkles } from 'lucide-react';

export default function SupplierCompareModal({ supplierData, onClose }) {
  if (!supplierData) return null;

  const { product_name, unit, suppliers, ai_recommendation } = supplierData;

  return (
    <div className="modal-overlay">
      <div className="glass-panel p-6 max-w-xl w-full border border-amber-500/40 relative animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Truck className="w-6 h-6 text-gray-950" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-100">
                Supplier Price & Lead Time Comparison
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                Optimized sourcing for {product_name}
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

        {/* Suppliers List */}
        <div className="my-5 space-y-3">
          {suppliers.map((s, idx) => {
            const isBest = idx === 0;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isBest 
                    ? 'bg-gradient-to-r from-amber-500/10 via-gray-900 to-gray-900 border-amber-500/40' 
                    : 'bg-gray-950 border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                      {s.name}
                      {isBest && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                          {s.tag}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Rating: {s.rating} / 5.0
                    </p>
                  </div>

                  <span className="text-base font-extrabold text-amber-400">
                    ₹{s.cost_per_unit} <span className="text-xs font-normal text-gray-400">/ {unit}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-800/80 text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Delivery: <strong className="text-gray-200">{s.delivery_days} days</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" /> Min Order: <strong className="text-gray-200">{s.min_order} {unit}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Recommendation Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Sourcing Recommendation:
          </span>
          <p className="text-xs text-gray-200">
            {ai_recommendation}
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
}
