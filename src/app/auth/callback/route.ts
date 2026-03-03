import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_NEXT_PATHS = ["/dashboard", "/reset-password"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // Validate the redirect target against an allowlist to prevent open redirects
  const redirectTo =
    next && ALLOWED_NEXT_PATHS.includes(next) ? next : "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth code exchange failed — send user back to login with context
  const failurePath =
    redirectTo === "/reset-password" ? "/login?error=expired" : "/login";
  return NextResponse.redirect(`${origin}${failurePath}`);
}
