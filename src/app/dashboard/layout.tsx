import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !DEV_BYPASS) {
    redirect("/login");
  }

  let userName = "Tiger";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    userName = profile?.full_name || profile?.email || user.email || "Tiger";
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-[#0F0F0F]">
      <Sidebar userName={userName} />

      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pt-16 sm:px-6 sm:py-8 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
