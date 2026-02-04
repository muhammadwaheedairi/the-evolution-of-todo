from typing import Optional
import sys

# Handle imports when running as a script vs as a module
try:
    # When running as part of the package
    from .managers.task_manager import TaskManager
    from .interfaces.console import ConsoleInterface
    from .models.task import Task
except ImportError:
    # When running as a script
    import sys
    import os
    # Add src directory to path to allow imports
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    from managers.task_manager import TaskManager
    from interfaces.console import ConsoleInterface
    from models.task import Task


class TodoApp:
    """
    Main application class that ties all components together with a modern CLI interface.

    [Task]: T-004
    [From]: specs/todo-app/spec.md §All Functional Requirements, specs/todo-app/plan.md §Main Application
    """

    def __init__(self):
        """
        Initialize the TodoApp with required components.
        """
        self.task_manager = TaskManager()
        self.console = ConsoleInterface()
        self.running = True

    def run(self) -> None:
        """
        Run the main application loop with interactive menu.
        """
        self.console.display_header()
        self.console.display_message("Welcome to the Todo App!")
        self.console.display_message("Use the interactive menu to manage your tasks.")

        while self.running:
            try:
                # Clear screen and show menu
                self.console.clear_screen()
                self.console.display_header()

                # Show current tasks
                tasks = self.task_manager.get_all_tasks()
                if tasks:
                    self.console.display_message(f"Current tasks: {len(tasks)}")

                # Get user choice from interactive menu
                choice = self.console.get_main_menu_choice()

                if choice == 'add':
                    self.handle_add_interactive()
                elif choice == 'list':
                    self.handle_list_interactive()
                elif choice == 'update':
                    self.handle_update_interactive()
                elif choice == 'delete':
                    self.handle_delete_interactive()
                elif choice == 'complete':
                    self.handle_complete_interactive()
                elif choice == 'incomplete':
                    self.handle_incomplete_interactive()
                elif choice == 'help':
                    self.handle_help_interactive()
                elif choice == 'quit':
                    self.handle_quit_interactive()
                else:
                    self.console.display_error(f"Unknown command: {choice}")
                    input("Press Enter to continue...")
            except KeyboardInterrupt:
                self.console.display_message("Exiting...")
                self.running = False
            except Exception as e:
                self.console.display_error(f"An error occurred: {str(e)}")
                input("Press Enter to continue...")

    def handle_add_interactive(self) -> None:
        """
        Handle the add command interactively using Questionary.
        """
        try:
            title, description = self.console.get_task_details()

            if not title or not title.strip():
                self.console.display_error("Title cannot be empty")
                input("Press Enter to continue...")
                return

            task = self.task_manager.add_task(title.strip(), description.strip() if description else "")
            self.console.display_message(f"✓ Task added successfully with ID: {task.id}")
            input("Press Enter to continue...")
        except ValueError as e:
            self.console.display_error(str(e))
            input("Press Enter to continue...")

    def handle_list_interactive(self) -> None:
        """
        Handle the list command to display all tasks.
        """
        tasks = self.task_manager.get_all_tasks()
        self.console.display_tasks(tasks)
        input("Press Enter to continue...")

    def handle_update_interactive(self) -> None:
        """
        Handle the update command interactively using Questionary.
        """
        tasks = self.task_manager.get_all_tasks()
        if not tasks:
            self.console.display_error("No tasks available to update")
            input("Press Enter to continue...")
            return

        selected_task = self.console.get_task_selection(tasks, "update")
        if selected_task is None:
            self.console.display_message("Update cancelled")
            input("Press Enter to continue...")
            return

        title, description = self.console.get_task_details(selected_task.title, selected_task.description)

        if not title or not title.strip():
            self.console.display_error("Title cannot be empty")
            input("Press Enter to continue...")
            return

        try:
            updated_task = self.task_manager.update_task(selected_task.id, title.strip(), description.strip() if description else "")
            if updated_task:
                self.console.display_message(f"✓ Task {updated_task.id} updated successfully")
            else:
                self.console.display_error(f"Task with ID {selected_task.id} not found")
            input("Press Enter to continue...")
        except ValueError as e:
            self.console.display_error(str(e))
            input("Press Enter to continue...")

    def handle_delete_interactive(self) -> None:
        """
        Handle the delete command interactively using Questionary.
        """
        tasks = self.task_manager.get_all_tasks()
        if not tasks:
            self.console.display_error("No tasks available to delete")
            input("Press Enter to continue...")
            return

        selected_task = self.console.get_task_selection(tasks, "delete")
        if selected_task is None:
            self.console.display_message("Delete cancelled")
            input("Press Enter to continue...")
            return

        # Confirm deletion
        try:
            from rich.prompt import Confirm
            confirm = Confirm.ask(f"Are you sure you want to delete task '{selected_task.title}'?")
        except ImportError:
            confirm = input(f"Are you sure you want to delete task '{selected_task.title}'? (y/N): ").lower() == 'y'

        if confirm:
            deleted = self.task_manager.delete_task(selected_task.id)
            if deleted:
                self.console.display_message(f"✓ Task {selected_task.id} deleted successfully")
            else:
                self.console.display_error(f"Task with ID {selected_task.id} not found")
        else:
            self.console.display_message("Delete cancelled")

        input("Press Enter to continue...")

    def handle_complete_interactive(self) -> None:
        """
        Handle the complete command interactively using Questionary.
        """
        tasks = self.task_manager.get_all_tasks()
        incomplete_tasks = [task for task in tasks if not task.completed]

        if not incomplete_tasks:
            self.console.display_error("No incomplete tasks available to mark as complete")
            input("Press Enter to continue...")
            return

        selected_task = self.console.get_task_selection(incomplete_tasks, "mark complete")
        if selected_task is None:
            self.console.display_message("Complete cancelled")
            input("Press Enter to continue...")
            return

        task = self.task_manager.mark_task_complete(selected_task.id)
        if task:
            self.console.display_message(f"✓ Task {task.id} marked as complete")
        else:
            self.console.display_error(f"Task with ID {task.id} not found")

        input("Press Enter to continue...")

    def handle_incomplete_interactive(self) -> None:
        """
        Handle the incomplete command interactively using Questionary.
        """
        tasks = self.task_manager.get_all_tasks()
        complete_tasks = [task for task in tasks if task.completed]

        if not complete_tasks:
            self.console.display_error("No completed tasks available to mark as incomplete")
            input("Press Enter to continue...")
            return

        selected_task = self.console.get_task_selection(complete_tasks, "mark incomplete")
        if selected_task is None:
            self.console.display_message("Incomplete cancelled")
            input("Press Enter to continue...")
            return

        task = self.task_manager.mark_task_incomplete(selected_task.id)
        if task:
            self.console.display_message(f"✓ Task {task.id} marked as incomplete")
        else:
            self.console.display_error(f"Task with ID {task.id} not found")

        input("Press Enter to continue...")

    def handle_help_interactive(self) -> None:
        """
        Handle the help command to display available commands.
        """
        self.console.display_help()
        input("Press Enter to continue...")

    def handle_quit_interactive(self) -> None:
        """
        Handle the quit command to exit the application.
        """
        self.console.display_message("Goodbye! Thanks for using Todo App.")
        self.running = False

    # Legacy command handlers for compatibility with existing functionality
    def handle_add(self, *args) -> None:
        """
        Handle the add command to create a new task (legacy for compatibility).

        Args:
            *args: Arguments for the add command (title, optional description)
        """
        if len(args) < 1:
            self.console.display_error("Usage: add \"title\" [\"description\"]")
            return

        title = args[0]
        description = args[1] if len(args) > 1 else ""

        try:
            task = self.task_manager.add_task(title, description)
            self.console.display_message(f"✓ Task added successfully with ID: {task.id}")
        except ValueError as e:
            self.console.display_error(str(e))

    def handle_list(self, *args) -> None:
        """
        Handle the list command to display all tasks (legacy for compatibility).

        Args:
            *args: Arguments for the list command (none expected)
        """
        tasks = self.task_manager.get_all_tasks()
        self.console.display_tasks(tasks)

    def handle_update(self, *args) -> None:
        """
        Handle the update command to modify an existing task (legacy for compatibility).

        Args:
            *args: Arguments for the update command (id, title, optional description)
        """
        if len(args) < 2:
            self.console.display_error("Usage: update id \"title\" [\"description\"]")
            return

        try:
            task_id = int(args[0])
        except ValueError:
            self.console.display_error("Task ID must be a number")
            return

        title = args[1]
        description = args[2] if len(args) > 2 else ""

        try:
            task = self.task_manager.update_task(task_id, title, description)
            if task:
                self.console.display_message(f"✓ Task {task_id} updated successfully")
            else:
                self.console.display_error(f"Task with ID {task_id} not found")
        except ValueError as e:
            self.console.display_error(str(e))

    def handle_delete(self, *args) -> None:
        """
        Handle the delete command to remove a task (legacy for compatibility).

        Args:
            *args: Arguments for the delete command (id)
        """
        if len(args) < 1:
            self.console.display_error("Usage: delete id")
            return

        try:
            task_id = int(args[0])
        except ValueError:
            self.console.display_error("Task ID must be a number")
            return

        deleted = self.task_manager.delete_task(task_id)
        if deleted:
            self.console.display_message(f"✓ Task {task_id} deleted successfully")
        else:
            self.console.display_error(f"Task with ID {task_id} not found")

    def handle_complete(self, *args) -> None:
        """
        Handle the complete command to mark a task as complete (legacy for compatibility).

        Args:
            *args: Arguments for the complete command (id)
        """
        if len(args) < 1:
            self.console.display_error("Usage: complete id")
            return

        try:
            task_id = int(args[0])
        except ValueError:
            self.console.display_error("Task ID must be a number")
            return

        task = self.task_manager.mark_task_complete(task_id)
        if task:
            self.console.display_message(f"✓ Task {task_id} marked as complete")
        else:
            self.console.display_error(f"Task with ID {task_id} not found")

    def handle_incomplete(self, *args) -> None:
        """
        Handle the incomplete command to mark a task as incomplete (legacy for compatibility).

        Args:
            *args: Arguments for the incomplete command (id)
        """
        if len(args) < 1:
            self.console.display_error("Usage: incomplete id")
            return

        try:
            task_id = int(args[0])
        except ValueError:
            self.console.display_error("Task ID must be a number")
            return

        task = self.task_manager.mark_task_incomplete(task_id)
        if task:
            self.console.display_message(f"✓ Task {task_id} marked as incomplete")
        else:
            self.console.display_error(f"Task with ID {task_id} not found")

    def handle_help(self, *args) -> None:
        """
        Handle the help command to display available commands (legacy for compatibility).

        Args:
            *args: Arguments for the help command (none expected)
        """
        self.console.display_help()

    def handle_quit(self, *args) -> None:
        """
        Handle the quit command to exit the application (legacy for compatibility).

        Args:
            *args: Arguments for the quit command (none expected)
        """
        self.console.display_message("Goodbye! Thanks for using Todo App.")
        self.running = False


def main():
    """
    Main entry point for the application.
    """
    app = TodoApp()
    app.run()


if __name__ == "__main__":
    main()