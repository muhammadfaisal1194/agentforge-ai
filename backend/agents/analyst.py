import os
from crewai import Agent, LLM
from tools.summarize_tool import summarize


def make_analyst() -> Agent:
    llm = LLM(
        model="anthropic/claude-sonnet-4-5",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=2048,
    )
    return Agent(
        role="Data Analyst",
        goal="Structure and analyze research findings into clear, actionable insights",
        backstory=(
            "You are an expert analyst who transforms raw information into structured, "
            "actionable insights. You spot patterns, quantify comparisons, and distill "
            "complex data into clear frameworks that decision-makers can act on immediately."
        ),
        tools=[summarize],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )
