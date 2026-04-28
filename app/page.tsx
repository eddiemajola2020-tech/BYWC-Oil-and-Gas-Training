"use client";

import { useState } from "react";
import Link from "next/link";

const programRedirect = "/signup?redirect=/program";
const dashboardRedirect = "/login?redirect=/dashboard";
const signupApplyRedirect = "/signup?redirect=/apply#application-form";

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

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-16 w-auto object-contain md:h-20"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link
              href={programRedirect}
              className="transition hover:text-blue-900"
            >
              Program
            </Link>

            <Link
              href={signupApplyRedirect}
              className="transition hover:text-blue-900"
            >
              Apply
            </Link>

            <a href="#contact" className="transition hover:text-blue-900">
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-blue-900"
            >
              Login
            </Link>

            <Link
              href={signupApplyRedirect}
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Apply Now
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
                href={programRedirect}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Program
              </Link>

              <Link
                href={signupApplyRedirect}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Apply
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Login
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
            <div className="relative h-[560px] w-full overflow-hidden rounded-[28px] md:h-[78vh] md:min-h-[620px] md:rounded-[32px]">
              <img
                src="/banner_1.png"
                alt="BYWC Oil and Gas banner"
                className="h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/45 md:bg-gradient-to-r md:from-black/55 md:via-black/20 md:to-transparent" />

              <div className="absolute inset-0 z-20 flex items-end pb-20 md:items-center md:pb-0">
                <div className="w-full px-6 sm:px-8 lg:px-14">
                  <div className="max-w-3xl">
                    <h1 className="max-w-[620px] text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                      10-Day Oil &amp; Gas
                      <br />
                      Training Program
                    </h1>

                    <p className="mt-5 max-w-md text-base font-semibold leading-7 text-white/95 sm:text-lg md:mt-6 md:max-w-xl">
                      Gain skills. Enter Botswana’s energy sector.
                    </p>

                    <div className="mt-7 md:mt-10">
                      <Link
                        href={signupApplyRedirect}
                        className="inline-flex rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600 md:px-8 md:py-4 md:text-base"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-8 lg:h-10" />
        </div>
      </section>

      <section className="bg-[#f6f7fb]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-2 lg:px-10 lg:py-16">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              NATIONAL TRAINING PLATFORM
            </span>

            <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-blue-950 md:text-5xl lg:text-6xl">
              Build Your Future in Botswana’s Energy Sector
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              A structured national platform helping youth, women and citizens
              access training, industry readiness, and real opportunity in oil,
              gas, logistics, fuel retail, and entrepreneurship.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={signupApplyRedirect}
                className="rounded-full bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-orange-600"
              >
                Apply Now
              </Link>

              <Link
                href={programRedirect}
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

          <div className="relative flex items-center justify-center">
            <div className="absolute -top-8 right-10 h-28 w-28 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-blue-200/40 blur-3xl" />

            <div className="relative w-full max-w-xl rounded-[28px] border border-white/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Program Flow</p>
                  <h3 className="text-xl font-semibold text-blue-950">
                    Your Journey Starts Here
                  </h3>
                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Before Login
                </span>
              </div>

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
                    Get Selected
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Receive confirmation and onboarding details after review.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-blue-950 p-5 text-white">
                <p className="text-sm text-blue-100">Program Cycle</p>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-3xl font-bold">2026 Intake</p>
                    <p className="mt-1 text-sm text-blue-100">
                      National application and onboarding platform
                    </p>
                  </div>

                  <Link
                    href={signupApplyRedirect}
                    className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-950"
                  >
                    Start Application
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}