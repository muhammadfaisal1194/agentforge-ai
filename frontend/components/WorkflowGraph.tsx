"use client";

import { motion } from "framer-motion";
import { WorkflowStep } from "@/lib/websocket";

const NODES = [
  { id: "research" as WorkflowStep, label: "Research", icon: "🔍", color: "#06B6D4", x: 8, y: 35 },
  { id: "analysis" as WorkflowStep, label: "Analysis", icon: "📊", color: "#8B5CF6", x: 28, y: 10 },
  { id: "discussion" as WorkflowStep, label: "Discussion", icon: "💬", color: "#EC4899", x: 50, y: 35 },
  { id: "writing" as WorkflowStep, label: "Writing", icon: "✍️", color: "#10B981", x: 70, y: 10 },
  { id: "review" as WorkflowStep, label: "Review", icon: "✅", color: "#F59E0B", x: 88, y: 35 },
];

const EDGES = [
  ["research", "analysis"],
  ["analysis", "discussion"],
  ["discussion", "writing"],
  ["writing", "review"],
  ["review", "writing"],   // revision loop (dashed)
];

const LOOP_EDGE_IDX = 4; // index of the revision loop edge

interface Props {
  currentStep: WorkflowStep | null;
  completedSteps: WorkflowStep[];
}

export function WorkflowGraph({ currentStep, completedSteps }: Props) {
  return (
    <div className="w-full h-28 relative">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="wfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" fill="#8B5CF640" />
          </marker>
        </defs>

        {EDGES.map(([from, to], i) => {
          const fromNode = NODES.find((n) => n.id === from)!;
          const toNode = NODES.find((n) => n.id === to)!;
          const isLoop = i === LOOP_EDGE_IDX;
          const isDone = completedSteps.includes(from as WorkflowStep);
          const isActive = currentStep === from || currentStep === to;

          if (isLoop) {
            // Draw the revision loop as a curved arc above the nodes
            const mx = (fromNode.x + toNode.x) / 2;
            return (
              <path
                key={i}
                d={`M ${toNode.x + 4} ${toNode.y + 4} Q ${mx + 4} 2 ${fromNode.x + 4} ${fromNode.y + 4}`}
                fill="none"
                stroke="#F59E0B40"
                strokeWidth="0.4"
                strokeDasharray="1.5 1"
                markerEnd="url(#arrowhead)"
              />
            );
          }

          return (
            <line
              key={i}
              x1={fromNode.x + 4}
              y1={fromNode.y + 4}
              x2={toNode.x + 4}
              y2={toNode.y + 4}
              stroke={isDone ? "url(#wfGrad)" : isActive ? "#8B5CF660" : "#2A2A3E"}
              strokeWidth="0.5"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>

      {NODES.map((node) => {
        const isDone = completedSteps.includes(node.id);
        const isActive = currentStep === node.id;

        return (
          <div
            key={node.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{
                background: isDone
                  ? `${node.color}25`
                  : isActive
                  ? `${node.color}20`
                  : "#13131F",
                border: `1px solid ${isDone || isActive ? node.color + "60" : "#2A2A3E"}`,
                boxShadow: isActive ? `0 0 8px ${node.color}50` : undefined,
              }}
            >
              {isDone ? "✓" : node.icon}
            </motion.div>
            <span
              className="text-xs"
              style={{ color: isDone ? node.color : isActive ? node.color : "#64748b" }}
            >
              {node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
