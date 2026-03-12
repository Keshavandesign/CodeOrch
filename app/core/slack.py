"""
Slack notification helpers for SprintBoard.

Configuration (via environment variables — set in docker-compose.yml):
  SLACK_WEBHOOK_URL  — Incoming Webhook URL for channel posts (optional)
  SLACK_BOT_TOKEN    — Bot token (xoxb-...) for DMs to individual users (optional)

Both can be active simultaneously. If neither is set, all calls silently no-op.
"""

import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "").strip()
BOT_TOKEN   = os.getenv("SLACK_BOT_TOKEN",   "").strip()


# ── Internal senders ──────────────────────────────────────────────────────────

def _post_webhook(payload: dict):
    if not WEBHOOK_URL:
        return
    try:
        import requests
        r = requests.post(WEBHOOK_URL, json=payload, timeout=5)
        if r.status_code != 200:
            logger.warning("Slack webhook returned %s: %s", r.status_code, r.text[:200])
    except Exception as e:
        logger.warning("Slack webhook error: %s", e)


def _post_dm(slack_member_id: str, payload: dict):
    if not BOT_TOKEN or not slack_member_id:
        return
    try:
        import requests
        payload["channel"] = slack_member_id
        r = requests.post(
            "https://slack.com/api/chat.postMessage",
            json=payload,
            headers={"Authorization": f"Bearer {BOT_TOKEN}", "Content-Type": "application/json"},
            timeout=5,
        )
        data = r.json()
        if not data.get("ok"):
            logger.warning("Slack DM error: %s", data.get("error"))
    except Exception as e:
        logger.warning("Slack DM error: %s", e)


def _send(user, payload: dict):
    """Fire webhook (if configured) and/or DM (if user has slack_member_id + BOT_TOKEN)."""
    _post_webhook(payload)
    if user and getattr(user, "slack_member_id", None):
        _post_dm(user.slack_member_id, dict(payload))  # fresh copy for channel override


def _fmt_deadline(deadline) -> str:
    if not deadline:
        return "No deadline"
    if isinstance(deadline, datetime):
        return deadline.strftime("%b %d, %Y")
    return str(deadline)


# ── Block-Kit message builders ────────────────────────────────────────────────

def _task_context_block(task, sprint_name: str) -> dict:
    """Small context block: priority · deadline · sprint."""
    priority_emoji = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}.get(
        task.priority.value if hasattr(task.priority, "value") else task.priority, "⚪"
    )
    return {
        "type": "context",
        "elements": [
            {"type": "mrkdwn", "text": f"{priority_emoji} *{task.priority.value if hasattr(task.priority, 'value') else task.priority}*"},
            {"type": "mrkdwn", "text": f"📅 {_fmt_deadline(task.deadline)}"},
            {"type": "mrkdwn", "text": f"🏃 {sprint_name}"},
        ],
    }


# ── Public notification functions ─────────────────────────────────────────────

def notify_assignment(task, assignee, assigner, sprint_name: str):
    """Fired when a task is created with an assignee, or reassigned."""
    if not (WEBHOOK_URL or BOT_TOKEN):
        return
    if not assignee:
        return

    if assigner and assigner.id != assignee.id:
        headline = f"*{assigner.name}* assigned you a task"
    else:
        headline = "You've been assigned a new task"

    payload = {
        "text": f"⚡ {headline}: {task.title}",
        "blocks": [
            {"type": "section", "text": {"type": "mrkdwn",
                "text": f"⚡ *{headline}*\n*<#{task.id}|{task.title}>*"}},
            _task_context_block(task, sprint_name),
            {"type": "divider"},
        ],
    }
    _send(assignee, payload)


def notify_status_change(task, assignee, old_status_name: str, new_status_name: str, sprint_name: str):
    """Fired when a task's status changes."""
    if not (WEBHOOK_URL or BOT_TOKEN):
        return

    emoji_map = {
        "Completed":   "✅",
        "Blocked":     "🚨",
        "In Progress": "🔄",
        "To Do":       "📋",
    }
    emoji = emoji_map.get(new_status_name, "📌")

    # Blocked & Completed are highest priority messages
    if new_status_name == "Blocked":
        headline = f"Task is *Blocked* — needs attention"
    elif new_status_name == "Completed":
        headline = f"Task marked *Completed* 🎉"
    else:
        headline = f"Status changed: {old_status_name} → *{new_status_name}*"

    payload = {
        "text": f"{emoji} {headline}: {task.title}",
        "blocks": [
            {"type": "section", "text": {"type": "mrkdwn",
                "text": f"{emoji} {headline}\n*{task.title}*"}},
            _task_context_block(task, sprint_name),
            {"type": "divider"},
        ],
    }
    _send(assignee, payload)


def notify_comment(task, assignee, commenter, comment_text: str, sprint_name: str):
    """Fired when a comment is posted. Only sends if commenter ≠ assignee."""
    if not (WEBHOOK_URL or BOT_TOKEN):
        return
    if not assignee:
        return
    if commenter and assignee and commenter.id == assignee.id:
        return  # don't notify yourself

    # Truncate long comments for preview
    preview = comment_text[:120] + ("…" if len(comment_text) > 120 else "")

    payload = {
        "text": f"💬 {commenter.name} commented on: {task.title}",
        "blocks": [
            {"type": "section", "text": {"type": "mrkdwn",
                "text": f"💬 *{commenter.name}* commented on *{task.title}*\n_{preview}_"}},
            _task_context_block(task, sprint_name),
            {"type": "divider"},
        ],
    }
    _send(assignee, payload)
