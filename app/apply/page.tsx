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
  townVillage: string;
  address: string;

  highestQualification: string;
  completedBgcseIgcse: string;
  examinationBody: string;
  bgcseLevel: string;
  bgcsePoints: string;
  schoolName: string;
  yearCompleted: string;
  preferredLanguage: string;
  englishComfort: string;
  tertiaryCompleted: string;
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
  bgcseCertificateFile: string;
  highestQualificationFile: string;

  declarationAccepted: boolean;
  consentAccepted: boolean;
};

type UploadingState = {
  omangFile: boolean;
  cvFile: boolean;
  certificateFile: boolean;
  bgcseCertificateFile: boolean;
  highestQualificationFile: boolean;
  disabilityProofFile: boolean;
};

const districtConstituencies: Record<string, string[]> = {
  "Central District": [
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
    "Boteti East",
    "Boteti West",
    "Boteti South",
  ],
  "North West District": [
    "Okavango West",
    "Okavango East",
    "Ngami",
    "Maun North",
    "Maun East",
    "Maun West",
  ],
  "Chobe District": ["Chobe"],
  "Tutume District": ["Nata-Gweta", "Nkange", "Shashe West", "Tonota"],
  "North East District": [
    "Tati West",
    "Tati East",
    "Francistown West",
    "Francistown South",
    "Francistown East",
  ],
  "Ghanzi District": ["Ghanzi North", "Ghanzi South"],
  "Kgalagadi District": ["Kgalagadi North", "Kgalagadi South"],
  "Kgatleng District": ["Kgatleng West", "Kgatleng Central", "Kgatleng East"],
  "Kweneng District": [
    "Letlhakeng",
    "Takatokwane",
    "Molepolole North",
    "Molepolole South",
    "Thamaga-Kumakwane",
    "Mmopane-Metsimotlhabe",
    "Lentsweletau",
    "Mogoditshane West",
    "Mogoditshane East",
  ],
  "South East District": [
    "Gaborone North",
    "Gaborone Central",
    "Gaborone North West",
    "Gaborone South",
    "Gaborone Bonnington North",
    "Gaborone Bonnington South",
    "Tlokweng-Mmokolodi",
    "Ramotswa",
  ],
  "Southern District": [
    "Jwaneng-Mabutsane",
    "Lobatse",
    "Goodhope-Mmathethe",
    "Kanye North",
    "Kanye South",
    "Moshupa-Manyana",
  ],
};

const districts = Object.keys(districtConstituencies);
const allConstituencies = Object.values(districtConstituencies).flat();

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
  townVillage: "",
  address: "",

  highestQualification: "",
  completedBgcseIgcse: "",
  examinationBody: "",
  bgcseLevel: "",
  bgcsePoints: "",
  schoolName: "",
  yearCompleted: "",
  preferredLanguage: "",
  englishComfort: "",
  tertiaryCompleted: "",
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
  bgcseCertificateFile: "",
  highestQualificationFile: "",

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

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

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
    bgcseCertificateFile: false,
    highestQualificationFile: false,
    disabilityProofFile: false,
  });

  const constituencyBoxRef = useRef<HTMLDivElement | null>(null);
  const applicationSectionRef = useRef<HTMLElement | null>(null);

  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep]);

  const motivationWordCount = useMemo(() => {
    return countWords(formData.motivation);
  }, [formData.motivation]);

  const postProgramWordCount = useMemo(() => {
    return countWords(formData.postProgramPlan);
  }, [formData.postProgramPlan]);

  const availableConstituencies = useMemo(() => {
    if (!formData.district) {
      return allConstituencies;
    }

    return districtConstituencies[formData.district] || [];
  }, [formData.district]);

  const filteredConstituencies = useMemo(() => {
    const query = constituencyQuery.trim().toLowerCase();

    if (!query) {
      return availableConstituencies.slice(0, 10);
    }

    return availableConstituencies.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [constituencyQuery, availableConstituencies]);

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

    if (name === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        constituency: "",
      }));
      setConstituencyQuery("");
      setShowConstituencyResults(false);
      return;
    }

    if (name === "completedBgcseIgcse") {
      setFormData((prev) => ({
        ...prev,
        completedBgcseIgcse: value,
        examinationBody: value === "Yes" ? prev.examinationBody : "",
        bgcsePoints: value === "Yes" ? prev.bgcsePoints : "",
        schoolName: value === "Yes" ? prev.schoolName : "",
        yearCompleted: value === "Yes" ? prev.yearCompleted : "",
        bgcseCertificateFile: value === "Yes" ? prev.bgcseCertificateFile : "",
        certificateFile: value === "Yes" ? prev.certificateFile : "",
      }));
      return;
    }

    if (name === "tertiaryCompleted") {
      setFormData((prev) => ({
        ...prev,
        tertiaryCompleted: value,
        tertiaryEducation: value === "Yes" ? prev.tertiaryEducation : "",
        tertiaryInstitution: value === "Yes" ? prev.tertiaryInstitution : "",
        fieldOfStudy: value === "Yes" ? prev.fieldOfStudy : "",
        highestQualificationFile:
          value === "Yes" ? prev.highestQualificationFile : "",
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
      | "bgcseCertificateFile"
      | "highestQualificationFile"
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
      town_village: formData.townVillage,
      address: formData.address,

      highest_qualification: formData.highestQualification,
      completed_bgcse_igcse: formData.completedBgcseIgcse,
      examination_body: formData.examinationBody,
      bgcse_level: formData.bgcseLevel,
      bgcse_points: formData.bgcsePoints,
      school_name: formData.schoolName,
      year_completed: formData.yearCompleted,
      preferred_language: formData.preferredLanguage,
      english_comfort: formData.englishComfort,

      tertiary_completed: formData.tertiaryCompleted,
      tertiary_education: formData.tertiaryEducation,
      tertiary_institution: formData.tertiaryInstitution,
      field_of_study: formData.fieldOfStudy,

      employment_status: formData.employmentStatus,
      occupation: formData.occupation,
      business_experience: formData.businessExperience,
      interest_area: formData.interestArea,

      motivation: formData.motivation,
      post_program_plan: formData.postProgramPlan,
      motivation_word_count: motivationWordCount,
      post_program_word_count: postProgramWordCount,

      omang_file: formData.omangFile,
      cv_file: formData.cvFile,
      certificate_file: formData.bgcseCertificateFile || formData.certificateFile,
      bgcse_certificate_file:
        formData.bgcseCertificateFile || formData.certificateFile,
      highest_qualification_file: formData.highestQualificationFile,

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

                    <Select
                      label="District"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      options={["Select district", ...districts]}
                    />

                    <Input
                      label="Town / Village"
                      name="townVillage"
                      value={formData.townVillage}
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
                        placeholder={
                          formData.district
                            ? "Start typing your constituency name"
                            : "Select district first, then type constituency"
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Select your district first. Constituency suggestions
                        will then be filtered for that district.
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
                      label="Residential Address"
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
                    Provide your education background. BGCSE / IGCSE completion
                    and proof are required for eligibility screening.
                  </p>

                  <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <h4 className="text-lg font-bold text-blue-950">
                      Minimum Education Requirement
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      This section confirms whether you meet the minimum academic
                      requirement for the programme.
                    </p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <Select
                        label="Highest Qualification Completed"
                        name="highestQualification"
                        value={formData.highestQualification}
                        onChange={handleInputChange}
                        options={[
                          "Select qualification",
                          "BGCSE / IGCSE",
                          "Certificate",
                          "Diploma",
                          "Degree",
                          "Postgraduate",
                          "Other",
                        ]}
                      />

                      <Select
                        label="Did you complete BGCSE / IGCSE?"
                        name="completedBgcseIgcse"
                        value={formData.completedBgcseIgcse}
                        onChange={handleInputChange}
                        options={["Select option", "Yes", "No"]}
                      />

                      {formData.completedBgcseIgcse === "Yes" && (
                        <>
                          <Select
                            label="Examination Type"
                            name="examinationBody"
                            value={formData.examinationBody}
                            onChange={handleInputChange}
                            options={[
                              "Select examination type",
                              "BGCSE",
                              "IGCSE",
                              "Other",
                            ]}
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

                          <div className="md:col-span-2">
                            <FileUploadCard
                              label="BGCSE / IGCSE Certificate or Results Slip"
                              helper="Required for eligibility screening. Accepted formats: PDF, JPG, PNG"
                              fileName={
                                formData.bgcseCertificateFile ||
                                formData.certificateFile
                              }
                              inputId="bgcse-certificate-upload"
                              isUploading={uploading.bgcseCertificateFile}
                              onFileChange={(e) =>
                                handleFileUpload(e, "bgcseCertificateFile")
                              }
                            />
                          </div>
                        </>
                      )}

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

                    
                  </div>

                  <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
                    <h4 className="text-lg font-bold text-blue-950">
                      Higher Qualification Evidence
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      If you have a certificate, diploma, degree, postgraduate
                      qualification, or other higher qualification, provide the
                      details and upload proof. This can strengthen your
                      application ranking.
                    </p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <Select
                        label="Have you completed tertiary / higher education?"
                        name="tertiaryCompleted"
                        value={formData.tertiaryCompleted}
                        onChange={handleInputChange}
                        options={["Select option", "Yes", "No"]}
                      />

                      {formData.tertiaryCompleted === "Yes" && (
                        <>
                          <Input
                            label="Higher Qualification Name"
                            name="tertiaryEducation"
                            value={formData.tertiaryEducation}
                            onChange={handleInputChange}
                          />

                          <Input
                            label="Institution Name"
                            name="tertiaryInstitution"
                            value={formData.tertiaryInstitution}
                            onChange={handleInputChange}
                          />

                          <div className="md:col-span-2">
                            <TextArea
                              label="Field of Study / Additional Details"
                              name="fieldOfStudy"
                              value={formData.fieldOfStudy}
                              onChange={handleInputChange}
                              rows={4}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <FileUploadCard
                              label="Proof of Highest Qualification"
                              helper="Optional but recommended. Accepted formats: PDF, JPG, PNG"
                              fileName={formData.highestQualificationFile}
                              inputId="highest-qualification-upload"
                              isUploading={uploading.highestQualificationFile}
                              onFileChange={(e) =>
                                handleFileUpload(
                                  e,
                                  "highestQualificationFile"
                                )
                              }
                            />
                          </div>
                        </>
                      )}
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
                    to do afterward. These answers help the review team assess
                    seriousness and programme fit.
                  </p>

                  <div className="mt-8 space-y-6">
                    <div>
                      <TextArea
                        label="Why do you want to join this program?"
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        rows={6}
                      />
                      <p
                        className={`mt-2 text-xs ${
                          motivationWordCount < 40
                            ? "text-orange-600"
                            : "text-slate-500"
                        }`}
                      >
                        {motivationWordCount} words. Recommended minimum: 40
                        words.
                      </p>
                    </div>

                    <div>
                      <TextArea
                        label="What do you hope to do after completing the program?"
                        name="postProgramPlan"
                        value={formData.postProgramPlan}
                        onChange={handleInputChange}
                        rows={6}
                      />
                      <p
                        className={`mt-2 text-xs ${
                          postProgramWordCount < 30
                            ? "text-orange-600"
                            : "text-slate-500"
                        }`}
                      >
                        {postProgramWordCount} words. Recommended minimum: 30
                        words.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {currentStep === 4 && (
                <section>
                  <h3 className="text-2xl font-bold text-blue-950">
                    Documents
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Attach your supporting documents. Some documents are
                    critical for eligibility screening.
                  </p>

                  {uploadError && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {uploadError}
                    </div>
                  )}

                  <div className="mt-8 grid gap-6">
                    <FileUploadCard
                      label="Omang / ID Copy"
                      helper="Required for eligibility screening. Accepted formats: PDF, JPG, PNG"
                      fileName={formData.omangFile}
                      inputId="omang-upload"
                      isUploading={uploading.omangFile}
                      onFileChange={(e) => handleFileUpload(e, "omangFile")}
                    />

                    <FileUploadCard
                      label="BGCSE / IGCSE Certificate or Results Slip"
                      helper="Required for eligibility screening. Accepted formats: PDF, JPG, PNG"
                      fileName={
                        formData.bgcseCertificateFile ||
                        formData.certificateFile
                      }
                      inputId="bgcse-certificate-upload-documents"
                      isUploading={uploading.bgcseCertificateFile}
                      onFileChange={(e) =>
                        handleFileUpload(e, "bgcseCertificateFile")
                      }
                    />

                    <FileUploadCard
                      label="Curriculum Vitae (CV)"
                      helper="Optional but recommended. Accepted formats: PDF, DOC, DOCX"
                      fileName={formData.cvFile}
                      inputId="cv-upload"
                      isUploading={uploading.cvFile}
                      onFileChange={(e) => handleFileUpload(e, "cvFile")}
                    />

                    {formData.tertiaryCompleted === "Yes" && (
                      <FileUploadCard
                        label="Proof of Highest Qualification"
                        helper="Optional but recommended. Accepted formats: PDF, JPG, PNG"
                        fileName={formData.highestQualificationFile}
                        inputId="highest-qualification-upload-documents"
                        isUploading={uploading.highestQualificationFile}
                        onFileChange={(e) =>
                          handleFileUpload(e, "highestQualificationFile")
                        }
                      />
                    )}

                    {formData.disabilityStatus === "Yes" && (
                      <FileUploadCard
                        label="Proof of Disability"
                        helper="Required if disability was selected. Accepted formats: PDF, JPG, PNG"
                        fileName={formData.disabilityProofFile}
                        inputId="disability-proof-upload-documents"
                        isUploading={uploading.disabilityProofFile}
                        onFileChange={(e) =>
                          handleFileUpload(e, "disabilityProofFile")
                        }
                      />
                    )}
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
                        ["District", formData.district],
                        ["Constituency", formData.constituency],
                        ["Town / Village", formData.townVillage],
                        ["Residential Address", formData.address],
                      ]}
                    />

                    <ReviewCard
                      title="Education"
                      items={[
                        [
                          "Highest Qualification Completed",
                          formData.highestQualification,
                        ],
                        [
                          "Completed BGCSE / IGCSE",
                          formData.completedBgcseIgcse,
                        ],
                        ["Examination Type", formData.examinationBody],
                        ["BGCSE / IGCSE Points", formData.bgcsePoints],
                        ["School Name", formData.schoolName],
                        ["Year Completed", formData.yearCompleted],
                        [
                          "BGCSE / IGCSE Certificate",
                          formData.bgcseCertificateFile ||
                            formData.certificateFile,
                        ],
                        [
                          "Preferred Training Language",
                          formData.preferredLanguage,
                        ],
                        ["English Comfort", formData.englishComfort],
                        [
                          "Tertiary / Higher Education Completed",
                          formData.tertiaryCompleted,
                        ],
                        [
                          "Higher Qualification",
                          formData.tertiaryEducation,
                        ],
                        ["Institution", formData.tertiaryInstitution],
                        ["Field of Study", formData.fieldOfStudy],
                        [
                          "Proof of Highest Qualification",
                          formData.highestQualificationFile,
                        ],
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
                        ["Motivation Word Count", String(motivationWordCount)],
                        ["Post Program Plan", formData.postProgramPlan],
                        [
                          "Post Program Word Count",
                          String(postProgramWordCount),
                        ],
                      ]}
                    />

                    <ReviewCard
                      title="Documents"
                      items={[
                        ["Omang / ID Copy", formData.omangFile],
                        [
                          "BGCSE / IGCSE Certificate",
                          formData.bgcseCertificateFile ||
                            formData.certificateFile,
                        ],
                        ["CV", formData.cvFile],
                        [
                          "Proof of Highest Qualification",
                          formData.highestQualificationFile,
                        ],
                        ["Proof of Disability", formData.disabilityProofFile],
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