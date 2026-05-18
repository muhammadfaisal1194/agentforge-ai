import os
from crewai.tools import tool


@tool("summarize")
def summarize(text: str) -> str:
    """Summarize a long piece of text into a concise summary. Input should be the full text."""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=600,
            messages=[{
                "role": "user",
                "content": (
                    "Summarize the following text concisely, preserving the key points:\n\n"
                    + text[:5000]
                ),
            }],
        )
        return response.content[0].text
    except Exception as e:
        return f"Summarization failed: {e}"
