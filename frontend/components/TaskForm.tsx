"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

const EXAMPLE_TASKS = [
  "Research top 5 CRM tools and compare pricing",
  "Write a go-to-market strategy for a fitness app",
  "Analyze pros/cons of microservices vs monolith",
];

interface Props {
  onSubmit: (description: string) => Promise<void>;
  isRunning: boolean;
  initialTask?: string;
}

export function TaskForm({ onSubmit, isRunning, initialTask }: Props) {
  const [description, setDescription] = useState(initialTask || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isRunning || isLoading) return;
    setIsLoading(true);
    try {
      await onSubmit(description.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleExample = (task: string) => {
    setDescription(task);
  };

  const busy = isRunning || isLoading;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your task... e.g. Research competitors and write a marketing strategy"
            rows={4}
            disabled={busy}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-600">
            {description.length}/500
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!description.trim() || busy}
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.98 } : {}}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: busy
              ? "linear-gradient(135deg, #4c1d95, #0e7490)"
              : "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            color: "white",
          }}
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Agents working...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Launch Agent Crew
            </>
          )}
        </motion.button>
      </form>

      {/* Example tasks */}
      <div className="space-y-2">
        <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Try an example</p>
        <div className="space-y-1.5">
          {EXAMPLE_TASKS.map((task, i) => (
            <button
              key={i}
              onClick={() => handleExample(task)}
              disabled={busy}
              className="w-full text-left px-3 py-2 rounded-lg border border-border bg-card/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-primary mr-2">→</span>
              {task}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
