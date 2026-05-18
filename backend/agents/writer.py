import os
from crewai import Agent, LLM


def make_writer() -> Agent:
    llm = LLM(
        model="anthropic/claude-sonnet-4-5",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=4096,
    )
    return Agent(
        role="Content Writer",
        goal="Transform analyzed insights into polished, professional content",
        backstory=(
            "You are an expert business writer who crafts clear, compelling content. "
            "You have a talent for taking complex analysis and translating it into "
            "well-structured documents that engage the reader and drive action."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )
