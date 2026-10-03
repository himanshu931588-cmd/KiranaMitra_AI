import React, { useState } from 'react';
import { Package, Search, AlertTriangle, Plus, Minus } from 'lucide-react';

export default function Inventory({ products, onUpdateStock, onAddToPurchase }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.hindi_name && p.hindi_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.aliases && p.aliases.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesLowStock = !onlyLowStock || p.stock <= p.min_threshold;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.stock <= p.min_threshold).length;

  return (
    <div className="glass-panel section-panel">
      
      {/* Header & Filter Controls */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package style={{ width: 20, height: 20, color: 'var(--accent-gold)' }} />
            <h2 className="section-title">Dukaan Inventory</h2>
            {lowStockCount > 0 && (
              <span className="badge-red animate-pulse">
                ⚠️ {lowStockCount} Low Stock Alert
              </span>
            )}
          </div>
          <p className="section-subtitle">Real-time stock tracking for 15 essential Kirana items</p>
        </div>

        {/* Filters & Search Bar */}
        <div className="filter-row">
          <div className="search-box">
            <Search />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search (e.g. Maggi, Chini)..."
              className="search-input"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`filter-btn ${onlyLowStock ? 'active' : ''}`}
          >
            <AlertTriangle /> Low Stock Only
          </button>
        </div>
      </div>

      {/* Product Grid Cards */}
      <div className="grid-inventory">
        {filteredProducts.map(p => {
          const isLow = p.stock <= p.min_threshold;
          const isOut = p.stock <= 0;
          const cardClass = isOut ? 'out' : isLow ? 'low' : 'optimal';

          return (
            <div key={p.id} className={`product-card ${cardClass}`}>
              <div>
                {/* Status Badge & Name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-hindi">{p.hindi_name}</p>
                  </div>
                  {isOut ? (
                    <span className="badge-red">OUT OF STOCK 🔴</span>
                  ) : isLow ? (
                    <span className="badge-red animate-pulse">LOW 🔴</span>
                  ) : (
                    <span className="badge-green">OPTIMAL 🟢</span>
                  )}
                </div>

                {/* Stock Details & Progress Bar */}
                <div className="stock-details">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="stock-label">Current Stock:</span>
                    <span className={`stock-value ${isLow ? 'red' : 'green'}`}>
                      {p.stock} {p.unit}
                    </span>
                  </div>

                  <div className="stock-bar-track">
                    <div
                      className={`stock-bar-fill ${isLow ? 'red' : 'green'}`}
                      style={{ width: `${Math.min(100, (p.stock / (p.min_threshold * 2)) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="stock-meta">
                    <span>Min Alert: {p.min_threshold} {p.unit}</span>
                    <span>Cost: ₹{p.cost_price} | Sell: ₹{p.selling_price}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions">
                <div className="stock-counter">
                  <button
                    onClick={() => onUpdateStock(p.id, -1)}
                    className="stock-btn"
                    title="Decrease Stock (-1)"
                  >
                    <Minus />
                  </button>
                  <span className="stock-count">{p.stock}</span>
                  <button
                    onClick={() => onUpdateStock(p.id, 1)}
                    className="stock-btn"
                    title="Increase Stock (+1)"
                  >
                    <Plus />
                  </button>
                </div>

                <button
                  onClick={() => onAddToPurchase(p.id, isLow ? Math.max(10, p.min_threshold * 2) : 10)}
                  className="btn-add-order"
                >
                  + Add to Order
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
