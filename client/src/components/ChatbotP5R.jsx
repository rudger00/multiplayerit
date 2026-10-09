import React, { useState, useEffect, useRef } from 'react';

const TOTAL_TIMEOUT_MS = 15000;

export default function ChatbotP5R() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Inizializzazione Navigazione... Scudo anti-blocco attivo. Dimmi tutto, Joker!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cerveletto locale di emergenza (se il server non risponde)
  const getFutabaLocalResponse = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('ciao') || lowerText.includes('hey')) return "Mwehehe! Ciao Joker. Rete esterna lenta, ma i miei sistemi locali sono operativi!";
    if (lowerText.includes('come stai')) return "Caffeina al 100%. Sistemi operativi. Sono pronta!";
    if (lowerText.includes('aiuto') || lowerText.includes('problema')) return "Tranquillo, ci penso io a coprirti le spalle.";
    return "Mmh... Interferenze di rete con il Meta-Verso. Riesci a ripetere?";
  };

  const getAIResponse = async (userText) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);

      // Chiamiamo IL NOSTRO SERVER sicuro, non Gemini direttamente!
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Errore dal server");
      
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Errore di rete/server, attivo scudo locale:", error.message);
      return getFutabaLocalResponse(userText);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const newUserMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    const aiResponseText = await getAIResponse(newUserMsg.text);

    const botResponse = { id: Date.now() + 1, sender: 'bot', text: aiResponseText };
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[550px] flex flex-col bg-[#c90000] border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.8)] overflow-hidden animate-fadeIn origin-bottom-right">
          <div className="bg-black text-white h-14 relative flex items-center px-4 shrink-0 overflow-hidden border-b-4 border-white transform skew-y-1 origin-top-left z-10">
            <div className="relative z-10 flex items-center justify-between w-full transform -skew-y-1">
              <div className="flex items-center gap-3">
                <span className="text-[#e60012] text-3xl font-black italic tracking-tighter">IM</span>
                <h3 className="text-white font-black text-xl italic uppercase tracking-tighter drop-shadow-md">Phantom_Navi</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#e60012] font-black text-3xl transition-colors outline-none pb-1">&times;</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative" style={{ backgroundColor: '#c90000', backgroundImage: 'radial-gradient(#b30000 20%, transparent 20%), radial-gradient(#b30000 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
                {msg.sender === 'bot' ? (
                  <div className="flex items-start gap-3 w-full max-w-[85%]">
                    <div className="relative shrink-0 mt-2">
                      <div className="absolute -left-2 top-2 bottom-2 w-3 bg-[#39ff14] transform -skew-x-12 z-0 shadow-lg"></div>
                      <div className="w-12 h-12 bg-black border-[3px] border-white transform skew-x-6 flex items-center justify-center relative z-10 overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=N+A&background=000&color=fff&font-size=0.4&bold=true" alt="Navi" className="w-full h-full object-cover transform -skew-x-6 scale-125 opacity-80 filter contrast-125 grayscale" />
                      </div>
                      <div className="absolute -right-4 top-4 w-6 h-4 bg-white transform rotate-12 z-0"></div>
                    </div>
                    <div className="bg-black border-[4px] border-white p-3 transform -skew-x-3 relative z-10 shadow-xl">
                      <p className="text-white text-[15px] font-bold leading-snug tracking-tight transform skew-x-3 whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-end gap-3 w-full max-w-[85%] mt-2">
                    <div className="bg-white border-[4px] border-black p-3 px-5 transform skew-x-3 relative z-10 shadow-xl">
                      <p className="text-black text-[16px] font-black leading-snug tracking-tight transform -skew-x-3 whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="absolute right-0 top-4 w-6 h-4 bg-black transform -rotate-12 -z-10 translate-x-2"></div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3 w-full max-w-[85%] relative z-10">
                <div className="relative shrink-0 mt-2">
                  <div className="absolute -left-2 top-2 bottom-2 w-3 bg-[#39ff14] transform -skew-x-12 z-0 shadow-lg"></div>
                  <div className="w-12 h-12 bg-black border-[3px] border-white transform skew-x-6 flex items-center justify-center relative z-10">
                    <span className="text-white text-xs font-black transform -skew-x-6">NAVI</span>
                  </div>
                </div>
                <div className="bg-black border-[4px] border-white p-3 transform -skew-x-3 relative z-10 shadow-xl w-16 flex justify-center">
                  <span className="text-[#39ff14] text-[20px] font-black transform skew-x-3 animate-pulse leading-none -mt-1">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-black p-4 border-t-4 border-white flex gap-3 items-center relative overflow-hidden z-20">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBMMjAgMEgwaC0yMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Scrivi qui..." className="flex-1 bg-white border-[3px] border-black text-black px-3 py-2 outline-none font-bold placeholder-gray-500 transform skew-x-2 focus:ring-4 focus:ring-[#e60012] relative z-10" />
            <button onClick={handleSend} disabled={isTyping} className="bg-[#e60012] text-white font-black uppercase italic text-lg px-5 py-1.5 border-[3px] border-white hover:bg-white hover:text-[#e60012] transition-colors transform -skew-x-6 shadow-[3px_3px_0px_#000] relative z-10 disabled:opacity-50 disabled:cursor-not-allowed">INVIO</button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 border-4 border-white rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform relative z-50 group overflow-hidden ${isOpen ? 'bg-black text-white' : 'bg-[#e60012] text-white'}`}>
        {isOpen ? (
          <span className="font-black text-3xl transition-transform group-hover:rotate-90 pb-1">&times;</span>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="absolute bg-black w-8 h-8 rotate-12 transform scale-125" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
            <span className="text-white font-black italic tracking-tighter text-xl relative z-10 -ml-1">IM</span>
          </div>
        )}
      </button>
    </div>
  );
}