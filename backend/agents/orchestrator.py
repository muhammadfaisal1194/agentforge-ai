"""
Orchestrator is represented by the LangGraph state machine itself.
This module provides helpers used across the workflow.
"""
from dataclasses import dataclass, field
from typing import Any, Callable, Coroutine


@dataclass
class WorkflowState:
    task_id: str
    description: str
    broadcast: Callable[[str, dict], Coroutine]
    research_output: str = ""
    analysis_output: str = ""
    discussion_summary: str = ""
    draft_output: str = ""
    review_output: str = ""
    review_score: int = 0
    revision_count: int = 0
    final_output: str = ""
    current_step: str = "research"
    error: str = ""
