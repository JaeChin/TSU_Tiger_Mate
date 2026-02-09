import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiger M.A.T.E — My Academic Transition Experience",
  description:
    "Your all-in-one campus companion for Texas Southern University. Centralized dashboard for events, resources, academics, and AI-powered guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
