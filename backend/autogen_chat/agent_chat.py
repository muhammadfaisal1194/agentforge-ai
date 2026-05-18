"""
AutoGen-style inter-agent discussion between Researcher and Analyst.
Uses direct Claude API calls to simulate structured back-and-forth —
pyautogen 0.5+ rewrote its entire API, so we use the Anthropic SDK directly
for reliable results across all environments.
"""
import asyncio
import os
from typing import Callable, Coroutine


async def run_autogen_discussion(
    research_output: str,
    analysis_output: str,
    task_description: str,
    task_id: str,
    broadcast: Callable[[str, dict], Coroutine],
) -> str:
    await broadcast(task_id, {
        "type": "agent_start",
        "agent": "Orchestrator",
        "message": "Initiating Researcher ↔ Analyst discussion...",
    })

    return await _claude_discussion(
        research_output, analysis_output, task_description, task_id, broadcast
    )


async def _claude_discussion(
    research_output: str,
    analysis_output: str,
    task_description: str,
    task_id: str,
    broadcast: Callable[[str, dict], Coroutine],
) -> str:
    """
    Simulate a structured 3-turn discussion between Researcher and Analyst
    using Claude as both agents — each turn has a distinct persona prompt.
    """
    import anthropic

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    turns = [
        {
            "from_agent": "Analyst",
            "to_agent": "Researcher",
            "system": (
                "You are the Data Analyst reviewing research findings. "
                "Ask 1-2 targeted clarifying questions about the most important "
                "or uncertain data points before writing begins. Be concise."
            ),
            "user_content": (
                f"Task: {task_description}\n\n"
                f"Research findings:\n{research_output[:1200]}\n\n"
                f"My preliminary analysis:\n{analysis_output[:800]}\n\n"
                "What should I clarify with the Researcher before we proceed?"
            ),
        },
        {
            "from_agent": "Researcher",
            "to_agent": "Analyst",
            "system": (
                "You are the Senior Research Specialist who gathered the data. "
                "Answer the Analyst's questions concisely, clarify any uncertain points, "
                "and highlight which findings you consider most reliable. Be concise."
            ),
            "user_content": None,  # filled dynamically from previous turn
        },
        {
            "from_agent": "Analyst",
            "to_agent": "Researcher",
            "system": (
                "You are the Data Analyst. Acknowledge the Researcher's clarifications "
                "and state 2-3 aligned key insights you'll pass to the Writer. "
                "End with exactly: DISCUSSION COMPLETE: [one sentence summary of agreed insights]"
            ),
            "user_content": None,  # filled dynamically
        },
    ]

    last_message = ""
    summary = "Agents aligned on key research findings and analysis approach."

    for i, turn in enumerate(turns):
        if i == 0:
            user_content = turn["user_content"]
        elif i == 1:
            user_content = (
                f"The Analyst asked:\n{last_message}\n\n"
                f"Based on the research data:\n{research_output[:1000]}\n\n"
                "Please respond to their questions."
            )
        else:
            user_content = (
                f"The Researcher clarified:\n{last_message}\n\n"
                "Please provide your final alignment summary."
            )

        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=350,
            system=turn["system"],
            messages=[{"role": "user", "content": user_content}],
        )
        last_message = response.content[0].text

        await broadcast(task_id, {
            "type": "agent_chat",
            "from": turn["from_agent"],
            "to": turn["to_agent"],
            "message": last_message,
        })

        await asyncio.sleep(0.1)

        if "DISCUSSION COMPLETE:" in last_message:
            summary = last_message.split("DISCUSSION COMPLETE:")[-1].strip()

    return summary
