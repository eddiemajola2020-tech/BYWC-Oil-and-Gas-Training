import Link from "next/link";

const focusAreas = [
  {
    title: "LPG Supply Chains & Market Structures",
    icon: "/d8_icon1.png",
  },
  {
    title: "Clean Cooking Initiatives and National Policy Direction",
    icon: "/d8_icon2.png",
  },
  {
    title: "LPG Refill Sites, Safety Compliance and Licensing",
    icon: "/d8_icon3.png",
  },
  {
    title: "LPG Marketing, Pricing and Customer Models",
    icon: "/d8_icon4.png",
  },
  {
    title: "Community-based LPG Business Opportunities",
    icon: "/d8_icon5.png",
  },
];

export default function DayEightPage() {
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

      {/* PAGE */}
      <section className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden px-6 py-6 md:min-h-[980px] md:px-8 md:py-10 lg:px-14">
            {/* DOT BACKGROUND */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* TOP LINE */}
            <div className="absolute left-6 top-3 h-[3px] w-[220px] bg-gradient-to-r from-orange-500 to-blue-500 md:left-10 md:top-4 md:w-[500px]" />

            {/* HEADER */}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="pt-4">
                <div className="flex items-center justify-between gap-4 md:block">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl text-blue-900 md:text-4xl">▣</div>

                    <h2 className="text-3xl font-black text-blue-900 md:text-4xl">
                      Day 8
                    </h2>
                  </div>

                  <img
                    src="/logo_2.png"
                    alt="Logo"
                    className="h-10 w-auto object-contain md:hidden"
                  />
                </div>
              </div>

              <img
                src="/logo_2.png"
                alt="Logo"
                className="hidden h-20 w-auto object-contain md:block"
              />
            </div>

            {/* MOBILE PERSON IMAGE - FLUSH ABOVE CONTENT */}
            <img
              src="/courses/C8.WEBP"
              alt="LPG business participant"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            {/* MAIN GREY BOX */}
            <div className="relative z-10 -mt-2 bg-[#e6e6e6] pb-8 md:mt-8 md:pb-10">
              {/* TITLE BAR */}
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black text-white">
                  LPG &amp; Clean Cooking{" "}
                  <span className="text-orange-400">
                    Business Pathways
                  </span>
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="max-w-3xl text-base leading-7 text-black md:text-lg">
                  This masterclass explores Liquefied Petroleum Gas and clean
                  cooking as Growth sectors within Botswana’s and international
                  energy access agenda.
                </p>

                <p className="mt-4 text-base text-black md:text-lg">
                  Focus areas include:
                </p>

                {/* CONTENT LAYOUT */}
                <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-[1fr_1.6fr] md:gap-6">
                  {/* LEFT SMALL BOXES */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {focusAreas.slice(0, 4).map((item) => (
                      <div
                        key={item.title}
                        className="flex min-h-[150px] flex-col items-center justify-center bg-blue-900 px-4 py-5 text-center text-white md:min-h-[170px]"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500 md:h-20 md:w-20">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-9 w-9 object-contain brightness-0 invert md:h-12 md:w-12"
                          />
                        </div>

                        <p className="mt-4 text-sm font-medium leading-5 md:mt-5">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* BIG FEATURE CARD */}
                  <div className="relative overflow-hidden rounded-[24px] bg-blue-900 px-6 py-8 text-white md:rounded-[28px] md:px-10 md:py-10">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-500 md:h-28 md:w-28">
                      <img
                        src={focusAreas[4].icon}
                        alt={focusAreas[4].title}
                        className="h-12 w-12 object-contain brightness-0 invert md:h-16 md:w-16"
                      />
                    </div>

                    <h3 className="mt-6 max-w-[320px] text-2xl font-medium leading-tight md:mt-8 md:max-w-[260px] md:text-3xl">
                      Community-based LPG business Opportunities
                    </h3>

                    <div className="mt-6 h-[4px] w-28 bg-orange-500" />

                    {/* DESKTOP PERSON IMAGE */}
                    <img
                      src="/courses/C8.webp"
                      alt="LPG business participant"
                      className="hidden md:block absolute bottom-0 right-[-60px] z-20 max-h-[620px] w-auto object-contain lg:right-[-90px] lg:max-h-[720px]"
                    />
                  </div>
                </div>

                {/* BOTTOM TEXT */}
                <p className="mt-8 max-w-xl text-base leading-7 text-black md:text-lg">
                  This day highlights LPG as a practical entry point for youth,
                  women, citizen led enterprises.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/program"
            className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
          >
            ← Back to Programme
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/program/day-7"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Previous Day
            </Link>

            <Link
              href="/program/day-9"
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
