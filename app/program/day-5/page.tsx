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
              className="h-16 object-contain md:h-20"
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
                <h1 className="text-3xl font-black uppercase text-blue-900 md:text-5xl">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                {/* DAY + LOGO */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl text-blue-900 md:text-4xl">▣</div>

                    <h2 className="text-3xl font-black text-blue-900 md:text-4xl">
                      Day 5
                    </h2>
                  </div>

                  <img
                    src="/logo_2.png"
                    alt="BYWC secondary logo"
                    className="h-10 object-contain md:h-20"
                  />
                </div>
              </div>
            </div>

            {/* MOBILE IMAGE */}
            <img
              src="/courses/C5.webp"
              alt="Occupational health and safety participant"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            {/* CONTENT */}
            <div className="relative z-10 -mt-2 max-w-[720px] bg-[#e6e6e6] pb-8">
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black uppercase text-white">
                  Occupational Health & Safety Systems
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="text-base text-black md:text-lg">
                  The final safety-focused masterclass provides a comprehensive
                  understanding of workplace health and safety management
                  systems.
                </p>

                <p className="mt-4 text-base text-black md:text-lg">
                  Focus areas include:
                </p>

                <div className="mt-6 grid gap-4 md:gap-3">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="flex min-h-[170px] flex-col items-center justify-center bg-blue-900 px-5 py-6 text-center text-white md:min-h-[110px] md:grid md:grid-cols-[52px_8px_76px_1fr] md:items-center md:gap-x-4 md:px-6 md:py-5 md:text-left"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500 md:hidden">
                        <img
                          src="/10-Day Curriculum/day_5.png"
                          alt=""
                          className="h-8 w-8 object-contain brightness-0 invert"
                        />
                      </div>

                      <div className="mt-4 text-4xl font-black leading-none md:col-start-1 md:row-start-1 md:mt-0 md:text-5xl">
                        {item.number}
                      </div>

                      <div className="mt-4 h-[5px] w-16 bg-orange-500 md:col-start-2 md:row-start-1 md:mt-0 md:h-14 md:w-[5px]" />

                      <div className="hidden md:col-start-3 md:row-start-1 md:flex md:h-[68px] md:w-[68px] md:items-center md:justify-center md:rounded-full md:border-[5px] md:border-orange-500">
                        <img
                          src="/10-Day Curriculum/day_5.png"
                          alt=""
                          className="h-9 w-9 object-contain brightness-0 invert"
                        />
                      </div>

                      <p className="mt-3 text-[15px] font-semibold leading-[1.35] md:col-start-4 md:row-start-1 md:mt-0 md:text-[19px] md:font-bold md:leading-[1.25]">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP IMAGE */}
            <img
              src="/courses/C5.webp"
              alt="Occupational health and safety participant"
              className="absolute bottom-0 left-[-170px] z-20 hidden max-h-[600px] w-auto object-contain md:block lg:left-[-210px] lg:max-h-[680px]"
            />

            <div className="absolute bottom-0 right-0 h-24 w-64 bg-orange-500/10" />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-between gap-4">
          <Link href="/program" className="rounded-full border px-6 py-3">
            ← Back to Programme
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link href="/program/day-4" className="rounded-full border px-6 py-3">
              ← Previous Day
            </Link>

            <Link href="/program/day-6" className="rounded-full border px-6 py-3">
              Next Day →
            </Link>

            <Link
              href="/apply"
              className="rounded-full bg-orange-500 px-6 py-3 text-white"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}