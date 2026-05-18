"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type AgentName = "Researcher" | "Analyst" | "Writer" | "Reviewer" | "Orchestrator";
export type WorkflowStep = "research" | "analysis" | "discussion" | "writing" | "review" | "complete";

export interface AgentEvent {
  type: string;
  timestamp?: string;
  agent?: AgentName;
  message?: string;
  tool?: string;
  input?: string;
  from?: AgentName;
  to?: AgentName;
  step?: WorkflowStep;
  status?: "active" | "done" | "error";
  output?: string;
  score?: number;
}

export interface AgentStatus {
  name: AgentName;
  status: "idle" | "thinking" | "working" | "done" | "error";
  lastAction: string;
  color: string;
  icon: string;
  role: string;
}

const AGENT_META: Record<AgentName, Omit<AgentStatus, "status" | "lastAction">> = {
  Researcher: { name: "Researcher", color: "#06B6D4", icon: "🔍", role: "Senior Research Specialist" },
  Analyst: { name: "Analyst", color: "#8B5CF6", icon: "📊", role: "Data Analyst" },
  Writer: { name: "Writer", color: "#10B981", icon: "✍️", role: "Content Writer" },
  Reviewer: { name: "Reviewer", color: "#F59E0B", icon: "✅", role: "Quality Reviewer" },
  Orchestrator: { name: "Orchestrator", color: "#EC4899", icon: "🎯", role: "Workflow Orchestrator" },
};

function makeDefaultAgents(): AgentStatus[] {
  return (Object.keys(AGENT_META) as AgentName[]).map((name) => ({
    ...AGENT_META[name],
    status: "idle",
    lastAction: "Waiting...",
  }));
}

const STEP_ORDER: WorkflowStep[] = ["research", "analysis", "discussion", "writing", "review", "complete"];

export function useAgentStream(taskId: string | null) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(makeDefaultAgents());
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [output, setOutput] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<NodeJS.Timeout | null>(null);

  const resetState = useCallback(() => {
    setEvents([]);
    setAgentStatuses(makeDefaultAgents());
    setCurrentStep(null);
    setCompletedSteps([]);
    setOutput(null);
    setIsComplete(false);
    setError(null);
  }, []);

  const handleEvent = useCallback((event: AgentEvent) => {
    setEvents((prev) => [...prev, event]);

    if (event.type === "agent_start" || event.type === "agent_thought" || event.type === "agent_action") {
      const agentName = event.agent;
      if (agentName && AGENT_META[agentName]) {
        setAgentStatuses((prev) =>
          prev.map((a) =>
            a.name === agentName
              ? {
                  ...a,
                  status: event.type === "agent_start" ? "working" : "thinking",
                  lastAction: event.message || event.input || "Working...",
                }
              : a
          )
        );
      }
    }

    if (event.type === "agent_result") {
      const agentName = event.agent;
      if (agentName && AGENT_META[agentName]) {
        setAgentStatuses((prev) =>
          prev.map((a) =>
            a.name === agentName
              ? { ...a, status: "done", lastAction: event.message || "Done" }
              : a
          )
        );
      }
    }

    if (event.type === "workflow_step") {
      const step = event.step as WorkflowStep;
      if (event.status === "active") {
        setCurrentStep(step);
      }
      if (event.status === "done") {
        setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
      }
    }

    if (event.type === "task_complete") {
      setOutput(event.output || null);
      setIsComplete(true);
      setCurrentStep("complete");
      setCompletedSteps(STEP_ORDER);
      setAgentStatuses((prev) => prev.map((a) => ({ ...a, status: "done" })));
    }

    if (event.type === "error") {
      setError(event.message || "An error occurred");
    }
  }, []);

  useEffect(() => {
    if (!taskId) return;

    resetState();

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/${taskId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 25000);
    };

    ws.onmessage = (e) => {
      try {
        const event: AgentEvent = JSON.parse(e.data);
        if (event.type === "pong") return;
        handleEvent(event);
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (pingRef.current) clearInterval(pingRef.current);
    };

    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
      ws.close();
    };
  }, [taskId, handleEvent, resetState]);

  return {
    events,
    agentStatuses,
    currentStep,
    completedSteps,
    output,
    isComplete,
    isConnected,
    error,
  };
}
