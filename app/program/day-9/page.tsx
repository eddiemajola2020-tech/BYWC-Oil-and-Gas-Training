import Link from "next/link";

const focusAreas = [
  {
    title: "Wholesale Fuel Business Models",
    icon: "/d9_icon1.png",
  },
  {
    title: "Licensing And Compliance Requirements",
    icon: "/d9_icon2.png",
  },
  {
    title: "Fuel Retail Station Development",
    icon: "/d9_icon3.png",
  },
  {
    title: "Site Feasibility, Zoning And Market Analysis",
    icon: "/d9_icon4.png",
  },
  {
    title: "Ownership Models And Operational Considerations",
    icon: "/d9_icon5.png",
  },
];

export default function DayNinePage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/home">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-20 w-auto object-contain"
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

      {/* PAGE */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
            {/* BACKGROUND DOTS */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            <div className="relative z-10 px-8 py-10 lg:px-12">
              {/* TOP LINE */}
              <div className="mb-8 h-[3px] w-full bg-gradient-to-r from-orange-500 via-orange-500 to-blue-500" />

              {/* HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Program Details
                  </p>

                  {/* DAY LABEL */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="text-4xl text-blue-900">▣</div>

                    <h2 className="text-4xl font-black text-blue-900">
                      Day 9
                    </h2>
                  </div>
                </div>

                <img
                  src="/logo_2.png"
                  alt="Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>

              {/* MAIN BOX CENTERED */}
              <div className="mx-auto mt-4 max-w-[760px] bg-[#e6e6e6]">
                {/* TOP BANNER IMAGE */}
                <img
                  src="/banner_7.png"
                  alt="Fuel wholesale and retail business"
                  className="h-[320px] w-full rounded-tr-[24px] object-cover object-center"
                />

                {/* BLUE TITLE BAR */}
                <div className="bg-blue-900 px-8 py-4">
                  <h3 className="text-xl font-black text-white">
                    Fuel Wholesale & Retail Business{" "}
                    <span className="text-orange-400">Development</span>
                  </h3>
                </div>

                {/* CONTENT */}
                <div className="px-5 py-7 sm:px-8 sm:py-8">
                  <p className="text-lg leading-8 text-black">
                    Participants are introduced to{" "}
                    <span className="font-bold">
                      Commercial Fuel Supply and Retail Operations.
                    </span>
                  </p>

                  <p className="mt-6 text-lg font-bold text-black">
                    Focus areas include:
                  </p>

                  {/* LESSON CARDS */}
                  <div className="mt-8 grid gap-5">
                    {focusAreas.map((item, index) => (
                      <div
                        key={item.title}
                        className="flex items-center bg-blue-900 px-5 py-6 text-white sm:px-7 sm:py-7"
                      >
                        <div className="w-[42px] shrink-0 text-4xl font-extrabold leading-none sm:w-[52px] sm:text-5xl">
                          {index + 1}
                        </div>

                        <div className="ml-2 mr-4 h-14 w-[5px] shrink-0 bg-orange-500 sm:mr-5 sm:h-16 sm:w-[6px]" />

                        <div className="mr-5 flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full border-[6px] border-orange-500 sm:h-[82px] sm:w-[82px] sm:border-[7px]">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-8 w-8 object-contain brightness-0 invert sm:h-9 sm:w-9"
                          />
                        </div>

                        <div className="flex-1 text-[20px] font-extrabold leading-[1.18] sm:text-[24px]">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BOTTOM TEXT */}
                  <p className="mt-8 text-lg leading-8 text-black">
                    Participants learn what it realistically takes to develop
                    and operate fuel-related businesses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/program"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Back to Programme
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/program/day-8"
                className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
              >
                ← Previous Day
              </Link>

              <Link
                href="/program/day-10"
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
        </div>
      </section>
    </main>
  );
}