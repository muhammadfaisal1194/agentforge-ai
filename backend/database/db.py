import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "agentforge.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            description TEXT,
            status TEXT DEFAULT 'pending',
            current_step TEXT,
            output TEXT,
            events TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def create_task(description: str) -> str:
    task_id = str(uuid.uuid4())
    conn = get_conn()
    conn.execute(
        "INSERT INTO tasks (id, description, status, events) VALUES (?, ?, 'pending', '[]')",
        (task_id, description),
    )
    conn.commit()
    conn.close()
    return task_id


def get_task(task_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["events"] = json.loads(d["events"] or "[]")
    return d


def update_task(task_id: str, **kwargs):
    conn = get_conn()
    if "events" in kwargs:
        kwargs["events"] = json.dumps(kwargs["events"])
    sets = ", ".join(f"{k} = ?" for k in kwargs)
    values = list(kwargs.values()) + [task_id]
    conn.execute(f"UPDATE tasks SET {sets} WHERE id = ?", values)
    conn.commit()
    conn.close()


def append_event(task_id: str, event: dict):
    conn = get_conn()
    row = conn.execute("SELECT events FROM tasks WHERE id = ?", (task_id,)).fetchone()
    events = json.loads(row["events"] or "[]")
    event["timestamp"] = datetime.utcnow().isoformat()
    events.append(event)
    conn.execute("UPDATE tasks SET events = ? WHERE id = ?", (json.dumps(events), task_id))
    conn.commit()
    conn.close()
