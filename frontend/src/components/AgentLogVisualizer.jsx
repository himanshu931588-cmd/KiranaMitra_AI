import React from 'react';
import { Layers, Cpu, CheckCircle2, ArrowRight, Database, Bot, Sparkles, Terminal } from 'lucide-react';

export default function AgentLogVisualizer({ agentResult }) {
  return (
    <div className="glass-panel p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              Open-Weight AI Architecture & Tool Calling Visualizer
            </h2>
            <p className="text-xs text-gray-400">Proves Open-Weight LLM tool execution pipeline live during pitch</p>
          </div>
        </div>

        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Agent Ready
        </span>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 mb-5">
        <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Agent Execution Pipeline:
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          
          <div className="bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-center min-w-[110px]">
            <span className="text-amber-400 block font-bold">1. Input</span>
            <span className="text-[11px] text-gray-400">Hinglish Voice/Text</span>
          </div>

          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />

          <div className="bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-center min-w-[120px]">
            <span className="text-amber-400 block font-bold">2. ASR Engine</span>
            <span className="text-[11px] text-gray-400">Srota Hinglish ASR</span>
          </div>

          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />

          <div className="bg-amber-500/20 border border-amber-500/40 p-2.5 rounded-lg text-center min-w-[130px]">
            <span className="text-amber-300 block font-bold">3. Open-Weight AI</span>
            <span className="text-[11px] text-amber-200">Qwen3-8B Tool Agent</span>
          </div>

          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />

          <div className="bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-center min-w-[120px]">
            <span className="text-amber-400 block font-bold">4. Tool Selection</span>
            <span className="text-[11px] text-gray-400">Database Tools</span>
          </div>

          <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />

          <div className="bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-center min-w-[110px]">
            <span className="text-emerald-400 block font-bold">5. Action Output</span>
            <span className="text-[11px] text-gray-400">Order / Forecast</span>
          </div>

        </div>
      </div>

      {/* Real-time Tool Call Trace */}
      {agentResult ? (
        <div className="bg-gray-950 p-4 rounded-xl border border-amber-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-amber-400" /> Latest Execution Trace
            </span>
            <span className="text-gray-500 text-[11px]">{agentResult.open_weight_model}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5">Raw User Input:</span>
            <p className="text-gray-200 bg-gray-900 p-2 rounded border border-gray-800 font-sans">
              "{agentResult.transcription}"
            </p>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5">Detected Intent Action:</span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30 inline-block">
              {agentResult.intent}
            </span>
          </div>

          {agentResult.tools_called && agentResult.tools_called.length > 0 && (
            <div>
              <span className="text-gray-400 block mb-1">Tools Invoked & Arguments:</span>
              <div className="space-y-1.5">
                {agentResult.tools_called.map((t, idx) => (
                  <div key={idx} className="bg-gray-900 p-2 rounded border border-gray-800 text-[11px]">
                    <span className="text-emerald-400 font-bold">tool_name: {t.tool}</span>
                    <pre className="text-gray-300 mt-1 overflow-x-auto text-[10px]">{JSON.stringify(t.args, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-gray-400 block mb-0.5">Structured Agent Output:</span>
            <p className="text-emerald-300 font-sans bg-gray-900 p-2 rounded border border-gray-800">
              {agentResult.reply_text_english}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500 text-xs bg-gray-950/40 rounded-xl border border-gray-800">
          No tool calls executed yet. Use the voice bar or click a preset chip to view live execution logs!
        </div>
      )}

    </div>
  );
}
