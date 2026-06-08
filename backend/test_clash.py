import sys
from sqlmodel import Session, select, create_engine, text
from models import ClassSectionCombination, Teacher, Student
from database import DATABASE_URL
import bcrypt

# Setup test connection
engine = create_engine(DATABASE_URL)

def run_tests():
    print("Starting clash validation and atomic transaction tests...")
    
    with Session(engine) as db:
        # Clear existing combinations & teachers for clean test
        db.exec(text("DELETE FROM students"))
        db.exec(text("DELETE FROM class_section_combinations"))
        db.exec(text("DELETE FROM teachers"))
        db.commit()
        
        # 1. Create two teachers
        hashed = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode('utf-8')
        t1 = Teacher(username="teacher_a", hashed_password=hashed, full_name="Teacher A")
        t2 = Teacher(username="teacher_b", hashed_password=hashed, full_name="Teacher B")
        db.add(t1)
        db.add(t2)
        db.commit()
        
        db.refresh(t1)
        db.refresh(t2)
        print(f"Created teachers: {t1.full_name} (ID: {t1.id}), {t2.full_name} (ID: {t2.id})")
        
        # 2. Create combinations
        c1 = ClassSectionCombination(name="Class 1 - A")
        c2 = ClassSectionCombination(name="Class 1 - B")
        db.add(c1)
        db.add(c2)
        db.commit()
        
        db.refresh(c1)
        db.refresh(c2)
        print(f"Created combinations: '{c1.name}' (ID: {c1.id}), '{c2.name}' (ID: {c2.id})")
        
        # Test Case 1: Assign combination to Teacher A
        c1.teacher_id = t1.id
        db.add(c1)
        db.commit()
        db.refresh(c1)
        print(f"Assigned '{c1.name}' to Teacher A (ID: {c1.teacher_id}). Confirmed: {c1.teacher_id == t1.id}")
        
        # Test Case 2: Verify Teacher B cannot assign themselves to Class 1 - A (assigned to Teacher A)
        # We simulate set_my_combinations for Teacher B with [c1.id, c2.id]
        print("Testing assignment collision...")
        
        # First, set Teacher B's initial assignment to Class 1 - B
        c2.teacher_id = t2.id
        db.add(c2)
        db.commit()
        db.refresh(c2)
        print(f"Assigned '{c2.name}' to Teacher B. Teacher B current combos: {[c.name for c in t2.combinations]}")
        
        # Simulate set_my_combinations endpoint body for Teacher B trying to claim [c1.id, c2.id]
        # In memory unassign:
        t2_combos = db.exec(select(ClassSectionCombination).where(ClassSectionCombination.teacher_id == t2.id)).all()
        for combo in t2_combos:
            combo.teacher_id = None
            db.add(combo)
            
        # Try to assign both c1 and c2 to Teacher B
        success = True
        try:
            for combo_id in [c1.id, c2.id]:
                combo = db.get(ClassSectionCombination, combo_id)
                if combo:
                    # Check clash
                    if combo.teacher_id is not None and combo.teacher_id != t2.id:
                        db.rollback()
                        raise Exception(f"Collision: Class combination '{combo.name}' is already assigned to another teacher.")
                    combo.teacher_id = t2.id
                    db.add(combo)
            db.commit()
        except Exception as e:
            success = False
            print(f"Caught expected exception: {e}")
            
        assert not success, "Expected collision assignment to fail!"
        
        # Refresh and verify atomic transaction rollback
        db.refresh(t2)
        db.refresh(c2)
        db.refresh(c1)
        
        # Verify that Teacher B's assignment to Class 1 - B is STILL intact!
        print(f"Teacher B combos after collision attempt: {[c.name for c in t2.combinations]}")
        assert len(t2.combinations) == 1, "Teacher B combinations should not have been cleared on error!"
        assert t2.combinations[0].id == c2.id, "Teacher B should still be assigned to Class 1 - B!"
        assert c1.teacher_id == t1.id, "Class 1 - A should still be assigned to Teacher A!"
        
        print("SUCCESS: Both collision detection and atomic rollback tests passed successfully!")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as ae:
        print(f"Assertion Error: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"Error running tests: {e}")
        sys.exit(1)
