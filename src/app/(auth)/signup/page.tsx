"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateEduEmail } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!validateEduEmail(trimmedEmail)) {
      setError("Please use a valid .edu email address.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
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
          Check your inbox!
        </h1>
        <p className="mt-3 text-sm text-surface-600 leading-relaxed">
          We sent a confirmation link to{" "}
          <strong className="text-surface-900">{email.trim()}</strong>.
          Click it to activate your account.
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
        Meet your M.A.T.E
      </h1>
      <p className="mt-2 text-sm text-surface-500 text-center">
        Create an account with your .edu email to get started.
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
          <label htmlFor="full-name" className="block text-sm font-medium text-surface-700 mb-1.5">
            Full name
          </label>
          <input
            id="full-name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
            Password
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-maroon-900 hover:text-maroon-700">
          Sign in
        </Link>
      </p>
    </section>
  );
}
