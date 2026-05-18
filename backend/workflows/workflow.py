"""
LangGraph workflow: Orchestrator state machine for the full agent pipeline.
"""
import asyncio
import os
import re
from typing import Callable, Coroutine, TypedDict

from langgraph.graph import StateGraph, END
from crewai import Task, Crew

from agents.researcher import make_researcher
from agents.analyst import make_analyst
from agents.writer import make_writer
from agents.reviewer import make_reviewer
from autogen_chat.agent_chat import run_autogen_discussion
from database.db import update_task


# ── State ──────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    task_id: str
    description: str
    broadcast: Callable
    research_output: str
    analysis_output: str
    discussion_summary: str
    draft_output: str
    review_output: str
    review_score: int
    revision_count: int
    final_output: str


# ── Helpers ────────────────────────────────────────────────────────────────────

async def emit(state: AgentState, event: dict):
    await state["broadcast"](state["task_id"], event)


def _run_crew(crew: Crew) -> str:
    """Run a CrewAI crew synchronously (called from executor)."""
    result = crew.kickoff()
    if hasattr(result, "raw"):
        return result.raw
    return str(result)


async def _crew_async(crew: Crew) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_crew, crew)


def _extract_score(review_text: str) -> int:
    """Parse SCORE: X/10 from reviewer output."""
    matches = re.findall(r"SCORE:\s*(\d+)\s*/\s*10", review_text, re.IGNORECASE)
    if matches:
        return min(10, max(1, int(matches[-1])))
    # Fallback: look for standalone digit near /10
    matches = re.findall(r"(\d+)\s*/\s*10", review_text)
    if matches:
        return min(10, max(1, int(matches[-1])))
    return 7  # default pass


# ── Nodes ──────────────────────────────────────────────────────────────────────

async def research_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "workflow_step",
        "step": "research",
        "status": "active",
    })
    await emit(state, {
        "type": "agent_start",
        "agent": "Researcher",
        "message": "Starting comprehensive research on your task...",
    })

    update_task(state["task_id"], current_step="research")

    researcher = make_researcher()
    task = Task(
        description=(
            f"Research the following task thoroughly: {state['description']}\n\n"
            "Use web search to find current, relevant information. "
            "Gather at least 3-5 key data points, statistics, or examples. "
            "Summarize your findings clearly."
        ),
        expected_output=(
            "A comprehensive research report with key findings, data points, "
            "relevant examples, and source references where possible."
        ),
        agent=researcher,
    )
    crew = Crew(agents=[researcher], tasks=[task], verbose=False)

    await emit(state, {
        "type": "agent_thought",
        "agent": "Researcher",
        "message": f"Searching for information about: {state['description'][:80]}...",
    })
    await emit(state, {
        "type": "agent_action",
        "agent": "Researcher",
        "tool": "web_search",
        "input": state["description"][:100],
    })

    result = await _crew_async(crew)

    await emit(state, {
        "type": "agent_result",
        "agent": "Researcher",
        "message": f"Research complete. Gathered {len(result.split())} words of findings.",
    })
    await emit(state, {
        "type": "workflow_step",
        "step": "research",
        "status": "done",
    })

    return {**state, "research_output": result}


async def analyse_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "workflow_step",
        "step": "analysis",
        "status": "active",
    })
    await emit(state, {
        "type": "agent_start",
        "agent": "Analyst",
        "message": "Analyzing research findings and extracting insights...",
    })

    update_task(state["task_id"], current_step="analysis")

    analyst = make_analyst()
    task = Task(
        description=(
            f"Analyze the following research findings for the task: {state['description']}\n\n"
            f"Research Output:\n{state['research_output']}\n\n"
            "Structure this into: key insights, comparisons, recommendations, and data gaps."
        ),
        expected_output=(
            "A structured analysis with clearly labeled sections: "
            "Key Insights, Comparative Analysis, Strategic Recommendations, and Data Quality Notes."
        ),
        agent=analyst,
    )
    crew = Crew(agents=[analyst], tasks=[task], verbose=False)

    await emit(state, {
        "type": "agent_thought",
        "agent": "Analyst",
        "message": "Processing research data and identifying patterns...",
    })

    result = await _crew_async(crew)

    await emit(state, {
        "type": "agent_result",
        "agent": "Analyst",
        "message": "Analysis complete. Structured insights ready for discussion.",
    })
    await emit(state, {
        "type": "workflow_step",
        "step": "analysis",
        "status": "done",
    })

    return {**state, "analysis_output": result}


async def autogen_discussion_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "workflow_step",
        "step": "discussion",
        "status": "active",
    })

    update_task(state["task_id"], current_step="discussion")

    summary = await run_autogen_discussion(
        research_output=state["research_output"],
        analysis_output=state["analysis_output"],
        task_description=state["description"],
        task_id=state["task_id"],
        broadcast=state["broadcast"],
    )

    await emit(state, {
        "type": "agent_result",
        "agent": "Orchestrator",
        "message": f"Discussion complete. Summary: {summary[:200]}",
    })
    await emit(state, {
        "type": "workflow_step",
        "step": "discussion",
        "status": "done",
    })

    return {**state, "discussion_summary": summary}


async def write_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "workflow_step",
        "step": "writing",
        "status": "active",
    })
    await emit(state, {
        "type": "agent_start",
        "agent": "Writer",
        "message": "Crafting the final content based on research and analysis...",
    })

    update_task(state["task_id"], current_step="writing")

    revision_context = ""
    if state.get("review_output") and state.get("revision_count", 0) > 0:
        revision_context = (
            f"\n\nPrevious draft was reviewed and needs revision. "
            f"Reviewer feedback:\n{state['review_output'][:800]}\n\n"
            f"Previous draft:\n{state.get('draft_output', '')[:1000]}\n\n"
            "Please address all feedback points in this revised version."
        )

    writer = make_writer()
    task = Task(
        description=(
            f"Write professional content for: {state['description']}\n\n"
            f"Based on this research:\n{state['research_output'][:1200]}\n\n"
            f"And this analysis:\n{state['analysis_output'][:800]}\n\n"
            f"Key aligned insights from team discussion: {state['discussion_summary']}"
            f"{revision_context}"
        ),
        expected_output=(
            "A polished, well-structured document with clear sections, "
            "professional tone, and actionable content. Use markdown formatting."
        ),
        agent=writer,
    )
    crew = Crew(agents=[writer], tasks=[task], verbose=False)

    await emit(state, {
        "type": "agent_thought",
        "agent": "Writer",
        "message": (
            "Revising draft based on reviewer feedback..."
            if state.get("revision_count", 0) > 0
            else "Structuring content and crafting the document..."
        ),
    })

    result = await _crew_async(crew)

    await emit(state, {
        "type": "agent_result",
        "agent": "Writer",
        "message": f"Draft complete. {len(result.split())} words written.",
    })
    await emit(state, {
        "type": "workflow_step",
        "step": "writing",
        "status": "done",
    })

    return {**state, "draft_output": result}


async def review_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "workflow_step",
        "step": "review",
        "status": "active",
    })
    await emit(state, {
        "type": "agent_start",
        "agent": "Reviewer",
        "message": "Quality reviewing the draft content...",
    })

    update_task(state["task_id"], current_step="review")

    reviewer = make_reviewer()
    task = Task(
        description=(
            f"Review this content for quality, accuracy, and completeness.\n\n"
            f"Original task: {state['description']}\n\n"
            f"Content to review:\n{state['draft_output']}\n\n"
            "Evaluate: accuracy, completeness, clarity, structure, and usefulness. "
            "Provide specific improvement suggestions. "
            "End your review with exactly: SCORE: X/10"
        ),
        expected_output=(
            "A detailed review with specific feedback on strengths and weaknesses, "
            "followed by SCORE: X/10 on its own line."
        ),
        agent=reviewer,
    )
    crew = Crew(agents=[reviewer], tasks=[task], verbose=False)

    await emit(state, {
        "type": "agent_thought",
        "agent": "Reviewer",
        "message": "Evaluating accuracy, completeness, and quality...",
    })

    result = await _crew_async(crew)
    score = _extract_score(result)

    await emit(state, {
        "type": "agent_result",
        "agent": "Reviewer",
        "message": f"Review complete. Quality score: {score}/10",
    })
    await emit(state, {
        "type": "workflow_step",
        "step": "review",
        "status": "done",
    })

    return {**state, "review_output": result, "review_score": score}


async def revise_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "agent_thought",
        "agent": "Orchestrator",
        "message": f"Score {state['review_score']}/10 — sending back for revision (attempt {state['revision_count'] + 1}/2)...",
    })
    new_revision_count = state.get("revision_count", 0) + 1
    # Clear review so write_node knows to use feedback
    return {
        **state,
        "revision_count": new_revision_count,
        "draft_output": state["draft_output"],  # keep old draft for context
    }


async def complete_node(state: AgentState) -> AgentState:
    await emit(state, {
        "type": "workflow_step",
        "step": "complete",
        "status": "active",
    })

    final = state["draft_output"]
    update_task(
        state["task_id"],
        status="completed",
        output=final,
        current_step="complete",
    )

    await emit(state, {
        "type": "task_complete",
        "output": final,
        "score": state["review_score"],
    })
    await emit(state, {
        "type": "workflow_step",
        "step": "complete",
        "status": "done",
    })

    return {**state, "final_output": final}


# ── Routing ────────────────────────────────────────────────────────────────────

def route_after_review(state: AgentState) -> str:
    if state["review_score"] >= 8 or state.get("revision_count", 0) >= 2:
        return "complete"
    return "revise"


# ── Graph ──────────────────────────────────────────────────────────────────────

def build_workflow():
    graph = StateGraph(AgentState)

    graph.add_node("research", research_node)
    graph.add_node("analyse", analyse_node)
    graph.add_node("autogen_discussion", autogen_discussion_node)
    graph.add_node("write", write_node)
    graph.add_node("review", review_node)
    graph.add_node("revise", revise_node)
    graph.add_node("complete", complete_node)

    graph.set_entry_point("research")
    graph.add_edge("research", "analyse")
    graph.add_edge("analyse", "autogen_discussion")
    graph.add_edge("autogen_discussion", "write")
    graph.add_edge("write", "review")
    graph.add_conditional_edges(
        "review",
        route_after_review,
        {"complete": "complete", "revise": "revise"},
    )
    graph.add_edge("revise", "write")
    graph.add_edge("complete", END)

    return graph.compile()


_workflow = None


def get_workflow():
    global _workflow
    if _workflow is None:
        _workflow = build_workflow()
    return _workflow


async def run_agent_workflow(task_id: str, description: str, broadcast: Callable):
    workflow = get_workflow()

    initial_state: AgentState = {
        "task_id": task_id,
        "description": description,
        "broadcast": broadcast,
        "research_output": "",
        "analysis_output": "",
        "discussion_summary": "",
        "draft_output": "",
        "review_output": "",
        "review_score": 0,
        "revision_count": 0,
        "final_output": "",
    }

    await broadcast(task_id, {
        "type": "agent_start",
        "agent": "Orchestrator",
        "message": f"Starting AgentForge workflow for: {description[:100]}",
    })

    await workflow.ainvoke(initial_state)
