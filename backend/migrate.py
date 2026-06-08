import os
import sys
from sqlalchemy import text
from database import engine

print("Connecting to database to run migration...")
with engine.connect() as conn:
    # 1. Check if column teacher_id already exists in class_section_combinations
    try:
        # Check if we can select teacher_id (will throw if it doesn't exist)
        conn.execute(text("SELECT teacher_id FROM class_section_combinations LIMIT 1"))
        print("Column teacher_id already exists. No migration needed.")
    except Exception as e:
        print("Column teacher_id does not exist. Adding column...")
        try:
            conn.execute(text("ALTER TABLE class_section_combinations ADD COLUMN teacher_id INT NULL"))
            conn.execute(text("ALTER TABLE class_section_combinations ADD CONSTRAINT fk_teacher_combination FOREIGN KEY (teacher_id) REFERENCES teachers(id)"))
            conn.commit()
            print("Alter successful. Column teacher_id and Foreign Key added.")
        except Exception as alter_err:
            print(f"Error during ALTER TABLE: {alter_err}")
            sys.exit(1)

    # 2. Drop the unused teacher_class_links table
    try:
        conn.execute(text("DROP TABLE IF EXISTS teacher_class_links"))
        conn.commit()
        print("Dropped teacher_class_links table successfully.")
    except Exception as drop_err:
        print(f"Could not drop link table: {drop_err}")

print("Migration completed.")
