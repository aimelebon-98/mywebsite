"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      })
      .catch(() => {});

    // Show bubble after 3 seconds
    const timer = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    const phone = whatsappNumber.replace(/\D/g, "");
    const text = message || "Hi! I'm interested in your shoes. Can you help me?";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setIsOpen(false);
    setMessage("");
  };

  const quickMessages = [
    "Hi! I need help choosing shoes.",
    "Do you have this in my size?",
    "What are your best deals today?",
    "I have a question about my order.",
  ];

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] animate-slide-in-left">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-green-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">SoleVault Support</p>
                  <p className="text-green-100 text-xs">Usually replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-[#e5ddd5] min-h-[180px]">
              {/* Welcome message bubble */}
              <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm max-w-[85%] mb-3">
                <p className="text-sm text-gray-800">
                  👋 Hey there! Welcome to SoleVault. How can we help you today?
                </p>
                <p className="text-[10px] text-gray-400 mt-1 text-right">Just now</p>
              </div>

              {/* Quick replies */}
              <div className="space-y-1.5 mt-4">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => { setMessage(msg); }}
                    className="block w-full text-left px-3 py-2 bg-white/90 rounded-lg text-xs text-gray-700 hover:bg-white transition border border-white/50"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification bubble */}
      {showBubble && !isOpen && (
        <div
          onClick={() => { setIsOpen(true); setShowBubble(false); }}
          className="fixed bottom-24 right-4 sm:right-6 z-50 bg-white rounded-xl shadow-lg px-4 py-3 max-w-[260px] cursor-pointer animate-slide-in-left border border-gray-100 hover:shadow-xl transition"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
          <p className="text-sm text-gray-800 font-medium">Need help? 👋</p>
          <p className="text-xs text-gray-500 mt-0.5">Chat with us on WhatsApp</p>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowBubble(false); }}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 ${
          isOpen ? "bg-gray-700 rotate-0" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
        )}
      </button>
    </>
  );
}
