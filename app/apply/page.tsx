"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabaseClient";

type FormData = {
  firstName: string;
  lastName: string;
  omang: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  citizenship: string;
  phone: string;
  email: string;
  disabilityStatus: string;
  disabilityType: string;
  disabilityProofFile: string;
  constituency: string;
  district: string;
  address: string;

  highestQualification: string;
  examinationBody: string;
  bgcseLevel: string;
  bgcsePoints: string;
  schoolName: string;
  yearCompleted: string;
  preferredLanguage: string;
  englishComfort: string;
  tertiaryEducation: string;
  tertiaryInstitution: string;
  fieldOfStudy: string;

  employmentStatus: string;
  occupation: string;
  businessExperience: string;
  interestArea: string;

  motivation: string;
  postProgramPlan: string;

  omangFile: string;
  cvFile: string;
  certificateFile: string;

  declarationAccepted: boolean;
  consentAccepted: boolean;
};

type UploadingState = {
  omangFile: boolean;
  cvFile: boolean;
  certificateFile: boolean;
  disabilityProofFile: boolean;
};

const constituencies = [
  "Okavango West",
  "Okavango East",
  "Ngami",
  "Maun North",
  "Maun East",
  "Maun West",
  "Chobe",
  "Nata-Gweta",
  "Nkange",
  "Shashe West",
  "Tati West",
  "Tati East",
  "Francistown West",
  "Francistown South",
  "Francistown East",
  "Tonota",
  "Boteti East",
  "Ghanzi North",
  "Ghanzi South",
  "Kgalagadi North",
  "Kgalagadi South",
  "Serowe North",
  "Serowe West",
  "Serowe South",
  "Shoshong",
  "Mahalapye West",
  "Mahalapye East",
  "Lerala-Maunatlala",
  "Palapye",
  "Mmadinare",
  "Bobonong",
  "Selebi Phikwe West",
  "Selebi Phikwe East",
  "Kgatleng West",
  "Kgatleng Central",
  "Kgatleng East",
  "Boteti West",
  "Boteti South",
  "Letlhakeng",
  "Takatokwane",
  "Jwaneng-Mabutsane",
  "Molepolole North",
  "Molepolole South",
  "Thamaga-Kumakwane",
  "Mmopane-Metsimotlhabe",
  "Lentsweletau",
  "Mogoditshane West",
  "Mogoditshane East",
  "Gaborone North",
  "Gaborone Central",
  "Gaborone North West",
  "Gaborone South",
  "Gaborone Bonnington North",
  "Gaborone Bonnington South",
  "Tlokweng-Mmokolodi",
  "Ramotswa",
  "Lobatse",
  "Goodhope-Mmathethe",
  "Kanye North",
  "Kanye South",
  "Moshupa-Manyana",
];

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  omang: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  citizenship: "Botswana",
  phone: "",
  email: "",
  disabilityStatus: "",
  disabilityType: "",
  disabilityProofFile: "",
  constituency: "",
  district: "",
  address: "",

  highestQualification: "",
  examinationBody: "",
  bgcseLevel: "",
  bgcsePoints: "",
  schoolName: "",
  yearCompleted: "",
  preferredLanguage: "",
  englishComfort: "",
  tertiaryEducation: "",
  tertiaryInstitution: "",
  fieldOfStudy: "",

  employmentStatus: "",
  occupation: "",
  businessExperience: "",
  interestArea: "",

  motivation: "",
  postProgramPlan: "",

  omangFile: "",
  cvFile: "",
  certificateFile: "",

  declarationAccepted: false,
  consentAccepted: false,
};

const steps = [
  "Personal Info",
  "Education",
  "Background",
  "Motivation",
  "Documents",
  "Review",
];

export default function ApplyPage() {
 const [loggedInEmail, setLoggedInEmail] = useState("");
const [authChecked, setAuthChecked] = useState(false);
const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [constituencyQuery, setConstituencyQuery] = useState("");
  const [showConstituencyResults, setShowConstituencyResults] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploading, setUploading] = useState<UploadingState>({
    omangFile: false,
    cvFile: false,
    certificateFile: false,
    disabilityProofFile: false,
  });

  const constituencyBoxRef = useRef<HTMLDivElement | null>(null);
  const applicationSectionRef = useRef<HTMLElement | null>(null);

  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep]);

  const filteredConstituencies = useMemo(() => {
    const query = constituencyQuery.trim().toLowerCase();

    if (!query) {
      return constituencies.slice(0, 10);
    }

    return constituencies.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [constituencyQuery]);

  useEffect(() => {
  let redirectTimer: ReturnType<typeof setTimeout>;

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.email) {
      setLoggedInEmail(session.user.email);

      setFormData((prev) => ({
        ...prev,
        email: session.user.email || "",
      }));

      setAuthChecked(true);
      return;
    }

    redirectTimer = setTimeout(async () => {
      const {
        data: { session: delayedSession },
      } = await supabase.auth.getSession();

      if (delayedSession?.user?.email) {
        setLoggedInEmail(delayedSession.user.email);

        setFormData((prev) => ({
          ...prev,
          email: delayedSession.user.email || "",
        }));

        setAuthChecked(true);
        return;
      }

      window.location.href = "/login?redirect=/apply#application-form";
    }, 1200);
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.email) {
      clearTimeout(redirectTimer);

      setLoggedInEmail(session.user.email);

      setFormData((prev) => ({
        ...prev,
        email: session.user.email || "",
      }));

      setAuthChecked(true);
    }
  });

  checkSession();

  return () => {
    clearTimeout(redirectTimer);
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        constituencyBoxRef.current &&
        !constituencyBoxRef.current.contains(event.target as Node)
      ) {
        setShowConstituencyResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "dateOfBirth") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: age ? String(age) : "",
      }));
      return;
    }

    if (name === "employmentStatus") {
      setFormData((prev) => ({
        ...prev,
        employmentStatus: value,
        occupation:
          value === "Unemployed"
            ? "Not applicable"
            : prev.occupation === "Not applicable"
            ? ""
            : prev.occupation,
      }));
      return;
    }

    if (name === "disabilityStatus") {
      setFormData((prev) => ({
        ...prev,
        disabilityStatus: value,
        disabilityType: value === "Yes" ? prev.disabilityType : "",
        disabilityProofFile: value === "Yes" ? prev.disabilityProofFile : "",
      }));
      return;
    }

    if (name === "bgcsePoints") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        bgcsePoints: numericValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName:
      | "omangFile"
      | "cvFile"
      | "certificateFile"
      | "disabilityProofFile"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("fieldName", fieldName);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: result.filePath,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
      e.target.value = "";
    }
  }

  function calculateAge(dateString: string) {
    if (!dateString) return "";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : "";
  }

  function scrollToApplicationSection() {
    applicationSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setTimeout(scrollToApplicationSection, 80);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setTimeout(scrollToApplicationSection, 80);
    }
  }

  function selectConstituency(value: string) {
    setFormData((prev) => ({
      ...prev,
      constituency: value,
    }));
    setConstituencyQuery(value);
    setShowConstituencyResults(false);
  }

  function handleStepClick(index: number) {
    setCurrentStep(index);
    setTimeout(scrollToApplicationSection, 80);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user?.email) {
      alert("Please log in first.");
      window.location.href = "/login?redirect=/apply#application-form";
      return;
    }

    const newApplication = {
      application_id: `BYWC-${new Date().getFullYear()}-${Date.now()}`,
      submitted_at: new Date().toISOString(),
      status: "Submitted",

      first_name: formData.firstName,
      last_name: formData.lastName,
      omang: formData.omang,
      date_of_birth: formData.dateOfBirth,
      age: formData.age,
      gender: formData.gender,
      citizenship: formData.citizenship,
      phone: formData.phone,
      email: user.email,

      disability_status: formData.disabilityStatus,
      disability_type: formData.disabilityType,
      disability_proof_file: formData.disabilityProofFile,

      constituency: formData.constituency,
      district: formData.district,
      address: formData.address,

      highest_qualification: formData.highestQualification,
      examination_body: formData.examinationBody,
      bgcse_level: formData.bgcseLevel,
      bgcse_points: formData.bgcsePoints,
      school_name: formData.schoolName,
      year_completed: formData.yearCompleted,
      preferred_language: formData.preferredLanguage,
      english_comfort: formData.englishComfort,

      tertiary_education: formData.tertiaryEducation,
      tertiary_institution: formData.tertiaryInstitution,
      field_of_study: formData.fieldOfStudy,

      employment_status: formData.employmentStatus,
      occupation: formData.occupation,
      business_experience: formData.businessExperience,
      interest_area: formData.interestArea,

      motivation: formData.motivation,
      post_program_plan: formData.postProgramPlan,

      omang_file: formData.omangFile,
      cv_file: formData.cvFile,
      certificate_file: formData.certificateFile,

      declaration_accepted: formData.declarationAccepted,
      consent_accepted: formData.consentAccepted,
    };

    const { error } = await supabase
      .from("applications")
      .insert([newApplication]);

    if (error) {
      console.error("Supabase submit error:", error);
      alert(error.message);
      return;
    }

    setShowSuccessModal(true);
  }
  if (!authChecked) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6 text-center">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-950">
          Checking your login...
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Please hold on while we confirm your account.
        </p>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link href="/home" className="hover:text-blue-900">
              Home
            </Link>

            <Link href="/program" className="hover:text-blue-900">
              Program
            </Link>

            <Link href="/apply" className="text-blue-900">
              Apply
            </Link>

            <Link href="/dashboard" className="hover:text-blue-900">
              Dashboard
            </Link>

            <a href="#contact" className="hover:text-blue-900">
              Contacts
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="rounded-full px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50"
            >
              Back Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-6 pt-8 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden rounded-[32px]">
              <img
                src="/banner_3.png"
                alt="Apply banner"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
            </div>
          </div>

          <div className="pt-12 text-center">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Application Portal
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-blue-950 md:text-5xl lg:text-6xl">
              Apply for the BYWC{" "}
              <span className="text-orange-600">
                Oil &amp; Gas Training Program
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-600">
              Complete your application carefully. You’ll be guided through each
              section step by step, including your personal information,
              education, background, motivation, and supporting documents.
            </p>
          </div>
        </div>
      </section>

      <section
        id="application-form"
        ref={applicationSectionRef}
        className="mx-auto max-w-7xl scroll-mt-28 px-6 py-10 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Progress
            </p>
            <h2 className="mt-3 text-2xl font-bold text-blue-950">
              Your Application
            </h2>

            <div className="mt-6 h-3 w-full rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </p>

            <div className="mt-8 space-y-3">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleStepClick(index)}
                    className={`block w-full rounded-2xl border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-blue-900 bg-blue-50"
                        : isCompleted
                        ? "border-orange-200 bg-orange-50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold ${
                          isActive
                            ? "text-blue-950"
                            : isCompleted
                            ? "text-orange-700"
                            : "text-slate-600"
                        }`}
                      >
                        {step}
                      </p>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-blue-900 text-white"
                            : isCompleted
                            ? "bg-orange-500 text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
  {/* Mobile Progress Bar Only */}
  <div className="mb-6 block lg:hidden">
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-3 rounded-full bg-orange-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>

    <p className="mt-3 text-sm font-semibold text-slate-600">
      Step {currentStep + 1} of {steps.length}
    </p>
  </div>

  {/* Logged In Box */}
  <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
    Logged in as: <span className="font-bold">{loggedInEmail}</span>
  </div>

  <form onSubmit={handleSubmit}>
              {currentStep === 0 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Personal Information
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Enter your personal and contact details as they appear on
                    your official records.
                  </p>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Omang / ID Number"
                      name="omang"
                      value={formData.omang}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      readOnly
                    />
                    <Select
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      options={["Select gender", "Male", "Female"]}
                    />
                    <Input
                      label="Citizenship"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />

                    <Select
                      label="Do you have a disability?"
                      name="disabilityStatus"
                      value={formData.disabilityStatus}
                      onChange={handleInputChange}
                      options={["Select option", "Yes", "No"]}
                    />

                    {formData.disabilityStatus === "Yes" && (
                      <>
                        <Input
                          label="Please specify disability / accessibility support needed"
                          name="disabilityType"
                          value={formData.disabilityType}
                          onChange={handleInputChange}
                        />

                        <FileUploadCard
                          label="Proof of Disability"
                          helper="Accepted formats: PDF, JPG, PNG"
                          fileName={formData.disabilityProofFile}
                          inputId="disability-proof-upload"
                          isUploading={uploading.disabilityProofFile}
                          onFileChange={(e) =>
                            handleFileUpload(e, "disabilityProofFile")
                          }
                        />
                      </>
                    )}

                    <Input
                      label="District / Town / Village"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mt-6" ref={constituencyBoxRef}>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Constituency
                      </span>

                      <input
                        type="text"
                        value={constituencyQuery}
                        onChange={(e) => {
                          setConstituencyQuery(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            constituency: e.target.value,
                          }));
                          setShowConstituencyResults(true);
                        }}
                        onFocus={() => setShowConstituencyResults(true)}
                        placeholder="Start typing your constituency name"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Start typing to search instead of scrolling through all
                        61 constituencies.
                      </p>

                      {showConstituencyResults && (
                        <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                          {filteredConstituencies.length > 0 ? (
                            filteredConstituencies.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => selectConstituency(item)}
                                className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                              >
                                {item}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-500">
                              No matching constituency found
                            </div>
                          )}
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="mt-6">
                    <TextArea
                      label="Physical Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </section>
              )}

              {currentStep === 1 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Education
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Provide your academic background and preferred training
                    language.
                  </p>

                  <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <h4 className="text-lg font-bold text-blue-950">
                      Secondary Education
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      This section captures your core academic background.
                    </p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <Select
                        label="Highest Qualification"
                        name="highestQualification"
                        value={formData.highestQualification}
                        onChange={handleInputChange}
                        options={[
                          "Select qualification",
                          "BGCSE",
                          "IGCSE",
                          "Certificate",
                          "Diploma",
                          "Degree",
                          "Postgraduate",
                          "Other",
                        ]}
                      />
                      <Select
                        label="Examination Body"
                        name="examinationBody"
                        value={formData.examinationBody}
                        onChange={handleInputChange}
                        options={[
                          "Select examination body",
                          "BGCSE",
                          "IGCSE",
                          "Other",
                        ]}
                      />
                      <Input
                        label="Minimum BGCSE / IGCSE Level"
                        name="bgcseLevel"
                        value={formData.bgcseLevel}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="BGCSE / IGCSE Points"
                        name="bgcsePoints"
                        type="number"
                        value={formData.bgcsePoints}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="School Name"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Year Completed"
                        name="yearCompleted"
                        value={formData.yearCompleted}
                        onChange={handleInputChange}
                      />
                      <Select
                        label="Preferred Training Language"
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleInputChange}
                        options={[
                          "Select preferred language",
                          "English",
                          "Setswana",
                        ]}
                      />
                      <Select
                        label="Are you comfortable learning and participating in English?"
                        name="englishComfort"
                        value={formData.englishComfort}
                        onChange={handleInputChange}
                        options={["Select option", "Yes", "No"]}
                      />
                    </div>

                    <p className="mt-5 text-xs leading-6 text-slate-500">
                      The training programme is delivered primarily in English.
                      Preferred language is used for eligibility screening and
                      administration planning.
                    </p>
                  </div>

                  <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
                    <h4 className="text-lg font-bold text-blue-950">
                      Tertiary / Additional Study
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      Fill this in only if you have further education beyond
                      BGCSE / IGCSE.
                    </p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <Input
                        label="Tertiary Qualification (Optional)"
                        name="tertiaryEducation"
                        value={formData.tertiaryEducation}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Institution Name (Optional)"
                        name="tertiaryInstitution"
                        value={formData.tertiaryInstitution}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mt-6">
                      <TextArea
                        label="Field of Study / Additional Details (Optional)"
                        name="fieldOfStudy"
                        value={formData.fieldOfStudy}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </div>
                </section>
              )}

              {currentStep === 2 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Background
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Help us understand your current work background and area of
                    interest.
                  </p>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Select
                      label="Employment Status"
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                      options={[
                        "Select employment status",
                        "Employed",
                        "Self-employed",
                        "Unemployed",
                        "Student",
                        "Graduate",
                        "Internship Seeking",
                        "Informal Business Owner",
                        "Youth Entrepreneur",
                      ]}
                    />

                    <Input
                      label="Current Occupation / Main Activity"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                    />

                    <Select
                      label="Have You Run a Business Before?"
                      name="businessExperience"
                      value={formData.businessExperience}
                      onChange={handleInputChange}
                      options={["Select option", "Yes", "No"]}
                    />

                    <div>
                      <Select
                        label="Primary Interest Area"
                        name="interestArea"
                        value={formData.interestArea}
                        onChange={handleInputChange}
                        options={[
                          "Select your main interest",
                          "LPG",
                          "Fuel Retail",
                          "Logistics",
                          "Clean Cooking",
                          "Entrepreneurship",
                          "Compliance / Safety",
                          "Oil & Gas Operations",
                          "Emergency Response",
                          "Not sure yet",
                        ]}
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        This helps us understand participant interest for
                        research and planning. You will still complete the full
                        10-day programme covering all core areas.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {currentStep === 3 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Motivation
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Tell us why you want to join the program and what you hope
                    to do afterward.
                  </p>

                  <div className="mt-8 space-y-6">
                    <TextArea
                      label="Why do you want to join this program?"
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      rows={6}
                    />
                    <TextArea
                      label="What do you hope to do after completing the program?"
                      name="postProgramPlan"
                      value={formData.postProgramPlan}
                      onChange={handleInputChange}
                      rows={6}
                    />
                  </div>
                </section>
              )}

              {currentStep === 4 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Documents
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Attach the required supporting documents for your
                    application.
                  </p>

                  {uploadError && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {uploadError}
                    </div>
                  )}

                  <div className="mt-8 grid gap-6">
                    <FileUploadCard
                      label="Omang / ID Copy"
                      helper="Accepted formats: PDF, JPG, PNG"
                      fileName={formData.omangFile}
                      inputId="omang-upload"
                      isUploading={uploading.omangFile}
                      onFileChange={(e) => handleFileUpload(e, "omangFile")}
                    />

                    <FileUploadCard
                      label="Curriculum Vitae (CV)"
                      helper="Accepted formats: PDF, DOC, DOCX"
                      fileName={formData.cvFile}
                      inputId="cv-upload"
                      isUploading={uploading.cvFile}
                      onFileChange={(e) => handleFileUpload(e, "cvFile")}
                    />

                    {formData.disabilityStatus === "Yes" && (
                      <FileUploadCard
                        label="Proof of Disability"
                        helper="Accepted formats: PDF, JPG, PNG"
                        fileName={formData.disabilityProofFile}
                        inputId="disability-proof-upload-documents"
                        isUploading={uploading.disabilityProofFile}
                        onFileChange={(e) =>
                          handleFileUpload(e, "disabilityProofFile")
                        }
                      />
                    )}

                    <FileUploadCard
                      label="Certificates / Results Slip"
                      helper="Attach your BGCSE / IGCSE certificate or results slip"
                      fileName={formData.certificateFile}
                      inputId="certificate-upload"
                      isUploading={uploading.certificateFile}
                      onFileChange={(e) =>
                        handleFileUpload(e, "certificateFile")
                      }
                    />
                  </div>
                </section>
              )}

              {currentStep === 5 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Review &amp; Submit
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Review your details before submitting your application.
                  </p>

                  <div className="mt-8 grid gap-6">
                    <ReviewCard
                      title="Personal Information"
                      items={[
                        [
                          "Full Name",
                          `${formData.firstName} ${formData.lastName}`,
                        ],
                        ["Omang / ID", formData.omang],
                        ["Date of Birth", formData.dateOfBirth],
                        ["Age", formData.age],
                        ["Gender", formData.gender],
                        ["Citizenship", formData.citizenship],
                        ["Phone", formData.phone],
                        ["Email", loggedInEmail || formData.email],
                        ["Disability Status", formData.disabilityStatus],
                        [
                          "Disability / Accessibility Support",
                          formData.disabilityType,
                        ],
                        ["Proof of Disability", formData.disabilityProofFile],
                        ["Constituency", formData.constituency],
                        ["District", formData.district],
                        ["Address", formData.address],
                      ]}
                    />

                    <ReviewCard
                      title="Education"
                      items={[
                        [
                          "Highest Qualification",
                          formData.highestQualification,
                        ],
                        ["Examination Body", formData.examinationBody],
                        ["Minimum BGCSE / IGCSE Level", formData.bgcseLevel],
                        ["BGCSE / IGCSE Points", formData.bgcsePoints],
                        ["School Name", formData.schoolName],
                        ["Year Completed", formData.yearCompleted],
                        [
                          "Preferred Training Language",
                          formData.preferredLanguage,
                        ],
                        ["English Comfort", formData.englishComfort],
                        [
                          "Tertiary Qualification",
                          formData.tertiaryEducation,
                        ],
                        ["Institution", formData.tertiaryInstitution],
                        ["Field of Study", formData.fieldOfStudy],
                      ]}
                    />

                    <ReviewCard
                      title="Background"
                      items={[
                        ["Employment Status", formData.employmentStatus],
                        [
                          "Current Occupation / Main Activity",
                          formData.occupation,
                        ],
                        ["Business Experience", formData.businessExperience],
                        ["Interest Area", formData.interestArea],
                      ]}
                    />

                    <ReviewCard
                      title="Motivation"
                      items={[
                        ["Why Join", formData.motivation],
                        ["Post Program Plan", formData.postProgramPlan],
                      ]}
                    />

                    <ReviewCard
                      title="Documents"
                      items={[
                        ["Omang / ID Copy", formData.omangFile],
                        ["CV", formData.cvFile],
                        ["Proof of Disability", formData.disabilityProofFile],
                        [
                          "Certificates / Results Slip",
                          formData.certificateFile,
                        ],
                      ]}
                    />

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="declarationAccepted"
                          checked={formData.declarationAccepted}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-slate-700">
                          I declare that the information provided in this
                          application is true and correct to the best of my
                          knowledge.
                        </span>
                      </label>

                      <label className="mt-4 flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="consentAccepted"
                          checked={formData.consentAccepted}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-slate-700">
                          I consent to the review and processing of my
                          application for program administration purposes.
                        </span>
                      </label>
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`rounded-full px-6 py-3 text-sm font-semibold ${
                    currentStep === 0
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-full bg-blue-900 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-950"
                    >
                      Submit Application
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
              ✓
            </div>

            <h2 className="mt-6 text-2xl font-bold text-blue-950">
              Application Successful
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your application has been submitted successfully. You can now
              continue to your dashboard to track your status.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="mt-7 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: string;
  readOnly?: boolean;
};

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  options: string[];
};

function Select({ label, name, value, onChange, options }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option, index) => (
          <option key={option} value={index === 0 ? "" : option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextAreaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  rows?: number;
};

function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 5,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

type FileUploadCardProps = {
  label: string;
  helper: string;
  fileName: string;
  inputId: string;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function FileUploadCard({
  label,
  helper,
  fileName,
  inputId,
  isUploading,
  onFileChange,
}: FileUploadCardProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          {isUploading ? "Uploading..." : "Attach File"}
        </label>

        <input
          id={inputId}
          type="file"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {fileName ? fileName : "No file uploaded yet"}
        </div>
      </div>
    </div>
  );
}

type ReviewCardProps = {
  title: string;
  items: [string, string | boolean][];
};

function ReviewCard({ title, items }: ReviewCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-bold text-blue-950">{title}</h4>
      <div className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 rounded-2xl bg-slate-50 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start"
          >
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            <p className="break-words text-sm text-slate-600">
              {String(value || "-")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}