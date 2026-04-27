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
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative min-h-[980px] overflow-hidden px-8 py-10 lg:px-14">
            {/* DOT BACKGROUND */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* TOP LINE */}
            <div className="absolute left-10 top-4 h-[3px] w-[500px] bg-gradient-to-r from-orange-500 to-blue-500" />

            {/* HEADER */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-4xl text-blue-900">▣</div>

                  <h2 className="text-4xl font-black text-blue-900">
                    Day 8
                  </h2>
                </div>
              </div>

              <img
                src="/logo_2.png"
                alt="Logo"
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* MAIN GREY BOX */}
            <div className="relative z-10 mt-8 bg-[#e6e6e6] pb-10">
              {/* TITLE BAR */}
              <div className="bg-blue-900 px-8 py-4">
                <h3 className="text-lg font-black text-white">
                  LPG &amp; Clean Cooking{" "}
                  <span className="text-orange-400">
                    Business Pathways
                  </span>
                </h3>
              </div>

              <div className="px-8 py-6">
                <p className="max-w-3xl text-lg leading-7 text-black">
                  This masterclass explores Liquefied Petroleum Gas and clean
                  cooking as Growth sectors within Botswana’s and international
                  energy access agenda.
                </p>

                <p className="mt-4 text-lg text-black">
                  Focus areas include:
                </p>

                {/* CONTENT LAYOUT */}
                <div className="mt-8 grid grid-cols-[1fr_1.6fr] gap-6">
                  {/* LEFT SMALL BOXES */}
                  <div className="grid grid-cols-2 gap-3">
                    {focusAreas.slice(0, 4).map((item) => (
                      <div
                        key={item.title}
                        className="flex min-h-[170px] flex-col items-center justify-center bg-blue-900 px-4 py-5 text-center text-white"
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-500">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-12 w-12 object-contain brightness-0 invert"
                          />
                        </div>

                        <p className="mt-5 text-sm font-medium leading-5">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* BIG FEATURE CARD */}
                  <div className="relative rounded-[28px] bg-blue-900 px-10 py-10 text-white">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500">
                      <img
                        src={focusAreas[4].icon}
                        alt={focusAreas[4].title}
                        className="h-16 w-16 object-contain brightness-0 invert"
                      />
                    </div>

                    <h3 className="mt-8 max-w-[260px] text-3xl font-medium leading-tight">
                      Community-based LPG business Opportunities
                    </h3>

                    <div className="mt-6 h-[4px] w-28 bg-orange-500" />

                    {/* PERSON IMAGE */}
                    <img
                      src="/courses/C8.png"
                      alt="LPG business participant"
                      className="absolute bottom-0 right-[-60px] z-20 max-h-[620px] w-auto object-contain lg:right-[-90px] lg:max-h-[720px]"
                    />
                  </div>
                </div>

                {/* BOTTOM TEXT */}
                <p className="mt-8 max-w-xl text-lg leading-7 text-black">
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