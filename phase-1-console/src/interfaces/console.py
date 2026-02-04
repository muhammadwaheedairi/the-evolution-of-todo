from typing import List, Optional
import sys

# Handle imports when running as a script vs as a module
try:
    # When running as part of the package
    from ..models.task import Task
except ImportError:
    # When running as a script
    import sys
    import os
    # Add src directory to path to allow imports
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from models.task import Task

# Import Rich for modern UI
try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.text import Text
    from rich.prompt import Confirm
    from rich import print
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    # Fallback - though this shouldn't happen if requirements are met
    class MockConsole:
        def print(self, *args, **kwargs):
            print(*args)
    Console = MockConsole

# Import Questionary for interactive menus
try:
    import questionary
    QUESTIONARY_AVAILABLE = True
except ImportError:
    QUESTIONARY_AVAILABLE = False


class ConsoleInterface:
    """
    Handles user input/output operations for the todo application using Rich and Questionary.

    [Task]: T-003
    [From]: specs/todo-app/spec.md §User Interface Commands, specs/todo-app/plan.md §Console Interface
    """

    def __init__(self):
        """
        Initialize the ConsoleInterface with Rich console.
        """
        if RICH_AVAILABLE:
            self.console = Console()
        else:
            self.console = None

    def display_tasks(self, tasks: List[Task]) -> None:
        """
        Display all tasks in a Rich formatted table with color-coded statuses.

        Args:
            tasks (List[Task]): List of tasks to display
        """
        if not tasks:
            if RICH_AVAILABLE:
                self.console.print(Panel("[yellow]No tasks found.[/yellow]", title="Tasks"))
            else:
                print("No tasks found.")
            return

        if RICH_AVAILABLE:
            table = Table(title="Your Tasks", show_header=True, header_style="bold magenta")
            table.add_column("ID", style="dim", width=6)
            table.add_column("Title", min_width=15)
            table.add_column("Description", min_width=20)
            table.add_column("Status", justify="center")
            table.add_column("Created", justify="center")

            for task in tasks:
                status_symbol = "✅" if task.completed else "❌"
                status_text = f"[green]{status_symbol}[/green]" if task.completed else f"[red]{status_symbol}[/red]"

                table.add_row(
                    str(task.id),
                    task.title,
                    task.description if task.description else "[italic]No description[/italic]",
                    status_text,
                    task.created.strftime('%Y-%m-%d %H:%M')
                )

            self.console.print(table)
        else:
            # Fallback for when Rich is not available
            print("\nYour Tasks:")
            print("-" * 50)
            for task in tasks:
                status = "✓" if task.completed else "○"
                print(f"[{status}] {task.id}. {task.title}")
                if task.description:
                    print(f"      Description: {task.description}")
                print(f"      Status: {task.get_status_text()}")
                print()

    def display_task(self, task: Task) -> None:
        """
        Display a single task with detailed information in a Rich panel.

        Args:
            task (Task): Task to display
        """
        if RICH_AVAILABLE:
            status_symbol = "✅" if task.completed else "❌"
            status_color = "green" if task.completed else "red"
            status_text = f"[{status_color}]{status_symbol}[/]"

            title_text = Text.assemble(
                ("ID: ", "bold"), (str(task.id), "yellow"),
                ("\nTitle: ", "bold"), (task.title, "blue"),
                ("\nStatus: ", "bold"), (f"{status_text} ", ""), (task.get_status_text(), status_color),
                ("\nCreated: ", "bold"), (task.created.strftime('%Y-%m-%d %H:%M:%S'), "cyan")
            )

            if task.description:
                title_text.append("\nDescription: ", style="bold")
                title_text.append(task.description, style="default")

            self.console.print(Panel(title_text, title="Task Details"))
        else:
            # Fallback for when Rich is not available
            status = "✓" if task.completed else "○"
            print(f"\n[{status}] {task.id}. {task.title}")
            if task.description:
                print(f"Description: {task.description}")
            print(f"Status: {task.get_status_text()}")
            print(f"Created: {task.created.strftime('%Y-%m-%d %H:%M:%S')}")

    def display_message(self, message: str) -> None:
        """
        Display a simple message to the user with Rich formatting.

        Args:
            message (str): Message to display
        """
        if RICH_AVAILABLE:
            self.console.print(f"[green]{message}[/green]")
        else:
            print(message)

    def display_error(self, error: str) -> None:
        """
        Display an error message to the user with Rich formatting.

        Args:
            error (str): Error message to display
        """
        if RICH_AVAILABLE:
            self.console.print(f"[red]❌ Error: {error}[/red]")
        else:
            print(f"Error: {error}")

    def display_help(self) -> None:
        """
        Display help information with available commands in a Rich panel.
        """
        if RICH_AVAILABLE:
            help_text = """
[bold cyan]Available Commands:[/bold cyan]
  [yellow]add[/yellow] "title" "description"    - Add a new task
  [yellow]list[/yellow]                        - List all tasks
  [yellow]update[/yellow] id "title" "description" - Update a task
  [yellow]delete[/yellow] id                   - Delete a task
  [yellow]complete[/yellow] id                 - Mark task as complete
  [yellow]incomplete[/yellow] id               - Mark task as incomplete
  [yellow]help[/yellow]                        - Show this help message
  [yellow]quit[/yellow]                        - Exit the application

[bold magenta]Examples:[/bold magenta]
  [blue]add[/blue] "Buy groceries" "Milk, bread, eggs"
  [blue]update[/blue] 1 "Buy groceries" "Milk, bread, eggs, fruits"
  [blue]complete[/blue] 1
            """
            self.console.print(Panel(help_text, title="Help"))
        else:
            help_text = """
Available Commands:
  add "title" "description"    - Add a new task
  list                        - List all tasks
  update id "title" "description" - Update a task
  delete id                   - Delete a task
  complete id                 - Mark task as complete
  incomplete id               - Mark task as incomplete
  help                        - Show this help message
  quit                        - Exit the application

Examples:
  add "Buy groceries" "Milk, bread, eggs"
  update 1 "Buy groceries" "Milk, bread, eggs, fruits"
  complete 1
            """
            print(help_text)

    def display_header(self) -> None:
        """
        Display a styled header for the application.
        """
        if RICH_AVAILABLE:
            header_text = """
[cyan]╔════════════════════════════════════════════════════════════════════════════════════════════╗[/cyan]
[cyan]║[/cyan]                        [bold yellow]TODO APP - Organize Your Tasks[/bold yellow]                          [cyan]║[/cyan]
[cyan]╚════════════════════════════════════════════════════════════════════════════════════════════╝[/cyan]
            """
            self.console.print(header_text)
        else:
            print("=" * 80)
            print("TODO APP - Organize Your Tasks")
            print("=" * 80)

    def clear_screen(self) -> None:
        """
        Clear the screen.
        """
        if RICH_AVAILABLE:
            self.console.clear()
        else:
            import os
            os.system('clear' if os.name == 'posix' else 'cls')

    def get_main_menu_choice(self) -> str:
        """
        Display an interactive main menu using Questionary and return the user's choice.

        Returns:
            str: The selected menu option
        """
        if QUESTIONARY_AVAILABLE:
            choices = [
                {"name": "Add Task", "value": "add"},
                {"name": "List Tasks", "value": "list"},
                {"name": "Update Task", "value": "update"},
                {"name": "Delete Task", "value": "delete"},
                {"name": "Mark Complete", "value": "complete"},
                {"name": "Mark Incomplete", "value": "incomplete"},
                {"name": "Help", "value": "help"},
                {"name": "Exit", "value": "quit"}
            ]

            return questionary.select(
                "What would you like to do?",
                choices=choices
            ).ask()
        else:
            # Fallback to basic input if Questionary is not available
            return input("Enter command (add/list/update/delete/complete/incomplete/help/quit): ").strip().lower()

    def get_task_selection(self, tasks: List[Task], action: str = "select") -> Optional[Task]:
        """
        Allow the user to interactively select a task using Questionary.

        Args:
            tasks (List[Task]): List of tasks to choose from
            action (str): The action being performed (for prompt text)

        Returns:
            Optional[Task]: The selected task or None if cancelled
        """
        if not tasks:
            return None

        if QUESTIONARY_AVAILABLE:
            # Format task choices for the selection prompt
            choices = []
            for task in tasks:
                status_symbol = "✅" if task.completed else "❌"
                status_text = f"[green]{status_symbol}[/green]" if task.completed else f"[red]{status_symbol}[/red]"
                description = task.description if task.description else "No description"

                # Create a display string that includes the status in the choice
                display_text = f"{task.id}. [{'green' if task.completed else 'red'}]{task.title}[/] - {description[:30]}{'...' if len(description) > 30 else ''}"
                choices.append({"name": display_text, "value": task})

            # Add cancel option
            choices.append({"name": "Cancel", "value": None})

            return questionary.select(
                f"Select a task to {action}:",
                choices=choices
            ).ask()
        else:
            # Fallback to basic input if Questionary is not available
            print(f"Available tasks:")
            for task in tasks:
                status = "✓" if task.completed else "○"
                print(f"  {task.id}. [{status}] {task.title}")
            task_id = input(f"Enter task ID to {action} (or 'cancel'): ").strip()
            if task_id.lower() == 'cancel':
                return None
            try:
                task_id = int(task_id)
                return next((task for task in tasks if task.id == task_id), None)
            except ValueError:
                return None

    def get_task_details(self, existing_title: str = "", existing_description: str = "") -> tuple:
        """
        Get task details from the user using Questionary.

        Args:
            existing_title (str): Existing title for update (optional)
            existing_description (str): Existing description for update (optional)

        Returns:
            tuple: (title, description) entered by the user
        """
        if QUESTIONARY_AVAILABLE:
            title = questionary.text(
                "Enter task title:",
                default=existing_title
            ).ask()

            description = questionary.text(
                "Enter task description (optional):",
                default=existing_description
            ).ask()

            return title, description
        else:
            # Fallback to basic input if Questionary is not available
            title = input(f"Enter task title (current: '{existing_title}'): ").strip()
            description = input(f"Enter task description (current: '{existing_description}'): ").strip()
            return title, description

    def get_user_input(self, prompt: str = "> ") -> str:
        """
        Get input from the user.

        Args:
            prompt (str): Prompt to display to the user

        Returns:
            str: User input
        """
        if QUESTIONARY_AVAILABLE:
            return questionary.text(prompt).ask() or ""
        else:
            return input(prompt)

    def parse_command(self, user_input: str) -> tuple:
        """
        Parse user command and extract arguments.

        Args:
            user_input (str): Raw user input

        Returns:
            tuple: (command, args) where command is the command string and args is a list of arguments
        """
        # Simple parsing that handles quoted strings
        parts = []
        current_part = ""
        in_quotes = False
        i = 0

        while i < len(user_input):
            char = user_input[i]

            if char == '"':
                in_quotes = not in_quotes
            elif char == ' ' and not in_quotes:
                if current_part:
                    parts.append(current_part)
                    current_part = ""
            else:
                current_part += char

            i += 1

        # Add the last part if it exists
        if current_part:
            parts.append(current_part)

        if not parts:
            return "", []

        command = parts[0].lower()
        args = parts[1:] if len(parts) > 1 else []

        return command, args