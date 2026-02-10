import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";

const badgeClass: Record<string, string> = {
  academic: "badge-academic",
  social: "badge-social",
  sports: "badge-sports",
  career: "badge-career",
  health: "badge-health",
  cultural: "badge-cultural",
  other: "badge-campus",
};

interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, location, category, start_time, end_time, is_featured")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.start_time);
  const month = startDate
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = startDate.getDate();
  const weekday = startDate.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <>
      {/* Back Link */}
      <Link
        href="/dashboard/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-maroon-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Events
      </Link>

      <article className="card">
        {/* Header */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Date Block */}
          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-maroon-100 text-maroon-900">
            <span className="text-xs font-semibold uppercase leading-none">
              {month}
            </span>
            <span className="text-3xl font-bold leading-tight">{day}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-bold text-maroon-950 sm:text-2xl leading-snug">
                {event.title}
              </h1>
              {event.is_featured && (
                <Star
                  className="mt-1 h-5 w-5 shrink-0 fill-gold-500 text-gold-500"
                  aria-label="Featured event"
                />
              )}
            </div>

            <div className="mt-1">
              <span className={badgeClass[event.category] || "badge-campus"}>
                {event.category.charAt(0).toUpperCase() +
                  event.category.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl bg-surface-50 p-4">
            <Calendar
              className="mt-0.5 h-5 w-5 shrink-0 text-maroon-900"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-surface-900">Date</p>
              <p className="text-sm text-surface-600">
                {weekday}, {formatDate(event.start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-surface-50 p-4">
            <Clock
              className="mt-0.5 h-5 w-5 shrink-0 text-maroon-900"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-surface-900">Time</p>
              <p className="text-sm text-surface-600">
                {formatTime(event.start_time)}
                {event.end_time && <> &ndash; {formatTime(event.end_time)}</>}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3 rounded-xl bg-surface-50 p-4">
              <MapPin
                className="mt-0.5 h-5 w-5 shrink-0 text-maroon-900"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-surface-900">Location</p>
                <p className="text-sm text-surface-600">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-surface-900">
              About this event
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-surface-600 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}
      </article>
    </>
  );
}
