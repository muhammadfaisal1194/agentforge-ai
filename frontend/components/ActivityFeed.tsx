"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentEvent } from "@/lib/websocket";

const AGENT_COLORS: Record<string, string> = {
  Researcher: "#06B6D4",
  Analyst: "#8B5CF6",
  Writer: "#10B981",
  Reviewer: "#F59E0B",
  Orchestrator: "#EC4899",
};

const TYPE_ICONS: Record<string, string> = {
  agent_start: "🚀",
  agent_thought: "💭",
  agent_action: "⚡",
  agent_result: "✅",
  agent_chat: "💬",
  workflow_step: "🔄",
  task_complete: "🎉",
  error: "❌",
  pong: "🏓",
};

function formatTime(ts?: string) {
  if (!ts) return "";
  try {
    const d = new Date(ts + "Z");
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

function EventRow({ event, index }: { event: AgentEvent; index: number }) {
  if (event.type === "pong") return null;

  const agentColor = event.agent ? AGENT_COLORS[event.agent] : event.from ? AGENT_COLORS[event.from] : "#64748b";
  const icon = TYPE_ICONS[event.type] || "•";
  const agentName = event.agent || event.from;

  let message = event.message || "";
  if (event.type === "agent_action") {
    message = `Used tool: ${event.tool} — "${event.input?.slice(0, 60) || ""}"`;
  }
  if (event.type === "agent_chat") {
    message = `${event.from} → ${event.to}: ${event.message}`;
  }
  if (event.type === "workflow_step") {
    message = `Step ${event.step} — ${event.status}`;
  }
  if (event.type === "task_complete") {
    message = "Task completed successfully!";
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5 py-2 px-3 rounded-lg hover:bg-white/3 transition-colors"
    >
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {agentName && (
            <span className="text-xs font-semibold" style={{ color: agentColor }}>
              {agentName}
            </span>
          )}
          <span className="text-xs text-slate-600">{formatTime(event.timestamp)}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed break-words">{message}</p>
      </div>
    </motion.div>
  );
}

interface Props {
  events: AgentEvent[];
}

export function ActivityFeed({ events }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const visible = events.filter((e) => e.type !== "pong");

  return (
    <div className="h-full overflow-y-auto pr-1">
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
          <span className="text-4xl">📡</span>
          <p className="text-sm">Waiting for agent activity...</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          <AnimatePresence>
            {visible.map((event, i) => (
              <EventRow key={i} event={event} index={i} />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
