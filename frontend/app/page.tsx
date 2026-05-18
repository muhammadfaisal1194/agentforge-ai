"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Eye, Brain, GitBranch, Users, Workflow } from "lucide-react";

const AGENT_NODES = [
  { id: "researcher", label: "Researcher", color: "#06B6D4", icon: "🔍", x: 10, y: 40 },
  { id: "analyst", label: "Analyst", color: "#8B5CF6", icon: "📊", x: 32, y: 20 },
  { id: "discussion", label: "Discussion", color: "#EC4899", icon: "💬", x: 52, y: 40 },
  { id: "writer", label: "Writer", color: "#10B981", icon: "✍️", x: 72, y: 20 },
  { id: "reviewer", label: "Reviewer", color: "#F59E0B", icon: "✅", x: 88, y: 40 },
];

const EDGES = [
  ["researcher", "analyst"],
  ["analyst", "discussion"],
  ["discussion", "writer"],
  ["writer", "reviewer"],
];

const FEATURES = [
  {
    icon: <Users className="w-6 h-6" />,
    color: "#8B5CF6",
    title: "Multi-Agent Collaboration",
    desc: "Specialized agents — Researcher, Analyst, Writer, and Reviewer — work as a coordinated team, each contributing their expertise.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    color: "#06B6D4",
    title: "Real-Time Visibility",
    desc: "Watch every agent's thoughts, actions, and inter-agent conversations as they happen in a live streaming dashboard.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    color: "#10B981",
    title: "Claude-Powered Intelligence",
    desc: "Every agent is powered by Claude, using LangChain, LangGraph, CrewAI, and AutoGen for orchestration.",
  },
];

const EXAMPLE_TASKS = [
  "Research top 5 CRM tools and compare pricing",
  "Write a go-to-market strategy for a fitness app",
  "Analyze pros/cons of microservices vs monolith",
  "Create a competitive analysis for an e-commerce startup",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg grid-bg overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">AgentForge AI</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all text-sm font-medium"
        >
          Open Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Powered by Claude · LangGraph · CrewAI · AutoGen
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">Give AI a task.</span>
            <br />
            <span className="text-slate-200">Watch a team of</span>
            <br />
            <span className="text-slate-200">agents get it done.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            AgentForge AI assembles a crew of specialized AI agents that autonomously
            research, analyze, write, and review — all visible in a live real-time dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg hover:opacity-90 transition-all glow-violet"
            >
              Try a Live Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-border bg-card text-slate-300 font-semibold text-lg hover:border-primary/50 transition-all"
            >
              How It Works
            </a>
          </div>
        </motion.div>

        {/* Animated workflow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full max-w-3xl mx-auto mt-20 h-40"
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60">
            {EDGES.map(([from, to], i) => {
              const fromNode = AGENT_NODES.find((n) => n.id === from)!;
              const toNode = AGENT_NODES.find((n) => n.id === to)!;
              return (
                <motion.line
                  key={i}
                  x1={fromNode.x + 5}
                  y1={fromNode.y + 4}
                  x2={toNode.x + 5}
                  y2={toNode.y + 4}
                  stroke="url(#edgeGrad)"
                  strokeWidth="0.5"
                  strokeDasharray="2 1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                />
              );
            })}
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {AGENT_NODES.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border"
                style={{
                  backgroundColor: `${node.color}15`,
                  borderColor: `${node.color}40`,
                  boxShadow: `0 0 12px ${node.color}30`,
                }}
              >
                {node.icon}
              </motion.div>
              <span className="text-xs text-slate-400 font-medium">{node.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Example tasks */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-slate-500 text-sm mb-6 font-medium uppercase tracking-widest">
            Example tasks you can run
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_TASKS.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={`/dashboard?task=${encodeURIComponent(task)}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-accent transition-colors flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{task}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-primary ml-auto transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A pipeline of specialized agents, each contributing their expertise
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { step: "1", label: "You enter a task", icon: "📝", color: "#8B5CF6" },
              { step: "2", label: "Researcher gathers info", icon: "🔍", color: "#06B6D4" },
              { step: "3", label: "Analyst structures it", icon: "📊", color: "#8B5CF6" },
              { step: "4", label: "Agents discuss & align", icon: "💬", color: "#EC4899" },
              { step: "5", label: "Writer creates content", icon: "✍️", color: "#10B981" },
              { step: "6", label: "Reviewer scores it", icon: "✅", color: "#F59E0B" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex md:flex-col items-center gap-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  {item.icon}
                </div>
                <span className="text-slate-400 text-xs text-center max-w-[80px]">
                  {item.label}
                </span>
                {i < 5 && (
                  <span className="text-slate-600 text-lg md:hidden">→</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Ready to forge your first workflow?
          </h2>
          <p className="text-slate-400 mb-8">
            No setup required. Enter a task and watch the agents work.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg hover:opacity-90 transition-all"
          >
            Launch Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-8 py-6 flex items-center justify-between text-slate-500 text-sm">
        <span className="gradient-text font-semibold">AgentForge AI</span>
        <span>Built with Claude · LangGraph · CrewAI · AutoGen</span>
      </footer>
    </div>
  );
}
