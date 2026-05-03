"use client";

import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "Occupational Health And Safety Principles And Legislation",
  },
  {
    number: "2",
    title: "Development And Implementation Of OHS Policies",
  },
  {
    number: "3",
    title: "Risk Assessment And Hazard Control",
  },
  {
    number: "4",
    title: "Personal Protective Equipment (PPE) Selection And Use",
  },
  {
    number: "5",
    title: "Housekeeping, Ergonomics And Accident Prevention",
  },
  {
    number: "6",
    title: "Accident And Incident Investigation Processes",
  },
];

export default function DayFivePage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* NAVBAR */}
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

      {/* PAGE */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden px-6 py-6 md:px-8 md:py-10 lg:px-14">

            {/* BACKGROUND */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* HEADER */}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-black uppercase text-blue-900">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                {/* DAY + LOGO */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl md:text-4xl text-blue-900">▣</div>

                    <h2 className="text-3xl md:text-4xl font-black text-blue-900">
                      Day 5
                    </h2>
                  </div>

                  <img
                    src="/logo_2.png"
                    alt="BYWC secondary logo"
                    className="h-10 md:h-20 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* MOBILE IMAGE (FLUSH) */}
            <img
              src="/courses/C5.png"
              alt="Occupational health and safety participant"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            {/* CONTENT */}
            <div className="relative z-10 -mt-2 max-w-[720px] bg-[#e6e6e6] pb-8">
              <div className="bg-blue-900 px-6 md:px-8 py-4">
                <h3 className="text-lg font-black uppercase text-white">
                  Occupational Health & Safety Systems
                </h3>
              </div>

              <div className="px-6 md:px-8 py-6">
                <p className="text-base md:text-lg text-black">
                  The final safety-focused masterclass provides a comprehensive
                  understanding of workplace health and safety management
                  systems.
                </p>

                <p className="mt-4 text-base md:text-lg text-black">
                  Focus areas include:
                </p>

                <div className="mt-6 space-y-3">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="grid grid-cols-[50px_1px_60px_1fr] md:grid-cols-[70px_1px_78px_1fr] items-center bg-blue-900 px-4 md:px-5 py-3 text-white"
                    >
                      <div className="text-3xl md:text-5xl font-black">
                        {item.number}
                      </div>

                      <div className="h-10 md:h-14 w-[3px] bg-orange-500" />

                      <div className="flex justify-center">
                        <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border-4 border-orange-500">
                          <img
                            src="/10-Day Curriculum/day_5.png"
                            alt=""
                            className="h-6 w-6 md:h-9 md:w-9 object-contain brightness-0 invert"
                          />
                        </div>
                      </div>

                      <p className="pl-3 md:pl-5 text-sm md:text-base leading-tight">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP IMAGE */}
            <img
              src="/courses/C5.png"
              alt="Occupational health and safety participant"
              className="hidden md:block absolute bottom-0 left-[-170px] z-20 max-h-[600px] w-auto object-contain lg:left-[-210px] lg:max-h-[680px]"
            />

            <div className="absolute bottom-0 right-0 h-24 w-64 bg-orange-500/10" />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-between gap-4">
          <Link href="/program" className="border px-6 py-3 rounded-full">
            ← Back to Programme
          </Link>

          <div className="flex gap-3 flex-wrap">
            <Link href="/program/day-4" className="border px-6 py-3 rounded-full">
              ← Previous Day
            </Link>

            <Link href="/program/day-6" className="border px-6 py-3 rounded-full">
              Next Day →
            </Link>

            <Link href="/apply" className="bg-orange-500 text-white px-6 py-3 rounded-full">
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}