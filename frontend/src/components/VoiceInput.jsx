import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, CheckCircle2, Bot } from 'lucide-react';

export default function VoiceInput({ onSendCommand, isProcessing, agentResult }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Hindi + Hinglish recognition

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported on this browser. Please use Google Chrome or Edge, or type in Hinglish below!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendCommand(inputText);
  };

  const handlePresetClick = (phrase) => {
    setInputText(phrase);
    onSendCommand(phrase);
  };

  const presetPhrases = [
    { text: "Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de", tag: "Order List" },
    { text: "Maggi aur chini kam hai, next order mein add kar do", tag: "Demand Check" },
    { text: "Aaj 3 carton Amul milk aaya aur 2 carton bik gaya", tag: "Stock Update" },
    { text: "Agar main Maggi ka price ₹5 badha du toh?", tag: "What-If Simulator" }
  ];

  return (
    <div className="glass-panel voice-section">
      
      {/* Background Decorative Accent */}
      <div className="voice-bg-glow"></div>

      <div className="voice-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="voice-icon">
            <Volume2 />
          </div>
          <div>
            <h2 className="voice-title">
              "Bolo → Kaam Ho Gaya" 
              <span className="voice-tag">Hinglish Voice Agent</span>
            </h2>
            <p className="voice-subtitle">Speak naturally in Hindi or Hinglish — AI parses intents & executes tool actions</p>
          </div>
        </div>

        {isListening && (
          <div className="listening-indicator">
            <span className="listening-dot"></span>
            <span className="listening-text">Listening to Hinglish Speech...</span>
          </div>
        )}
      </div>

      {/* Voice & Text Form Input */}
      <form onSubmit={handleSubmit} className="voice-form">
        
        {/* Main Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`mic-btn ${isListening ? 'animate-mic-active' : ''}`}
          title={isListening ? "Stop Recording" : "Click to Speak in Hinglish"}
        >
          {isListening ? <MicOff /> : <Mic />}
        </button>

        {/* Input Text Field */}
        <div className="voice-input-wrapper">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Say or type e.g. "Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de"'
            className="voice-input"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="voice-send-btn"
          >
            {isProcessing ? (
              <span className="spinner"></span>
            ) : (
              <Send />
            )}
          </button>
        </div>

      </form>

      {/* Hinglish Quick Preset Chips */}
      <div className="preset-chips">
        <span className="preset-label">
          <Sparkles /> Hackathon Demo Chips:
        </span>
        {presetPhrases.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetClick(chip.text)}
            className="preset-btn"
          >
            <span>🗣️</span>
            <span>"{chip.text}"</span>
            <span className="preset-tag">{chip.tag}</span>
          </button>
        ))}
      </div>

      {/* AI Live Agent Result Banner */}
      {agentResult && (
        <div className="agent-result fade-in">
          <div className="agent-result-inner">
            <div className="agent-avatar">
              <Bot />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="agent-intent-badge">
                  🤖 {agentResult.intent || 'AI AGENT ACTION'}
                </span>
                <span className="agent-model-label">
                  Model: <strong style={{ color: 'var(--text-secondary)' }}>{agentResult.open_weight_model}</strong>
                </span>
              </div>

              <p className="agent-reply">
                {agentResult.reply_text_hindi || agentResult.reply_text_english}
              </p>

              {agentResult.tools_called && agentResult.tools_called.length > 0 && (
                <div className="agent-tools-row">
                  <span className="agent-tools-label">Tools Executed:</span>
                  {agentResult.tools_called.map((t, i) => (
                    <span key={i} className="tool-badge">
                      <CheckCircle2 /> {t.tool}({JSON.stringify(t.args)})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
