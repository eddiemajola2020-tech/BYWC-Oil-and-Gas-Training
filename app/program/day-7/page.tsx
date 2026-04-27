import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "Fuel Transportation And Distribution Systems",
    icon: "/d7_icon1.png",
  },
  {
    number: "2",
    title: "Storage, Handling And Depot Operations",
    icon: "/d7_icon2.png",
  },
  {
    number: "3",
    title: "Supply Chain Planning And Delivery Coordination",
    icon: "/d7_icon3.png",
  },
  {
    number: "4",
    title: "Logistics Safety, Compliance And Risk Control",
    icon: "/d7_icon4.png",
  },
  {
    number: "5",
    title: "Operational Requirements For Fuel Distribution Businesses",
    icon: "/d7_icon5.png",
  },
];

export default function DaySevenPage() {
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
              {/* HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-blue-900 lg:text-5xl">
                    Ten-Day Masterclass
                    <br />
                    <span className="text-orange-500">
                      Training Structure
                    </span>
                  </h1>

                  <div className="mt-8 flex items-center gap-3">
                    <div className="text-4xl text-blue-900">▣</div>

                    <h2 className="text-4xl font-black text-blue-900">
                      Day 7
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
              <div className="mx-auto mt-8 max-w-[760px] bg-[#e6e6e6]">
                {/* BANNER IMAGE */}
                <img
                  src="/banner_6.png"
                  alt="Fuel logistics and distribution"
                  className="h-[280px] w-full object-cover object-center"
                />

                {/* BLUE TITLE BAR */}
                <div className="bg-blue-900 px-8 py-4">
                  <h3 className="text-xl font-black text-white">
                    Fuel Logistics{" "}
                    <span className="text-orange-400">
                      &amp; Distribution
                    </span>
                  </h3>
                </div>

                {/* CONTENT */}
                <div className="px-8 py-8">
                  <p className="text-lg leading-8 text-black">
                    This masterclass introduces participants to the movement,
                    storage and distribution systems that support the fuel and
                    energy supply chain.
                  </p>

                  <p className="mt-5 text-lg text-black">
                    Focus areas include:
                  </p>

                  {/* ICON GRID */}
                  <div className="mt-8 grid gap-3 md:grid-cols-5">
                    {focusAreas.map((item) => (
                      <div
                        key={item.number}
                        className="flex min-h-[220px] flex-col items-center bg-blue-900 px-4 py-5 text-center text-white"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-9 w-9 object-contain brightness-0 invert"
                          />
                        </div>

                        <p className="mt-5 text-xs font-medium leading-5">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
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
                href="/program/day-6"
                className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
              >
                ← Previous Day
              </Link>

              <Link
                href="/program/day-8"
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