# CodeOrch - Task Management & Agent Orchestration

A FastAPI-based task management tool designed for weekly sprints with built-in support for Claude Code agent orchestration.

## Features

### v3 (Current)
- 📋 **Sprint Management** - Auto-creates and rolls over weekly sprints
- ✅ **Task CRUD** - Full lifecycle task management
- 🔄 **Subtasks** - Nested tasks with descriptions
- 📊 **Dashboard** - Sprint statistics (total, completed, overdue)
- 🎨 **Kanban & List Views** - Drag-and-drop and sortable table views
- 👤 **User Assignment** - Track task ownership
- 🏷️ **Status & Priority** - Customizable workflow states with color coding
- 💬 **Task Comments** - Threaded comments with author-only delete
- 🔗 **Smart Links** - XSS-safe clickable links in descriptions
- 🤖 **Slack Integration** - Channel and DM notifications

### v4 (Planned)
- 🚀 Agent Orchestration - Claude agents pick tasks and work in branches
- 🔀 PR Auto-linking - Tasks automatically update from PR status
- 🔐 Agent Auth - Dedicated API keys for agent access

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy ORM
- **Database**: PostgreSQL
- **Frontend**: HTML/CSS/vanilla JavaScript
- **Deployment**: Docker + Docker Compose
- **Auth**: JWT-based

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/Keshavandesign/CodeOrch.git
cd CodeOrch
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the application**
```bash
docker-compose up -d
```

4. **Access the app**
- Frontend: http://localhost:8000
- API: http://localhost:8000/api
- Health check: http://localhost:8000/health

## Development

### Local Setup (Without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Run the app
uvicorn main:app --reload
```

### Project Structure
```
CodeOrch/
├── app/
│   ├── core/           # Security, Slack integration
│   ├── models/         # Database models & ORM
│   ├── routes/         # API endpoints
│   └── schemas/        # Pydantic schemas
├── static/             # Frontend (HTML/CSS/JS)
├── templates/          # HTML templates
├── main.py             # FastAPI app entry
├── docker-compose.yml  # Docker configuration
└── requirements.txt    # Python dependencies
```

## API Documentation

All API endpoints (except `/auth`) require a valid JWT token.

### Authentication
- `POST /auth/login` - Get JWT token

### Sprints
- `GET /api/sprints/` - List all sprints
- `GET /api/sprints/active` - Get current sprint (auto-creates if missing)
- `POST /api/sprints/` - Create sprint
- `PUT /api/sprints/{id}` - Update sprint
- `PUT /api/sprints/{id}/rename` - Rename sprint
- `DELETE /api/sprints/{id}` - Delete sprint

### Tasks
- `GET /api/tasks/sprint/{sprint_id}` - Get sprint tasks (sorted by priority)
- `POST /api/tasks/` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/subtasks` - Add subtask
- `DELETE /api/tasks/{id}/subtasks/{subtask_id}` - Delete subtask

### Comments
- `GET /api/tasks/{task_id}/comments` - Get task comments
- `POST /api/tasks/{task_id}/comments` - Add comment
- `DELETE /api/comments/{comment_id}` - Delete comment (author only)

### Dashboard
- `GET /api/dashboard/stats` - Get sprint statistics

### Users & Statuses
- `GET/POST /api/users/` - User management
- `GET/POST /api/statuses/` - Status management

## Environment Variables

See `.env.example` for all available options.

**Required:**
- `JWT_SECRET` - Secret key for JWT signing
- `DATABASE_URL` - PostgreSQL connection string

**Optional:**
- `SLACK_BOT_TOKEN` - For Slack notifications
- `SLACK_NOTIFICATION_MODE` - `channel` or `dm`

## Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Database runs on `localhost:5433` (to avoid conflicts with local PostgreSQL).

## Deployment Options

### Render (Recommended - Low Cost)
1. Push code to GitHub (already done ✅)
2. Connect repo to [Render.com](https://render.com)
3. Create Web Service + PostgreSQL
4. Set environment variables
5. Deploy!

**Estimated Cost**: ~$7/month

### AWS ECS
- Better for scaling with agent workloads
- Estimated Cost: $20-100+/month

### DigitalOcean App Platform
- Good balance of simplicity and control
- Estimated Cost: $10-50/month

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

MIT

## Support

For issues and questions, open a GitHub issue or check the documentation.

---

**Current Version**: v3 (Collaboration & Rich Tasks)
**Next**: v4 (Agent Orchestration)
