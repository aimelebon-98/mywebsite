"use client";

import { useState, useEffect } from "react";
import type { Author } from "@/db/schema";
import { Plus, Edit2, Trash2, Check, X, User, Mail, Instagram, Linkedin, Globe } from "lucide-react";

interface Props {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function AuthorsManager({ onNotify }: Props) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Author | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/authors?active=false");
      if (res.ok) setAuthors(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAuthors(); }, []);

  const handleSave = async (data: Partial<Author>) => {
    try {
      const url = editing ? `/api/authors/${editing.id}` : "/api/authors";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        onNotify(editing ? "Author updated" : "Author created", "success");
        setShowForm(false);
        setEditing(null);
        fetchAuthors();
      } else {
        onNotify("Failed to save author", "error");
      }
    } catch {
      onNotify("Failed to save author", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete author "${name}"? Posts by this author will remain but show no author.`)) return;
    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (res.ok) {
        onNotify("Author deleted", "success");
        fetchAuthors();
      }
    } catch {
      onNotify("Failed to delete", "error");
    }
  };

  const toggleActive = async (author: Author) => {
    try {
      await fetch(`/api/authors/${author.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !author.active }),
      });
      fetchAuthors();
    } catch { /* ignore */ }
  };

  if (showForm) {
    return (
      <AuthorForm
        author={editing || undefined}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Authors</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage blog contributors and their profiles.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Author
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : authors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No authors yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {authors.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <img
                src={a.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=111827&color=fff`}
                alt={a.name}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{a.name}</h3>
                  {a.role && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{a.role}</span>}
                  {!a.active && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">Inactive</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                  {a.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {a.email}</span>}
                  <span className="text-gray-400">/{a.slug}</span>
                </div>
                {a.bio && <p className="text-xs text-gray-600 mt-1 line-clamp-1">{a.bio}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(a)}
                  title={a.active ? "Deactivate" : "Activate"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${a.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                >
                  {a.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditing(a); setShowForm(true); }}
                  title="Edit"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id, a.name)}
                  title="Delete"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthorForm({
  author,
  onSave,
  onCancel,
}: {
  author?: Author;
  onSave: (data: Partial<Author>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(author?.name || "");
  const [slug, setSlug] = useState(author?.slug || "");
  const [avatar, setAvatar] = useState(author?.avatar || "");
  const [email, setEmail] = useState(author?.email || "");
  const [role, setRole] = useState(author?.role || "");
  const [roleFr, setRoleFr] = useState(author?.roleFr || "");
  const [bio, setBio] = useState(author?.bio || "");
  const [bioFr, setBioFr] = useState(author?.bioFr || "");
  const [twitter, setTwitter] = useState(author?.twitter || "");
  const [instagram, setInstagram] = useState(author?.instagram || "");
  const [linkedin, setLinkedin] = useState(author?.linkedin || "");
  const [website, setWebsite] = useState(author?.website || "");
  const [active, setActive] = useState(author?.active !== false);
  const [sortOrder, setSortOrder] = useState(String(author?.sortOrder ?? 100));

  const previewAvatar = avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=fff&bold=true&size=200` : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      slug: slug || undefined,
      avatar,
      email,
      role,
      roleFr: roleFr || null,
      bio,
      bioFr: bioFr || null,
      twitter,
      instagram,
      linkedin,
      website,
      active,
      sortOrder: parseInt(sortOrder) || 100,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{author ? "Edit Author" : "New Author"}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Save</button>
        </div>
      </div>

      {/* Basic */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Basic Information</h3>
        <div className="flex items-start gap-5">
          {previewAvatar && (
            <img src={previewAvatar} alt="Preview" className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-gray-100" />
          )}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Smith" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug <span className="text-xs text-gray-500 font-normal">(leave empty to auto-generate)</span></label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="john-smith" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Avatar URL</label>
            <input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://... (leave empty for auto)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@solevault.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role (English)</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Editor" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role (French)</label>
            <input type="text" value={roleFr} onChange={(e) => setRoleFr(e.target.value)} placeholder="Redacteur en chef" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Bio (English)</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Short biography..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Bio (French)</label>
          <textarea value={bioFr} onChange={(e) => setBioFr(e.target.value)} rows={3} placeholder="Biographie en francais..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
        </div>
      </div>

      {/* Socials */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-lg">Social Links</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-2"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter / X</label>
            <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/@handle" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-2"><Instagram className="w-3.5 h-3.5" /> Instagram</label>
            <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/handle" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</label>
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/handle" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-site.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-lg">Settings</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Sort Order <span className="text-xs text-gray-500 font-normal">(lower = first)</span></label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-5 h-5 rounded" />
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-gray-500">Show in author dropdowns</div>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
}
