"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

type AdminMessage = {
  id: string;
  applicantEmail: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export default function InboxPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [activeMessage, setActiveMessage] = useState<AdminMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInboxMessages() {
      setLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Failed to load inbox messages:", error);
        setLoading(false);
        return;
      }

      if (!data || !data.admin_message) {
        setMessages([]);
        setActiveMessage(null);
        setLoading(false);
        return;
      }

      const inboxMessage: AdminMessage = {
        id: data.id,
        applicantEmail: data.email,
        title: "Message from Admin",
        message: data.admin_message,
        createdAt: data.submitted_at || new Date().toISOString(),
        read: false,
      };

      setMessages([inboxMessage]);
      setActiveMessage(inboxMessage);
      setLoading(false);
    }

    loadInboxMessages();
  }, []);

  function markAsRead() {
    if (!activeMessage) return;

    const updatedMessage = { ...activeMessage, read: true };

    setMessages((prev) =>
      prev.map((msg) => (msg.id === activeMessage.id ? updatedMessage : msg))
    );

    setActiveMessage(updatedMessage);
  }

  const unreadMessages = messages.filter((msg) => !msg.read).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f7] text-slate-900">
        <p className="text-sm font-semibold text-slate-600">
          Loading inbox...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef1f7] px-6 py-8 text-slate-900 lg:px-10">
      <section className="mx-auto grid max-w-7xl overflow-hidden rounded-[36px] border border-white/70 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[90px_1fr]">
        <aside className="flex flex-col items-center justify-between rounded-[30px] bg-blue-950 px-4 py-6 text-white">
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/home"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-950"
            >
              B
            </Link>

            <nav className="flex flex-col items-center gap-4">
              {[
                ["Home", "/home", "⌂", false],
                ["Dashboard", "/dashboard", "▦", false],
                ["Profile", "/dashboard#profile", "◉", false],
                ["Messages", "/inbox", "✉", true],
                ["Tracker", "/tracker", "✓", false],
                ["Apply", "/apply", "+", false],
              ].map(([label, href, icon, active]) => (
                <Link
                  key={String(label)}
                  href={String(href)}
                  title={String(label)}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-lg transition ${
                    active
                      ? "bg-orange-500 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  {icon}

                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            href="/login"
            title="Log Out"
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg text-blue-100 transition hover:bg-white/10"
          >
            ↩
          </Link>
        </aside>

        <section className="rounded-[30px] bg-[#f8fafc] p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
                Communication Center
              </p>

              <h1 className="mt-3 text-4xl font-bold text-blue-950 lg:text-5xl">
                Messages
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Messages received from programme administration will appear
                here.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-blue-950 px-5 py-3 text-sm font-bold text-blue-950 hover:bg-blue-50"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-[30px] bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">Inbox</p>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                  {unreadMessages} New
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isActive = activeMessage?.id === message.id;

                    return (
                      <button
                        key={message.id}
                        type="button"
                        onClick={() => setActiveMessage(message)}
                        className={`block w-full rounded-2xl p-4 text-left transition ${
                          isActive
                            ? "bg-blue-950 text-white"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-sm font-bold">
                            {message.title}
                          </h2>

                          {!message.read && (
                            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                          )}
                        </div>

                        <p
                          className={`mt-2 line-clamp-2 text-xs leading-5 ${
                            isActive ? "text-blue-100" : "text-slate-500"
                          }`}
                        >
                          {message.message}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                    No admin messages yet.
                  </div>
                )}
              </div>
            </aside>

            <section className="rounded-[30px] bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
              {activeMessage ? (
                <>
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
                        Message Received
                      </p>

                      <h2 className="mt-3 text-3xl font-bold text-blue-950">
                        {activeMessage.title}
                      </h2>
                    </div>

                    <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700">
                      Programme Administration
                    </span>
                  </div>

                  <div className="max-w-3xl py-8 text-sm leading-8 text-slate-700">
                    <p>Dear Applicant,</p>

                    <p className="mt-5 whitespace-pre-line">
                      {activeMessage.message}
                    </p>

                    <p className="mt-5">
                      Regards,
                      <br />
                      BYWC Programme Administration
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                    <button
                      type="button"
                      onClick={markAsRead}
                      className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
                    >
                      Mark as Read
                    </button>

                    <Link
                      href="/tracker"
                      className="rounded-full border border-blue-950 px-6 py-3 text-sm font-bold text-blue-950 hover:bg-blue-50"
                    >
                      View Tracker
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[380px] items-center justify-center rounded-[24px] bg-slate-50 p-8 text-center">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950">
                      No message selected
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Messages from programme administration will appear here.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}