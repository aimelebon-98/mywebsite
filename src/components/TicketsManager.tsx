"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, Search, RefreshCw, Loader2, Send, User, Mail, Phone, ArrowLeft, ChevronDown, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

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
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const d = await res.json();
      setTickets(d.tickets || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    // Optimistic: mark as read locally
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, unreadByAdmin: false } : t)));

    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setDetailError(errData.error || `Server Error (${res.status})`);
      }
    } catch (e: any) {
      setDetailError(e?.message || "Error connecting to server");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      if (res.ok) {
        setReply("");
        await openDetail(selectedId);
      } else {
        alert("Failed to send reply");
      }
    } catch {
      alert("Error sending reply");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status: string) => {
    if (!selectedId) return;
    try {
      await fetch(`/api/admin/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setDetail((d) => (d ? { ...d, ticket: { ...d.ticket, status } } : d));
      setTickets((prev) => prev.map((t) => (t.id === selectedId ? { ...t, status } : t)));
    } catch {
      alert("Failed to update status");
    }
  };

  const changePriority = async (priority: string) => {
    if (!selectedId) return;
    try {
      await fetch(`/api/admin/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      setDetail((d) => (d ? { ...d, ticket: { ...d.ticket, priority } } : d));
      setTickets((prev) => prev.map((t) => (t.id === selectedId ? { ...t, priority } : t)));
    } catch {
      alert("Failed to update priority");
    }
  };

  const deleteTicket = async () => {
    if (!selectedId || !confirm("Are you sure you want to permanently delete this support ticket?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedId}`, { method: "DELETE" });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== selectedId));
        closeDetail();
      } else {
        alert("Failed to delete ticket");
      }
    } catch {
      alert("Error deleting ticket");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !t.subject.toLowerCase().includes(s) &&
        !(t.customerName || "").toLowerCase().includes(s) &&
        !(t.customerEmail || "").toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const unreadCount = tickets.filter((t) => t.unreadByAdmin).length;
  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  // Render detail view if a ticket is clicked
  if (selectedId) {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          <button
            onClick={closeDetail}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to tickets
          </button>
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#CA3F2E] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-600">Loading ticket conversation...</p>
          </div>
        </div>
      );
    }

    if (detailError || !detail) {
      return (
        <div className="space-y-4">
          <button
            onClick={closeDetail}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to tickets
          </button>
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-base font-bold text-gray-900">{detailError || "Could not load ticket details"}</p>
            <button
              onClick={() => openDetail(selectedId)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    const t = detail.ticket;
    const messagesList = detail.messages || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={closeDetail}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to tickets
          </button>

          <button
            onClick={deleteTicket}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Ticket
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg font-black text-gray-900">{t.subject}</h2>
                <span
                  className={
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border " +
                    (STATUS_STYLES[t.status] || STATUS_STYLES.open)
                  }
                >
                  {t.status ? t.status.replace("_", " ") : "open"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>#{t.id ? t.id.slice(0, 8) : ""}</span>
                <span>•</span>
                <span>Created {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</span>
              </div>
            </div>

            <div className="space-y-3">
              {messagesList.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
                  No messages found in this ticket.
                </div>
              ) : (
                messagesList.map((m) => (
                  <div key={m.id} className={"flex " + (m.senderType === "admin" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[88%] rounded-2xl p-4 shadow-xs " +
                        (m.senderType === "admin"
                          ? "bg-[#CA3F2E] text-white"
                          : "bg-white border border-gray-200 text-gray-900")
                      }
                    >
                      <div
                        className={
                          "text-[10px] font-bold uppercase mb-1 flex items-center gap-1 " +
                          (m.senderType === "admin" ? "text-white/80" : "text-gray-500")
                        }
                      >
                        {m.senderType === "admin" ? "Support Admin" : m.senderName || t.customerName || "Customer"}
                      </div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.message}</div>
                      <div
                        className={
                          "text-[10px] mt-2 text-right " +
                          (m.senderType === "admin" ? "text-white/70" : "text-gray-400")
                        }
                      >
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {t.status !== "closed" ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Type your response to the customer..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Customer will see this reply in their account dashboard.</p>
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center text-xs font-semibold text-gray-500">
                This ticket is closed. Re-open status to send new messages.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Customer Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-bold text-gray-900 truncate">{t.customerName || "Customer"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${t.customerEmail}`} className="text-xs text-blue-600 hover:underline truncate">
                    {t.customerEmail || "No email"}
                  </a>
                </div>
                {t.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-700">{t.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Ticket Status</h3>
              <div className="relative">
                <select
                  value={t.status || "open"}
                  onChange={(e) => changeStatus(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] font-medium"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Priority Level</h3>
              <div className="relative">
                <select
                  value={t.priority || "normal"}
                  onChange={(e) => changePriority(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] font-medium"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Category</h3>
              <span className="text-sm font-semibold capitalize text-gray-800">{t.category || "General"}</span>
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, customer name, or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
        >
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={load}
          title="Refresh tickets"
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw className={"w-4 h-4 text-gray-600" + (loading ? " animate-spin" : "")} />
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#CA3F2E]" />
          <p className="text-sm">Loading tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{tickets.length === 0 ? "No tickets yet" : "No tickets match your filters"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => openDetail(t.id)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-[#CA3F2E] hover:shadow-sm transition text-left block cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {t.unreadByAdmin && <span className="w-2.5 h-2.5 rounded-full bg-[#CA3F2E] shrink-0" />}
                    <span className="font-bold text-sm text-gray-900 truncate">{t.subject}</span>
                    <span
                      className={
                        "text-[10px] px-1.5 py-0.5 rounded font-bold " +
                        (PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.normal)
                      }
                    >
                      {t.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span className="font-bold text-gray-700">{t.customerName || "Customer"}</span>
                    <span>•</span>
                    <span className="truncate">{t.customerEmail}</span>
                    <span>•</span>
                    <span>
                      {t.lastMessageAt || t.createdAt
                        ? new Date(t.lastMessageAt || t.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
                <span
                  className={
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 " +
                    (STATUS_STYLES[t.status] || STATUS_STYLES.open)
                  }
                >
                  {t.status ? t.status.replace("_", " ") : "open"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
