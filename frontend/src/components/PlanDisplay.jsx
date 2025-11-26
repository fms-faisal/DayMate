import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * PlanDisplay Component
 * Displays the AI-generated daily plan with formatted content
 */

function PlanDisplay({ plan, city, weather, news, error }) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!plan) return null;

  // Text-to-Speech function
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(plan);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Speech-to-Text function
  const handleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      // Stop listening logic if needed, but usually we just let it finish
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Parse inline markdown (bold, italic)
  const parseInlineMarkdown = (text) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Simple markdown-like formatting
  const formatPlan = (text) => {
    // Split by lines and process
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      
      // Bullet points with * (markdown style)
      if (line.trimStart().startsWith('* ')) {
        const content = line.replace(/^\s*\*\s/, '');
        return (
          <div key={index} className="flex items-start gap-3 my-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-blue-500 mt-1 text-lg">•</span>
            <p className="text-slate-700 flex-1 leading-relaxed">{parseInlineMarkdown(content)}</p>
          </div>
        );
      }
      
      // Bullet points with - or •
      if (line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ')) {
        const content = line.replace(/^\s*[-•]\s/, '');
        return (
          <div key={index} className="flex items-start gap-3 my-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-blue-500 mt-1 text-lg">•</span>
            <p className="text-slate-700 flex-1 leading-relaxed">{parseInlineMarkdown(content)}</p>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          return (
            <div key={index} className="flex items-start gap-3 my-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {match[1]}
              </span>
              <p className="text-slate-700 flex-1 leading-relaxed">{parseInlineMarkdown(match[2])}</p>
            </div>
          );
        }
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-slate-600 my-2 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        city: city,
        weather: weather,
        news: news,
        previous_plan: plan
      });

      if (response.data.response) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that request right now. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Plan Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-pink-500/10 border border-white/50 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-violet-200 to-pink-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-lg shadow-pink-500/30">
              <span className="text-3xl">✨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-600">Your Day in {city}</h2>
              <p className="text-slate-500">Personalized itinerary</p>
            </div>
          </div>
          
          <button 
            onClick={handleSpeak}
            className={`p-3 rounded-xl transition-all ${
              isSpeaking 
                ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-100' 
                : 'bg-violet-50 text-violet-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
            title={isSpeaking ? "Stop reading" : "Read aloud"}
          >
            {isSpeaking ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-pink-700">
              <span className="font-bold">Note:</span> {error}
            </p>
          </div>
        )}

        <div className="prose prose-slate max-w-none relative z-10">
          {formatPlan(plan)}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-pink-500/10 border border-white/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl shadow-lg shadow-pink-500/20">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-orange-500">Chat with DayMate</h3>
            <p className="text-sm text-slate-500">Ask for changes or more details</p>
          </div>
        </div>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {chatMessages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-tr-none shadow-md shadow-pink-500/20' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleChatSubmit} className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="e.g., 'Find a cheaper lunch place' or 'Add a museum visit'"
            className="w-full p-4 pr-24 bg-violet-50/50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={handleListen}
              className={`p-2 rounded-lg transition-colors ${
                isListening ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
              }`}
              title="Voice input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="p-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:from-violet-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-pink-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-pink-100">
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <span>🎯</span>
          <span>Personalized based on real-time weather &amp; local news</span>
        </p>
      </div>
    </div>
  );
}

export default PlanDisplay;
