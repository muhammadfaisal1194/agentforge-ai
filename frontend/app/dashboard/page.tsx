"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Workflow, Wifi, WifiOff, AlertCircle, ArrowLeft } from "lucide-react";

import { useAgentStream } from "@/lib/websocket";
import { TaskForm } from "@/components/TaskForm";
import { AgentCard } from "@/components/AgentCard";
import { ProgressBar } from "@/components/ProgressBar";
import { WorkflowGraph } from "@/components/WorkflowGraph";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AgentChat } from "@/components/AgentChat";
import { OutputPanel } from "@/components/OutputPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Tab = "activity" | "chat" | "output";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTask = searchParams.get("task") || "";

  const [taskId, setTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [isRunning, setIsRunning] = useState(false);

  const {
    events,
    agentStatuses,
    currentStep,
    completedSteps,
    output,
    isComplete,
    isConnected,
    error,
  } = useAgentStream(taskId);

  // Auto-switch to output tab when complete
  useEffect(() => {
    if (isComplete) {
      setActiveTab("output");
      setIsRunning(false);
    }
  }, [isComplete]);

  // Auto-switch to chat when agent_chat events appear
  useEffect(() => {
    const hasChat = events.some((e) => e.type === "agent_chat");
    if (hasChat && activeTab === "activity") {
      // Don't force switch — just badge the tab
    }
  }, [events, activeTab]);

  const handleSubmit = useCallback(async (description: string) => {
    setIsRunning(true);
    setActiveTab("activity");

    const res = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create task: ${err}`);
    }

    const data = await res.json();
    setTaskId(data.task_id);
  }, []);

  const chatCount = events.filter((e) => e.type === "agent_chat").length;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "activity", label: "Activity Feed" },
    { key: "chat", label: "Agent Chat", badge: chatCount || undefined },
    { key: "output", label: "Output", badge: isComplete ? 1 : undefined },
  ];

  return (
    <div className="min-h-screen bg-bg grid-bg flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Workflow className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">AgentForge AI</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {taskId && (
            <div className="flex items-center gap-1.5 text-xs">
              {isConnected ? (
                <><Wifi className="w-3.5 h-3.5 text-success" /><span className="text-success">Live</span></>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-slate-600" /><span className="text-slate-600">Disconnected</span></>
              )}
            </div>
          )}
          <div className="text-xs text-slate-600 font-mono bg-card border border-border px-2 py-1 rounded">
            {taskId ? `task: ${taskId.slice(0, 8)}...` : "no active task"}
          </div>
        </div>
      </nav>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-6 py-3 bg-danger/10 border-b border-danger/30 text-danger text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left panel (40%) */}
        <div className="lg:w-[40%] flex-shrink-0 border-r border-border/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Task form */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Task Input
              </h2>
              <TaskForm
                onSubmit={handleSubmit}
                isRunning={isRunning}
                initialTask={initialTask}
              />
            </div>

            {/* Workflow graph */}
            {taskId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Workflow Graph
                </h2>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <WorkflowGraph
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                  />
                </div>
              </motion.div>
            )}

            {/* Progress */}
            {taskId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Progress
                </h2>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <ProgressBar
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                  />
                </div>
              </motion.div>
            )}

            {/* Agent cards */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Agent Status
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {agentStatuses.map((agent) => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 pt-5 pb-0 border-b border-border/50 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "text-primary border-primary bg-primary/5"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden p-6">
            <AnimatePresence mode="wait">
              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <ActivityFeed events={events} />
                </motion.div>
              )}
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <AgentChat events={events} />
                </motion.div>
              )}
              {activeTab === "output" && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <OutputPanel
                    output={output}
                    isComplete={isComplete}
                    score={events.find((e) => e.type === "task_complete")?.score}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-primary rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
