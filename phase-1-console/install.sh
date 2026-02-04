#!/bin/bash

# Install script for Todo App with modern CLI interface
echo "Installing dependencies for Todo App..."

# Check if pip is available
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Please install pip first."
    exit 1
fi

# Install dependencies from requirements.txt
if [ -f "requirements.txt" ]; then
    echo "Installing from requirements.txt..."
    pip install -r requirements.txt
else
    echo "requirements.txt not found. Installing required packages directly..."
    pip install rich questionary
fi

echo "Installation complete!"
echo "You can now run the application with: python3 run.py"