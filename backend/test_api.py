import urllib.request
import urllib.error

url = "http://127.0.0.1:8000/api/combinations"
output = []
output.append(f"Requesting {url}...")
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read().decode('utf-8')
        output.append(f"STATUS CODE: {response.status}")
        output.append(f"RESPONSE: {html}")
except urllib.error.HTTPError as e:
    output.append(f"HTTP ERROR: {e.code} - {e.reason}")
    try:
        output.append(e.read().decode('utf-8'))
    except Exception:
        pass
except Exception as e:
    output.append(f"GENERIC ERROR: {e}")

with open("debug.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))
print("Done debug writing")
