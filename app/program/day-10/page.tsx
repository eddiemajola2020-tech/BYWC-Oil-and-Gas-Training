import Link from "next/link";

const focusAreas = [
  {
    title: "Business idea refinement",
    icon: "/d10_icon1.png",
  },
  {
    title: "Market entry pathways",
    icon: "/d10_icon2.png",
  },
  {
    title: "Licensing and Registration Processes",
    icon: "/d10_icon3.png",
  },
  {
    title: "Funding readiness & institutional support",
    icon: "/d10_icon4.png",
  },
  {
    title: "Engagement with public and private sector stakeholders",
    icon: "/d10_icon5.png",
  },
];

export default function DayTenPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
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

      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e3a8a_1px,transparent_0)] [background-size:10px_10px]" />
            </div>

            <div className="relative z-10 px-8 py-10 lg:px-12">
              <div className="mb-8 h-[3px] w-full bg-gradient-to-r from-orange-500 via-orange-500 to-blue-500" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl text-blue-900">▣</div>
                  <h1 className="text-4xl font-black text-blue-900">
                    Day 10
                  </h1>
                </div>

                <img
                  src="/logo_2.png"
                  alt="Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>

              <div className="mx-auto mt-8 max-w-[860px] bg-[#e6e6e6]">
                <div className="bg-blue-900 px-8 py-4">
                  <h2 className="text-xl font-black text-white">
                    Entrepreneurial Activation{" "}
                    <span className="text-orange-400">
                      &amp; Business Readiness
                    </span>
                  </h2>
                </div>

                <div className="px-8 py-8">
                  <p className="text-lg leading-8 text-black">
                    The final masterclass focuses on converting learning into
                    action.
                  </p>

                  <p className="mt-4 text-lg text-black">
                    Focus areas include:
                  </p>

                  <div className="mt-8 grid gap-3 md:grid-cols-5">
                    {focusAreas.map((item) => (
                      <div
                        key={item.title}
                        className="flex min-h-[220px] flex-col items-center bg-blue-900 px-4 py-5 text-center text-white"
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-500">
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="h-12 w-12 object-contain brightness-0 invert"
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

              <div className="mx-auto mt-8 max-w-[860px]">
                <p className="text-lg leading-8 text-black">
                  Participants leave with a clear understanding of their next
                  steps toward enterprise development, employment or incubation
                  pathways.
                </p>

                <img
                  src="/banner_8.png"
                  alt="Graduates holding certificates"
                  className="mt-5 h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/program"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              ← Back to Programme
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/program/day-9"
                className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
              >
                ← Previous Day
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