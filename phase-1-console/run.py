#!/usr/bin/env python3
"""
Run script for the Todo App with modern CLI interface
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from main import main

if __name__ == "__main__":
    print("Starting Todo App with modern CLI interface...")
    print("Make sure you have installed the required dependencies:")
    print("  pip install -r requirements.txt")
    print()
    main()