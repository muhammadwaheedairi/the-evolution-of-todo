# 📝 Hackathon II - Phase I: In-Memory Python Console Todo App

![Python](https://img.shields.io/badge/python-3.13+-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![Spec-Driven](https://img.shields.io/badge/spec-driven-brightgreen?style=flat-square)

> **Project Type:** Hackathon II, Phase I  
> **Objective:** Build a modern, in-memory CLI todo application with full CRUD operations, following Spec-KitPlus + Claude Code workflow.

A professional, in-memory todo application that runs in the console. Features a modern, interactive CLI interface with **color-coded output, styled tables, and menus**.

---

## 📌 Table of Contents

1. [Features](#-features)
2. [Requirements](#-requirements)
3. [Setup](#-setup)
4. [Usage](#-usage)
5. [Project Structure](#-project-structure)
6. [Implementation Details](#-implementation-details)
7. [Specifications](#-specifications)
8. [Task IDs](#-task-ids)
9. [Running the Application](#-running-the-application)
10. [Modern UI Features](#-modern-ui-features)
11. [Hackathon II - Phase I](#-hackathon-ii---phase-i)

---

## 🛠 Features

- Add tasks with title and description
- List all tasks with **color-coded status indicators**
- Update task details
- Delete tasks by ID
- Mark tasks as complete/incomplete
- Console-based interface with **modern UI**
- Interactive menus using **Questionary**
- Rich-formatted tables and panels using **Rich**
- Clear screen between actions
- Success/error messages styled with **Rich**
- Confirmation prompts for destructive actions

---

## ⚙️ Requirements

- Python 3.13+  
- UV package manager (optional)  
- Python libraries:

```bash
pip install rich questionary
````

---

## 🚀 Setup

1. Clone or download the repository.
2. Navigate to the project directory.
3. Install dependencies:

```bash
pip install -r requirements.txt
# or directly
pip install rich questionary
```

4. Run the application:

```bash
python src/main.py
```

---

## 📖 Usage

### Available Commands

| Command                           | Description             |
| --------------------------------- | ----------------------- |
| `add "title" "description"`       | Add a new task          |
| `list`                            | List all tasks          |
| `update id "title" "description"` | Update a task           |
| `delete id`                       | Delete a task           |
| `complete id`                     | Mark task as complete   |
| `incomplete id`                   | Mark task as incomplete |
| `help`                            | Show available commands |
| `quit` / `exit`                   | Exit the application    |

### Examples

```bash
# Add a new task
add "Buy groceries" "Milk, bread, eggs"

# List all tasks
list

# Update a task (ID 1)
update 1 "Buy groceries" "Milk, bread, eggs, fruits"

# Mark a task as complete (ID 1)
complete 1

# Delete a task (ID 1)
delete 1
```

---

## 🏗 Project Structure

```
src/
├── models/
│   ├── __init__.py
│   └── task.py          # Task data model
├── managers/
│   ├── __init__.py
│   └── task_manager.py  # Task business logic
├── interfaces/
│   ├── __init__.py
│   └── console.py       # Console interface
├── __init__.py
└── main.py              # Main application entry point
```

---

## 📝 Implementation Details

* In-memory storage only (no database)
* Console-based interface
* Built with Python standard library, **Rich**, and **Questionary**
* Object-oriented design principles applied

---

## 🧩 Specifications

Following the **Spec-Driven Development** workflow:

* Specification: `specs/todo-app/spec.md`
* Implementation Plan: `specs/todo-app/plan.md`
* Implementation Tasks: `specs/todo-app/tasks.md`
* Project Constitution: `.specify/memory/constitution.md`

---

## 🔢 Task IDs

* T-001: Task Model
* T-002: Task Manager
* T-003: Console Interface
* T-004: Main Application

---

## 💻 Running the Application

### Options:

1. **Direct execution:**

```bash
python src/main.py
```

2. **Using run script:**

```bash
python run.py
```

3. **Using installed package (after pip install):**

```bash
todo-app
```

---

## 🎨 Modern UI Features

* Interactive arrow-key menus using **Questionary**
* Rich-styled tables with color-coded status indicators (✅ complete, ❌ incomplete)
* Styled headers and panels using **Rich**
* Clear screen between actions
* Rich-styled success/error messages
* Task selection with visual indicators
* Confirmation prompts for destructive actions

---

## 🏆 Hackathon II - Phase I

**Goal:** Demonstrate **spec-driven development** using Claude Code + Spec-KitPlus.

**Deliverables:**

* Working console app with all basic features
* GitHub repo including:

  * Constitution file: `.specify/memory/constitution.md`
  * `specs/` folder with all specification files
  * `/src` folder with Python source code
  * README.md with setup instructions
  * CLAUDE.md with Claude Code instructions

**Next Phases:**
Phase II → Full-stack web application
Phase III → Chatbot integration
Later phases → Deployment & cloud integration
