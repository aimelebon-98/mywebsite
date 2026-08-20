"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, Search, RefreshCw, Loader2, Send, User, Mail, Phone, ArrowLeft, ChevronDown } from "lucide-react";

interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  lastMessageAt: string;
  unreadByAdmin: boolean;
  createdAt: string;
  customerName: string;
  customerEmail: string;
}

interface Message { id: string; senderType: string; senderName: string; message: string; createdAt: string; }

interface TicketDetail {
  ticket: Ticket & { customerPhone?: string };
  messages: Message[];
}

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed:      "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  low:    "bg-gray-100 text-gray-600",
  normal: "bg-blue-50 text-blue-700",
  high:   "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

export default function TicketsManager() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets");
      const d = await res.json();
      setTickets(d.tickets || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch("/api/admin/tickets/" + id);
      if (res.ok) setDetail(await res.json());
    } catch { /* ignore */ }
    setDetailLoading(false);
    // Optimistic: mark as read locally
    setTickets(prev => prev.map(t => t.id === id ? { ...t, unreadByAdmin: false } : t));
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      await fetch("/api/admin/tickets/" + selectedId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      setReply("");
      await openDetail(selectedId);
    } catch { /* ignore */ }
    setSending(false);
  };

  const changeStatus = async (status: string) => {
    if (!selectedId) return;
    await fetch("/api/admin/tickets/" + selectedId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setDetail(d => d ? { ...d, ticket: { ...d.ticket, status } } : d);
    setTickets(prev => prev.map(t => t.id === selectedId ? { ...t, status } : t));
  };

  const changePriority = async (priority: string) => {
    if (!selectedId) return;
    await fetch("/api/admin/tickets/" + selectedId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    setDetail(d => d ? { ...d, ticket: { ...d.ticket, priority } } : d);
    setTickets(prev => prev.map(t => t.id === selectedId ? { ...t, priority } : t));
  };

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.subject.toLowerCase().includes(s) &&
          !(t.customerName || "").toLowerCase().includes(s) &&
          !(t.customerEmail || "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const unreadCount = tickets.filter(t => t.unreadByAdmin).length;
  const openCount = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;

  // Detail view
  if (selectedId && detail) {
    const t = detail.ticket;
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedId(null); setDetail(null); }}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to tickets
        </button>

        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="text-lg font-black text-gray-900">{t.subject}</h2>
                <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border " + (STATUS_STYLES[t.status] || STATUS_STYLES.open)}>
                  {t.status.replace("_", " ")}
                </span>
              </div>
              <div className="text-xs text-gray-500">#{t.id.slice(0, 8)} { }{new Date(t.createdAt).toLocaleString()}</div>
            </div>

            <div className="space-y-3">
              {detail.messages.map(m => (
                <div key={m.id} className={"flex " + (m.senderType === "admin" ? "justify-end" : "justify-start")}>
                  <div className={"max-w-[85%] rounded-2xl p-4 " + (m.senderType === "admin" ? "bg-[#CA3F2E] text-white" : "bg-white border border-gray-200")}>
                    <div className={"text-[10px] font-bold uppercase mb-1 " + (m.senderType === "admin" ? "text-white/70" : "text-gray-500")}>
                      {m.senderType === "admin" ? "You (Support)" : m.senderName}
                    </div>
                    <div className={"text-sm whitespace-pre-wrap " + (m.senderType === "admin" ? "text-white" : "text-gray-800")}>{m.message}</div>
                    <div className={"text-[10px] mt-2 " + (m.senderType === "admin" ? "text-white/60" : "text-gray-400")}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {t.status !== "closed" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4}
                  placeholder="Type your reply to the customer..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] resize-none" />
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition disabled:opacity-50">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send reply & email customer
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Customer</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-gray-400" /> <span className="font-bold">{t.customerName}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> <span className="text-xs">{t.customerEmail}</span></div>
                {t.customerPhone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> <span className="text-xs">{t.customerPhone}</span></div>}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Status</h3>
              <div className="relative">
                <select value={t.status} onChange={(e) => changeStatus(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Priority</h3>
              <div className="relative">
                <select value={t.priority} onChange={(e) => changePriority(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Category</h3>
              <span className="text-sm capitalize">{t.category}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{tickets.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total tickets</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{openCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-red-600">{unreadCount}</p>
          <p className="text-xs text-gray-500 mt-1">Unread</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, customer name, or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]">
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <button onClick={load} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <RefreshCw className={"w-4 h-4 text-gray-600" + (loading ? " animate-spin" : "")} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{tickets.length === 0 ? "No tickets yet" : "No tickets match your filters"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <button key={t.id} onClick={() => openDetail(t.id)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-[#CA3F2E] hover:shadow-sm transition text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {t.unreadByAdmin && <span className="w-2 h-2 rounded-full bg-[#CA3F2E]" />}
                    <span className="font-bold text-sm text-gray-900 truncate">{t.subject}</span>
                    <span className={"text-[10px] px-1.5 py-0.5 rounded font-bold " + (PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.normal)}>{t.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span className="font-bold text-gray-700">{t.customerName || "Unknown"}</span>
                    <span>{t.customerEmail}</span>
                    <span>{new Date(t.lastMessageAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 " + (STATUS_STYLES[t.status] || STATUS_STYLES.open)}>
                  {t.status.replace("_", " ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}