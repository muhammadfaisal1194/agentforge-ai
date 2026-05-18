import os
from crewai import Agent, LLM
from tools.search_tool import web_search
from tools.summarize_tool import summarize


def make_researcher() -> Agent:
    llm = LLM(
        model="anthropic/claude-sonnet-4-5",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=2048,
    )
    return Agent(
        role="Senior Research Specialist",
        goal="Find comprehensive, accurate information about the given task",
        backstory=(
            "You are an expert researcher with deep experience finding and synthesizing "
            "information from multiple sources. You excel at identifying the most relevant "
            "data, spotting trends, and pulling together a thorough picture quickly."
        ),
        tools=[web_search, summarize],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=4,
    )
