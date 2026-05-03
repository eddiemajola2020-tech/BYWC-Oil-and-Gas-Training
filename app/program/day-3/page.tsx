"use client";

import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "Fire Chemistry And Causes Of Fire",
    icon: "/d3_icon1.png",
  },
  {
    number: "2",
    title: "Fire Prevention And Protection Systems",
    icon: "/d3_icon2.png",
  },
  {
    number: "3",
    title: "Methods Of Fire Suppression And Extinguishing",
    icon: "/d3_icon3.png",
  },
  {
    number: "4",
    title: "Fire Risk Assessment And Inspection Procedures",
    icon: "/d3_icon4.png",
  },
  {
    number: "5",
    title: "Emergency Evacuation Planning & Response Protocols",
    icon: "/d3_icon5.png",
  },
];

export default function DayThreePage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/home">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-16 w-auto object-contain md:h-20"
            />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link href="/home" className="hover:text-blue-900">
              Home
            </Link>

            <Link href="/program" className="text-blue-900">
              Program
            </Link>

            <Link href="/apply" className="hover:text-blue-900">
              Apply
            </Link>

            <Link href="/dashboard" className="hover:text-blue-900">
              Dashboard
            </Link>
          </div>

          <Link
            href="/apply"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Apply Now
          </Link>
        </div>
      </nav>

      {/* COURSE PAGE */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden px-6 py-6 md:px-8 md:py-10 lg:px-14">
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* TOP HEADER */}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="w-full md:w-auto">
                <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-blue-900 md:text-4xl lg:text-5xl">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                <div className="mt-5 flex items-center justify-between md:mt-8">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl text-blue-900 md:text-4xl">▣</div>

                    <h2 className="text-3xl font-black text-blue-900 md:text-4xl">
                      Day 3
                    </h2>
                  </div>

                  <img
                    src="/logo_2.png"
                    alt="BYWC secondary logo"
                    className="h-10 w-auto object-contain md:hidden"
                  />
                </div>
              </div>

              <img
                src="/logo_2.png"
                alt="BYWC secondary logo"
                className="hidden h-20 w-auto object-contain md:block"
              />
            </div>

            {/* MOBILE IMAGE - FLUSH WITH CONTENT */}
            <img
              src="/courses/C3.png"
              alt="Fire marshal training participant"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            {/* MAIN CONTENT BLOCK */}
            <div className="relative z-10 -mt-2 w-full bg-[#e6e6e6] pb-8 md:mt-5 md:max-w-[720px]">
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black uppercase tracking-wide text-white">
                  Fire Marshal Training &amp; Emergency Preparedness
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="max-w-xl text-base leading-7 text-black md:text-lg">
                  This masterclass focuses on fire prevention, response and
                  evacuation readiness within regulated and high-risk
                  environments.
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
                          src={item.icon}
                          alt={item.title}
                          className="h-8 w-8 object-contain brightness-0 invert"
                        />
                      </div>

                      <div className="mt-4 text-4xl font-black leading-none md:col-start-1 md:row-start-1 md:mt-0 md:text-5xl">
                        {item.number}
                      </div>

                      <div className="mt-4 h-[5px] w-16 bg-orange-500 md:col-start-2 md:row-start-1 md:mt-0 md:h-14 md:w-[5px]" />

                      <div className="hidden md:col-start-3 md:row-start-1 md:flex md:h-[68px] md:w-[68px] md:items-center md:justify-center md:rounded-full md:border-[5px] md:border-orange-500">
                        <img
                          src={item.icon}
                          alt={item.title}
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

            {/* DESKTOP CHARACTER IMAGE */}
            <img
              src="/courses/C3.png"
              alt="Fire marshal training participant"
              className="absolute bottom-0 right-0 z-20 hidden max-h-[680px] w-auto object-contain md:block lg:max-h-[760px]"
            />
          </div>
        </div>

        {/* PAGE ACTIONS */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/program"
            className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
          >
            ← Back to Programme
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/program/day-2"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Previous Day
            </Link>

            <Link
              href="/program/day-4"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              Next Day →
            </Link>

            <Link
              href="/apply"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}