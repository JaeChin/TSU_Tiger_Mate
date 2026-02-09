import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  MessageCircle,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  Radio,
  Sparkles,
  ArrowRight,
  Users,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

/* ============================================================
   Landing Page — Tiger M.A.T.E Marketing Site
   ============================================================ */

const features = [
  {
    icon: LayoutDashboard,
    title: "Student Dashboard",
    description:
      "Your personalized home base. Events, tasks, and quick actions — all in one view.",
  },
  {
    icon: BookOpen,
    title: "Resource Finder",
    description:
      "Searchable directory of every campus office, service, and support resource at TSU.",
  },
  {
    icon: CheckSquare,
    title: "Task Manager",
    description:
      "Track assignments, deadlines, and personal goals with categories and priorities.",
  },
  {
    icon: MessageCircle,
    title: "Ask M.A.T.E",
    description:
      "AI-powered campus assistant that answers questions about TSU life, 24/7.",
  },
  {
    icon: CalendarDays,
    title: "Events Hub",
    description:
      "Browse, filter, and bookmark campus events. Never miss orientation, career fairs, or Tiger Fest.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Built with .edu-only access, encrypted data, and row-level security on every record.",
  },
] as const;

const stats = [
  {
    icon: AlertTriangle,
    value: "10+",
    label: "separate portals students must navigate",
    detail: "Fragmented systems with broken links and expired info",
  },
  {
    icon: Users,
    value: "67%",
    label: "of freshmen feel overwhelmed in semester one",
    detail: "No centralized guidance for course selection, events, or resources",
  },
  {
    icon: Compass,
    value: "1 in 3",
    label: "students don't know where to get help",
    detail: "Critical services exist but are buried across disconnected sites",
  },
] as const;

const valueProps = [
  {
    icon: TrendingUp,
    title: "Boost Retention",
    description:
      "Students who feel supported stay enrolled. M.A.T.E. reduces confusion in the critical first year and connects students to help before they fall behind.",
  },
  {
    icon: Radio,
    title: "Centralize Communication",
    description:
      "Replace fragmented portals, outdated links, and scattered PDFs with one living platform that students actually open every day.",
  },
  {
    icon: Sparkles,
    title: "Modernize the Experience",
    description:
      "Position TSU as a technology-forward institution. An AI-powered student platform signals innovation to prospective students, parents, and accreditors.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* --------------------------------------------------------
          Navigation
          -------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-100">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <Link href="/" aria-label="Tiger M.A.T.E home">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* --------------------------------------------------------
            Hero Section
            -------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-gradient-to-b from-maroon-50/60 to-white pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="badge-campus mb-6 inline-flex">
              Built for TSU Tigers
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-maroon-950 sm:text-5xl lg:text-6xl text-balance">
              Your guide from{" "}
              <span className="text-maroon-900">day one</span> to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">graduation</span>
                <span
                  className="absolute bottom-1 left-0 right-0 h-3 bg-gold-500/30 -z-0 rounded"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-600 text-balance">
              Tiger M.A.T.E replaces 10 scattered portals with one intelligent
              platform. Events, resources, tasks, and an AI assistant — all
              built for the TSU student experience.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup" className="btn-gold text-base px-8 py-3.5">
                Start Your Journey
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-base px-8 py-3.5"
              >
                Sign In with .edu
              </Link>
            </div>
          </div>

          {/* Decorative gradient blob */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gold-500/10 blur-3xl"
            aria-hidden="true"
          />
        </section>

        {/* --------------------------------------------------------
            Problem Section
            -------------------------------------------------------- */}
        <section className="py-20 sm:py-28 bg-white" aria-labelledby="problem-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2
                id="problem-heading"
                className="text-3xl font-bold text-maroon-950 sm:text-4xl"
              >
                The problem is real
              </h2>
              <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto text-balance">
                Students arrive excited — then hit a wall of disconnected
                systems, missing info, and zero guidance.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <article key={stat.value} className="card-hover text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-maroon-100">
                    <stat.icon
                      className="h-6 w-6 text-maroon-900"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-5 text-4xl font-bold text-maroon-900 font-display">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-medium text-surface-900">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-sm text-surface-500">{stat.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------
            Features Section
            -------------------------------------------------------- */}
        <section
          className="py-20 sm:py-28 bg-surface-50"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2
                id="features-heading"
                className="text-3xl font-bold text-maroon-950 sm:text-4xl"
              >
                Everything a Tiger needs
              </h2>
              <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto text-balance">
                Six tools designed around how students actually navigate campus
                life.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="card-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100">
                    <feature.icon
                      className="h-6 w-6 text-gold-700"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-surface-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-surface-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------
            Institutional Value Section — Admin Audience
            -------------------------------------------------------- */}
        <section
          className="py-20 sm:py-28 bg-maroon-900"
          aria-labelledby="value-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2
                id="value-heading"
                className="text-3xl font-bold text-white sm:text-4xl"
              >
                Why this matters for TSU
              </h2>
              <p className="mt-4 text-lg text-maroon-200 max-w-2xl mx-auto text-balance">
                Tiger M.A.T.E isn&apos;t just a student tool — it&apos;s a
                strategic asset for the institution.
              </p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {valueProps.map((prop) => (
                <article
                  key={prop.title}
                  className="rounded-2xl bg-maroon-800/50 border border-maroon-700 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/20">
                    <prop.icon
                      className="h-6 w-6 text-gold-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {prop.title}
                  </h3>
                  <p className="mt-2 text-maroon-200 text-sm leading-relaxed">
                    {prop.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------
            CTA Section
            -------------------------------------------------------- */}
        <section className="py-20 sm:py-28 bg-white" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2
              id="cta-heading"
              className="text-3xl font-bold text-maroon-950 sm:text-4xl"
            >
              Ready to meet your M.A.T.E?
            </h2>
            <p className="mt-4 text-lg text-surface-600 text-balance">
              Sign up with your TSU email and get instant access to your
              personalized campus dashboard.
            </p>
            <div className="mt-10">
              <Link href="/signup" className="btn-gold text-base px-10 py-4">
                Create Your Account
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------
          Footer
          -------------------------------------------------------- */}
      <footer className="border-t border-surface-200 bg-surface-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <Logo size="sm" />
            <p className="text-sm text-surface-500 text-center">
              Built with 🐅 for Texas Southern University
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
