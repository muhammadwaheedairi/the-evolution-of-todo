"""MCP server initialization and registration."""

from typing import Dict, Any


class MCPServer:
    """
    MCP (Model Context Protocol) Server for task management.
    Provides standardized tool interface for AI agents.
    """

    def __init__(self, name: str):
        self.name = name
        self.tools: Dict[str, Any] = {}

    def register_tool(self, name: str, handler: callable, schema: Dict[str, Any]):
        """
        Register a tool with the MCP server.

        Args:
            name: Tool name
            handler: Tool handler function
            schema: Tool input schema
        """
        self.tools[name] = {
            "handler": handler,
            "schema": schema
        }

    def list_tools(self):
        """List all registered tools."""
        return list(self.tools.keys())

    def execute_tool(self, name: str, params: Dict[str, Any]):
        """
        Execute a registered tool.

        Args:
            name: Tool name
            params: Tool parameters

        Returns:
            Tool execution result
        """
        if name not in self.tools:
            raise ValueError(f"Tool '{name}' not found")

        handler = self.tools[name]["handler"]
        return handler(**params)


# Global MCP server instance
mcp_server = MCPServer("todo-mcp-server")