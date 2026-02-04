# In-Memory Python Console Todo App Constitution

## Core Principles
- Spec-Driven Development: No manual coding allowed; all code must be generated from specifications.
- Task Traceability: Every feature implemented must reference a Task ID in `speckit.tasks`.
- Simplicity & Clarity: Clear console interface, intuitive commands, human-readable outputs.
- Clean Code: Pythonic style, PEP8 compliance, type hints where appropriate.
- Iterative & Spec-First: Each step flows from Specify → Plan → Tasks → Implement.

## Key Standards
- **Python Version:** 3.13+ with UV package manager.
- **Project Structure:** `/src` for code, `/specs` for specifications, README.md and CLAUDE.md included.
- **Feature Implementation:** All 5 basic features (Add, Delete, Update, View, Mark Complete) must be fully functional.
- **Testing:** Manual verification of features; clear Task IDs linking code to specs.
- **Documentation:** README must include setup instructions and demonstration steps.
- **Logging & Error Handling:** Minimal, clear console messages; no uncaught exceptions.
- **Code Comments:** Link every function or module to Task ID and Plan section.

## Constraints
- **In-Memory Storage Only:** No database usage; tasks exist only in memory during runtime.
- **Console Interface Only:** No web or GUI elements.
- **No AI Agents Required:** Phase I focuses on CLI functionality; Subagents/MCP not used.
- **Time Constraint:** Must complete and submit by December 7, 2025.
- **Single Developer:** Individual work only; no team submissions.

## Success Criteria
- Fully functional CLI app with 5 basic features:
  1. Add tasks with title and description.
  2. List all tasks with status indicators.
  3. Update task details.
  4. Delete tasks by ID.
  5. Mark tasks complete/incomplete.
- All code generated from Spec-Kit Plus tasks via Claude Code.
- README.md and CLAUDE.md present and accurate.
- Clear linkage of every code module to Task IDs in `speckit.tasks`.
- No manual code writing or shortcuts; spec-driven pipeline strictly followed.

## Development Workflow
- Specifications must be complete and approved before implementation
- All code must be traceable to specific tasks
- Minimal viable implementation approach
- Clear error handling and user feedback

## Governance
All development must follow the Spec-Driven Development workflow: Specify → Plan → Tasks → Implement
All PRs/reviews must verify compliance with the constitution and spec requirements.

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02
