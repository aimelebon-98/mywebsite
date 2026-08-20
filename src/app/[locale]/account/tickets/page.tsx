"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { LifeBuoy, Plus, Loader2, MessageCircle, X, Send } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  lastMessageAt: string;
  unreadByCustomer: boolean;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed:      "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TicketsPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomer();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("order");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !customer) router.push(`/${locale}/account/login`);
  }, [authLoading, customer, locale, router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (customer) load(); }, [customer]);

  const submit = async () => {
    setError("");
    if (!subject.trim() || !message.trim()) {
      setError(isFr ? "Sujet et message requis" : "Subject and message required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || (isFr ? "Erreur lors de la création du ticket." : "Failed to create ticket."));
      } else {
        setShowForm(false);
        setSubject("");
        setMessage("");
        setCategory("order");
        await load();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || (isFr ? "Erreur réseau." : "Network error."));
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (st: string) => {
    if (isFr) return { open: "Ouvert", in_progress: "En cours", resolved: "R\u00e9solu", closed: "Ferm\u00e9" }[st] || st;
    return { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" }[st] || st;
  };

  const categories = [
    { value: "order",   labelEn: "Order Issue",       labelFr: "Probl\u00e8me de commande" },
    { value: "product", labelEn: "Product Question",  labelFr: "Question produit" },
    { value: "refund",  labelEn: "Refund / Return",   labelFr: "Remboursement / Retour" },
    { value: "account", labelEn: "Account Issue",     labelFr: "Probl\u00e8me de compte" },
    { value: "general", labelEn: "General Inquiry",   labelFr: "Question g\u00e9n\u00e9rale" },
  ];

  if (authLoading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 lg:pt-8 lg:pb-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={isFr ? "Support" : "Support"} onOpen={() => setMenuOpen(true)} />

              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-6 h-6 lg:w-7 lg:h-7 text-[#CA3F2E]" />
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{isFr ? "Tickets de support" : "Support Tickets"}</h1>
                </div>
                {!showForm && (
                  <button onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition">
                    <Plus className="w-4 h-4" /> {isFr ? "Nouveau ticket" : "New Ticket"}
                  </button>
                )}
              </div>

              {showForm && (
                <div className="bg-white border-2 border-[#CA3F2E]/20 rounded-2xl p-6 mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">{isFr ? "Cr\u00e9er un ticket" : "Create a ticket"}</h2>
                    <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-1.5 block">{isFr ? "Cat\u00e9gorie" : "Category"}</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]">
                      {categories.map(c => <option key={c.value} value={c.value}>{isFr ? c.labelFr : c.labelEn}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-1.5 block">{isFr ? "Sujet" : "Subject"}</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                      placeholder={isFr ? "R\u00e9sum\u00e9 court de votre probl\u00e8me" : "Short summary of your issue"}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-1.5 block">Message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
                      placeholder={isFr ? "D\u00e9crivez votre probl\u00e8me en d\u00e9tail..." : "Describe your issue in detail..."}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] resize-none" />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                  <button onClick={submit} disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isFr ? "Envoyer" : "Submit"}
                  </button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#CA3F2E]" /></div>
              ) : tickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <LifeBuoy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{isFr ? "Aucun ticket" : "No tickets yet"}</h2>
                  <p className="text-sm text-gray-500">{isFr ? "Cr\u00e9ez un ticket pour toute question ou probl\u00e8me" : "Create a ticket if you need help"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map(t => (
                    <Link key={t.id} href={`/${locale}/account/tickets/${t.id}`}
                      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#CA3F2E] hover:shadow-sm transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {t.unreadByCustomer && <span className="w-2 h-2 rounded-full bg-[#CA3F2E]" />}
                            <span className="font-bold text-sm text-gray-900 truncate">{t.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <span>#{t.id.slice(0, 8)}</span>
                            <span>{new Date(t.lastMessageAt).toLocaleDateString(isFr ? "fr-FR" : "en-US")}</span>
                          </div>
                        </div>
                        <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border " + (STATUS_STYLES[t.status] || STATUS_STYLES.open)}>
                          {statusLabel(t.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}