import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <header className="px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Back to home">
          <Logo size="sm" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
