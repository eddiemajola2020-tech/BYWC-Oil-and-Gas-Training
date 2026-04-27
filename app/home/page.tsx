"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const aboutHighlights = [
  {
    title: "Structured Entry Pathways",
    text: "A national platform creating access into Botswana’s energy economy.",
  },
  {
    title: "Twice-Yearly Delivery",
    text: "June training cycle and October Energy Expo & Business Summit.",
  },
  {
    title: "National Platform",
    text: "Connecting participants with industry, regulators, and opportunities.",
  },
  {
    title: "10-Day Masterclass",
    text: "Focused on skills, business readiness, and sector entry.",
  },
];

const pathwayCards = [
  {
    title: "Oil & Gas Foundations",
    text: "Understand how the energy sector works.",
    icon: "/icon_1.png",
  },
  {
    title: "Fuel Logistics",
    text: "Storage, transport, and distribution systems.",
    icon: "/icon_2.png",
  },
  {
    title: "LPG & Clean Energy",
    text: "Opportunities in gas and clean energy.",
    icon: "/icon_3.png",
  },
  {
    title: "Business Readiness",
    text: "Prepare for entrepreneurship and employment.",
    icon: "/icon_4.png",
  },
];

const partners = [
  "/logos/gov_1.png",
  "/logos/seth_1.png",
  "/logos/emangweni_1.png",
  "/logos/baisago_1.png",
  "/logos/ub_1.png",
  "/logos/bera_1.png",
  "/logos/ter_1.png",
];

const bannerImages = ["/banner_1.png", "/banner_2.png", "/banner_3.png"];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* LOGO */}
          <Link href="/home" className="flex h-full items-center">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-12 w-auto object-contain md:h-14 lg:h-16"
            />
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link href="/home" className="transition hover:text-blue-900">
              Home
            </Link>

            <Link href="/program" className="transition hover:text-blue-900">
              Program
            </Link>

            <Link href="/apply" className="transition hover:text-blue-900">
              Apply
            </Link>

            <Link
              href="/dashboard"
              className="transition hover:text-blue-900"
            >
              Dashboard
            </Link>

            <a href="#contact" className="transition hover:text-blue-900">
              Contact
            </a>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO BANNER CAROUSEL */}
      <section className="px-6 pt-8 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="relative h-[78vh] min-h-[620px] w-full overflow-hidden rounded-[32px]">
              {bannerImages.map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`BYWC banner ${index + 1}`}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    index === activeBanner ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              {/* DARK GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

              {/* HERO COPY */}
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="w-full px-8 lg:px-14">
                  <div className="max-w-3xl">
                    <h1 className="text-5xl font-bold leading-[1.05] text-white md:text-6xl lg:text-7xl">
                      10-Day Oil & Gas
                      <br />
                      Training Program
                    </h1>

                    <p className="mt-6 max-w-xl text-lg font-medium text-white/90">
                      Gain skills. Enter Botswana’s energy sector.
                    </p>

                    <div className="mt-10">
                      <Link
                        href="/apply"
                        className="inline-flex rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-orange-600"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* CAROUSEL DOTS */}
              <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveBanner(index)}
                    className={`h-3 rounded-full transition-all ${
                      index === activeBanner
                        ? "w-8 bg-orange-500"
                        : "w-3 bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-8 lg:h-10" />
        </div>
      </section>

      {/* SECTION 2: LOGGED-IN JOURNEY PREVIEW */}
      <section className="bg-[#f6f7fb]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-2 lg:px-10 lg:py-16">
          {/* LEFT SIDE */}
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              NATIONAL TRAINING PLATFORM
            </span>

            <h2 className="max-w-xl text-5xl font-bold leading-tight tracking-tight text-blue-950 lg:text-6xl">
              Build Your Future in Botswana’s Energy Sector
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              A structured national platform helping youth, women and citizens
              access training, industry readiness, and real opportunity in oil,
              gas, logistics, fuel retail, and entrepreneurship.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="rounded-full bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-orange-600"
              >
                Apply Now
              </Link>

              <Link
                href="/program"
                className="rounded-full border-2 border-slate-900 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <div>
                <p className="text-2xl font-bold text-blue-950">1,000</p>
                <p>Participant Target</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-blue-950">61</p>
                <p>Constituencies</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-blue-950">10 Days</p>
                <p>Masterclass Training</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -top-8 right-10 h-28 w-28 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-blue-200/40 blur-3xl" />

            <div className="relative w-full max-w-xl rounded-[28px] border border-white/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              {/* HEADER */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Program Flow</p>
                  <h3 className="text-xl font-semibold text-blue-950">
                    Your Journey Starts Here
                  </h3>
                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Logged In
                </span>
              </div>

              {/* STEPS */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Step 1</p>
                  <p className="mt-2 text-2xl font-bold text-blue-900">
                    Apply
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-1/4 rounded-full bg-orange-500" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Submit your application in minutes
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Step 2</p>
                  <p className="mt-2 text-2xl font-bold text-blue-900">
                    Review
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-3/5 rounded-full bg-orange-500" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Our team evaluates your submission
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-sm text-slate-500">Step 3</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">
                    Track Status
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Follow updates from your dashboard and tracker.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 rounded-2xl bg-blue-950 p-5 text-white">
                <p className="text-sm text-blue-100">
                  Application Dashboard
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">Track Progress</p>
                    <p className="mt-1 text-sm text-blue-100">
                      View your application status and updates
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-950"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ABOUT REDESIGNED WITH IMAGE */}
      <section id="about" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="relative">
              <div className="max-w-xl rounded-[28px_28px_110px_28px] bg-[#214b92] px-8 py-10 text-white shadow-[0_20px_50px_rgba(33,75,146,0.18)] lg:px-10 lg:py-12">
                <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                  BYWC Overview
                </span>

                <h2 className="mt-5 text-4xl font-bold tracking-tight lg:text-5xl">
                  Why This Program Matters
                </h2>

                <p className="mt-5 text-base leading-7 text-white/90">
                  Botswana stands at a defining economic moment. Traditional
                  growth sectors such as diamonds are under pressure, and the
                  need for new engines of opportunity has never been clearer.
                </p>

                <p className="mt-4 text-base leading-7 text-white/90">
                  This programme is a structured national response, focused on
                  equipping youth, women, and citizens with the skills,
                  readiness, and market access required to participate in oil,
                  gas, LPG, logistics, and clean energy value chains.
                </p>

                <p className="mt-4 text-base leading-7 text-white/90">
                  It is designed not simply as training, but as an economic
                  inclusion platform.
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-[360px] w-[360px] rounded-full opacity-20 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(33,75,146,0.35) 0%, rgba(255,255,255,0) 70%)",
                  }}
                />
              </div>

              <div
                className="pointer-events-none absolute inset-0 hidden bg-center bg-no-repeat opacity-10 lg:block"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, #214b92 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              />

              <div className="relative flex min-h-[420px] w-full items-end justify-center">
                <img
                  src="/person_1.png"
                  alt="BYWC participant overview"
                  className="max-h-[480px] w-auto object-contain lg:max-h-[560px]"
                />
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {aboutHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-[#f6f7fb] p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-blue-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            In Partnership With
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 lg:text-4xl">
            Our Strategic Partners
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {partners.map((logo, index) => (
            <div
              key={index}
              className="flex h-[120px] items-center justify-center rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <img
                src={logo}
                alt={`Partner logo ${index + 1}`}
                className="h-full w-full object-contain scale-125"
              />
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU'LL LEARN */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            What You’ll Learn
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 lg:text-4xl">
            Training Built for Real Sector Readiness
          </h2>
        </div>

        {/* CONTENT */}
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* IMAGE LEFT */}
          <div className="flex justify-center">
            <img
              src="/pic_1.png"
              alt="Training visual"
              className="w-full max-w-lg rounded-2xl object-cover shadow-md"
            />
          </div>

          {/* RIGHT SIDE */}
          <div>
            <p className="max-w-xl text-base leading-8 text-slate-600">
              The program is designed to help participants understand the
              sector, identify opportunity areas, and build the readiness needed
              to move toward employment, entrepreneurship, and industry
              participation.
            </p>

            {/* CARDS */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {pathwayCards.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* ICON CONTAINER */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    {/* ICON SIZE CONTROL */}
                    <img
                      src={item.icon}
                      alt={item.title}
                      className={`object-contain ${
                        item.title === "LPG & Clean Energy"
                          ? "h-12 w-12"
                          : "h-16 w-16"
                      }`}
                    />
                  </div>

                  {/* TEXT */}
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTONS */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/program"
                className="rounded-full border-2 border-blue-900 px-6 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50"
              >
                See More
              </Link>

              <Link
                href="/apply"
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 text-center">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          {/* HEADER */}
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-950 lg:text-4xl">
              Your Application Journey
            </h2>
          </div>

          {/* DESKTOP FLOW */}
          <div className="mt-10 hidden items-center justify-center gap-4 md:flex">
            {/* STEP 1 */}
            <div className="relative flex w-full max-w-sm items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                1
              </div>

              <p className="text-base font-medium text-slate-900">
                Complete Application
              </p>
            </div>

            {/* ARROW 1 */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <span className="text-xl font-bold">→</span>
            </div>

            {/* STEP 2 */}
            <div className="relative flex w-full max-w-sm items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                2
              </div>

              <p className="text-base font-medium text-slate-900">
                Submit Documents
              </p>
            </div>

            {/* ARROW 2 */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <span className="text-xl font-bold">→</span>
            </div>

            {/* STEP 3 */}
            <div className="relative flex w-full max-w-sm items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                3
              </div>

              <p className="text-base font-medium text-slate-900">
                Track Status
              </p>
            </div>
          </div>

          {/* MOBILE STACK */}
          <div className="mt-10 grid gap-4 md:hidden">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                1
              </div>

              <p className="text-base font-medium text-slate-900">
                Complete Application
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                2
              </div>

              <p className="text-base font-medium text-slate-900">
                Submit Documents
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                3
              </div>

              <p className="text-base font-medium text-slate-900">
                Track Status
              </p>
            </div>
          </div>

          {/* EXPLANATION COPY */}
          <div className="mx-auto mt-12 max-w-3xl text-center">
            <p className="text-base leading-8 text-slate-600">
              Complete your application, upload the required documents, and
              submit your application for review. Once submitted, you can return
              to your dashboard at any time to check your progress and see new
              updates on your application status.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/apply"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Start Application
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full border-2 border-blue-900 px-6 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50"
            >
              Check Status
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="border-t py-6 text-center text-sm text-gray-500"
      >
        © 2026 BYWC Oil &amp; Gas Training Platform
      </footer>
    </main>
  );
}