import os
from crewai.tools import tool


@tool("web_search")
def web_search(query: str) -> str:
    """Search the web for current information. Input should be a clear search query string."""
    try:
        from duckduckgo_search import DDGS
        results = list(DDGS().text(query, max_results=6))
        if not results:
            return "No search results found."
        return "\n\n".join(
            f"**{r.get('title', 'Untitled')}**\n{r.get('body', '')}"
            for r in results
        )
    except Exception as e:
        return f"Search failed: {e}"
