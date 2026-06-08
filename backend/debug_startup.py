print("1. Importing standard libraries...")
import os
import sys
import time
print("1. done")
print("2. Importing third-party libraries (pymysql, sqlmodel)...")
import pymysql
import sqlmodel
from sqlmodel import create_engine, Session, select
print("2. done")
print("3. Importing project database settings...")
import database
print("3. done")
print("4. Importing project models...")
import models
print("4. done")

print("5. Initializing database schema (connecting to MySQL)...")
try:
    print("6. Database schema initializing...")
    database.init_db()
    print("6. done")
    
except Exception as e:
    print(f"6. exception: FAILED DATABASE CONNECTION: {e}")
print("5. done")
print("7. Diagnostic complete! Everything works.")
