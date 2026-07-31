"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("done");
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-gray-900 text-white pt-32 lg:pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            {t("badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{t("heroTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("heroDesc")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { Icon: MessageCircle, title: t("infoWhatsappTitle"), desc: t("infoWhatsappDesc"), sub: t("infoWhatsappSub") },
            { Icon: Mail, title: t("infoEmailTitle"), desc: t("infoEmailDesc"), sub: t("infoEmailSub") },
            { Icon: Clock, title: t("infoHoursTitle"), desc: t("infoHoursDesc"), sub: t("infoHoursSub") },
            { Icon: MapPin, title: t("infoLocationTitle"), desc: t("infoLocationDesc"), sub: t("infoLocationSub") },
          ].map(({ Icon, title, desc, sub }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
              <p className="text-sm text-gray-700 font-medium">{desc}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-14">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("formTitle")}</h2>
            <p className="text-gray-500 mb-8 text-sm">{t("formDesc")}</p>

            {status === "done" ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("successTitle")}</h3>
                <p className="text-gray-500 text-sm max-w-sm">{t("successDesc")}</p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                >
                  {t("sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("fieldName")}</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder={t("placeholderName")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("fieldEmail")}</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder={t("placeholderEmail")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("fieldSubject")}</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
                  >
                    <option value="">{t("subjectPlaceholder")}</option>
                    <option value="order">{t("subjectOrder")}</option>
                    <option value="return">{t("subjectReturn")}</option>
                    <option value="product">{t("subjectProduct")}</option>
                    <option value="shipping">{t("subjectShipping")}</option>
                    <option value="other">{t("subjectOther")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("fieldMessage")}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={t("placeholderMessage")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-60"
                >
                  {status === "loading" ? t("sending") : <><Send className="w-4 h-4" />{t("sendMessage")}</>}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-3xl p-8">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-5">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("whatsappTitle")}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{t("whatsappDesc")}</p>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition"
              >
                <MessageCircle className="w-4 h-4" />
                {t("whatsappBtn")}
              </a>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t("faqTitle")}</h3>
              <p className="text-gray-500 text-sm mb-5">{t("faqDesc")}</p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition"
              >
                {t("faqBtn")}
              </Link>
            </div>

            <div className="bg-gray-900 text-white rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-4">{t("hoursTitle")}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span className="text-gray-400">{t("hoursMon")}</span><span>9:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between"><span className="text-gray-400">{t("hoursSat")}</span><span>10:00 AM - 4:00 PM</span></li>
                <li className="flex justify-between"><span className="text-gray-400">{t("hoursSun")}</span><span className="text-gray-400">{t("hoursClosed")}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}