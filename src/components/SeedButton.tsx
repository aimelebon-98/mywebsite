"use client";

import { useState } from "react";
import { RefreshCw, Database, CheckCircle, AlertTriangle } from "lucide-react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const setup = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Create tables
      setStatus("Creating database tables...");
      const setupRes = await fetch("/api/setup", { method: "POST" });
      if (!setupRes.ok) {
        const data = await setupRes.json();
        throw new Error(data.error || "Failed to create tables");
      }

      // Step 2: Seed products
      setStatus("Adding 50 products & reviews...");
      const seedRes = await fetch("/api/seed", { method: "POST" });
      if (!seedRes.ok) {
        const data = await seedRes.json();
        throw new Error(data.error || "Failed to seed products");
      }

      setStatus("Done! Reloading...");
      setDone(true);
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed. Check DATABASE_URL.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold">
        <CheckCircle className="w-5 h-5" /> Store is ready!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={setup}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-60"
      >
        {loading ? (
          <><RefreshCw className="w-4 h-4 animate-spin" /> {status}</>
        ) : (
          <><Database className="w-4 h-4" /> Setup Store &amp; Add Products</>
        )}
      </button>
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Setup failed</p>
            <p className="text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
