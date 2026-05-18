import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentForge AI — Multi-Agent Workflow Automation",
  description: "Give AI a task. Watch a team of specialized agents get it done.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-slate-200 antialiased">{children}</body>
    </html>
  );
}
