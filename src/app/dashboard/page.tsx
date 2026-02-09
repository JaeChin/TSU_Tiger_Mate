import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  MapPin,
  MessageCircle,
  ArrowRight,
  Clock,
  MapPinIcon,
  Star,
  CircleDot,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGreeting, formatDate, formatTime } from "@/lib/utils";

const quickActions = [
  {
    href: "/dashboard/events",
    label: "Events",
    icon: Calendar,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    href: "/dashboard/todos",
    label: "To-Dos",
    icon: CheckSquare,
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    href: "/dashboard/resources",
    label: "Resources",
    icon: MapPin,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    href: "/dashboard/ask-mate",
    label: "Ask M.A.T.E",
    icon: MessageCircle,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
] as const;

const priorityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] || "Tiger";

  // Fetch upcoming events (next 3 from now)
  const { data: events } = await supabase
    .from("events")
    .select("id, title, location, start_time, is_featured, category")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(3);

  // Fetch user's incomplete todos (up to 3)
  const { data: todos } = await supabase
    .from("todos")
    .select("id, title, priority, due_date")
    .eq("user_id", user!.id)
    .eq("is_completed", false)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(3);

  const greeting = getGreeting();

  return (
    <>
      {/* --------------------------------------------------------
          Welcome Banner
          -------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-900 to-maroon-950 px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="relative z-10 text-2xl font-bold text-white sm:text-3xl">
          {greeting}, {firstName} 🐅
        </h1>
        <p className="relative z-10 mt-2 text-maroon-200 text-sm sm:text-base">
          Here&apos;s what&apos;s happening on campus today.
        </p>

        {/* Decorative gold blurs */}
        <div
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-500/15 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-8 right-1/3 h-32 w-32 rounded-full bg-gold-500/10 blur-2xl"
          aria-hidden="true"
        />
      </section>

      {/* --------------------------------------------------------
          Quick Actions
          -------------------------------------------------------- */}
      <section className="mt-6" aria-label="Quick actions">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-hover flex flex-col items-center gap-3 py-6 text-center"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg}`}>
                <action.icon className={`h-6 w-6 ${action.iconColor}`} aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-surface-900">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------
          Two-Column: Events + Todos
          -------------------------------------------------------- */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <section className="card" aria-labelledby="upcoming-events-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="upcoming-events-heading" className="text-lg font-semibold text-surface-900">
              Upcoming Events
            </h2>
            <Link
              href="/dashboard/events"
              className="flex items-center gap-1 text-sm font-medium text-maroon-900 hover:text-maroon-700"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <ul className="space-y-3">
              {events.map((event) => {
                const date = new Date(event.start_time);
                const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const day = date.getDate();

                return (
                  <li key={event.id}>
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-surface-50"
                    >
                      {/* Date block */}
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-maroon-50 text-maroon-900">
                        <span className="text-[10px] font-semibold uppercase leading-none">
                          {month}
                        </span>
                        <span className="text-xl font-bold leading-tight">{day}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-surface-900">
                            {event.title}
                          </p>
                          {event.is_featured && (
                            <Star className="h-3.5 w-3.5 shrink-0 text-gold-500 fill-gold-500" aria-label="Featured event" />
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {formatTime(event.start_time)}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                              <span className="truncate max-w-[150px]">{event.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl bg-surface-50 py-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-surface-300" aria-hidden="true" />
              <p className="mt-2 text-sm text-surface-500">No upcoming events</p>
            </div>
          )}
        </section>

        {/* My To-Dos */}
        <section className="card" aria-labelledby="my-todos-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="my-todos-heading" className="text-lg font-semibold text-surface-900">
              My To-Dos
            </h2>
            <Link
              href="/dashboard/todos"
              className="flex items-center gap-1 text-sm font-medium text-maroon-900 hover:text-maroon-700"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {todos && todos.length > 0 ? (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-50"
                >
                  <CircleDot
                    className={`h-4 w-4 shrink-0 ${priorityColors[todo.priority] ? `text-${todo.priority === "high" ? "red" : todo.priority === "medium" ? "amber" : "green"}-500` : "text-surface-400"}`}
                    aria-label={`${todo.priority} priority`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {todo.title}
                    </p>
                    {todo.due_date && (
                      <p className="text-xs text-surface-500 mt-0.5">
                        Due {formatDate(todo.due_date)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl bg-surface-50 py-8 text-center">
              <CheckSquare className="mx-auto h-8 w-8 text-surface-300" aria-hidden="true" />
              <p className="mt-2 text-sm text-surface-500">No to-dos yet</p>
              <Link
                href="/dashboard/todos"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-maroon-900 hover:text-maroon-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add your first to-do
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* --------------------------------------------------------
          Ask M.A.T.E CTA
          -------------------------------------------------------- */}
      <Link
        href="/dashboard/ask-mate"
        className="mt-6 block"
        aria-label="Ask M.A.T.E — AI campus assistant"
      >
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 px-6 py-6 sm:px-8 sm:py-8 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-maroon-900/10">
              <MessageCircle className="h-6 w-6 text-maroon-950" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-maroon-950">
                Need help? Ask M.A.T.E
              </h2>
              <p className="mt-0.5 text-sm text-maroon-900/70">
                Your AI campus assistant — get answers about TSU life, classes, and resources.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-maroon-950" aria-hidden="true" />
          </div>

          <div
            className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gold-300/40 blur-xl"
            aria-hidden="true"
          />
        </section>
      </Link>
    </>
  );
}
