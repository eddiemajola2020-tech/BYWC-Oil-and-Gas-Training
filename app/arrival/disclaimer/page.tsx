import Link from "next/link";

const sections = [
  {
    title: "Acknowledgement of Risk",
    body:
      "Participation may involve exposure to oil, gas, LPG, logistics, industrial safety, hazardous materials training, fire safety demonstrations, emergency response simulations, CPR and first aid practical exercises, safety equipment, physical drills and related programme activities. These activities may carry risks including injury, smoke exposure, burns, slips, falls, allergic reactions, respiratory complications, emotional stress, equipment-related incidents and other unforeseen risks.",
  },
  {
    title: "Voluntary Participation",
    body:
      "You confirm that your participation is voluntary, that you are participating at your own risk, and that you will disclose any medical condition, disability, injury, allergy or limitation that may affect your safe participation.",
  },
  {
    title: "Safety Rules and Conduct",
    body:
      "You agree to follow lawful instructions from trainers, safety officers and programme officials, wear required PPE, observe safety and emergency protocols, avoid reckless or disruptive conduct, and report unsafe conditions, injuries or incidents immediately.",
  },
  {
    title: "Attendance and Personal Responsibility",
    body:
      "The programme operates within scheduled training hours, designated venues, accommodation facilities and officially supervised activities. You remain responsible for personal movements, private conduct, unauthorized travel, missing sessions, unlawful conduct, or activities outside official programme supervision.",
  },
  {
    title: "Release and Limitation of Liability",
    body:
      "To the fullest extent permitted under Botswana law, you acknowledge the inherent risks of participation and release the organisers from liability for ordinary accidents or injuries arising from known training risks, except where liability cannot lawfully be excluded.",
  },
  {
    title: "Medical Consent",
    body:
      "In the event of injury or medical emergency, you authorize the organisers to obtain emergency medical assistance on your behalf where reasonably necessary. Medical costs may become your responsibility unless otherwise required by law.",
  },
  {
    title: "Accommodation, Meals and Property",
    body:
      "Accommodation and meals are provided as part of the sponsored initiative and remain subject to programme rules. You remain responsible for valuables, money, electronic devices, travel documents, conduct and personal safety outside supervised programme activities.",
  },
  {
    title: "Media Consent",
    body:
      "Photographs, videos and media content may be captured during the programme for lawful promotional, educational, reporting and documentation purposes connected to the programme and its partners. You consent to use of your image, voice and likeness for such purposes unless you formally withdraw consent in writing before participation.",
  },
  {
    title: "No Guarantee of Employment or Funding",
    body:
      "The programme is educational and training-based. Participation does not guarantee employment, business funding, licensing approval or commercial opportunities.",
  },
  {
    title: "Governing Law",
    body:
      "This waiver and agreement is governed by the laws of the Republic of Botswana and any dispute shall be subject to the jurisdiction of Botswana courts.",
  },
];

export default function ArrivalDisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#eef1f7] px-4 py-8 text-slate-900 lg:px-10">
      <section className="mx-auto max-w-4xl rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:rounded-[40px] lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">
          BYWC Oil & Gas Training Programme 2026
        </p>

        <h1 className="mt-4 text-4xl font-black text-blue-950 lg:text-5xl">
          Participant Waiver & Code of Conduct
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-600">
          This page summarizes the BYWC Participant Waiver, Release of Liability,
          Assumption of Risk and Code of Conduct Agreement. Read it carefully
          before accepting the waiver on the arrival registration page.
        </p>

        <div className="mt-8 space-y-5">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                Section {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-black text-blue-950">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border border-orange-200 bg-orange-50 p-5">
          <h2 className="text-xl font-black text-blue-950">
            Declaration
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            By accepting the waiver during arrival registration, you confirm that
            you have read and understood the agreement, understand the nature and
            risks of the programme, had the opportunity to seek independent
            advice if you wished to do so, and accept freely and voluntarily.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/arrival?event=BYWC-ARRIVAL-2026"
            className="rounded-full bg-blue-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
          >
            Return to Arrival Registration
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-blue-950 px-6 py-3 text-sm font-bold text-blue-950 transition hover:bg-blue-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
