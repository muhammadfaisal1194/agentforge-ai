"use client";

import { motion } from "framer-motion";
import { WorkflowStep } from "@/lib/websocket";

const STEPS: { key: WorkflowStep; label: string; icon: string }[] = [
  { key: "research", label: "Research", icon: "🔍" },
  { key: "analysis", label: "Analysis", icon: "📊" },
  { key: "discussion", label: "Discussion", icon: "💬" },
  { key: "writing", label: "Writing", icon: "✍️" },
  { key: "review", label: "Review", icon: "✅" },
  { key: "complete", label: "Done", icon: "🎯" },
];

interface Props {
  currentStep: WorkflowStep | null;
  completedSteps: WorkflowStep[];
}

export function ProgressBar({ currentStep, completedSteps }: Props) {
  const totalSteps = STEPS.length;
  const doneCount = completedSteps.length;
  const progressPct = (doneCount / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-3">
      {/* Step labels */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(step.key);
          const isActive = currentStep === step.key && !isDone;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all"
                style={{
                  background: isDone
                    ? "#10B98120"
                    : isActive
                    ? "#8B5CF620"
                    : "#13131F",
                  borderColor: isDone
                    ? "#10B981"
                    : isActive
                    ? "#8B5CF6"
                    : "#2A2A3E",
                }}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              >
                {isDone ? "✓" : isActive ? (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {step.icon}
                  </motion.span>
                ) : step.icon}
              </motion.div>
              <span
                className="text-xs text-center hidden sm:block"
                style={{
                  color: isDone ? "#10B981" : isActive ? "#8B5CF6" : "#64748b",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
