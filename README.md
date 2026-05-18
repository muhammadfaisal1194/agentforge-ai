# AgentForge AI
### Multi-Agent Workflow Automation Platform

Give AI a task. Watch a team of specialized agents autonomously research, analyze, discuss, write, and review — all visible in a live real-time dashboard.

---

## Architecture

```
User task
   ↓
FastAPI (WebSocket server)
   ↓
LangGraph orchestrates the workflow
   ↓
CrewAI assigns specialized agents:
  🔍 Researcher → 📊 Analyst → 💬 AutoGen Discussion → ✍️ Writer → ✅ Reviewer
   ↓
AutoGen handles agent-to-agent conversation
   ↓
LangChain manages tools (DuckDuckGo search, summarization) & memory
   ↓
Claude (claude-sonnet-4-5) powers every agent
   ↓
WebSocket streams live events → Next.js dashboard
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.11, FastAPI, WebSockets |
| Orchestration | LangGraph (state machine) |
| Agent Framework | CrewAI (specialized agent roles) |
| Agent Communication | AutoGen (inter-agent chat) |
| LLM Tooling | LangChain (tools, chains, memory) |
| LLM | Anthropic Claude (claude-sonnet-4-5) |
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Storage | SQLite |

---

## Project Structure

```
agentforge-ai/
├── backend/
│   ├── main.py                   # FastAPI app + WebSocket server
│   ├── agents/
│   │   ├── orchestrator.py       # Workflow state dataclass
│   │   ├── researcher.py         # CrewAI researcher agent
│   │   ├── analyst.py            # CrewAI analyst agent
│   │   ├── writer.py             # CrewAI writer agent
│   │   └── reviewer.py           # CrewAI reviewer agent
│   ├── workflows/
│   │   └── workflow.py           # LangGraph workflow definition
│   ├── autogen_chat/
│   │   └── agent_chat.py         # AutoGen inter-agent conversation
│   ├── tools/
│   │   ├── search_tool.py        # DuckDuckGo web search
│   │   └── summarize_tool.py     # LangChain summarization
│   ├── memory/
│   │   └── memory.py             # ConversationBufferMemory
│   ├── database/
│   │   └── db.py                 # SQLite task storage
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   └── dashboard/page.tsx   # Live dashboard
│   ├── components/
│   │   ├── TaskForm.tsx          # Task input form
│   │   ├── AgentCard.tsx         # Agent status card
│   │   ├── WorkflowGraph.tsx     # Live SVG node graph
│   │   ├── ActivityFeed.tsx      # Real-time event log
│   │   ├── AgentChat.tsx         # AutoGen chat log (iMessage style)
│   │   ├── ProgressBar.tsx       # Step-by-step progress
│   │   └── OutputPanel.tsx       # Markdown-rendered final output
│   └── lib/
│       └── websocket.ts          # useAgentStream() hook
└── .env.example
```

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- An Anthropic API key

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.

API docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp ../.env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL

# Start dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Usage

1. Open `http://localhost:3000`
2. Click **Try a Live Demo** to go to the dashboard
3. Enter a business task or click one of the example tasks
4. Click **Launch Agent Crew**
5. Watch the agents work in real-time:
   - **Activity Feed** — every agent thought, action, and result
   - **Agent Chat** — AutoGen inter-agent discussion (iMessage style)
   - **Output** — final rendered markdown output when complete

---

## WebSocket Events

The backend streams structured JSON events over WebSocket:

```json
{ "type": "agent_start",    "agent": "Researcher", "message": "..." }
{ "type": "agent_thought",  "agent": "Researcher", "message": "..." }
{ "type": "agent_action",   "agent": "Researcher", "tool": "web_search", "input": "..." }
{ "type": "agent_result",   "agent": "Researcher", "message": "..." }
{ "type": "agent_chat",     "from": "Analyst", "to": "Researcher", "message": "..." }
{ "type": "workflow_step",  "step": "analysis", "status": "active" }
{ "type": "task_complete",  "output": "...", "score": 9 }
{ "type": "error",          "message": "..." }
```

---

## LangGraph Workflow

```
research_node
     ↓
analyse_node
     ↓
autogen_discussion_node
     ↓
write_node
     ↓
review_node ──(score < 8, max 2x)──→ revise_node → write_node
     ↓ (score ≥ 8 or max revisions)
complete_node
```

---

## Notes

- **No API key for DuckDuckGo** — web search is free via `duckduckgo-search`
- **AutoGen** falls back to direct Claude calls if the `pyautogen` package has compatibility issues with the current version
- **SQLite** stores all tasks and events — the `agentforge.db` file is created automatically on first run
- Demo only — no auth, no payments, no rate limiting

---

## Running the App

Open two terminal windows from the project root and run both servers simultaneously:

**Terminal 1 — Backend**
```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser. The frontend connects to the backend at `http://localhost:8000` via WebSocket.

> Both servers must be running at the same time for the app to work.

---

## License

MIT
