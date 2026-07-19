"use client";

import { useState } from "react";
import { Mail, Check, ArrowRight, Sparkles } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Exclusive Offers Await</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Join Our Newsletter
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              Be the first to know about new arrivals, exclusive deals, and get 
              <span className="text-white font-semibold"> 15% off</span> your next order.
            </p>

            {status === "success" ? (
              <div className="inline-flex items-center gap-2 px-8 py-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl text-lg font-semibold animate-fade-in-up">
                <Check className="w-5 h-5" />
                You&apos;re in! Check your inbox for your discount code.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {status === "loading" ? (
                      "Subscribing..."
                    ) : (
                      <>Subscribe <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-red-400 text-sm mt-3">Something went wrong. Try again!</p>
                )}
                <p className="text-gray-500 text-xs mt-4">No spam ever. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
