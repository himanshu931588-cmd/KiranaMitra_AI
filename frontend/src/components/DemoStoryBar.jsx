import React, { useState } from 'react';
import { Play, CheckCircle2, ChevronRight, Sparkles, X, RotateCcw } from 'lucide-react';

export default function DemoStoryBar({ 
  onRunStepCommand, 
  onExplainOrder, 
  openWhatIfModal, 
  onClose 
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: "Scene 1: Voice & Natural Language",
      description: "Shopkeeper says naturally: 'Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de'",
      actionText: "🎙️ Run Scene 1 (Voice Command)",
      action: () => {
        onRunStepCommand("Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de");
        setCurrentStep(2);
      }
    },
    {
      step: 2,
      title: "Scene 2: Dukaan Ka Dimaag AI Detects Stockout Risk",
      description: "AI checks 7-day sales memory: Maggi stock (4 pkts) vs expected 3-day demand (21 pkts)",
      actionText: "⚠️ Run Scene 2 (Demand Check)",
      action: () => {
        onRunStepCommand("Maggi aur chini kam hai, next order mein add kar do");
        setCurrentStep(3);
      }
    },
    {
      step: 3,
      title: "Scene 3: AI Purchase Order Generation",
      description: "AI generates purchase recommendation: Maggi → 30 packets, Sugar → 10 kg with ₹ cost calculation",
      actionText: "🛒 Run Scene 3 (Auto Reorder)",
      action: () => {
        onRunStepCommand("Maggi ke 20 packet aur 5 kilo sugar order list mein daal do");
        setCurrentStep(4);
      }
    },
    {
      step: 4,
      title: "Scene 4: Explainable AI ('Why am I buying this?')",
      description: "Demonstrate AI transparency: Click 'Why?' to view daily average sales, weekend surge, & delivery lead time formula",
      actionText: "🧠 Run Scene 4 (Explain AI)",
      action: () => {
        onExplainOrder(1); // Maggi ID = 1
        setCurrentStep(5);
      }
    },
    {
      step: 5,
      title: "Scene 5: 'What-if?' Simulator",
      description: "Demonstrate decision support: 'Agar main Maggi ka price ₹5 badha du toh?'",
      actionText: "💡 Run Scene 5 (What-If Simulator)",
      action: () => {
        openWhatIfModal();
        setCurrentStep(1);
      }
    }
  ];

  const activeStepObj = steps.find(s => s.step === currentStep);

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-gray-900 to-amber-500/20 border border-amber-500/40 p-4 rounded-2xl mb-6 shadow-xl relative animate-fadeIn">
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-gray-950 flex items-center justify-center font-bold text-xs">
            🏆
          </div>
          <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
            90-Second Hackathon Demo Pitch Story
            <span className="text-xs text-gray-400 font-normal">
              (Step {currentStep} of 5)
            </span>
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 text-xs flex items-center gap-1 cursor-pointer"
        >
          <X className="w-4 h-4" /> Close Demo Bar
        </button>
      </div>

      {/* Progress Dots */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {steps.map(s => (
          <div
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`h-2 rounded-full cursor-pointer transition-all ${
              s.step === currentStep 
                ? 'bg-amber-400 shadow-md shadow-amber-400/50 scale-105' 
                : s.step < currentStep 
                ? 'bg-emerald-400' 
                : 'bg-gray-800'
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Current Step Action Card */}
      <div className="bg-gray-950/90 p-3.5 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-gray-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {activeStepObj.title}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeStepObj.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={activeStepObj.action}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
          >
            {activeStepObj.actionText} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
