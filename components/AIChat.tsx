
import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { sendMessageToGemini } from '../services/gemini';
import { ChatMessage, Restaurant } from '../types';

interface AIChatProps {
  restaurants: Restaurant[];
}

const AIChat: React.FC<AIChatProps> = ({ restaurants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o Volpony Bot 🍃. Posso te ajudar a encontrar algo delicioso?', timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Ajuste aqui: enviando apenas o texto conforme esperado pelo serviço
    const history = messages.map(m => ({
        role: m.role,
        text: m.text
    }));

    const responseText = await sendMessageToGemini(history, userMsg.text, restaurants);

    const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-brand-500 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:bg-brand-600 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-brand-400"
        >
          <Sparkles className="animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[350px] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slideUp" style={{ maxHeight: '80vh', height: '500px' }}>
          <div className="bg-brand-500 p-4 flex justify-between items-center text-white shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg border border-white/30">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Volpony Bot</h3>
                <p className="text-xs text-brand-100">Assistente IA</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-brand-100 hover:text-white hover:bg-white/10 rounded-full p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <input
                type="text"
                placeholder="Como posso ajudar?"
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="text-brand-600 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
