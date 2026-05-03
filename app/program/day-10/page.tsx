"use client";

import Link from "next/link";

const focusAreas = [
  {
    title: "Business idea refinement",
    icon: "/d10_icon1.png",
  },
  {
    title: "Market entry pathways",
    icon: "/d10_icon2.png",
  },
  {
    title: "Licensing and Registration Processes",
    icon: "/d10_icon3.png",
  },
  {
    title: "Funding readiness & institutional support",
    icon: "/d10_icon4.png",
  },
  {
    title: "Engagement with public and private sector stakeholders",
    icon: "/d10_icon5.png",
  },
];

export default function DayTenPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/home">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-16 md:h-20 object-contain"
            />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link href="/home">Home</Link>
            <Link href="/program" className="text-blue-900">
              Program
            </Link>
            <Link href="/apply">Apply</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>

          <Link
            href="/apply"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
          >
            Apply Now
          </Link>
        </div>
      </nav>

      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">

            {/* BACKGROUND */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            <div className="relative z-10 px-6 py-6 md:px-8 md:py-10 lg:px-12">

              {/* TOP LINE */}
              <div className="mb-6 h-[3px] w-full bg-gradient-to-r from-orange-500 via-orange-500 to-blue-500" />

              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl md:text-4xl text-blue-900">▣</div>
                  <h1 className="text-3xl md:text-4xl font-black text-blue-900">
                    Day 10
                  </h1>
                </div>

                <img
                  src="/logo_2.png"
                  alt="Logo"
                  className="h-10 md:h-20 object-contain"
                />
              </div>

              {/* 🔥 IMAGE MOVED TO TOP */}
              <img
                src="/banner_8.png"
                alt="Graduates holding certificates"
                className="mt-6 w-full object-cover"
              />

              {/* CONTENT BOX */}
              <div className="mt-6 bg-[#e6e6e6]">
                <div className="bg-blue-900 px-6 md:px-8 py-4">
                  <h2 className="text-lg md:text-xl font-black text-white">
                    Entrepreneurial Activation{" "}
                    <span className="text-orange-400">
                      &amp; Business Readiness
                    </span>
                  </h2>
                </div>

                <div className="px-6 md:px-8 py-6">
                  <p className="text-base md:text-lg text-black">
                    The final masterclass focuses on converting learning into action.
                  </p>

                  <p className="mt-4 text-base md:text-lg text-black">
                    Focus areas include:
                  </p>

                  {/* GRID */}
                  <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-5">
                    {focusAreas.map((item) => (
                      <div
                        key={item.title}
                        className="flex flex-col items-center bg-blue-900 px-4 py-5 text-center text-white"
                      >
                        <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border-4 border-orange-500">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-8 w-8 md:h-12 md:w-12 object-contain brightness-0 invert"
                          />
                        </div>

                        <p className="mt-4 text-xs md:text-sm leading-5">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTTOM TEXT */}
              <div className="mt-6">
                <p className="text-base md:text-lg text-black">
                  Participants leave with a clear understanding of their next
                  steps toward enterprise development, employment or incubation pathways.
                </p>
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link href="/program" className="border px-6 py-3 rounded-full">
              ← Back to Programme
            </Link>

            <div className="flex gap-3 flex-wrap">
              <Link href="/program/day-9" className="border px-6 py-3 rounded-full">
                ← Previous Day
              </Link>

              <Link href="/apply" className="bg-orange-500 text-white px-6 py-3 rounded-full">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}