"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  GraduationCap,
  DollarSign,
  Heart,
  Shield,
  Apple,
  Monitor,
  Briefcase,
  BookOpen,
  Stethoscope,
  Home,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  DollarSign,
  Heart,
  Shield,
  Apple,
  Monitor,
  Briefcase,
  BookOpen,
  Stethoscope,
  Home,
};

const categoryColors: Record<string, string> = {
  academic: "bg-blue-100 text-blue-700",
  financial: "bg-amber-100 text-amber-700",
  health: "bg-teal-100 text-teal-700",
  safety: "bg-red-100 text-red-700",
  dining: "bg-orange-100 text-orange-700",
  technology: "bg-indigo-100 text-indigo-700",
  career: "bg-purple-100 text-purple-700",
  housing: "bg-emerald-100 text-emerald-700",
};

const badgeClass: Record<string, string> = {
  academic: "badge-academic",
  financial: "badge-financial",
  health: "badge-health",
  safety: "badge-campus",
  dining: "badge-social",
  technology: "badge-career",
  career: "badge-career",
  housing: "badge-sports",
};

interface Resource {
  id: string;
  name: string;
  description: string | null;
  category: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  icon: string | null;
}

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const filtered = query
    ? resources.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query))
      )
    : resources;

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search resources by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
          aria-label="Search campus resources"
        />
      </div>

      {/* Resource Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((resource) => {
            const IconComponent = resource.icon
              ? iconMap[resource.icon]
              : null;
            const colorClasses =
              categoryColors[resource.category] || "bg-surface-100 text-surface-700";

            return (
              <article key={resource.id} className="card-hover">
                {/* Header: Icon + Name + Badge */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClasses}`}
                  >
                    {IconComponent ? (
                      <IconComponent className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-surface-900 leading-snug">
                      {resource.name}
                    </h2>
                    <span
                      className={`mt-1 ${badgeClass[resource.category] || "badge-campus"}`}
                    >
                      {resource.category.charAt(0).toUpperCase() +
                        resource.category.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {resource.description && (
                  <p className="mt-3 text-sm text-surface-500 leading-relaxed">
                    {resource.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="mt-3 space-y-1.5 text-sm text-surface-600">
                  {resource.location && (
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-surface-400"
                        aria-hidden="true"
                      />
                      <span>{resource.location}</span>
                    </div>
                  )}
                  {resource.hours && (
                    <div className="flex items-start gap-2">
                      <Clock
                        className="mt-0.5 h-4 w-4 shrink-0 text-surface-400"
                        aria-hidden="true"
                      />
                      <span>{resource.hours}</span>
                    </div>
                  )}
                  {resource.phone && (
                    <div className="flex items-start gap-2">
                      <Phone
                        className="mt-0.5 h-4 w-4 shrink-0 text-surface-400"
                        aria-hidden="true"
                      />
                      <a
                        href={`tel:${resource.phone}`}
                        className="text-maroon-900 hover:text-maroon-700 font-medium"
                      >
                        {resource.phone}
                      </a>
                    </div>
                  )}
                  {resource.email && (
                    <div className="flex items-start gap-2">
                      <Mail
                        className="mt-0.5 h-4 w-4 shrink-0 text-surface-400"
                        aria-hidden="true"
                      />
                      <a
                        href={`mailto:${resource.email}`}
                        className="text-maroon-900 hover:text-maroon-700 font-medium"
                      >
                        {resource.email}
                      </a>
                    </div>
                  )}
                  {resource.website && (
                    <div className="flex items-start gap-2">
                      <Globe
                        className="mt-0.5 h-4 w-4 shrink-0 text-surface-400"
                        aria-hidden="true"
                      />
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-maroon-900 hover:text-maroon-700 font-medium truncate"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-surface-200 bg-white py-16 text-center">
          <Search
            className="mx-auto h-10 w-10 text-surface-300"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-lg font-semibold text-surface-900">
            No resources found
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Try a different search term.
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="btn-secondary mt-6 text-sm px-4 py-2"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </>
  );
}
