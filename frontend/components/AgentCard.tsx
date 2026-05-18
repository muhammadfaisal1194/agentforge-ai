"use client";

import { motion } from "framer-motion";
import { AgentStatus } from "@/lib/websocket";

const STATUS_LABELS: Record<AgentStatus["status"], string> = {
  idle: "Idle",
  thinking: "Thinking...",
  working: "Working",
  done: "Done",
  error: "Error",
};

const STATUS_COLORS: Record<AgentStatus["status"], string> = {
  idle: "#64748b",
  thinking: "#F59E0B",
  working: "#06B6D4",
  done: "#10B981",
  error: "#EF4444",
};

interface Props {
  agent: AgentStatus;
}

export function AgentCard({ agent }: Props) {
  const isActive = agent.status === "working" || agent.status === "thinking";
  const statusColor = STATUS_COLORS[agent.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4 rounded-xl border bg-card overflow-hidden"
      style={{ borderColor: isActive ? `${agent.color}60` : "#2A2A3E" }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at 50% 0%, ${agent.color}, transparent 70%)` }}
        />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon + pulse */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
          >
            {agent.icon}
          </div>
          {isActive && (
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card"
              style={{ backgroundColor: statusColor }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {!isActive && agent.status !== "idle" && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card"
              style={{ backgroundColor: statusColor }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-slate-100 text-sm">{agent.name}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ color: statusColor, background: `${statusColor}15` }}
            >
              {STATUS_LABELS[agent.status]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-1">{agent.role}</p>
          <p className="text-xs text-slate-400 truncate">{agent.lastAction}</p>
        </div>
      </div>
    </motion.div>
  );
}
