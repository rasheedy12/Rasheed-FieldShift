import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasheed FieldShift — Smarter Farming Decisions with NASA Data",
  description:
    "NASA Space Apps Challenge 2026: Rain-fed agriculture decision support for smallholder farmers in Azare, Bauchi State, Nigeria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
