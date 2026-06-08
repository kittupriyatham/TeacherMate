import sys
import os
from sqlalchemy import text

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from database import engine

print("Connecting to database to modify Spoken English columns to VARCHAR...")
with engine.connect() as conn:
    try:
        # Alter columns to VARCHAR(20)
        alter_query = """
        ALTER TABLE students 
        MODIFY COLUMN listening VARCHAR(20) NULL,
        MODIFY COLUMN speaking VARCHAR(20) NULL,
        MODIFY COLUMN reading VARCHAR(20) NULL,
        MODIFY COLUMN writing VARCHAR(20) NULL
        """
        print(f"Executing: {alter_query}")
        conn.execute(text(alter_query))
        conn.commit()
        print("Successfully modified Spoken English columns to VARCHAR(20).")
    except Exception as e:
        print(f"Error migrating columns: {e}")
        sys.exit(1)

print("Migration completed successfully.")
