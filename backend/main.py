import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Dict, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.db import init_db, create_task, get_task, update_task, append_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Active WebSocket connections keyed by task_id
active_connections: Dict[str, Set[WebSocket]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="AgentForge AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskRequest(BaseModel):
    description: str


async def broadcast(task_id: str, event: dict):
    """Send event to all WebSocket clients for this task and persist it."""
    append_event(task_id, event)
    sockets = active_connections.get(task_id, set())
    dead = set()
    for ws in sockets:
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.add(ws)
    for ws in dead:
        sockets.discard(ws)


async def run_workflow(task_id: str, description: str):
    """Run the full LangGraph workflow in the background."""
    try:
        # Import here to avoid circular imports and allow app to start even if deps missing
        from workflows.workflow import run_agent_workflow
        await run_agent_workflow(task_id, description, broadcast)
    except Exception as e:
        logger.exception("Workflow failed for task %s", task_id)
        error_event = {"type": "error", "message": str(e)}
        await broadcast(task_id, error_event)
        update_task(task_id, status="failed")


@app.post("/api/tasks")
async def create_new_task(req: TaskRequest, background_tasks: BackgroundTasks):
    task_id = create_task(req.description)
    update_task(task_id, status="running")
    background_tasks.add_task(run_workflow, task_id, req.description)
    return {"task_id": task_id, "status": "running"}


@app.get("/api/tasks/{task_id}")
async def get_task_status(task_id: str):
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    if task_id not in active_connections:
        active_connections[task_id] = set()
    active_connections[task_id].add(websocket)

    # Send existing events to newly connected client
    task = get_task(task_id)
    if task:
        for event in task.get("events", []):
            try:
                await websocket.send_text(json.dumps(event))
            except Exception:
                break

    try:
        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        active_connections.get(task_id, set()).discard(websocket)
