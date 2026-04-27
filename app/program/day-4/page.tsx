import Link from "next/link";

const focusAreas = [
  {
    number: "1",
    title: "Identification, Classification & Labelling Of Hazardous Substances",
    icon: "/d4_icon1.png",
  },
  {
    number: "2",
    title: "Risk Assessment Methodologies",
    icon: "/d4_icon2.png",
  },
  {
    number: "3",
    title: "Legislative & Regulatory Frameworks Governing Hazardous Materials",
    icon: "/d4_icon3.png",
  },
  {
    number: "4",
    title: "Operational Control Measures And Safe Handling Procedures",
    icon: "/d4_icon4.png",
  },
  {
    number: "5",
    title: "Emergency Response Planning And Incident Management",
    icon: "/d4_icon5.png",
  },
];

export default function DayFourPage() {
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

      {/* PAGE CONTENT */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="relative min-h-[900px] overflow-hidden px-8 py-10 lg:px-14">
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            {/* TOP HEADER */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-blue-900 lg:text-5xl">
                  Ten-Day Masterclass
                  <br />
                  <span className="text-orange-500">Training Structure</span>
                </h1>

                <div className="mt-8 flex items-center gap-3">
                  <div className="text-4xl text-blue-900">▣</div>

                  <h2 className="text-4xl font-black text-blue-900">
                    Day 4
                  </h2>
                </div>
              </div>

              <img
                src="/logo_2.png"
                alt="BYWC secondary logo"
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* MAIN CONTENT BLOCK */}
            <div className="relative z-10 mt-5 max-w-[720px] bg-[#e6e6e6] pb-8">
              <div className="bg-blue-900 px-8 py-4">
                <h3 className="text-lg font-black uppercase tracking-wide text-white">
                  Hazardous Materials Management
                </h3>
              </div>

              <div className="px-8 py-6">
                <p className="max-w-xl text-lg leading-7 text-black">
                  This session addresses the safe handling and control of
                  hazardous substances commonly encountered in energy, fuel and
                  industrial operations.
                </p>

                <p className="mt-4 text-lg text-black">
                  Focus areas include:
                </p>

                <div className="mt-6 space-y-2">
                  {focusAreas.map((item) => (
                    <div
                      key={item.number}
                      className="grid min-h-[92px] grid-cols-[80px_1px_82px_1fr] items-center bg-blue-900 px-6 text-white"
                    >
                      <div className="text-6xl font-black leading-none">
                        {item.number}
                      </div>

                      <div className="h-16 w-[3px] bg-orange-500" />

                      <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-10 w-10 object-contain brightness-0 invert"
                          />
                        </div>
                      </div>

                      <p className="pl-5 text-base font-medium leading-tight">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODEL IMAGE */}
            <img
              src="/courses/C4.png"
              alt="Hazardous materials management participant"
              className="absolute bottom-0 right-[-80px] z-20 max-h-[680px] w-auto object-contain lg:right-[-120px] lg:max-h-[760px]"
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
              href="/program/day-3"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Previous Day
            </Link>

            <Link
              href="/program/day-5"
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