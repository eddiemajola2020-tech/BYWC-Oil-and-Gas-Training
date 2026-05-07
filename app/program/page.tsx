"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProgramPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const trainingDays = [
    {
      day: "Day 1",
      title: "First Aid Foundations & Human Systems Awareness",
      text: "Introduces essential first aid knowledge, occupational hazards, and workplace emergency awareness.",
      icon: "/10-Day Curriculum/day_1.png",
      featured: true,
    },
    {
      day: "Day 2",
      title: "Practical First Aid & Emergency Response",
      text: "Covers casualty handling, CPR, AED use, and emergency response scenarios.",
      icon: "/10-Day Curriculum/day_2.png",
      featured: false,
    },
    {
      day: "Day 3",
      title: "Fire Marshal Training & Emergency Preparedness",
      text: "Focuses on fire prevention, evacuation systems, and emergency protocols.",
      icon: "/10-Day Curriculum/day_3.png",
      featured: false,
    },
    {
      day: "Day 4",
      title: "Hazardous Materials Management",
      text: "Covers identification, labelling, risk assessment, and handling of hazardous materials.",
      icon: "/10-Day Curriculum/day_4.png",
      featured: false,
    },
    {
      day: "Day 5",
      title: "Occupational Health & Safety Systems",
      text: "Explores OHS policies, PPE use, risk control, and accident investigation.",
      icon: "/10-Day Curriculum/day_5.png",
      featured: false,
    },
    {
      day: "Day 6",
      title: "Energy Sector Foundations",
      text: "Introduces oil, gas, LPG, and Botswana’s energy economy landscape.",
      icon: "/10-Day Curriculum/day_6.png",
      featured: false,
    },
    {
      day: "Day 7",
      title: "Fuel Logistics & Distribution",
      text: "Covers transportation, storage, and fuel distribution systems.",
      icon: "/10-Day Curriculum/day_7.png",
      featured: false,
    },
    {
      day: "Day 8",
      title: "LPG & Clean Energy Pathways",
      text: "Explores LPG supply chains and clean cooking opportunities.",
      icon: "/10-Day Curriculum/day_8.png",
      featured: false,
    },
    {
      day: "Day 9",
      title: "Fuel Retail & Wholesale",
      text: "Covers fuel station development, licensing, and business models.",
      icon: "/10-Day Curriculum/day_9.png",
      featured: false,
    },
    {
      day: "Day 10",
      title: "Entrepreneurial Activation",
      text: "Focuses on business setup, funding readiness, and opportunity access.",
      icon: "/10-Day Curriculum/day_10.png",
      featured: false,
    },
  ];

  const partners = [
    "/logos/gov_1.png",
    "/logos/pyec_1.png",
    "/logos/seth_1.png",
    "/logos/emangweni_1.png",
    "/logos/baisago_1.png",
    "/logos/ub_1.png",
    "/logos/bera_1.png",
    "/logos/ter_1.png",
  ];

  const pathwayCards = [
    {
      title: "Cooperative Formation",
      text: "Support to establish oil and gas cooperatives and enterprises across all 61 constituencies.",
    },
    {
      title: "Government Registration Support",
      text: "Assistance with formal formation, registration and setup through the Ministry of Trade and Entrepreneurship.",
    },
    {
      title: "Internships & Mentorship",
      text: "Exposure to real oil and gas operating environments through internship and mentorship opportunities.",
    },
    {
      title: "Project & Infrastructure Coordination",
      text: "Seth Resources Petroleum will coordinate cooperative projects, project management and infrastructure development.",
    },
  ];

  const participantBenefitCards = [
    {
      title: "Free Training Access",
      icon: "📘",
      text: "Access the full 10-day BYWC Oil & Gas Training Programme at no cost, covering safety systems, oil and gas operations, LPG, logistics, fuel retail, and enterprise activation.",
      featured: true,
    },
    {
      title: "Meals Throughout Training",
      icon: "🍽️",
      text: "Participants receive breakfast, lunch, and dinner throughout the programme to support full-day participation during the training period.",
      featured: false,
    },
    {
      title: "Government & Industry Backing",
      icon: "🤝",
      text: "The programme is supported through collaboration between PYEC, government institutions, and industry partners working to create structured entry into Botswana’s energy sector.",
      featured: false,
    },
    {
      title: "Internships, Mentorship & Enterprise Pathways",
      icon: "🛢️",
      text: "Selected participants may access mentorship, internship exposure, cooperative formation support, and structured pathways into enterprise development within the oil and gas sector.",
      featured: true,
    },
  ];

  const applicationRequirements = [
    {
      title: "Botswana Citizen Focus",
      text: "The programme is designed to prioritise citizens seeking practical pathways into Botswana’s energy economy.",
    },
    {
      title: "Complete Application",
      text: "Applicants must submit full registration details and complete all required application fields accurately.",
    },
    {
      title: "Supporting Documents",
      text: "Applicants should be ready to provide the required supporting documents during the application process.",
    },
    {
      title: "Programme Commitment",
      text: "Applicants should be available to attend and participate in the full 10-day training programme.",
    },
    {
      title: "Relevant Interest",
      text: "The programme is best suited to those interested in oil, gas, LPG, logistics, fuel retail, safety, or related enterprise pathways.",
    },
    {
      title: "Selection & Onboarding",
      text: "Successful applicants may be contacted for further vetting, confirmation, and onboarding before final participation.",
    },
  ];

  const programmeBenefits = [
    "10-day intensive training",
    "Internship and mentorship exposure",
    "Government registration support",
    "Cooperative and enterprise setup guidance",
    "Free meals 3 times a day during training",
    "Representation across all 61 constituencies",
  ];

  const curriculumRows = [
    trainingDays.slice(0, 3),
    trainingDays.slice(3, 6),
    trainingDays.slice(6, 10),
  ];

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
          <Link href="/home" className="flex items-center">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-16 w-auto object-contain md:h-20"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link href="/home" className="transition hover:text-blue-900">
              Home
            </Link>

            <Link href="/program" className="text-blue-900">
              Program
            </Link>

            <Link href="/apply" className="transition hover:text-blue-900">
              Apply
            </Link>

            <Link href="/dashboard" className="transition hover:text-blue-900">
              Dashboard
            </Link>

            <a href="#contact" className="transition hover:text-blue-900">
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/home"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Back Home
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white md:hidden"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
            <div className="grid gap-3">
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Home
              </Link>

              <Link
                href="/program"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700"
              >
                Program
              </Link>

              <Link
                href="/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Apply
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Dashboard
              </Link>

              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      <section className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:rounded-[32px]">
            <div className="relative h-[420px] w-full overflow-hidden rounded-[28px] md:h-[62vh] md:min-h-[460px] md:rounded-[32px]">
              <img
                src="/banner_2.webp"
                alt="Programme Banner"
                className="h-full w-full object-cover object-[32%_35%] md:object-center"
              />

              <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-black/25 to-black/45 md:bg-gradient-to-r md:from-black/40 md:via-black/10 md:to-transparent" />
            </div>
          </div>

          <div className="relative z-20 mx-auto -mt-28 w-[90%] max-w-5xl rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur md:-mt-32 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                  10-Day Programme
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-blue-950 md:text-4xl lg:text-5xl">
                  2026 National Intake
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
                  National training access designed to connect citizens to
                  sector readiness, opportunity pathways, and partner-led
                  industry exposure.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-blue-950">1,000</p>
                  <p className="mt-1 text-sm text-slate-600">Participants</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-blue-950">10</p>
                  <p className="mt-1 text-sm text-slate-600">Day Programme</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-blue-950">61</p>
                  <p className="mt-1 text-sm text-slate-600">Constituencies</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-base font-bold text-blue-950 lg:text-lg">
                    3 Meals
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Daily Support</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <Link
                href="/apply"
                className="rounded-full bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600 sm:px-7 sm:py-3.5"
              >
                Apply Now
              </Link>

              <Link
                href="/program"
                className="rounded-full border-2 border-blue-900 px-4 py-3 text-center text-sm font-semibold text-blue-900 hover:bg-blue-50 sm:px-7 sm:py-3.5"
              >
                Download Guide
              </Link>
            </div>
          </div>

          <div className="h-12 lg:h-16" />
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                Programme Launch
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-blue-950 lg:text-5xl">
                Programme Launch &<br className="hidden lg:block" />
                Pathway to Enterprise
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                BYWC, in collaboration with the Presidential Youth Economic
                Campaign (PYEC), was launched as a national initiative to create
                structured entry into Botswana’s oil and gas sector.
              </p>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Beyond training, this initiative is designed to move selected
                participants into real participation in the industry through
                cooperative formation, enterprise development, internships,
                mentorship and project support across all 61 constituencies.
              </p>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                The Ministry of Trade and Entrepreneurship will assist with the
                formation, registration and setup of cooperatives in accordance
                with the laws of Botswana. Seth Resources Petroleum will
                coordinate cooperative projects, project management and
                infrastructure development.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-10 right-10 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
                <img
                  src="/pic_2.webp"
                  alt="Programme leadership engagement"
                  className="h-[380px] w-full object-cover object-center md:h-[520px]"
                />
              </div>


            </div>
          </div>

          <div className="mt-20">
            <div className="mx-auto mb-14 max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                What You Get
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-blue-950 md:text-4xl lg:text-[3.2rem]">
                Programme Benefits &amp; Participant Support
              </h2>

              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
                The programme is designed to reduce barriers to participation by
                combining training, operational exposure, industry support, and
                participant-focused assistance within one structured national
                initiative.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {participantBenefitCards.map((item, index) => (
                <div
                  key={item.title}
                  className={`group min-h-[260px] rounded-[30px] border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] lg:p-8 ${
                    index % 2 === 0
                      ? "border-blue-950 bg-blue-950"
                      : "border-orange-500 bg-orange-500"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                      index % 2 === 0
                        ? "bg-white text-blue-950"
                        : "bg-white text-orange-500"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <h3
                    className={`mt-8 text-2xl font-black lg:text-3xl ${
"text-white"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`mt-4 text-base leading-8 ${
                      index % 2 === 0 ? "text-blue-100" : "text-orange-50"
                    }`}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-4 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <img
            src="/break_1.webp"
            alt="Section break"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            10-Day Curriculum
          </p>

          <h2 className="mt-3 text-4xl font-bold text-blue-950 lg:text-5xl">
            Full Training Breakdown
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
            A direct, structured learning journey covering safety, emergency
            response, operations, logistics, LPG, fuel retail, and business
            activation.
          </p>
        </div>

        {curriculumRows.map((row, rowIndex) => (
          <div key={rowIndex}>
            <div
              className={`grid gap-8 ${
                row.length === 3
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "md:grid-cols-2 xl:grid-cols-4"
              }`}
            >
              {row.map((item) => {
                const isDayOne = item.day === "Day 1";

                const dayLinks: Record<string, string> = {
                  "Day 1": "/program/day-1",
                  "Day 2": "/program/day-2",
                  "Day 3": "/program/day-3",
                  "Day 4": "/program/day-4",
                  "Day 5": "/program/day-5",
                  "Day 6": "/program/day-6",
                  "Day 7": "/program/day-7",
                  "Day 8": "/program/day-8",
                  "Day 9": "/program/day-9",
                  "Day 10": "/program/day-10",
                };

                return (
                  <Link
                    href={dayLinks[item.day] || "/program"}
                    key={item.day}
                    className={`group flex h-full min-h-[360px] flex-col rounded-[28px] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md lg:min-h-[430px] lg:rounded-[30px] lg:p-8 ${
                      isDayOne
                        ? "border border-blue-900 bg-blue-950"
                        : "border-2 border-blue-900 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4 lg:gap-5">
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl lg:h-20 lg:w-20 lg:rounded-3xl ${
                          isDayOne ? "bg-white/10" : "bg-orange-50"
                        }`}
                      >
                        <img
                          src={item.icon}
                          alt={item.day}
                          className={`h-11 w-11 object-contain lg:h-14 lg:w-14 ${
                            isDayOne ? "brightness-0 invert" : ""
                          }`}
                        />
                      </div>

                      <div className="rounded-xl bg-blue-900 px-4 py-2 lg:px-5 lg:py-3">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white lg:text-base">
                          {item.day}
                        </p>
                      </div>
                    </div>

                    <h3
                      className={`mt-7 text-2xl font-bold leading-tight lg:text-[2rem] ${
                        isDayOne ? "text-white" : "text-blue-900"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`mt-5 text-base leading-8 lg:text-lg ${
                        isDayOne ? "text-blue-100" : "text-slate-600"
                      }`}
                    >
                      {item.text}
                    </p>

                    <div className="mt-auto pt-8">
                      <p
                        className={`text-base font-bold ${
                          isDayOne ? "text-white" : "text-blue-900"
                        }`}
                      >
                        View details →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {rowIndex < curriculumRows.length - 1 && (
              <div className="py-10 lg:py-12">
                <img
                  src="/break_1.webp"
                  alt="Section break"
                  className="h-auto w-full object-contain"
                />
              </div>
            )}
          </div>
        ))}
      </section>

      <section id="partners" className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            In Partnership With
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 lg:text-4xl">
            Our Strategic Partners
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {partners.map((logo, index) => (
            <div
              key={index}
              className="flex h-[110px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md lg:h-[120px]"
            >
              <img
                src={logo}
                alt={`Partner logo ${index + 1}`}
                className="h-full w-full scale-110 object-contain lg:scale-125"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Before You Apply
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-950 lg:text-4xl">
              Application Requirements
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Review the key public-facing requirements below before starting
              your application.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {applicationRequirements.map((item, index) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-[#f6f7fb] p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  <h3 className="text-lg font-bold text-blue-900">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-5 text-sm leading-8 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-3xl bg-blue-950 p-8 text-center text-white lg:p-10">
          <h2 className="text-3xl font-bold">Ready to Apply?</h2>

          <p className="mt-4 text-blue-100">
            Start your application and take the first step into the energy
            sector.
          </p>

          <Link
            href="/apply"
            className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
