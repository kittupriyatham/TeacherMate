from sqlmodel import Session, select, create_engine
from models import ClassSectionCombination, Student
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with Session(engine) as session:
    combos = session.exec(select(ClassSectionCombination)).all()
    students = session.exec(select(Student)).all()
    
    print(f"--- DATABASE CHECKS (URL: {DATABASE_URL}) ---")
    print(f"Combinations Count: {len(combos)}")
    for c in combos:
        print(f"  - ID: {c.id}, Name: '{c.name}'")
        
    print(f"Students Count: {len(students)}")
    for s in students:
        print(f"  - ID: {s.id}, Name: '{s.name}', Roll: #{s.roll_no}, Combo ID: {s.combination_id}")
