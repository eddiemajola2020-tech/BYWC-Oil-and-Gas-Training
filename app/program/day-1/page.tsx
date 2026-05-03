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

              <img src="/logo_2.png" alt="Logo" className="hidden h-20 md:block" />
            </div>

            {/* IMAGE */}
            <img
              src="/courses/C9.png"
              alt="First aid training"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            <img
              src="/courses/C9.png"
              alt="First aid training"
              className="hidden max-h-[650px] md:absolute md:bottom-0 md:left-[-160px] md:z-20 md:block"
            />

            {/* CONTENT */}
            <div className="relative z-10 -mt-2 w-full bg-[#e6e6e6] pb-8 md:ml-auto md:mt-5 md:max-w-[720px]">
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black text-white">
                  First Aid Foundations & Human Systems Awareness
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="text-base leading-7 md:text-lg md:leading-8">
                  This opening masterclass introduces essential first aid
                  knowledge and workplace emergency awareness.
                </p>

                <p className="mt-5 text-base font-medium md:text-lg">
                  Focus areas include:
                </p>

                {/* FOCUS CARDS */}
                <div className="mt-6 grid gap-5">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="bg-blue-900 px-7 py-6 text-white md:grid md:min-h-[128px] md:grid-cols-[58px_8px_86px_1fr] md:items-center md:gap-x-5 md:px-7 md:py-6"
                    >
                      {/* MOBILE TOP ROW */}
                      <div className="flex items-center md:contents">
                        <div className="w-[52px] shrink-0 text-5xl font-extrabold leading-none md:w-auto">
                          {item.number}
                        </div>

                        <div className="mr-4 h-16 w-[6px] shrink-0 bg-orange-500 md:mr-0" />

                        <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full border-[7px] border-orange-500 md:h-[78px] md:w-[78px] md:border-[6px]">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-9 w-9 object-contain brightness-0 invert md:h-9 md:w-9"
                          />
                        </div>
                      </div>

                      {/* TEXT */}
                      <p className="mt-5 max-w-[95%] text-[24px] font-extrabold leading-[1.2] md:mt-0 md:max-w-none md:pl-2 md:pr-4 md:text-[22px] md:leading-[1.25]">
                        {item.title}
                      </p>
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