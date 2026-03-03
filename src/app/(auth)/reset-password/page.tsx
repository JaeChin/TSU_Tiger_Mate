"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      setLoading(false);

      if (updateError) {
        setError(friendlyAuthError(updateError.message));
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-maroon-950">
          Password updated!
        </h1>
        <p className="mt-3 text-sm text-surface-600 leading-relaxed">
          Your password has been reset successfully. You&apos;re all set to
          continue.
        </p>
        <Link href="/dashboard" className="btn-primary mt-8 w-full">
          Continue to Dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="card p-8">
      <h1 className="text-2xl font-bold text-maroon-950 text-center">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-surface-500 text-center">
        Choose a strong password for your account.
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
          <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-surface-700 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              Updating password...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        <Link href="/login" className="font-medium text-maroon-900 hover:text-maroon-700">
          Back to Sign In
        </Link>
      </p>
    </section>
  );
}
