import sys
import os
from sqlalchemy import text

# Append backend path to import database engine
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from database import engine

print("Connecting to database to run Spoken English and Remarks columns migration...")
with engine.connect() as conn:
    # Check current columns in students
    try:
        res = conn.execute(text("DESCRIBE students"))
        columns = [row[0] for row in res.fetchall()]
        print(f"Current columns in students: {columns}")
        
        alter_student_parts = []
        new_cols = {
            "listening": "INT NULL",
            "speaking": "INT NULL",
            "reading": "INT NULL",
            "writing": "INT NULL",
            "remarks": "TEXT NULL"
        }
        
        for col, col_def in new_cols.items():
            if col not in columns:
                alter_student_parts.append(f"ADD COLUMN {col} {col_def}")
                
        if alter_student_parts:
            alter_query = f"ALTER TABLE students {', '.join(alter_student_parts)}"
            print(f"Executing: {alter_query}")
            conn.execute(text(alter_query))
            conn.commit()
            print("Successfully added Spoken English and Remarks columns to students.")
        else:
            print("Spoken English and Remarks columns already exist in students.")
    except Exception as e:
        print(f"Error migrating students table: {e}")
        sys.exit(1)

print("Spoken English and Remarks migration completed successfully.")
