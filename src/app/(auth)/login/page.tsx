"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateEduEmail, friendlyAuthError } from "@/lib/utils";

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

const ERROR_MESSAGES: Record<string, string> = {
  expired: "Your password reset link has expired. Please request a new one.",
  invalid: "Invalid reset link. Please request a new password reset.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam && ERROR_MESSAGES[errorParam]) {
      setError(ERROR_MESSAGES[errorParam]);
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!validateEduEmail(trimmedEmail)) {
      setError("Please use a valid .edu email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        setLoading(false);
        setError(friendlyAuthError(authError.message));
        return;
      }
    } catch {
      setLoading(false);
      setError("Unable to reach the server. Your Supabase project may be paused — check your dashboard at supabase.com, or try again later.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="card p-8">
      <h1 className="text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5] text-center">
        Welcome back, Tiger
      </h1>
      <p className="mt-2 text-sm text-surface-500 dark:text-[#A0A0A0] text-center">
        Sign in with your .edu email to continue.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@tsu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-maroon-900 hover:text-maroon-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500 dark:text-[#A0A0A0]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-maroon-900 hover:text-maroon-700 dark:text-maroon-300 dark:hover:text-maroon-200">
          Create one
        </Link>
      </p>

      {DEV_BYPASS && (
        <Link
          href="/dashboard"
          className="mt-4 block w-full rounded-xl border-2 border-dashed border-surface-300 py-2.5 text-center text-sm font-medium text-surface-500 hover:border-maroon-300 hover:text-maroon-700"
        >
          Dev Mode: Skip to Dashboard
        </Link>
      )}
    </section>
  );
}
