import pymysql
try:
    conn = pymysql.connect(host='127.0.0.1', user='root', password='root', port=3306)
    print("SUCCESS: Connected to MySQL!")
    conn.close()
except Exception as e:
    print(f"FAILED: {e}")
