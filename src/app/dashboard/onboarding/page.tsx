"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/* ============================================================
   Constants
   ============================================================ */

const TSU_COLLEGES = [
  "College of Liberal Arts and Behavioral Sciences",
  "College of Science, Engineering and Technology",
  "Jesse H. Jones School of Business",
  "College of Education",
  "College of Pharmacy and Health Sciences",
  "Thurgood Marshall School of Law",
  "Barbara Jordan-Mickey Leland School of Public Affairs",
] as const;

const CLASSIFICATIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;

const GRAD_YEARS = Array.from({ length: 6 }, (_, i) => 2025 + i);

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
] as const;

const CAREER_GOALS = [
  "Find an Internship",
  "Build My Resume",
  "Network with Professionals",
  "Explore Career Paths",
  "Prepare for Grad School",
  "Start a Business",
  "Land a Full-Time Job",
  "Get Certified",
] as const;

const INVOLVEMENT_OPTIONS = [
  "Join a Student Org",
  "Greek Life",
  "Intramural Sports",
  "Student Government",
  "Community Service",
  "Research",
  "Campus Employment",
  "Mentorship Programs",
] as const;

const STEP_COUNT = 4;

interface InterestTag {
  id: string;
  label: string;
  category: string;
}

/* ============================================================
   Component
   ============================================================ */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 state
  const [preferredName, setPreferredName] = useState("");
  const [classification, setClassification] = useState("");
  const [major, setMajor] = useState("");
  const [college, setCollege] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [isTransfer, setIsTransfer] = useState(false);
  const [homeState, setHomeState] = useState("");

  // Step 2 state
  const [interestTags, setInterestTags] = useState<InterestTag[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 3 state
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [involvement, setInvolvement] = useState<string[]>([]);

  // Step 4 state
  const [bio, setBio] = useState("");

  // Pre-fill preferred name from profile
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("full_name, preferred_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setPreferredName(data.preferred_name || data.full_name?.split(" ")[0] || "");
          }
        });
    });
  }, []);

  // Fetch interest tags
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("interest_tags")
      .select("id, label, category")
      .order("category")
      .then(({ data }) => {
        if (data) setInterestTags(data);
      });
  }, []);

  /* ---- Validation ---- */
  function canProceed(): boolean {
    switch (step) {
      case 1:
        return !!(preferredName.trim() && classification && major.trim() && college && graduationYear);
      case 2:
        return selectedInterests.length >= 3;
      case 3:
        return careerGoals.length >= 1 && involvement.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  }

  /* ---- Chip toggle helpers ---- */
  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleCareerGoal(goal: string) {
    setCareerGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function toggleInvolvement(item: string) {
    setInvolvement((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  /* ---- Submit ---- */
  async function handleComplete() {
    setSaving(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated. Please sign in again.");
      setSaving(false);
      return;
    }

    const updatePayload = {
      preferred_name: preferredName.trim(),
      classification: classification.toLowerCase(),
      major: major.trim(),
      college,
      graduation_year: parseInt(graduationYear, 10),
      is_transfer: isTransfer,
      home_state: homeState || null,
      bio: bio.trim() || null,
      interests: selectedInterests,
      career_goals: careerGoals,
      campus_involvement: involvement,
      onboarding_complete: true,
    };

    console.log("[Onboarding] Updating profile with:", {
      userId: user.id,
      payload: updatePayload,
    });

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      console.error("[Onboarding] Supabase profile update error:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      setError("Failed to save your profile. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  /* ---- Group interests by category ---- */
  const groupedInterests: Record<string, InterestTag[]> = {};
  for (const tag of interestTags) {
    if (!groupedInterests[tag.category]) {
      groupedInterests[tag.category] = [];
    }
    groupedInterests[tag.category].push(tag);
  }

  /* ---- Render ---- */
  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-start justify-center py-8 lg:min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-600 dark:text-[#A0A0A0]">
              Step {step} of {STEP_COUNT}
            </span>
            <span className="text-sm font-medium text-surface-500 dark:text-[#A0A0A0]">
              {Math.round((step / STEP_COUNT) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-200 dark:bg-[#2A2A2A]" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={STEP_COUNT}>
            <div
              className="h-2 rounded-full bg-maroon-900 transition-all duration-300"
              style={{ width: `${(step / STEP_COUNT) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          {/* Error */}
          {error && (
            <div role="alert" className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5]">
                  Welcome to TigerMate!
                </h2>
                <p className="mt-1 text-surface-600 dark:text-[#A0A0A0]">
                  Let&apos;s start with the basics so we can personalize your experience.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="preferred-name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    Preferred Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="preferred-name"
                    type="text"
                    required
                    placeholder="What should we call you?"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="classification" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Classification <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="classification"
                      required
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      {CLASSIFICATIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="graduation-year" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Graduation Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="graduation-year"
                      required
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      {GRAD_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    Major <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="major"
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    College <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="college"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select your college...</option>
                    {TSU_COLLEGES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="transfer"
                    type="checkbox"
                    checked={isTransfer}
                    onChange={(e) => setIsTransfer(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-300 text-maroon-900 focus:ring-maroon-900"
                  />
                  <label htmlFor="transfer" className="text-sm text-surface-700 dark:text-surface-300">
                    I am a transfer student
                  </label>
                </div>

                <div>
                  <label htmlFor="home-state" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    Home State <span className="text-surface-400 font-normal">(optional)</span>
                  </label>
                  <select
                    id="home-state"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5]">
                  What are you into?
                </h2>
                <p className="mt-1 text-surface-600 dark:text-[#A0A0A0]">
                  Pick at least 3 interests so we can tailor your experience.
                </p>
                <p className="mt-1 text-sm text-surface-500 dark:text-[#A0A0A0]">
                  {selectedInterests.length} selected{selectedInterests.length < 3 && ` — ${3 - selectedInterests.length} more needed`}
                </p>
              </div>

              {Object.keys(groupedInterests).length > 0 ? (
                <div className="space-y-5">
                  {Object.entries(groupedInterests).map(([category, tags]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const selected = selectedInterests.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleInterest(tag.id)}
                              className={cn(
                                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                selected
                                  ? "bg-maroon-900 text-white"
                                  : "bg-white dark:bg-[#252525] text-surface-700 dark:text-[#A0A0A0] border border-surface-200 dark:border-[#2A2A2A] hover:border-maroon-300 dark:hover:border-maroon-700 hover:text-maroon-900 dark:hover:text-maroon-300"
                              )}
                              aria-pressed={selected}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-surface-500 dark:text-[#A0A0A0]">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" aria-hidden="true" />
                  Loading interests...
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5]">
                  What&apos;s next for you?
                </h2>
                <p className="mt-1 text-surface-600 dark:text-[#A0A0A0]">
                  Select at least 1 career goal and 1 campus involvement.
                </p>
              </div>

              {/* Career Goals */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-3">
                  Career Goals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CAREER_GOALS.map((goal) => {
                    const selected = careerGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleCareerGoal(goal)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          selected
                            ? "bg-maroon-900 text-white"
                            : "bg-white dark:bg-[#252525] text-surface-700 dark:text-[#A0A0A0] border border-surface-200 dark:border-[#2A2A2A] hover:border-maroon-300 dark:hover:border-maroon-700 hover:text-maroon-900 dark:hover:text-maroon-300"
                        )}
                        aria-pressed={selected}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campus Involvement */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-3">
                  Campus Involvement
                </h3>
                <div className="flex flex-wrap gap-2">
                  {INVOLVEMENT_OPTIONS.map((item) => {
                    const selected = involvement.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInvolvement(item)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          selected
                            ? "bg-maroon-900 text-white"
                            : "bg-white dark:bg-[#252525] text-surface-700 dark:text-[#A0A0A0] border border-surface-200 dark:border-[#2A2A2A] hover:border-maroon-300 dark:hover:border-maroon-700 hover:text-maroon-900 dark:hover:text-maroon-300"
                        )}
                        aria-pressed={selected}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5]">
                  Almost done!
                </h2>
                <p className="mt-1 text-surface-600 dark:text-[#A0A0A0]">
                  Add a short bio if you&apos;d like, then review your selections.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Bio <span className="text-surface-400 font-normal">(optional, max 200 chars)</span>
                </label>
                <textarea
                  id="bio"
                  maxLength={200}
                  rows={3}
                  placeholder="Tell us a little about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field resize-none"
                />
                <p className="mt-1 text-xs text-surface-400">
                  {bio.length}/200
                </p>
              </div>

              {/* Review Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide">
                  Review
                </h3>

                <div className="rounded-xl bg-surface-50 dark:bg-[#252525] p-4 space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-surface-900 dark:text-[#F5F5F5]">Name:</span>{" "}
                    <span className="text-surface-600 dark:text-[#A0A0A0]">{preferredName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-surface-900 dark:text-[#F5F5F5]">Classification:</span>{" "}
                    <span className="text-surface-600 dark:text-[#A0A0A0]">{classification} — Class of {graduationYear}</span>
                  </div>
                  <div>
                    <span className="font-medium text-surface-900 dark:text-[#F5F5F5]">Major:</span>{" "}
                    <span className="text-surface-600 dark:text-[#A0A0A0]">{major}</span>
                  </div>
                  <div>
                    <span className="font-medium text-surface-900 dark:text-[#F5F5F5]">College:</span>{" "}
                    <span className="text-surface-600 dark:text-[#A0A0A0]">{college}</span>
                  </div>
                  {isTransfer && (
                    <div>
                      <span className="font-medium text-surface-900 dark:text-[#F5F5F5]">Transfer Student:</span>{" "}
                      <span className="text-surface-600 dark:text-[#A0A0A0]">Yes</span>
                    </div>
                  )}
                  {homeState && (
                    <div>
                      <span className="font-medium text-surface-900 dark:text-[#F5F5F5]">Home State:</span>{" "}
                      <span className="text-surface-600 dark:text-[#A0A0A0]">{homeState}</span>
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-[#F5F5F5] mb-2">
                    Interests ({selectedInterests.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((id) => {
                      const tag = interestTags.find((t) => t.id === id);
                      return tag ? (
                        <span key={id} className="badge-campus text-xs">
                          {tag.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Career Goals */}
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-[#F5F5F5] mb-2">
                    Career Goals
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {careerGoals.map((g) => (
                      <span key={g} className="badge-career text-xs">{g}</span>
                    ))}
                  </div>
                </div>

                {/* Involvement */}
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-[#F5F5F5] mb-2">
                    Campus Involvement
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {involvement.map((i) => (
                      <span key={i} className="badge-social text-xs">{i}</span>
                    ))}
                  </div>
                </div>

                {bio && (
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-[#F5F5F5] mb-1">Bio</p>
                    <p className="text-sm text-surface-600 dark:text-[#A0A0A0]">{bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="btn-secondary text-sm py-2 px-4"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < STEP_COUNT ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="btn-primary text-sm py-2 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="btn-gold text-sm py-2 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
