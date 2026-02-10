"""Manual test script for chat endpoint."""

import requests
import json

BASE_URL = "http://localhost:8000/api"
EMAIL = "test@example.com"
PASSWORD = "password123"
NAME = "Test User"


def test_chat_workflow():
    """Test the complete chat workflow."""

    print("🧪 Testing Phase 3 Chat Endpoint...\n")

    # Step 1: Register
    print("1️⃣ Registering user...")
    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json={"name": NAME, "email": EMAIL, "password": PASSWORD}
    )

    if register_response.status_code == 201:
        print("✅ User registered")
    else:
        print("ℹ️ User exists, proceeding...")

    # Step 2: Login
    print("\n2️⃣ Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )

    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return

    login_data = login_response.json()
    token = login_data["access_token"]
    user_id = login_data["user"]["id"]

    print(f"✅ Logged in (User ID: {user_id})")

    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Add task via chat
    print("\n3️⃣ Testing: Add task via chat...")
    response = requests.post(
        f"{BASE_URL}/{user_id}/chat",
        headers=headers,
        json={"message": "add task buy groceries"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['response']}")
        print(f"   Tools: {data['tool_calls']}")
    else:
        print(f"❌ Failed: {response.text}")

    # Step 4: List tasks via chat
    print("\n4️⃣ Testing: List tasks via chat...")
    response = requests.post(
        f"{BASE_URL}/{user_id}/chat",
        headers=headers,
        json={"message": "show me all tasks"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['response']}")
        print(f"   Tools: {data['tool_calls']}")
    else:
        print(f"❌ Failed: {response.text}")

    # Step 5: Complete task
    print("\n5️⃣ Testing: Complete task...")
    response = requests.post(
        f"{BASE_URL}/{user_id}/chat",
        headers=headers,
        json={"message": "mark the first task as done"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['response']}")
        print(f"   Tools: {data['tool_calls']}")
    else:
        print(f"❌ Failed: {response.text}")

    print("\n✅ All tests completed!")


if __name__ == "__main__":
    test_chat_workflow()