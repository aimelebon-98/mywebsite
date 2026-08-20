"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, Trash2, Clock, Check, MessageSquare, ShieldCheck } from "lucide-react";

type AdminReview = {
  id: string;
  productId: string;
  productName: string | null;
  customerName: string;
  rating: number;
  comment: string;
  commentFr: string | null;
  avatar: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
};

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error("Failed to fetch admin reviews", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleToggleApprove = async (id: string, currentApproved: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentApproved }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error("Failed to update approval status", e);
    } finally {
      setActionId(null);
    }
  };

  const handleToggleVerified = async (id: string, currentVerified: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !currentVerified }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error("Failed to update verified status", e);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error("Failed to delete review", e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#CA3F2E]" />
            Product Reviews Moderation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Approve or reject customer product reviews and toggle Verified Buyer badges.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              filter === "pending"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              filter === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              filter === "all"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Reviews
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading product reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">No reviews found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filter === "pending" ? "All submitted reviews have been moderated!" : "No reviews match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 rounded-2xl border transition bg-white ${
                rev.approved ? "border-gray-200" : "border-amber-200 bg-amber-50/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white font-bold text-sm rounded-full flex items-center justify-center flex-shrink-0">
                    {rev.avatar || "ND"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{rev.customerName}</span>
                      {rev.verified ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          Unverified
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      Product: <span className="text-gray-900 font-bold">{rev.productName || rev.productId}</span>
                    </p>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Comment Body */}
                    <p className="text-sm text-gray-800 mt-3 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      rev.approved
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {rev.approved ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {rev.approved ? "Approved" : "Pending Review"}
                  </span>

                  <div className="flex items-center gap-2 mt-2 flex-wrap sm:justify-end">
                    {/* Toggle Verified Badge Button */}
                    <button
                      onClick={() => handleToggleVerified(rev.id, rev.verified)}
                      disabled={actionId === rev.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        rev.verified
                          ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                          : "border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                      }`}
                      title="Toggle Verified Purchase badge"
                    >
                      {rev.verified ? "✓ Verified" : "+ Mark Verified"}
                    </button>

                    {/* Toggle Approval Button */}
                    <button
                      onClick={() => handleToggleApprove(rev.id, rev.approved)}
                      disabled={actionId === rev.id}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        rev.approved
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                      }`}
                    >
                      {rev.approved ? "Unapprove" : "Approve & Publish"}
                    </button>

                    <button
                      onClick={() => handleDelete(rev.id)}
                      disabled={actionId === rev.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}