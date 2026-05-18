import os
from crewai import Agent, LLM


def make_reviewer() -> Agent:
    llm = LLM(
        model="anthropic/claude-sonnet-4-5",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=2048,
    )
    return Agent(
        role="Quality Reviewer",
        goal=(
            "Review output for quality, accuracy, and completeness. "
            "Provide a score from 1-10 and specific improvement suggestions."
        ),
        backstory=(
            "You are a meticulous editor and quality reviewer with exceptionally high "
            "standards. You ensure only polished, accurate, and complete content ships. "
            "You always end your review with: SCORE: X/10 on its own line."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2,
    )
