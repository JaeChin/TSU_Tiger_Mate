"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateEduEmail, friendlyAuthError } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!validateEduEmail(trimmedEmail)) {
      setError("Please use a valid .edu email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );

      setLoading(false);

      if (resetError) {
        setError(friendlyAuthError(resetError.message));
        return;
      }
    } catch {
      setLoading(false);
      setError("Unable to reach the server. Your Supabase project may be paused — check your dashboard at supabase.com, or try again later.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <section className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-100">
          <Mail className="h-7 w-7 text-gold-600" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-maroon-950">
          Check your inbox!
        </h1>
        <p className="mt-3 text-sm text-surface-600 leading-relaxed">
          If an account exists for{" "}
          <strong className="text-surface-900">{email.trim()}</strong>, we sent a
          password reset link. Check your email and follow the instructions.
        </p>
        <Link href="/login" className="btn-primary mt-8 w-full">
          Back to Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="card p-8">
      <h1 className="text-2xl font-bold text-maroon-950 text-center">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-surface-500 text-center">
        Enter your .edu email and we&apos;ll send you a reset link.
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
          <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-maroon-900 hover:text-maroon-700">
          Sign in
        </Link>
      </p>
    </section>
  );
}
