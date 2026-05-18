from collections import deque
from dataclasses import dataclass, field
from typing import List


@dataclass
class SharedMemory:
    """Simple in-memory conversation buffer — no langchain dependency."""
    messages: List[dict] = field(default_factory=list)
    max_messages: int = 50

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]

    def as_text(self) -> str:
        return "\n".join(f"{m['role']}: {m['content']}" for m in self.messages)


def make_shared_memory() -> SharedMemory:
    return SharedMemory()
