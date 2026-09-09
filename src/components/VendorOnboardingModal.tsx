"use client";

import { useState } from "react";
import { Store, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="bg-[#CA3F2E] p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Complete Your Store Profile</h2>
          <p className="text-white/80 text-sm mt-1">Submit your application to start selling</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Name *</label>
                <input autoFocus type="text" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#CA3F2E]" placeholder="My Awesome Store" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Description</label>
                <textarea rows={3} value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#CA3F2E] resize-none" placeholder="What kind of footwear do you sell?" />
              </div>
              <button disabled={!form.storeName} onClick={() => setStep(2)} className="w-full bg-[#CA3F2E] text-white rounded-lg p-3 font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#8B2A1E] disabled:opacity-50">Next <ChevronRight className="w-4 h-4"/></button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {["sneakers", "running", "formal", "boots", "sandals"].map(c => (
                    <button key={c} onClick={() => toggleCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${form.productCategories.includes(c) ? 'bg-[#CA3F2E] text-white border-[#CA3F2E]' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Country *</label>
                  <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full border rounded-lg p-3 text-sm bg-white outline-none focus:border-[#CA3F2E]">
                    <option value="NG">Nigeria</option>
                    <option value="TG">Togo</option>
                    <option value="GH">Ghana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                  <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#CA3F2E]" />
                </div>
              </div>
              <button disabled={form.productCategories.length === 0} onClick={() => setStep(3)} className="w-full bg-[#CA3F2E] text-white rounded-lg p-3 font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#8B2A1E] disabled:opacity-50">Next <ChevronRight className="w-4 h-4"/></button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#CA3F2E]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#CA3F2E]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Instagram (Optional)</label>
                <input type="text" value={form.instagramUrl} onChange={e => setForm({...form, instagramUrl: e.target.value})} className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#CA3F2E]" placeholder="@yourstore" />
              </div>
              <button disabled={!form.phone || loading} onClick={submit} className="w-full bg-green-600 text-white rounded-lg p-3 font-bold text-sm flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>} Submit Application
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Skip for now</button>
          </div>
        </div>
      </div>
    </div>
  );
}