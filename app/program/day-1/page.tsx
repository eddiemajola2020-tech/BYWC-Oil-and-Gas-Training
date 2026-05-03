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
            <Link href="/home">Home</Link>
            <Link href="/program" className="text-blue-900">Program</Link>
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

      {/* PAGE CONTENT */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden px-6 py-6 md:px-8 md:py-10 lg:px-14">
            
            {/* BACKGROUND */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* HEADER */}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:justify-between">
              <div>
                <h1 className="text-3xl font-black text-blue-900 md:text-5xl">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                <div className="mt-6 flex items-center gap-3">
                  <div className="text-4xl text-blue-900">▣</div>
                  <h2 className="text-4xl font-black text-blue-900">Day 1</h2>
                </div>
              </div>

              <img
                src="/logo_2.png"
                className="hidden md:block h-20"
              />
            </div>

            {/* IMAGE */}
            <img
              src="/courses/C9.png"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            <img
              src="/courses/C9.png"
              className="hidden md:block absolute bottom-0 left-[-160px] z-20 max-h-[650px]"
            />

            {/* CONTENT */}
            <div className="relative z-10 -mt-2 w-full bg-[#e6e6e6] pb-8 md:ml-auto md:mt-5 md:max-w-[720px]">
              
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black text-white">
                  First Aid Foundations & Human Systems Awareness
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="text-base md:text-lg">
                  This opening masterclass introduces essential first aid knowledge and workplace emergency awareness.
                </p>

                <p className="mt-4 text-base md:text-lg">
                  Focus areas include:
                </p>

                {/* ✅ FIXED CARDS */}
                <div className="mt-6 grid gap-4">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="grid min-h-[120px] grid-cols-[60px_8px_70px_1fr] items-center gap-x-4 bg-blue-900 px-5 py-5 text-white md:grid-cols-[70px_10px_82px_1fr] md:px-6 md:py-6"
                    >
                      {/* NUMBER */}
                      <div className="text-4xl md:text-5xl font-extrabold">
                        {item.number}
                      </div>

                      {/* ORANGE BAR */}
                      <div className="h-16 w-[6px] bg-orange-500" />

                      {/* ICON */}
                      <div className="flex items-center justify-center">
                        <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border-[6px] border-orange-500">
                          <img
                            src={item.icon}
                            className="h-8 w-8 md:h-10 md:w-10 brightness-0 invert"
                          />
                        </div>
                      </div>

                      {/* TEXT (FIXED BREATHING SPACE) */}
                      <div className="pl-2 pr-3">
                        <p className="text-[18px] md:text-[22px] font-extrabold leading-[1.25]">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 h-24 w-64 bg-orange-500/10" />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mx-auto mt-8 flex max-w-6xl justify-between">
          <Link href="/program" className="border px-6 py-3">
            ← Back
          </Link>

          <Link href="/apply" className="bg-orange-500 px-6 py-3 text-white">
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}