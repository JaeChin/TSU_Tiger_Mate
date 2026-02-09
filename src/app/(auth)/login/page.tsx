"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateEduEmail } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="card p-8">
      <h1 className="text-2xl font-bold text-maroon-950 text-center">
        Welcome back, Tiger
      </h1>
      <p className="mt-2 text-sm text-surface-500 text-center">
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
            autoComplete="current-password"
            required
            placeholder="Your password"
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-maroon-900 hover:text-maroon-700">
          Create one
        </Link>
      </p>
    </section>
  );
}
