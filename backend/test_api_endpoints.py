import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8080/api"

def make_request(url, data=None, headers=None, method="GET"):
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
        
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            return res.getcode(), json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            err_body = json.loads(e.read().decode("utf-8"))
        except Exception:
            err_body = e.reason
        return e.code, err_body
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("Starting API integration tests...")

    # 1. Register two teachers
    # We use timestamps or random suffix to make usernames unique for repeated runs
    import time
    ts = int(time.time())
    username_a = f"test_teacher_a_{ts}"
    username_b = f"test_teacher_b_{ts}"
    
    code, res = make_request(f"{BASE_URL}/auth/register", {
        "username": username_a,
        "password": "password123",
        "full_name": "Test Teacher A",
        "email": "a@test.com",
        "bio": "Bio A"
    }, method="POST")
    assert code == 201, f"Failed to register teacher a: {res}"
    print("Registered Teacher A.")
    
    code, res = make_request(f"{BASE_URL}/auth/register", {
        "username": username_b,
        "password": "password123",
        "full_name": "Test Teacher B",
        "email": "b@test.com",
        "bio": "Bio B"
    }, method="POST")
    assert code == 201, f"Failed to register teacher b: {res}"
    print("Registered Teacher B.")
    
    # 2. Login to get JWT tokens
    code, res = make_request(f"{BASE_URL}/auth/login", {
        "username": username_a,
        "password": "password123"
    }, method="POST")
    assert code == 200, f"Failed to login teacher a: {res}"
    token_a = res["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    code, res = make_request(f"{BASE_URL}/auth/login", {
        "username": username_b,
        "password": "password123"
    }, method="POST")
    assert code == 200, f"Failed to login teacher b: {res}"
    token_b = res["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    
    # 3. Create two combinations (owned/assigned to Teacher A on creation)
    # Note: POST /api/combinations creates and automatically assigns to current teacher
    code, res = make_request(f"{BASE_URL}/combinations", {"name": f"Class 10 - A {ts}"}, headers=headers_a, method="POST")
    assert code == 201, f"Failed to create combo 1: {res}"
    combo1_id = res["id"]
    combo1_name = res["name"]
    print(f"Teacher A created and claimed '{combo1_name}' (ID: {combo1_id}).")
    
    # Create another one for Teacher B
    code, res = make_request(f"{BASE_URL}/combinations", {"name": f"Class 10 - B {ts}"}, headers=headers_b, method="POST")
    assert code == 201, f"Failed to create combo 2: {res}"
    combo2_id = res["id"]
    combo2_name = res["name"]
    print(f"Teacher B created and claimed '{combo2_name}' (ID: {combo2_id}).")
    
    # Verify Teacher B has combo 2 linked
    code, res = make_request(f"{BASE_URL}/teachers/me/combinations", headers=headers_b, method="GET")
    assert code == 200, f"Failed to get B combinations: {res}"
    assert len(res) == 1 and res[0]["id"] == combo2_id, f"Unexpected combinations: {res}"
    print("Verified Teacher B's initial assignment is correct.")
    
    # 4. Try to assign combo 1 to Teacher B. This should fail (clash validation)
    # We request POST /api/teachers/me/combinations for Teacher B with [combo1_id, combo2_id]
    code, res = make_request(f"{BASE_URL}/teachers/me/combinations", [combo1_id, combo2_id], headers=headers_b, method="POST")
    assert code == 400, f"Expected 400 Bad Request, got {code}: {res}"
    print(f"Successfully caught expected clash response (HTTP {code}): {res}")
    
    # 5. Check if Teacher B's assignments remain unaffected (atomic transaction verify)
    code, res = make_request(f"{BASE_URL}/teachers/me/combinations", headers=headers_b, method="GET")
    assert code == 200, f"Failed to get B combinations after rollback: {res}"
    assert len(res) == 1 and res[0]["id"] == combo2_id, f"Teacher B's combinations were modified or cleared on failure: {res}"
    print("Verified Teacher B's initial assignment remains intact after the error (atomic transaction confirmed).")
    
    print("\nALL API INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as ae:
        print(f"Assertion Failure: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"Integration test error: {e}")
        sys.exit(1)
