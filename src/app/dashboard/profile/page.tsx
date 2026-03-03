"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Save,
  X,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/providers/theme-provider";
import { cn, formatDate } from "@/lib/utils";

/* ============================================================
   Constants (shared with onboarding)
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
  "Find an Internship","Build My Resume","Network with Professionals","Explore Career Paths",
  "Prepare for Grad School","Start a Business","Land a Full-Time Job","Get Certified",
] as const;

const INVOLVEMENT_OPTIONS = [
  "Join a Student Org","Greek Life","Intramural Sports","Student Government",
  "Community Service","Research","Campus Employment","Mentorship Programs",
] as const;

interface InterestTag {
  id: string;
  label: string;
  category: string;
}

interface Profile {
  preferred_name: string | null;
  full_name: string | null;
  email: string;
  classification: string | null;
  major: string | null;
  college: string | null;
  graduation_year: number | null;
  is_transfer: boolean;
  home_state: string | null;
  bio: string | null;
  interests: string[];
  career_goals: string[];
  campus_involvement: string[];
  theme_preference: string | null;
  notification_events: boolean;
  notification_deadlines: boolean;
  notification_friends: boolean;
  created_at: string;
}

type Theme = "light" | "dark" | "system";

/* ============================================================
   Component
   ============================================================ */

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editInterests, setEditInterests] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Editable fields
  const [preferredName, setPreferredName] = useState("");
  const [major, setMajor] = useState("");
  const [college, setCollege] = useState("");
  const [classification, setClassification] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [isTransfer, setIsTransfer] = useState(false);
  const [homeState, setHomeState] = useState("");
  const [bio, setBio] = useState("");

  // Interests/goals
  const [interestTags, setInterestTags] = useState<InterestTag[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [involvement, setInvolvement] = useState<string[]>([]);

  // Notification toggles
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifDeadlines, setNotifDeadlines] = useState(true);
  const [notifFriends, setNotifFriends] = useState(true);

  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("preferred_name, full_name, email, classification, major, college, graduation_year, is_transfer, home_state, bio, interests, career_goals, campus_involvement, theme_preference, notification_events, notification_deadlines, notification_friends, created_at")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data as Profile);
      setPreferredName(data.preferred_name || "");
      setMajor(data.major || "");
      setCollege(data.college || "");
      setClassification(data.classification || "");
      setGraduationYear(data.graduation_year?.toString() || "");
      setIsTransfer(data.is_transfer || false);
      setHomeState(data.home_state || "");
      setBio(data.bio || "");
      setSelectedInterests(data.interests || []);
      setCareerGoals(data.career_goals || []);
      setInvolvement(data.campus_involvement || []);
      setNotifEvents(data.notification_events ?? true);
      setNotifDeadlines(data.notification_deadlines ?? true);
      setNotifFriends(data.notification_friends ?? true);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Fetch interest tags
  useEffect(() => {
    supabase
      .from("interest_tags")
      .select("id, label, category")
      .order("category")
      .then(({ data }) => {
        if (data) setInterestTags(data);
      });
  }, [supabase]);

  function showSavedFeedback() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        preferred_name: preferredName.trim() || null,
        major: major.trim() || null,
        college: college || null,
        classification: classification ? classification.toLowerCase() : null,
        graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
        is_transfer: isTransfer,
        home_state: homeState || null,
        bio: bio.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError("Failed to save profile. Please try again.");
      return;
    }

    await loadProfile();
    setEditMode(false);
    showSavedFeedback();
  }

  async function handleSaveInterests() {
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        interests: selectedInterests,
        career_goals: careerGoals,
        campus_involvement: involvement,
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError("Failed to save interests. Please try again.");
      return;
    }

    await loadProfile();
    setEditInterests(false);
    showSavedFeedback();
  }

  function cancelEdit() {
    if (profile) {
      setPreferredName(profile.preferred_name || "");
      setMajor(profile.major || "");
      setCollege(profile.college || "");
      setClassification(profile.classification || "");
      setGraduationYear(profile.graduation_year?.toString() || "");
      setIsTransfer(profile.is_transfer);
      setHomeState(profile.home_state || "");
      setBio(profile.bio || "");
    }
    setEditMode(false);
  }

  function cancelInterestEdit() {
    if (profile) {
      setSelectedInterests(profile.interests || []);
      setCareerGoals(profile.career_goals || []);
      setInvolvement(profile.campus_involvement || []);
    }
    setEditInterests(false);
  }

  async function handleNotificationToggle(field: string, value: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    if (field === "notification_events") setNotifEvents(value);
    if (field === "notification_deadlines") setNotifDeadlines(value);
    if (field === "notification_friends") setNotifFriends(value);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", user.id);

    if (updateError) {
      // Revert
      if (field === "notification_events") setNotifEvents(!value);
      if (field === "notification_deadlines") setNotifDeadlines(!value);
      if (field === "notification_friends") setNotifFriends(!value);
      setError("Failed to update notification preference.");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Group interests by category
  const groupedInterests: Record<string, InterestTag[]> = {};
  for (const tag of interestTags) {
    if (!groupedInterests[tag.category]) groupedInterests[tag.category] = [];
    groupedInterests[tag.category].push(tag);
  }

  const initials = (profile?.preferred_name || profile?.full_name || "T")
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-maroon-900" aria-hidden="true" />
        <span className="sr-only">Loading profile...</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Success Feedback */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4" aria-hidden="true" />
          Saved!
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="ml-3 shrink-0" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ---- Section A: Profile Header ---- */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-maroon-900 text-gold-500 font-display text-2xl sm:text-3xl font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5]">
              {profile.preferred_name || profile.full_name || "Tiger"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {profile.classification && (
                <span className="badge-campus">{profile.classification}</span>
              )}
              {profile.graduation_year && (
                <span className="text-sm text-surface-500 dark:text-[#A0A0A0]">
                  Class of {profile.graduation_year}
                </span>
              )}
            </div>
            {(profile.college || profile.major) && (
              <p className="mt-1 text-sm text-surface-600 dark:text-[#A0A0A0]">
                {[profile.major, profile.college].filter(Boolean).join(" — ")}
              </p>
            )}
          </div>
          {!editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="btn-secondary text-sm py-2 px-4 shrink-0"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* ---- Section B: Personal Information ---- */}
      <section className="card p-6 sm:p-8" aria-labelledby="personal-info-heading">
        <h2 id="personal-info-heading" className="text-lg font-semibold text-surface-900 dark:text-[#F5F5F5] mb-4">
          Personal Information
        </h2>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="pref-name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Preferred Name
              </label>
              <input id="pref-name" type="text" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} className="input-field" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="p-major" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Major</label>
                <input id="p-major" type="text" value={major} onChange={(e) => setMajor(e.target.value)} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-college" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">College</label>
                <select id="p-college" value={college} onChange={(e) => setCollege(e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {TSU_COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="p-class" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Classification</label>
                <select id="p-class" value={classification} onChange={(e) => setClassification(e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="p-grad" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Graduation Year</label>
                <select id="p-grad" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="p-state" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Home State</label>
                <select id="p-state" value={homeState} onChange={(e) => setHomeState(e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input id="p-transfer" type="checkbox" checked={isTransfer} onChange={(e) => setIsTransfer(e.target.checked)} className="h-4 w-4 rounded border-surface-300 text-maroon-900 focus:ring-maroon-900" />
              <label htmlFor="p-transfer" className="text-sm text-surface-700 dark:text-surface-300">Transfer student</label>
            </div>

            <div>
              <label htmlFor="p-bio" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Bio <span className="text-surface-400 font-normal">({bio.length}/200)</span>
              </label>
              <textarea id="p-bio" maxLength={200} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="input-field resize-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Saving...</> : <><Save className="h-4 w-4" aria-hidden="true" />Save</>}
              </button>
              <button type="button" onClick={cancelEdit} className="btn-secondary text-sm py-2 px-5">Cancel</button>
            </div>
          </div>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              ["Preferred Name", profile.preferred_name],
              ["Major", profile.major],
              ["College", profile.college],
              ["Classification", profile.classification],
              ["Graduation Year", profile.graduation_year],
              ["Transfer Student", profile.is_transfer ? "Yes" : "No"],
              ["Home State", profile.home_state],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="font-medium text-surface-500 dark:text-[#A0A0A0]">{label as string}</dt>
                <dd className="mt-0.5 text-surface-900 dark:text-[#F5F5F5]">{(value as string | number | null) || "—"}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="font-medium text-surface-500 dark:text-[#A0A0A0]">Bio</dt>
              <dd className="mt-0.5 text-surface-900 dark:text-[#F5F5F5]">{profile.bio || "—"}</dd>
            </div>
          </dl>
        )}
      </section>

      {/* ---- Section C: Interests & Goals ---- */}
      <section className="card p-6 sm:p-8" aria-labelledby="interests-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="interests-heading" className="text-lg font-semibold text-surface-900 dark:text-[#F5F5F5]">
            Interests & Goals
          </h2>
          {!editInterests && (
            <button type="button" onClick={() => setEditInterests(true)} className="btn-secondary text-sm py-1.5 px-3">
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
          )}
        </div>

        {editInterests ? (
          <div className="space-y-5">
            {/* Interests */}
            <div>
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">
                Interests ({selectedInterests.length} selected)
              </h3>
              {Object.entries(groupedInterests).map(([category, tags]) => (
                <div key={category} className="mb-3">
                  <p className="text-xs font-medium text-surface-500 dark:text-[#A0A0A0] mb-1.5">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const sel = selectedInterests.includes(tag.id);
                      return (
                        <button key={tag.id} type="button" onClick={() => setSelectedInterests((prev) => sel ? prev.filter((i) => i !== tag.id) : [...prev, tag.id])}
                          className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors", sel ? "bg-maroon-900 text-white" : "bg-white dark:bg-[#252525] text-surface-600 dark:text-[#A0A0A0] border border-surface-200 dark:border-[#2A2A2A] hover:border-maroon-300")}
                          aria-pressed={sel}
                        >{tag.label}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Career Goals */}
            <div>
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">Career Goals</h3>
              <div className="flex flex-wrap gap-2">
                {CAREER_GOALS.map((g) => {
                  const sel = careerGoals.includes(g);
                  return (
                    <button key={g} type="button" onClick={() => setCareerGoals((prev) => sel ? prev.filter((x) => x !== g) : [...prev, g])}
                      className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors", sel ? "bg-maroon-900 text-white" : "bg-white dark:bg-[#252525] text-surface-600 dark:text-[#A0A0A0] border border-surface-200 dark:border-[#2A2A2A] hover:border-maroon-300")}
                      aria-pressed={sel}
                    >{g}</button>
                  );
                })}
              </div>
            </div>

            {/* Involvement */}
            <div>
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">Campus Involvement</h3>
              <div className="flex flex-wrap gap-2">
                {INVOLVEMENT_OPTIONS.map((item) => {
                  const sel = involvement.includes(item);
                  return (
                    <button key={item} type="button" onClick={() => setInvolvement((prev) => sel ? prev.filter((x) => x !== item) : [...prev, item])}
                      className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors", sel ? "bg-maroon-900 text-white" : "bg-white dark:bg-[#252525] text-surface-600 dark:text-[#A0A0A0] border border-surface-200 dark:border-[#2A2A2A] hover:border-maroon-300")}
                      aria-pressed={sel}
                    >{item}</button>
                  );
                })}
              </div>
            </div>

            {selectedInterests.length < 3 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">Please select at least 3 interests.</p>
            )}
            {(careerGoals.length < 1 || involvement.length < 1) && (
              <p className="text-sm text-amber-600 dark:text-amber-400">Please select at least 1 career goal and 1 involvement.</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={handleSaveInterests}
                disabled={saving || selectedInterests.length < 3 || careerGoals.length < 1 || involvement.length < 1}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Saving...</> : <><Save className="h-4 w-4" aria-hidden="true" />Save</>}
              </button>
              <button type="button" onClick={cancelInterestEdit} className="btn-secondary text-sm py-2 px-5">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-[#A0A0A0] mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((id) => {
                    const tag = interestTags.find((t) => t.id === id);
                    return tag ? <span key={id} className="badge-campus text-xs">{tag.label}</span> : null;
                  })}
                </div>
              </div>
            )}
            {profile.career_goals && profile.career_goals.length > 0 && (
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-[#A0A0A0] mb-2">Career Goals</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.career_goals.map((g) => <span key={g} className="badge-career text-xs">{g}</span>)}
                </div>
              </div>
            )}
            {profile.campus_involvement && profile.campus_involvement.length > 0 && (
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-[#A0A0A0] mb-2">Campus Involvement</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.campus_involvement.map((i) => <span key={i} className="badge-social text-xs">{i}</span>)}
                </div>
              </div>
            )}
            {(!profile.interests || profile.interests.length === 0) && (!profile.career_goals || profile.career_goals.length === 0) && (
              <p className="text-sm text-surface-500 dark:text-[#A0A0A0]">No interests or goals set yet.</p>
            )}
          </div>
        )}
      </section>

      {/* ---- Section D: App Settings ---- */}
      <section className="card p-6 sm:p-8" aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="text-lg font-semibold text-surface-900 dark:text-[#F5F5F5] mb-4">
          App Settings
        </h2>

        {/* Theme */}
        <div className="mb-6">
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Theme</p>
          <div className="inline-flex rounded-xl border border-surface-200 dark:border-[#2A2A2A] overflow-hidden">
            {([
              { value: "light" as Theme, icon: Sun, label: "Light" },
              { value: "dark" as Theme, icon: Moon, label: "Dark" },
              { value: "system" as Theme, icon: Monitor, label: "System" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  theme === opt.value
                    ? "bg-maroon-900 text-white"
                    : "bg-white dark:bg-[#1A1A1A] text-surface-600 dark:text-[#A0A0A0] hover:bg-surface-50 dark:hover:bg-[#252525]"
                )}
                aria-pressed={theme === opt.value}
              >
                <opt.icon className="h-4 w-4" aria-hidden="true" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Notifications</p>
          <div className="space-y-3">
            {([
              { label: "Event reminders", field: "notification_events", checked: notifEvents, setter: (v: boolean) => { setNotifEvents(v); handleNotificationToggle("notification_events", v); } },
              { label: "Deadline alerts", field: "notification_deadlines", checked: notifDeadlines, setter: (v: boolean) => { setNotifDeadlines(v); handleNotificationToggle("notification_deadlines", v); } },
              { label: "Friend requests", field: "notification_friends", checked: notifFriends, setter: (v: boolean) => { setNotifFriends(v); handleNotificationToggle("notification_friends", v); } },
            ] as const).map((notif) => (
              <label key={notif.field} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-surface-700 dark:text-surface-300">{notif.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notif.checked}
                  onClick={() => notif.setter(!notif.checked)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
                    notif.checked ? "bg-maroon-900" : "bg-surface-300 dark:bg-surface-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5",
                      notif.checked ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Section E: Account ---- */}
      <section className="card p-6 sm:p-8" aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-lg font-semibold text-surface-900 dark:text-[#F5F5F5] mb-4">
          Account
        </h2>

        <dl className="space-y-3 text-sm mb-6">
          <div>
            <dt className="font-medium text-surface-500 dark:text-[#A0A0A0]">Email</dt>
            <dd className="mt-0.5 text-surface-900 dark:text-[#F5F5F5]">{profile.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-surface-500 dark:text-[#A0A0A0]">Member since</dt>
            <dd className="mt-0.5 text-surface-900 dark:text-[#F5F5F5]">{formatDate(profile.created_at)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleSignOut} className="btn-secondary text-sm py-2 px-4">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete Account
          </button>
        </div>
      </section>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowDeleteModal(false)}>
          <div className="card w-full max-w-md p-6 sm:p-8" role="alertdialog" aria-labelledby="delete-title" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h3 id="delete-title" className="text-lg font-semibold text-surface-900 dark:text-[#F5F5F5]">
                Delete Account
              </h3>
            </div>
            <p className="text-sm text-surface-600 dark:text-[#A0A0A0] mb-2">
              Account deletion is permanent and cannot be undone.
            </p>
            <p className="text-sm text-surface-600 dark:text-[#A0A0A0] mb-6">
              Please contact <a href="mailto:tigermate@txsu.edu" className="font-medium text-maroon-900 dark:text-maroon-300 hover:underline">tigermate@txsu.edu</a> to request account deletion.
            </p>
            <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary w-full text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
