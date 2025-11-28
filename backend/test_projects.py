import requests
import sys

try:
    # Login first
    print("Logging in...")
    url = "http://localhost:8003/api/v1/auth/login"
    payload = {
        "email": "admin@vrdsolution.com.br",
        "password": "admin123"
    }
    r = requests.post(url, json=payload)
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        # Don't exit, let's see if we can read logs
        # sys.exit(1)
        
    if r.status_code == 200:
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Fetch projects
        print("Fetching projects...")
        r = requests.get("http://localhost:8003/api/v1/projects/", headers=headers)
    print(f"Projects status: {r.status_code}")
    if r.status_code == 200:
        print("Projects fetched successfully!")
        print(r.json())
    else:
        print(f"Projects fetch failed: {r.text}")

except Exception as e:
    print(f"Error: {e}")
