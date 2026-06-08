import sys
import os
from sqlalchemy import text

# Append backend path to import database engine
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from database import engine

print("Connecting to database to run attendance columns migration...")
with engine.connect() as conn:
    # 1. Add columns to class_section_combinations
    months = ["jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may"]
    
    # Check current columns in class_section_combinations
    try:
        res = conn.execute(text("DESCRIBE class_section_combinations"))
        columns = [row[0] for row in res.fetchall()]
        print(f"Current columns in class_section_combinations: {columns}")
        
        alter_combo_parts = []
        for m in months:
            col_name = f"working_days_{m}"
            if col_name not in columns:
                alter_combo_parts.append(f"ADD COLUMN {col_name} INT NULL")
                
        if alter_combo_parts:
            alter_query = f"ALTER TABLE class_section_combinations {', '.join(alter_combo_parts)}"
            print(f"Executing: {alter_query}")
            conn.execute(text(alter_query))
            conn.commit()
            print("Successfully added monthly working days columns to class_section_combinations.")
        else:
            print("Monthly working days columns already exist in class_section_combinations.")
    except Exception as e:
        print(f"Error migrating class_section_combinations: {e}")
        sys.exit(1)

    # 2. Add columns to students
    try:
        res = conn.execute(text("DESCRIBE students"))
        columns = [row[0] for row in res.fetchall()]
        print(f"Current columns in students: {columns}")
        
        alter_student_parts = []
        for m in months:
            col_name = f"att_{m}"
            if col_name not in columns:
                alter_student_parts.append(f"ADD COLUMN {col_name} INT NULL")
                
        if alter_student_parts:
            alter_query = f"ALTER TABLE students {', '.join(alter_student_parts)}"
            print(f"Executing: {alter_query}")
            conn.execute(text(alter_query))
            conn.commit()
            print("Successfully added monthly attendance columns to students.")
        else:
            print("Monthly attendance columns already exist in students.")
    except Exception as e:
        print(f"Error migrating students: {e}")
        sys.exit(1)

print("Attendance migration completed successfully.")
