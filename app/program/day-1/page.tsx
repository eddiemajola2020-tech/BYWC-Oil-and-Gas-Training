"use client";

import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "Introduction To First Aid And Emergency Care",
    icon: "/d1_icon1.png",
  },
  {
    number: "2",
    title: "Roles And Responsibilities Of A First Aider",
    icon: "/d1_icon2.png",
  },
  {
    number: "3",
    title: "Human Body Systems Awareness",
    icon: "/d1_icon3.png",
  },
  {
    number: "4",
    title: "Common Workplace Hazards And Injury Risks",
    icon: "/d1_icon4.png",
  },
  {
    number: "5",
    title: "Initial Scene Assessment And Emergency Communication",
    icon: "/d1_icon5.png",
  },
  {
    number: "6",
    title: "Basic Emergency Preparedness And Response Principles",
    icon: "/d1_icon6.png",
  },
];

export default function DayOnePage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
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

      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden px-6 py-6 md:px-8 md:py-10 lg:px-14">
            
            {/* HEADER */}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase text-blue-900 md:text-5xl">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                <div className="mt-6 flex items-center gap-3">
                  <div className="text-3xl text-blue-900">▣</div>
                  <h2 className="text-3xl font-black text-blue-900">
                    Day 1
                  </h2>
                </div>
              </div>

              <img
                src="/logo_2.png"
                alt="BYWC"
                className="hidden h-20 md:block"
              />
            </div>

            {/* MOBILE IMAGE */}
            <img
              src="/courses/C9.webp"
              className="mt-6 w-full object-contain md:hidden"
            />

            {/* CONTENT */}
            <div className="mt-6 bg-[#e6e6e6] p-6 md:max-w-[720px] md:mt-8">
              <div className="bg-blue-900 px-6 py-4 text-white font-black">
                First Aid Foundations & Human Systems Awareness
              </div>

              <p className="mt-5 text-black">
                This opening masterclass introduces essential first aid
                knowledge, occupational hazards, and workplace emergency
                awareness.
              </p>

              <p className="mt-4 text-black">
                Focus areas include:
              </p>

              {/* 🔥 MOBILE + DESKTOP COMBINED SYSTEM */}
              <div className="mt-6 grid gap-4 md:gap-3">
                {focusAreas.map((item) => (
                  <div
                    key={item.number}
                    className="flex min-h-[170px] flex-col items-center justify-center bg-blue-900 px-5 py-6 text-center text-white md:min-h-[110px] md:grid md:grid-cols-[52px_8px_76px_1fr] md:items-center md:gap-x-4 md:px-6 md:py-5 md:text-left"
                  >
                    {/* MOBILE ICON */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500 md:hidden">
                      <img
                        src={item.icon}
                        className="h-8 w-8 brightness-0 invert"
                      />
                    </div>

                    {/* NUMBER */}
                    <div className="mt-4 text-4xl font-black md:mt-0 md:text-5xl">
                      {item.number}
                    </div>

                    {/* LINE */}
                    <div className="mt-4 h-[5px] w-16 bg-orange-500 md:mt-0 md:h-14 md:w-[5px]" />

                    {/* DESKTOP ICON */}
                    <div className="hidden md:flex h-[68px] w-[68px] items-center justify-center rounded-full border-[5px] border-orange-500">
                      <img
                        src={item.icon}
                        className="h-9 w-9 brightness-0 invert"
                      />
                    </div>

                    {/* TEXT */}
                    <p className="mt-3 text-[15px] font-semibold md:mt-0 md:text-[19px]">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* DESKTOP IMAGE */}
            <img
              src="/courses/C9.webp"
              className="hidden md:block absolute bottom-0 left-[-160px] max-h-[700px]"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mx-auto mt-8 flex max-w-6xl justify-between">
          <Link href="/program" className="text-blue-900 font-bold">
            ← Back
          </Link>

          <div className="flex gap-4">
            <Link href="/program/day-2">Next →</Link>
            <Link href="/apply">Apply</Link>
          </div>
        </div>
      </section>
    </main>
  );
}