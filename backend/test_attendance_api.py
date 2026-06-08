import urllib.request
import urllib.error
import json
import sys
import time

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
    print("Starting Attendance API Integration Tests...")
    
    # 1. Register a teacher
    ts = int(time.time())
    username = f"attendance_teacher_{ts}"
    code, res = make_request(f"{BASE_URL}/auth/register", {
        "username": username,
        "password": "password123",
        "full_name": "Attendance Teacher",
        "email": "attendance@test.com"
    }, method="POST")
    assert code == 201, f"Failed to register teacher: {res}"
    
    # 2. Login
    code, res = make_request(f"{BASE_URL}/auth/login", {
        "username": username,
        "password": "password123"
    }, method="POST")
    assert code == 200, f"Failed to login: {res}"
    token = res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create a Combination
    code, res = make_request(f"{BASE_URL}/combinations", {"name": f"Attendance Class {ts}"}, headers=headers, method="POST")
    assert code == 201, f"Failed to create combo: {res}"
    combo_id = res["id"]
    
    # Verify combination initially has null working days
    assert res["working_days_jun"] is None, f"Expected null working days, got {res['working_days_jun']}"
    
    # 4. Create a student
    code, res = make_request(f"{BASE_URL}/students", {
        "name": "Test Student A",
        "roll_no": 1,
        "combination_id": combo_id
    }, headers=headers, method="POST")
    assert code == 201, f"Failed to create student: {res}"
    student_id = res["id"]
    assert res["att_jun"] is None, f"Expected null attended days, got {res['att_jun']}"
    
    # 5. Fetch single combination details
    code, res = make_request(f"{BASE_URL}/combinations/{combo_id}", headers=headers, method="GET")
    assert code == 200, f"Failed to fetch combo details: {res}"
    assert res["name"] == f"Attendance Class {ts}"
    
    # 6. Save bulk attendance (Jun month, 22 working days, 20 attended days)
    payload = {
        "month": "jun",
        "working_days": 22,
        "students_attendance": [
            { "id": student_id, "attendance": 20 }
        ]
    }
    code, res = make_request(f"{BASE_URL}/combinations/{combo_id}/attendance", payload, headers=headers, method="POST")
    assert code == 200, f"Failed to save bulk attendance: {res}"
    print("Bulk attendance update returned code 200 successfully.")
    
    # 7. Verify updated combination working days
    code, res = make_request(f"{BASE_URL}/combinations/{combo_id}", headers=headers, method="GET")
    assert code == 200, f"Failed to refetch combo details: {res}"
    assert res["working_days_jun"] == 22, f"Expected working days to be 22, got {res['working_days_jun']}"
    
    # 8. Verify updated student attendance
    code, res = make_request(f"{BASE_URL}/students/{student_id}", headers=headers, method="GET")
    assert code == 200, f"Failed to fetch student details: {res}"
    assert res["att_jun"] == 20, f"Expected student attendance to be 20, got {res['att_jun']}"
    
    print("\nALL ATTENDANCE API INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as ae:
        print(f"Assertion Failure: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"Integration test error: {e}")
        sys.exit(1)
