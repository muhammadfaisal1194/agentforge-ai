"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AgentEvent } from "@/lib/websocket";

const AGENT_COLORS: Record<string, string> = {
  Researcher: "#06B6D4",
  Analyst: "#8B5CF6",
  Writer: "#10B981",
  Reviewer: "#F59E0B",
  Orchestrator: "#EC4899",
};

const AGENT_ICONS: Record<string, string> = {
  Researcher: "🔍",
  Analyst: "📊",
  Writer: "✍️",
  Reviewer: "✅",
  Orchestrator: "🎯",
};

function formatTime(ts?: string) {
  if (!ts) return "";
  try {
    const d = new Date(ts + "Z");
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

interface Props {
  events: AgentEvent[];
}

export function AgentChat({ events }: Props) {
  const chatEvents = events.filter((e) => e.type === "agent_chat" && e.from && e.message);

  // Use "Analyst" as the "left" side — messages from others appear on right
  const PRIMARY = "Analyst";

  return (
    <div className="h-full overflow-y-auto p-2">
      {chatEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
          <span className="text-4xl">💬</span>
          <p className="text-sm">Agent discussion will appear here...</p>
          <p className="text-xs text-slate-700">Starts after research & analysis phases</p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          <AnimatePresence>
            {chatEvents.map((event, i) => {
              const isLeft = event.from === PRIMARY;
              const agentName = event.from!;
              const color = AGENT_COLORS[agentName] || "#64748b";
              const icon = AGENT_ICONS[agentName] || "🤖";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, x: isLeft ? -20 : 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
                  className={`flex items-end gap-2 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mb-1"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    {icon}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${isLeft ? "items-start" : "items-end"} flex flex-col gap-1`}>
                    <span
                      className="text-xs font-semibold"
                      style={{ color }}
                    >
                      {agentName} → {event.to}
                    </span>
                    <div
                      className="px-4 py-3 rounded-2xl text-sm text-slate-200 leading-relaxed"
                      style={{
                        background: isLeft ? `${color}18` : "#1e1e2e",
                        borderBottomLeftRadius: isLeft ? 4 : 16,
                        borderBottomRightRadius: isLeft ? 16 : 4,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      {event.message}
                    </div>
                    <span className="text-xs text-slate-600">{formatTime(event.timestamp)}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
