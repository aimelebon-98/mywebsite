"use client";

import { useState } from "react";
import { Store, Loader2, CheckCircle2, ChevronRight, ChevronLeft, X } from "lucide-react";

export default function VendorOnboardingModal({ vendor, onClose, onComplete }: { vendor: any; onClose: ()=>void; onComplete: ()=>void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: vendor?.storeName?.includes("'s Store") ? "" : vendor.storeName || "",
    storeDescription: "",
    productCategories: [] as string[],
    country: "NG",
    city: "",
    phone: "",
    whatsapp: "",
    instagramUrl: "",
    websiteUrl: ""
  });

  const toggleCat = (c: string) => setForm(f => ({
    ...f, productCategories: f.productCategories.includes(c) 
      ? f.productCategories.filter(x => x !== c) 
      : [...f.productCategories, c]
  }));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) onComplete();
    } catch {}
    setLoading(false);
  };

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 bg-[#CA3F2E]/20 text-[#CA3F2E] rounded-xl flex items-center justify-center mb-4 border border-[#CA3F2E]/30">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Complete Your Store Profile</h2>
          <p className="text-gray-400 text-sm mt-1">Submit your details to start selling.</p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-2">
              <span className={step >= 1 ? "text-[#CA3F2E]" : "text-gray-600"}>1. Basics</span>
              <span className={step >= 2 ? "text-[#CA3F2E]" : "text-gray-600"}>2. Details</span>
              <span className={step >= 3 ? "text-[#CA3F2E]" : "text-gray-600"}>3. Contact</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="bg-[#CA3F2E] h-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPct}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 pb-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Store Name *</label>
                <input autoFocus type="text" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] placeholder-gray-600 transition-colors" placeholder="e.g. Kicks & Co" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Store Description</label>
                <textarea rows={3} value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] placeholder-gray-600 resize-none transition-colors" placeholder="What kind of footwear do you sell?" />
              </div>
              <div className="pt-2">
                <button disabled={!form.storeName} onClick={() => setStep(2)} className="w-full bg-[#CA3F2E] text-white rounded-xl p-4 font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#8B2A1E] disabled:opacity-50 transition-colors">
                  Next Step <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {["sneakers", "running", "formal", "boots", "sandals"].map(c => (
                    <button key={c} onClick={() => toggleCat(c)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${form.productCategories.includes(c) ? 'bg-[#CA3F2E] text-white border-[#CA3F2E]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Country *</label>
                  <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] transition-colors">
                    <option value="NG">Nigeria</option>
                    <option value="TG">Togo</option>
                    <option value="GH">Ghana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">City</label>
                  <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors">
                  <ChevronLeft className="w-5 h-5"/>
                </button>
                <button disabled={form.productCategories.length === 0} onClick={() => setStep(3)} className="flex-1 bg-[#CA3F2E] text-white rounded-xl p-4 font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#8B2A1E] disabled:opacity-50 transition-colors">
                  Next Step <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Instagram (Optional)</label>
                <input type="text" value={form.instagramUrl} onChange={e => setForm({...form, instagramUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm outline-none focus:border-[#CA3F2E] transition-colors placeholder-gray-600" placeholder="@yourstore" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors">
                  <ChevronLeft className="w-5 h-5"/>
                </button>
                <button disabled={!form.phone || loading} onClick={submit} className="flex-1 bg-green-600 text-white rounded-xl p-4 font-bold text-sm flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-900/20">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle2 className="w-5 h-5"/>} 
                  Submit Application
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xs font-medium uppercase tracking-wider transition-colors">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}