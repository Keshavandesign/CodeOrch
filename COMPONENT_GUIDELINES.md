# CodeOrch Component Guidelines

A practical guide for building components that follow the design system.

## Table of Contents
1. [Component Anatomy](#component-anatomy)
2. [Common Components](#common-components)
3. [Usage Examples](#usage-examples)
4. [Accessibility Checklist](#accessibility-checklist)

---

## Component Anatomy

Every component should have:
- **Structure** - HTML/DOM layout
- **States** - default, hover, focus, active, disabled, loading
- **Spacing** - consistent padding/margins
- **Colors** - semantic use of color palette
- **Interactions** - transitions, animations
- **Accessibility** - ARIA labels, focus indicators, semantic HTML

---

## Common Components

### 1. Button

**Anatomy:**
```html
<button class="btn btn-primary">
  Action Label
</button>
```

**States:**
```html
<!-- Default -->
<button class="btn btn-primary">Click me</button>

<!-- Hover (automatic via CSS) -->

<!-- Focus -->
<button class="btn btn-primary" style="outline: 2px solid #1F55FF;">Focus state</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled button</button>

<!-- Loading -->
<button class="btn btn-primary" disabled>
  <span class="spinner"></span> Loading...
</button>
```

**Variants:**
```html
<!-- Primary (Main CTA) -->
<button class="btn btn-primary">Save changes</button>

<!-- Secondary (Alternative action) -->
<button class="btn btn-secondary">Cancel</button>

<!-- Danger (Destructive) -->
<button class="btn btn-danger">Delete task</button>

<!-- Success -->
<button class="btn btn-success">Complete task</button>

<!-- Sizes -->
<button class="btn btn-sm btn-primary">Small</button>
<button class="btn btn-primary">Medium (default)</button>
<button class="btn btn-lg btn-primary">Large</button>

<!-- Full width -->
<button class="btn btn-primary btn-block">Full width button</button>
```

**CSS Implementation:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  height: 40px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
}

.btn:hover { box-shadow: var(--shadow-md); }
.btn:focus { outline: var(--border-focus); outline-offset: 2px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
}

.btn-primary:hover { background-color: var(--color-primary-600); }
```

---

### 2. Input Field

**Anatomy:**
```html
<div class="form-group">
  <label for="task-name" class="form-label">Task Name</label>
  <input
    type="text"
    id="task-name"
    class="input"
    placeholder="Enter task name"
  />
  <small class="form-hint">Optional: Add more details</small>
</div>
```

**States:**
```html
<!-- Default -->
<input class="input" type="text" placeholder="Enter text" />

<!-- Hover -->
<input class="input" type="text" placeholder="Hover state" />

<!-- Focus -->
<input class="input" type="text" placeholder="Focus state" style="border: 2px solid #1F55FF;" />

<!-- Filled -->
<input class="input" type="text" value="Filled value" />

<!-- Disabled -->
<input class="input" type="text" placeholder="Disabled" disabled />

<!-- Error -->
<input class="input error" type="text" value="Invalid input" />

<!-- With validation message -->
<input class="input error" type="text" value="Invalid" />
<small class="error-message">This field is required</small>
```

**CSS:**
```css
.input {
  width: 100%;
  padding: 10px 12px;
  border: var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--color-neutral-1);
  color: var(--color-neutral-5);
  font-size: var(--font-size-base);
  transition: var(--transition-fast);
}

.input:focus {
  outline: none;
  border: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(31, 85, 255, 0.1);
}

.input.error { border: var(--border-error); }

.form-hint {
  color: var(--color-neutral-4);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
}
```

---

### 3. Card

**Anatomy:**
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
    <button class="btn btn-sm btn-secondary">Action</button>
  </div>

  <div class="card-body">
    <p>Card content goes here</p>
  </div>

  <div class="card-footer">
    <button class="btn btn-primary">Save</button>
    <button class="btn btn-secondary">Cancel</button>
  </div>
</div>
```

**Variants:**
```html
<!-- Basic Card -->
<div class="card">
  <h4>Task: Fix login bug</h4>
  <p>Priority: High | Status: In Progress</p>
</div>

<!-- Interactive Card (with hover effect) -->
<div class="card" role="button" tabindex="0">
  <div class="flex flex-between">
    <h4>Project Name</h4>
    <span class="badge badge-success">Active</span>
  </div>
</div>

<!-- Card with icon -->
<div class="card">
  <div class="flex gap-4">
    <div class="icon">✓</div>
    <div>
      <h4>Task completed</h4>
      <p>Your task was marked as done</p>
    </div>
  </div>
</div>
```

**CSS:**
```css
.card {
  background-color: var(--color-neutral-1);
  border: var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-md);
  transition: var(--transition-fast);
}

.card:hover {
  border-color: var(--color-neutral-4);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  border-bottom: var(--border-default);
  padding-bottom: var(--spacing-3);
}
```

---

### 4. Badge

**Anatomy:**
```html
<span class="badge badge-success">Completed</span>
```

**Variants:**
```html
<!-- Filled badges -->
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-warning">Warning</span>

<!-- Outline badges -->
<span class="badge badge-outline primary">Outline Primary</span>
<span class="badge badge-outline success">Outline Success</span>

<!-- Subtle badges -->
<span class="badge badge-subtle success">Subtle Success</span>
<span class="badge badge-subtle error">Subtle Error</span>
<span class="badge badge-subtle warning">Subtle Warning</span>

<!-- With icon -->
<span class="badge badge-success">
  <span>✓</span> Approved
</span>

<!-- Dot badge -->
<span class="badge-dot success"></span>
```

**CSS:**
```css
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.badge-primary {
  background-color: var(--color-primary-500);
  color: white;
}

.badge-success {
  background-color: var(--color-success);
  color: white;
}

.badge-subtle.success {
  background-color: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}
```

---

### 5. Task Card (Domain-Specific)

**Anatomy:**
```html
<div class="task-card" data-task-id="123">
  <div class="task-header">
    <h4>Task Title</h4>
    <span class="badge badge-success">In Progress</span>
  </div>

  <div class="task-body">
    <p class="task-description">Task description with optional links</p>
    <div class="task-meta">
      <span class="meta-item">👤 Assigned to John</span>
      <span class="meta-item">🔴 High priority</span>
      <span class="meta-item">📅 Due: Mar 15</span>
    </div>
  </div>

  <div class="task-footer">
    <div class="subtasks">
      <span class="subtask-count">2/5 subtasks</span>
    </div>
    <div class="actions">
      <button class="btn btn-sm btn-secondary">Edit</button>
      <button class="btn btn-sm btn-danger">Delete</button>
    </div>
  </div>
</div>
```

**Status Indicators:**
```html
<!-- Task status colors -->
<div class="task-card status-todo">...</div>       <!-- #6366F1 -->
<div class="task-card status-in-progress">...</div> <!-- #F59E0B -->
<div class="task-card status-completed">...</div>   <!-- #10B981 -->
<div class="task-card status-blocked">...</div>     <!-- #EF4444 -->
```

**CSS:**
```css
.task-card {
  background-color: var(--color-neutral-1);
  border-left: 4px solid var(--color-status-todo);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-3);
  transition: var(--transition-fast);
  cursor: pointer;
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(2px);
}

.task-card.status-in-progress {
  border-left-color: var(--color-status-in-progress);
  background-color: rgba(245, 158, 11, 0.05);
}

.task-card.status-completed {
  border-left-color: var(--color-status-completed);
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.task-meta {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-4);
}
```

---

### 6. Modal / Dialog

**Anatomy:**
```html
<div class="modal-overlay" id="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2>Modal Title</h2>
      <button class="modal-close" aria-label="Close modal">✕</button>
    </div>

    <div class="modal-body">
      <p>Modal content goes here</p>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

**CSS:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 150ms ease-out;
}

.modal {
  background-color: var(--color-neutral-1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 500px;
  animation: slideUp 200ms ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: var(--border-default);
}

.modal-body {
  padding: var(--spacing-6);
}

.modal-footer {
  padding: var(--spacing-6);
  border-top: var(--border-default);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

---

## Usage Examples

### Example 1: Create Task Form

```html
<form class="form">
  <div class="form-group">
    <label for="task-name" class="form-label">Task Name *</label>
    <input
      type="text"
      id="task-name"
      class="input"
      required
      placeholder="Enter task name"
    />
  </div>

  <div class="form-group">
    <label for="task-desc" class="form-label">Description</label>
    <textarea
      id="task-desc"
      class="input"
      rows="4"
      placeholder="Add details..."
    ></textarea>
  </div>

  <div class="form-row">
    <div class="form-group flex-1">
      <label for="priority" class="form-label">Priority</label>
      <select id="priority" class="input">
        <option>Low</option>
        <option selected>Medium</option>
        <option>High</option>
      </select>
    </div>

    <div class="form-group flex-1">
      <label for="assigned-to" class="form-label">Assign To</label>
      <select id="assigned-to" class="input">
        <option>--Select user--</option>
        <option>John</option>
        <option>Jane</option>
      </select>
    </div>
  </div>

  <div class="form-footer">
    <button type="button" class="btn btn-secondary">Cancel</button>
    <button type="submit" class="btn btn-primary">Create Task</button>
  </div>
</form>
```

### Example 2: Task List View

```html
<div class="task-list">
  <div class="task-filters">
    <input type="text" class="input" placeholder="Search tasks..." />
    <select class="input">
      <option>All statuses</option>
      <option>To Do</option>
      <option>In Progress</option>
      <option>Completed</option>
    </select>
  </div>

  <div class="task-items">
    <div class="task-card status-in-progress">
      <div class="task-header">
        <h4>Fix login bug</h4>
        <span class="badge badge-warning">In Progress</span>
      </div>
      <p class="task-description">Users unable to reset password</p>
      <div class="task-meta">
        <span>👤 John</span>
        <span>🔴 High</span>
        <span>📅 Mar 12</span>
      </div>
    </div>

    <div class="task-card status-completed">
      <div class="task-header">
        <h4>Update documentation</h4>
        <span class="badge badge-success">Completed</span>
      </div>
      <p class="task-description">Add API documentation</p>
    </div>
  </div>
</div>
```

---

## Accessibility Checklist

Before shipping a component, verify:

- [ ] **Keyboard Navigation**: All interactive elements are keyboard-accessible
- [ ] **Focus Indicators**: Visible focus outlines on all focusable elements
- [ ] **Semantic HTML**: Proper use of `<button>`, `<input>`, `<label>`, etc.
- [ ] **ARIA Labels**: Descriptive `aria-label` for icon-only buttons
- [ ] **Color Contrast**: Text meets WCAG AA standard (4.5:1)
- [ ] **Form Labels**: Every input has associated `<label>` element
- [ ] **Error Messages**: Clear, descriptive error states
- [ ] **Focus Trap**: Modals trap focus properly
- [ ] **Escape Key**: Modals close on Escape
- [ ] **Reduced Motion**: Respects `prefers-reduced-motion` preference
- [ ] **Screen Reader**: Tested with screen reader (Voiceover, NVDA)
- [ ] **Touch Targets**: Buttons/inputs at least 44x44px on mobile

### Accessibility Template

```html
<!-- Button with icon and label -->
<button class="btn btn-primary" aria-label="Save changes">
  <span aria-hidden="true">💾</span> Save
</button>

<!-- Form with proper labels -->
<div class="form-group">
  <label for="email" class="form-label">Email Address *</label>
  <input
    type="email"
    id="email"
    class="input"
    required
    aria-required="true"
    aria-describedby="email-hint"
  />
  <small id="email-hint" class="form-hint">We'll never share your email</small>
</div>

<!-- Accessible modal -->
<div class="modal-overlay" role="presentation">
  <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-header">
      <h2 id="modal-title">Confirm Delete</h2>
      <button class="modal-close" aria-label="Close dialog">✕</button>
    </div>
    <div class="modal-body">Are you sure?</div>
  </div>
</div>
```

---

## Implementation Roadmap

### Phase 1: Core Components
- [x] Button
- [x] Input
- [x] Card
- [x] Badge
- [ ] Modal
- [ ] Dropdown
- [ ] Navigation

### Phase 2: Data-Driven Components
- [ ] Table/Data grid
- [ ] Pagination
- [ ] Tabs
- [ ] Accordion
- [ ] Breadcrumbs

### Phase 3: Domain Components (CodeOrch-specific)
- [ ] Task Card
- [ ] Sprint Board
- [ ] Status Indicator
- [ ] Priority Badge
- [ ] Agent Status Widget
- [ ] PR Status Link

### Phase 4: Advanced
- [ ] Search/Autocomplete
- [ ] Date Picker
- [ ] Multi-select
- [ ] Rich Text Editor
- [ ] Toast Notifications
- [ ] Loading Skeletons

---

## Quick Reference

| Component | Use When | Key Props | Variants |
|-----------|----------|-----------|----------|
| Button | Call to action, submit forms | size, variant, disabled | primary, secondary, danger |
| Input | Single-line text entry | type, placeholder, error | text, email, number, password |
| Card | Group related content | header, footer | interactive, elevated |
| Badge | Show status/tags | variant, size | filled, outline, subtle |
| Task Card | Display task info | status, priority | todo, in-progress, completed |

