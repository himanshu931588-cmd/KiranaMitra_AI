import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VoiceInput from './components/VoiceInput';
import Inventory from './components/Inventory';
import Recommendations from './components/Recommendations';
import PurchaseList from './components/PurchaseList';
import ExplainModal from './components/ExplainModal';
import WhatIfSimulator from './components/WhatIfSimulator';
import SupplierCompareModal from './components/SupplierCompareModal';
import AgentLogVisualizer from './components/AgentLogVisualizer';

const API_BASE = '/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [purchaseList, setPurchaseList] = useState({ items: [], total_cost: 0, item_count: 0 });
  const [agentResult, setAgentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [explainData, setExplainData] = useState(null);
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [supplierData, setSupplierData] = useState(null);

  // Initial Fetch Data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const [resInv, resRec, resPur] = await Promise.all([
        fetch(`${API_BASE}/inventory`).then(r => r.json()),
        fetch(`${API_BASE}/demand/recommendations`).then(r => r.json()),
        fetch(`${API_BASE}/purchase-list`).then(r => r.json())
      ]);

      setProducts(resInv || []);
      setRecommendations(resRec || []);
      setPurchaseList(resPur || { items: [], total_cost: 0, item_count: 0 });
    } catch (err) {
      console.error('API Fetch Error:', err);
      setFetchError('Unable to load shop data right now. Please retry in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Send Hinglish Command to Open-Weight AI Agent
  const handleSendCommand = async (commandText) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/agent/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandText })
      });
      const data = await res.json();
      setAgentResult(data);
      
      // Refresh inventory & purchase list to reflect tool mutations
      await fetchAllData();

      // If what-if tool was called, update simulation state
      if (data.intent === 'WHAT_IF_SIMULATOR' && data.tools_called.length > 0) {
        setWhatIfResult(data.tools_called[0].output);
        setShowWhatIfModal(true);
      }

    } catch (err) {
      console.error('Agent Command Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Manual Stock Update
  const handleUpdateStock = async (productId, delta) => {
    try {
      await fetch(`${API_BASE}/inventory/update-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity_change: delta, mode: 'delta' })
      });
      await fetchAllData();
    } catch (err) {
      console.error('Update Stock Error:', err);
    }
  };

  // 3. Add to Purchase Order List
  const handleAddPurchaseItem = async (productId, qty, unit) => {
    try {
      await fetch(`${API_BASE}/purchase-list/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: qty, unit })
      });
      await fetchAllData();
    } catch (err) {
      console.error('Add Purchase Item Error:', err);
    }
  };

  // 4. Delete Item from Purchase Order List
  const handleDeletePurchaseItem = async (itemId) => {
    try {
      await fetch(`${API_BASE}/purchase-list/${itemId}`, { method: 'DELETE' });
      await fetchAllData();
    } catch (err) {
      console.error('Delete Item Error:', err);
    }
  };

  // 5. Clear Purchase Order List
  const handleClearPurchaseList = async () => {
    try {
      await fetch(`${API_BASE}/purchase-list`, { method: 'DELETE' });
      await fetchAllData();
    } catch (err) {
      console.error('Clear List Error:', err);
    }
  };

  // 6. "Why am I buying this?" Explainable AI Modal Fetch
  const handleExplainOrder = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/demand/explain/${productId}`);
      const data = await res.json();
      setExplainData(data);
    } catch (err) {
      console.error('Explain Order Error:', err);
    }
  };

  // 7. "What-If?" Simulator Fetch
  const handleSimulateWhatIf = async (productName, scenarioType, value) => {
    try {
      const res = await fetch(`${API_BASE}/demand/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: productName, scenario_type: scenarioType, value })
      });
      const data = await res.json();
      setWhatIfResult(data);
    } catch (err) {
      console.error('What-If Error:', err);
    }
  };

  // 8. Compare Suppliers Fetch
  const handleCompareSuppliers = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/demand/suppliers/${productId}`);
      const data = await res.json();
      setSupplierData(data);
    } catch (err) {
      console.error('Supplier Compare Error:', err);
    }
  };

  // 9. Reset Demo Database
  const handleResetDemo = async () => {
    try {
      await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
      setAgentResult(null);
      await fetchAllData();
    } catch (err) {
      console.error('Reset Demo Error:', err);
    }
  };

  return (
    <div className="min-h-screen pb-12 px-3 md:px-6">
      
      {/* Header Bar */}
      <Header
        onResetDemo={handleResetDemo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openWhatIfModal={() => setShowWhatIfModal(true)}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Flagship Feature: "Bolo → Kaam Ho Gaya" Voice Agent */}
        <VoiceInput
          onSendCommand={handleSendCommand}
          isProcessing={isProcessing}
          agentResult={agentResult}
        />

        {/* Main Workspace Views */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Inventory List */}
            <div className="lg:col-span-2 space-y-6">
              <Inventory
                products={products}
                onUpdateStock={handleUpdateStock}
                onAddToPurchase={handleAddPurchaseItem}
              />

              <Recommendations
                recommendations={recommendations}
                onExplainOrder={handleExplainOrder}
                onCompareSuppliers={handleCompareSuppliers}
                onAddPurchaseItem={handleAddPurchaseItem}
                fetchError={fetchError}
                isLoading={isLoading}
              />
            </div>

            {/* Right 1 Column: Purchase List & Agent Visualizer */}
            <div className="space-y-6">
              <PurchaseList
                purchaseData={purchaseList}
                onDeleteItem={handleDeletePurchaseItem}
                onClearList={handleClearPurchaseList}
              />

              <AgentLogVisualizer agentResult={agentResult} />
            </div>

          </div>
        )}

        {activeTab === 'demand' && (
          <div className="space-y-6">
            <Recommendations
              recommendations={recommendations}
              onExplainOrder={handleExplainOrder}
              onCompareSuppliers={handleCompareSuppliers}
              onAddPurchaseItem={handleAddPurchaseItem}
              fetchError={fetchError}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <AgentLogVisualizer agentResult={agentResult} />
          </div>
        )}

      </div>

      {/* Modals */}
      {explainData && (
        <ExplainModal
          explanationData={explainData}
          onClose={() => setExplainData(null)}
        />
      )}

      {showWhatIfModal && (
        <WhatIfSimulator
          products={products}
          onSimulate={handleSimulateWhatIf}
          simulationResult={whatIfResult}
          onClose={() => setShowWhatIfModal(false)}
        />
      )}

      {supplierData && (
        <SupplierCompareModal
          supplierData={supplierData}
          onClose={() => setSupplierData(null)}
        />
      )}

    </div>
  );
}
