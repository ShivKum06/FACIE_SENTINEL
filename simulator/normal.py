import sys
import httpx

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
for path in ("/products", "/users", "/users/1", "/search?q=widget"):
    response = httpx.get(BASE_URL + path)
    print(response.status_code, path)
