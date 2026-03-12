# Changelog

All notable changes to CodeOrch will be documented in this file.

## [3.0.0] - 2026-03-12

### Added
- Slack notifications (channel and DM modes)
- Task comments with full threading
- Author-only comment deletion
- Clickable links in task descriptions (XSS-safe)
- Subtask descriptions (editable in modal)
- List view accordion for subtask expansion
- Inline status editing without page reload
- User profile modal for Slack Member ID updates
- Task comments with timestamps

### Fixed
- Priority sorting in tasks list (was broken, now using SQLAlchemy case())
- Subtask endpoints to use SubtaskCreate schema
- N+1 query issue in dashboard with joinedload
- Deprecated on_event in favor of lifespan context manager

### Changed
- Migrated from deprecated FastAPI on_event to lifespan
- Improved error handling in routes

## [2.0.0] - 2026-02-15

### Added
- Sprint management with auto-creation and rollover
- Task CRUD operations
- Subtask support
- Status management with color coding
- Priority system (High/Medium/Low)
- User assignment tracking
- Kanban view with drag-and-drop
- List view with sortable table
- Dashboard with statistics
- View toggle between Kanban and List

### Fixed
- Database initialization issues
- Task filtering logic

## [1.0.0] - 2026-01-01

### Added
- Initial project setup
- FastAPI framework integration
- PostgreSQL database schema
- Basic frontend structure
- Authentication system

---

## Upcoming - v4.0.0 (Planned)

### Planned Features
- Claude Code agent integration
- Task assignment to agents via API
- Automatic Git branch creation for tasks
- PR auto-linking to tasks
- Agent authentication with API keys
- Task status auto-update from PR comments
- Agent performance metrics
- Audit logging for agent actions

### Breaking Changes
- TBD based on v4 implementation
