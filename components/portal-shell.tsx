"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type PortalShellProps = {
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
  actions?: ReactNode;
  role?: "applicant" | "admin";
};

export default function PortalShell({
  title,
  subtitle,
  badge,
  children,
  actions,
  role = "applicant",
}: PortalShellProps) {
  const pathname = usePathname();

  const navigationItems =
    role === "admin"
      ? [
          { label: "Admin Dashboard", href: "/admin" },
          { label: "Program", href: "/program" },
          { label: "Home", href: "/" },
        ]
      : [
          { label: "Applicant Dashboard", href: "/dashboard" },
          { label: "Apply", href: "/apply" },
          { label: "Program", href: "/program" },
          { label: "Home", href: "/" },
        ];

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[300px] shrink-0 border-r border-slate-200 bg-white xl:flex xl:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              Navigation
            </p>

            <nav className="mt-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-950"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-[28px] bg-blue-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                {role === "admin" ? "Admin Console" : "BYWC Platform"}
              </p>
              <h3 className="mt-3 text-lg font-bold">
                {role === "admin"
                  ? "Review and intake management"
                  : "National training and application system"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-blue-100">
                {role === "admin"
                  ? "Review applications, monitor quotas, and manage shortlist decisions from one place."
                  : "Track your application, review documents, and stay updated throughout the process."}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back Home
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-5 lg:px-10">
              <div className="flex items-center justify-between gap-4 xl:hidden">
                <img
                  src="/bywc-logo.png.png"
                  alt="BYWC Logo"
                  className="h-16 w-auto object-contain"
                />

                <Link
                  href="/"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Home
                </Link>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                    {badge}
                  </span>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-blue-950 lg:text-4xl">
                    {title}
                  </h1>

                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg">
                    {subtitle}
                  </p>
                </div>

                {actions ? (
                  <div className="flex flex-wrap gap-3">{actions}</div>
                ) : null}
              </div>

              <div className="flex gap-3 overflow-x-auto xl:hidden">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-blue-950 text-white"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <section className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-8 lg:px-10">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}