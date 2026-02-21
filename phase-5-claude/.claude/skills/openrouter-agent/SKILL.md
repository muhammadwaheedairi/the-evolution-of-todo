---
name: openrouter-agent
description: Configure OpenAI Agents SDK to use OpenRouter API with free models
allowed-tools: Read, Create, Edit
---

# OpenRouter Agent Configuration

To use an OpenRouter API key and a free model within the OpenAI Agents SDK, you need to configure the SDK's underlying OpenAI client to point to the OpenRouter API base URL and use the OpenRouter API key.

## Step 1: Obtain your OpenRouter API Key

* Go to the OpenRouter website and sign in.
* Generate a new API key.
* Find a "free" model on the OpenRouter model list (models labeled as "free" or those with zero prompt pricing). Note down its model ID (e.g., `mistralai/mistral-7b-instruct-v0.2`).

## Step 2: Configure the OpenAI Client in your Code

You can either set environment variables or configure the client programmatically within your Python script.

### Option A: Set Environment Variables (Recommended)

This is the standard way the OpenAI Agents SDK expects configuration. Set the `OPENAI_API_KEY` and `OPENAI_API_BASE` variables in your terminal before running your script:
```bash
export OPENAI_API_KEY="<YOUR_OPENROUTER_API_KEY>"
export OPENAI_API_BASE="https://openrouter.ai/api/v1"
```

### Option B: Configure Programmatically

Alternatively, you can configure the default client within your Python code using the `set_default_openai_client` function from the `agents` library.
```python
import os
from openai import OpenAI
from agents import set_default_openai_client, Agent, Runner

# Set your OpenRouter API key
OPENROUTER_API_KEY = "<YOUR_OPENROUTER_API_KEY>"

# Create a custom OpenAI client instance pointing to OpenRouter
or_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
    # Optional: Add site headers for ranking on OpenRouter
    default_headers={
        "HTTP-Referer": "<YOUR_SITE_URL>",
        "X-Title": "<YOUR_SITE_NAME>",
    },
)

# Set this client as the default for the Agents SDK
set_default_openai_client(or_client)
```

## Step 3: Define and Run your Agent

Now you can use the `Agent` class from the SDK, specifying the free model's ID from OpenRouter.
```python
# Example of defining and running an agent
agent = Agent(
    name="FreeModelAgent",
    instructions="You are a helpful assistant that generates short, creative stories.",
    model="mistralai/mistral-7b-instruct-v0.2" # Replace with the free model ID you selected
)

runner = Runner()
response = runner.run(agent, "Write a 50-word story about a space explorer.")
print(response)
```

By following these steps, your OpenAI Agents SDK will route its API calls through the OpenRouter gateway, allowing you to use a free model with your OpenRouter API key.