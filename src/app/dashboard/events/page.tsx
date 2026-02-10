import Link from "next/link";
import { Calendar, Clock, MapPin, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatTime, cn } from "@/lib/utils";

const categories = [
  { label: "All Events", value: "all" },
  { label: "Academic", value: "academic" },
  { label: "Social", value: "social" },
  { label: "Sports", value: "sports" },
  { label: "Career", value: "career" },
  { label: "Health", value: "health" },
  { label: "Cultural", value: "cultural" },
] as const;

const badgeClass: Record<string, string> = {
  academic: "badge-academic",
  social: "badge-social",
  sports: "badge-sports",
  career: "badge-career",
  health: "badge-health",
  cultural: "badge-cultural",
  other: "badge-campus",
};

interface EventsPageProps {
  searchParams: { category?: string };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const activeCategory = searchParams.category || "all";

  const supabase = createClient();

  let query = supabase
    .from("events")
    .select("id, title, description, location, category, start_time, end_time, is_featured")
    .order("start_time", { ascending: true });

  if (activeCategory !== "all") {
    query = query.eq("category", activeCategory);
  }

  const { data: events } = await query;

  return (
    <>
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-maroon-950 sm:text-3xl">
          Campus Events
        </h1>
        <p className="mt-1 text-surface-600">
          Discover what&apos;s happening at TSU
        </p>
      </header>

      {/* Category Filter Bar */}
      <div className="relative mb-6">
        <nav
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
          aria-label="Filter events by category"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            const href =
              cat.value === "all"
                ? "/dashboard/events"
                : `/dashboard/events?category=${cat.value}`;

            return (
              <Link
                key={cat.value}
                href={href}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-maroon-900/30 focus-visible:ring-offset-2 focus:outline-none",
                  isActive
                    ? "bg-maroon-900 text-white"
                    : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50 hover:text-surface-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>
        {/* Scroll overflow hint — right gradient fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>

      {/* Events Grid */}
      {events && events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const date = new Date(event.start_time);
            const month = date
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase();
            const day = date.getDate();

            return (
              <article key={event.id} className="card-hover flex gap-4">
                {/* Date Block */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-maroon-100 text-maroon-900">
                  <span className="text-[10px] font-semibold uppercase leading-none">
                    {month}
                  </span>
                  <span className="text-2xl font-bold leading-tight">
                    {day}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Title Row */}
                  <div className="flex items-start gap-2">
                    <h2 className="text-base font-semibold text-surface-900 leading-snug">
                      {event.title}
                    </h2>
                    {event.is_featured && (
                      <Star
                        className="mt-0.5 h-4 w-4 shrink-0 fill-gold-500 text-gold-500"
                        aria-label="Featured event"
                      />
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="mt-1 text-sm text-surface-500 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Meta Row */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatTime(event.start_time)}
                      {event.end_time && (
                        <> &ndash; {formatTime(event.end_time)}</>
                      )}
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate max-w-[200px]">
                          {event.location}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mt-2">
                    <span className={badgeClass[event.category] || "badge-campus"}>
                      {event.category.charAt(0).toUpperCase() +
                        event.category.slice(1)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-surface-200 bg-white py-16 text-center">
          <Calendar
            className="mx-auto h-10 w-10 text-surface-300"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-lg font-semibold text-surface-900">
            No events found
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            {activeCategory !== "all"
              ? `There are no ${activeCategory} events right now. Try a different category.`
              : "Check back soon for upcoming campus events."}
          </p>
          {activeCategory !== "all" && (
            <Link
              href="/dashboard/events"
              className="btn-secondary mt-6 text-sm px-4 py-2"
            >
              View All Events
            </Link>
          )}
        </div>
      )}
    </>
  );
}
