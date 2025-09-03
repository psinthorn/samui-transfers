"use client"

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { CompanyInfo } from "@/data/CompanyInfo";

const ContactUs = () => {
  // Prefer values from CompanyInfo if available, otherwise fall back to sensible defaults
  const info = useMemo(() => ({
    email: CompanyInfo?.email || "info@samui-transfers.com",
    phone: CompanyInfo?.phone || "(+66) 099 108 7999",
    whatsapp: CompanyInfo?.whatsapp || "(+66) 099 108 7999",
    address: CompanyInfo?.address || "9/38 Moo 6, Tambon Bo Phut, Ko Samui, Surat Thani 84320, Thailand",
    facebook: CompanyInfo?.facebook || "https://www.facebook.com/profile.php?id=61578880422159",
  }), []);

  const telHref = useMemo(() => `tel:${info.phone.replace(/[^\d+]/g, "")}`, [info.phone]);
  const waHref = useMemo(() => `https://wa.me/${info.whatsapp.replace(/[^\d]/g, "")}`, [info.whatsapp]);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string } | null

  const onChange = (e) => setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return false;
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    return okEmail;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ type: "error", message: "Please fill all fields with a valid email." });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to send message.");
      setToast({ type: "success", message: json?.message || "Message sent. We’ll get back to you shortly." });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setToast({ type: "error", message: err?.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
      // Auto-hide toast after 6s
      setTimeout(() => setToast(null), 6000);
    }
  };

  return (
    <section className=" py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-primary">Contact</p>
          <h1 className="mt-2 text-lg sm:text-3xl md:text-4xl font-semibold text-slate-900">Get in touch</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Questions about transfers, pricing, or availability? We’re here to help.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact info card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Contact information</h2>
            <ul className="space-y-3 text-sm sm:text-base text-slate-700">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <a href={`mailto:${info.email}`} className="hover:text-primary focus:outline-none focus:underline">
                  {info.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <a href={telHref} className="hover:text-primary focus:outline-none focus:underline">
                  {info.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                <Link href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-primary focus:outline-none focus:underline">
                  WhatsApp chat <ExternalLink className="inline w-3.5 h-3.5 ml-1 align-[-2px]" />
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span>{info.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary mt-0.5" />
                <Link href={info.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary focus:outline-none focus:underline">
                  Facebook page
                </Link>
              </li>
            </ul>

            <div className="mt-6 rounded-lg bg-primary/5 p-4 text-xs sm:text-sm text-slate-700">
              Our team replies within a few hours during 08:00–20:00 (UTC+07:00).
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Send us a message</h2>

            {toast && (
              <div
                className={`mb-4 rounded-md px-4 py-2 text-sm ${
                  toast.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
                role="status"
              >
                {toast.message}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="How can we help?"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white text-sm disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send message"}
                </button>

                <p className="text-xs text-slate-500">
                  Prefer chat?{" "}
                  <Link href={waHref} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    WhatsApp
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;