/**
 * Join class names, filtering out falsy values.
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Validate that an email address ends with .edu
 */
export function validateEduEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;

  // Basic email format check + .edu domain
  const eduPattern = /^[^\s@]+@[^\s@]+\.edu$/i;
  return eduPattern.test(trimmed);
}

/**
 * Format a date as "Mon DD, YYYY" (e.g., "Jan 15, 2026")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a time as "H:MM AM/PM" (e.g., "2:30 PM")
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Map raw Supabase / network error messages to user-friendly text.
 */
export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed")) {
    return "Unable to reach the server. Your Supabase project may be paused — check your dashboard at supabase.com, or try again later.";
  }
  return message;
}

/**
 * Return a greeting based on the current hour.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
