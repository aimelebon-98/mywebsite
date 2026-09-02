"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, LifeBuoy } from "lucide-react";

interface Ticket { id: string; subject: string; category: string; status: string; priority: string; createdAt: string; lastMessageAt: string; }
interface Message { id: string; senderType: string; senderName: string; message: string; createdAt: string; }

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved:    "bg-emerald-50 text-emerald-700",
  closed:      "bg-gray-100 text-gray-600",
};

export default function TicketDetailPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const { customer, loading: authLoading } = useCustomer();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !customer) router.push(`/${locale}/account/login`);
  }, [authLoading, customer, locale, router]);

  const load = async () => {
    try {
      const res = await fetch("/api/customer/tickets/" + ticketId);
      if (res.ok) {
        const d = await res.json();
        setTicket(d.ticket);
        setMessages(d.messages || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (customer) load(); }, [customer, ticketId]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await fetch("/api/customer/tickets/" + ticketId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      setReply("");
      await load();
    } catch { /* ignore */ }
    setSending(false);
  };

  const statusLabel = (st: string) => {
    if (isFr) return { open: "Ouvert", in_progress: "En cours", resolved: "R\u00e9solu", closed: "Ferm\u00e9" }[st] || st;
    return { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" }[st] || st;
  };

  if (authLoading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={isFr ? "Ticket" : "Ticket"} onOpen={() => setMenuOpen(true)} />

              <Link href={`/${locale}/account/tickets`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour aux tickets" : "Back to tickets"}
              </Link>

              {loading ? (
                <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#CA3F2E]" /></div>
              ) : !ticket ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{isFr ? "Ticket introuvable" : "Ticket not found"}</p>
                </div>
              ) : (
                <>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h1 className="text-xl lg:text-2xl font-black text-gray-900">{ticket.subject}</h1>
                        <div className="text-xs text-gray-500 mt-1">
                          #{ticket.id.slice(0, 8)} { }{new Date(ticket.createdAt).toLocaleDateString(isFr ? "fr-FR" : "en-US")}
                        </div>
                      </div>
                      <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-bold " + (STATUS_STYLES[ticket.status] || STATUS_STYLES.open)}>
                        {statusLabel(ticket.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 max-h-[min(55vh,520px)] overflow-y-auto pr-1 scroll-smooth">
                    {messages.map(m => (
                      <div key={m.id} className={"flex " + (m.senderType === "customer" ? "justify-end" : "justify-start")}>
                        <div className={"max-w-[85%] rounded-2xl p-4 " + (m.senderType === "customer" ? "bg-[#CA3F2E] text-white" : "bg-white border border-gray-200")}>
                          <div className={"text-[10px] font-bold uppercase mb-1 " + (m.senderType === "customer" ? "text-white/70" : "text-gray-500")}>
                            {m.senderType === "customer" ? m.senderName : (isFr ? "\u00c9quipe support" : "Support Team")}
                          </div>
                          <div className={"text-sm whitespace-pre-wrap " + (m.senderType === "customer" ? "text-white" : "text-gray-800")}>{m.message}</div>
                          <div className={"text-[10px] mt-2 " + (m.senderType === "customer" ? "text-white/60" : "text-gray-400")}>
                            {new Date(m.createdAt).toLocaleString(isFr ? "fr-FR" : "en-US")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== "closed" && (
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 space-y-3 sticky bottom-4 z-20 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
                      <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
                        placeholder={isFr ? "Votre r\u00e9ponse..." : "Your reply..."}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] resize-none" />
                      <button onClick={sendReply} disabled={sending || !reply.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition disabled:opacity-50">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isFr ? "Envoyer" : "Send"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}