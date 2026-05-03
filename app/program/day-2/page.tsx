"use client";

import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "First Aid Equipment, Facilities, Signage and Training Requirements",
    icon: "/d2_icon1.png",
  },
  {
    number: "2",
    title: "Casualty Handling And Patient Management Procedures",
    icon: "/d2_icon2.png",
  },
  {
    number: "3",
    title: "Unconscious Casualty Checks And Lifesaving Priorities",
    icon: "/d2_icon3.png",
  },
  {
    number: "4",
    title:
      "Cardiopulmonary Resuscitation (CPR) And Use Of Automated External Defibrillators (AEDs)",
    icon: "/d2_icon4.png",
  },
  {
    number: "5",
    title: "Response To Common Emergency Scenarios",
    icon: "/d2_icon5.png",
  },
];

export default function DayTwoPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/home" className="flex items-center gap-3">
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
                      Day 2
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
              src="/courses/C2.png"
              alt="Practical first aid participant"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            {/* MAIN CONTENT BLOCK */}
            <div className="relative z-10 -mt-2 w-full bg-[#e6e6e6] pb-8 md:mt-5 md:max-w-[720px]">
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black uppercase tracking-wide text-white">
                  Practical First Aid &amp; Emergency Response
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="max-w-xl text-base leading-7 text-black md:text-lg">
                  This session translates first aid theory into hands-on
                  emergency response capability
                </p>

                <p className="mt-4 text-base text-black md:text-lg">
                  Focus areas include:
                </p>

                <div className="mt-6 space-y-3 md:space-y-2">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="grid min-h-[92px] grid-cols-[50px_1px_60px_1fr] items-center bg-blue-900 px-4 py-3 text-white md:grid-cols-[80px_1px_82px_1fr] md:px-6 md:py-0"
                    >
                      <div className="text-3xl font-black leading-none md:text-6xl">
                        {item.number}
                      </div>

                      <div className="h-10 w-[3px] bg-orange-500 md:h-16" />

                      <div className="flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-orange-500 md:h-16 md:w-16">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-6 w-6 object-contain brightness-0 invert md:h-10 md:w-10"
                          />
                        </div>
                      </div>

                      <p className="pl-3 text-sm font-medium leading-tight md:pl-5 md:text-base">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP CHARACTER IMAGE */}
            <img
              src="/courses/C2.png"
              alt="Practical first aid participant"
              className="hidden md:block absolute bottom-0 right-0 z-20 max-h-[650px] w-auto object-contain lg:max-h-[720px]"
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
              href="/program/day-1"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Previous Day
            </Link>

            <Link
              href="/program/day-3"
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
