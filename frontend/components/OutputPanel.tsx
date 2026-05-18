"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Download, CheckCircle } from "lucide-react";

interface Props {
  output: string | null;
  isComplete: boolean;
  score?: number;
}

export function OutputPanel({ output, isComplete, score }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentforge-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isComplete || !output) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-700 border-t-primary rounded-full"
        />
        <p className="text-sm">Output will appear when all agents finish...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span className="font-semibold text-slate-100">Final Output</span>
          {score !== undefined && score > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: score >= 8 ? "#10B98120" : "#F59E0B20",
                color: score >= 8 ? "#10B981" : "#F59E0B",
                border: `1px solid ${score >= 8 ? "#10B98140" : "#F59E0B40"}`,
              }}
            >
              Quality: {score}/10
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-all text-xs text-slate-400 hover:text-slate-200"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-accent/40 transition-all text-xs text-slate-400 hover:text-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl border border-border bg-card/50">
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
