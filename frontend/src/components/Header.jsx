import React from 'react';
import { Store, Sparkles, RefreshCw, Brain, HelpCircle, Layers } from 'lucide-react';

export default function Header({ 
  onResetDemo, 
  activeTab, 
  setActiveTab,
  openWhatIfModal
}) {
  return (
    <header className="glass-panel-gold header">
      <div className="header-inner max-container">
        
        {/* Brand & Store Info */}
        <div className="header-brand">
          <div className="header-logo">
            <Store />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="header-title">KiranaMitra AI</h1>
              <span className="header-badge">
                <Sparkles style={{ width: 12, height: 12, color: '#fbbf24' }} /> Open-Weight AI
              </span>
            </div>
            <p className="header-subtitle">
              <span>Gupta Kirana Store • Lucknow</span>
              <span className="header-status-dot"></span>
              <span className="header-status-text">Live Agent Ready</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Store /> Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('demand')}
            className={`nav-btn ${activeTab === 'demand' ? 'active' : ''}`}
          >
            <Brain /> Dukaan Ka Dimaag
          </button>

          <button
            onClick={openWhatIfModal}
            className="nav-btn nav-btn-accent"
          >
            <HelpCircle /> "What-if?" Simulator
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <Layers /> Agent Tools & Pipeline
          </button>
        </nav>

        {/* Quick Action Buttons */}
        <div className="header-actions">
          <button
            onClick={onResetDemo}
            title="Reset Store to Initial Hackathon Demo State"
            className="btn-reset"
          >
            <RefreshCw />
          </button>
        </div>

      </div>
    </header>
  );
}
