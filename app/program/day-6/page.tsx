import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "Overview of the Oil And Gas Value Chain",
    icon: "/d6_icon1.png",
  },
  {
    number: "2",
    title: "Crude Oil, Natural Gas, LPG & Refined Fuel Products",
    icon: "/d6_icon2.png",
  },
  {
    number: "3",
    title: "Regional Supply Dynamics And Importation Flows",
    icon: "/d6_icon3.png",
  },
  {
    number: "4",
    title: "Regulatory Landscape & Institutional Stakeholders In Botswana",
    icon: "/d6_icon4.png",
  },
  {
    number: "5",
    title: "Key Compliance Requirements For Operating In The Energy Sector",
    icon: "/d6_icon5.png",
  },
];

export default function DaySixPage() {
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

      {/* PAGE CONTENT */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden px-6 py-6 md:px-8 md:py-10 lg:min-h-[920px] lg:px-14">
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* TOP HEADER */}
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-blue-900 md:text-4xl lg:text-5xl">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                <div className="mt-4 flex items-center justify-between md:mt-8">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl text-blue-900 md:text-4xl">▣</div>

                    <h2 className="text-3xl font-black text-blue-900 md:text-4xl">
                      Day 6
                    </h2>
                  </div>

                  <img
                    src="/logo_2.png"
                    alt="BYWC secondary logo"
                    className="h-10 w-auto object-contain md:hidden"
                  />
                </div>
              </div>

              <img
                src="/logo_2.png"
                alt="BYWC secondary logo"
                className="hidden h-20 w-auto object-contain md:block"
              />
            </div>

            {/* MOBILE IMAGE */}
            <img
              src="/courses/C6.webp"
              alt="Energy sector training participant"
              className="relative z-10 w-full max-h-[360px] object-contain md:hidden"
            />

            {/* LEFT CONTENT BLOCK */}
            <div className="relative z-10 -mt-2 max-w-[720px] bg-[#e6e6e6] pb-8 md:mt-5">
              <div className="bg-blue-900 px-6 py-4 md:px-8">
                <h3 className="text-lg font-black tracking-wide text-white">
                  Energy Sector Foundations{" "}
                  <span className="text-orange-400">
                    &amp; Industry Orientation
                  </span>
                </h3>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="max-w-xl text-base leading-7 text-black md:text-lg">
                  This masterclass introduces participants to the structure and
                  functioning of the Oil, Gas and Fuel economy in Southern
                  Africa and Botswana specifically.
                </p>

                <p className="mt-4 text-base text-black md:text-lg">
                  Focus areas include:
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-8 md:grid-cols-5">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="flex min-h-[170px] flex-col items-center justify-center bg-blue-900 px-4 py-5 text-center text-white md:min-h-[210px]"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-orange-500 md:h-16 md:w-16">
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="h-8 w-8 object-contain brightness-0 invert md:h-9 md:w-9"
                        />
                      </div>

                      <p className="mt-4 text-xs font-medium leading-5 md:mt-5">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP MODEL IMAGE */}
            <img
              src="/courses/C6.webp"
              alt="Energy sector training participant"
              className="hidden md:block absolute bottom-0 right-[-180px] z-20 max-h-[650px] w-auto object-contain lg:right-[-240px] lg:max-h-[720px]"
            />
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
              href="/program/day-5"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Previous Day
            </Link>

            <Link
              href="/program/day-7"
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
