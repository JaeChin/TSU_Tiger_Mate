"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  MapPin,
  MessageCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Events", icon: Calendar },
  { href: "/dashboard/todos", label: "To-Dos", icon: CheckSquare },
  { href: "/dashboard/resources", label: "Resources", icon: MapPin },
  { href: "/dashboard/ask-mate", label: "Ask M.A.T.E", icon: MessageCircle },
] as const;

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-200">
        <Link href="/dashboard" aria-label="Dashboard home">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Dashboard navigation">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-maroon-900 text-white"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              )}
              aria-current={active ? "page" : undefined}
            >
              <link.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="border-t border-surface-200 px-4 py-4">
        <p className="truncate text-sm font-medium text-surface-900">{userName}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-surface-200 shadow-sm lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-surface-700" aria-hidden="true" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-surface-200 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-100"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5 text-surface-500" aria-hidden="true" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-surface-200 lg:bg-white"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
