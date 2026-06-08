from sqlmodel import Session, select, create_engine
from models import ClassSectionCombination, Student
from database import DATABASE_URL
import random

engine = create_engine(DATABASE_URL)

first_names_boys = [
    "Aarav", "Aditya", "Arjun", "Kabir", "Sai", "Krishna", "Rohan", "Vihaan", 
    "Ishan", "Reyansh", "Pranav", "Ritvik", "Karthik", "Siddharth", "Madhav", 
    "Rahul", "Anand", "Sanjay", "Vivek", "Sameer", "Harish", "Priyatham", 
    "Nikhil", "Akash", "Kiran", "Vijay", "Manish", "Gopal", "Vikram", "Ajay"
]

first_names_girls = [
    "Diya", "Ananya", "Kiara", "Riya", "Aaradhya", "Ishita", "Myra", "Kavya", 
    "Anika", "Sneha", "Shruti", "Meera", "Priya", "Pooja", "Neha", "Divya", 
    "Aditi", "Tanvi", "Swati", "Nisha", "Mohana", "Lakshmi", "Harini", 
    "Sanya", "Radhika", "Priyanka", "Amrita", "Kiran", "Shreya", "Deepika"
]

last_names = [
    "Sharma", "Patel", "Iyer", "Rao", "Nair", "Gupta", "Kumar", "Reddy", 
    "Joshi", "Verma", "Singh", "Choudhury", "Das", "Mishra", "Sen", "Bhat", 
    "Kulkarni", "Pillai", "Saxena", "Prasad", "Naidu", "Chowdary", "Soni",
    "Bose", "Roy", "Banerjee", "Chatterjee", "Dubey", "Dwivedi", "Pandey"
]

def generate_student_names(count):
    names = []
    # Seed to make sure name generation has variety but is reproducible/consistent if run once
    random.seed(42)
    
    used_names = set()
    while len(names) < count:
        first = random.choice(first_names_boys + first_names_girls)
        last = random.choice(last_names)
        full_name = f"{first} {last}"
        if full_name not in used_names:
            used_names.add(full_name)
            names.append(full_name)
            
    return names

def populate():
    with Session(engine) as session:
        # Get all class combinations
        combos = session.exec(select(ClassSectionCombination)).all()
        if not combos:
            print("No class combinations found. Please create them first.")
            return
            
        print(f"Generating 10 students for each of the {len(combos)} combinations...")
        
        # Clear existing students first for a clean setup
        from sqlmodel import text
        session.exec(text("DELETE FROM students"))
        session.commit()
        
        total_inserted = 0
        for combo in combos:
            # Generate 10 unique names for this combination
            names = generate_student_names(10)
            
            for index, name in enumerate(names):
                roll_no = index + 1  # Roll numbers starting from 1
                student = Student(
                    name=name,
                    roll_no=roll_no,
                    combination_id=combo.id,
                    # Main Evaluation (out of 100)
                    fa1=random.randint(60, 98),
                    fa2=random.randint(55, 95),
                    sa1=random.randint(50, 92),
                    fa3=random.randint(65, 99),
                    fa4=random.randint(60, 95),
                    sa2=random.randint(55, 96),
                    # Previous Year Main Evaluation
                    prev_fa1=random.randint(55, 95),
                    prev_fa2=random.randint(50, 92),
                    prev_sa1=random.randint(48, 90),
                    prev_fa3=random.randint(60, 96),
                    prev_fa4=random.randint(55, 92),
                    prev_sa2=random.randint(50, 93),
                    # 2 Years Ago Main Evaluation
                    prev2_fa1=random.randint(50, 90),
                    prev2_fa2=random.randint(45, 88),
                    prev2_sa1=random.randint(45, 85),
                    prev2_fa3=random.randint(55, 92),
                    prev2_fa4=random.randint(50, 88),
                    prev2_sa2=random.randint(45, 88),
                    # Grammar (out of 50)
                    g1=random.randint(30, 48),
                    g2=random.randint(28, 49),
                    g3=random.randint(32, 50),

                    # Vocabulary (out of 50)
                    v1=random.randint(25, 47),
                    v2=random.randint(29, 48),
                    v3=random.randint(31, 49),

                    # Creative Work (out of 100)
                    r1=random.randint(70, 98),
                    p1=random.randint(75, 99),
                    cw1=random.randint(68, 95),
                    r2=random.randint(72, 97),
                    p2=random.randint(78, 100),
                    cw2=random.randint(70, 96),
                    r3=random.randint(75, 99),
                    p3=random.randint(80, 100),
                    cw3=random.randint(72, 98),

                    # Slip Tests (out of 25)
                    st1=random.randint(12, 24),
                    st2=random.randint(10, 25),
                    st3=random.randint(15, 25),
                    st4=random.randint(11, 23),
                    st5=random.randint(14, 24),
                    st6=random.randint(13, 25),
                    st7=random.randint(12, 23),
                    st8=random.randint(15, 24),
                    st9=random.randint(14, 25),
                    st10=random.randint(16, 25)
                )
                session.add(student)
                total_inserted += 1
                
        session.commit()
        print(f"Success! Inserted {total_inserted} student records across {len(combos)} class combinations.")

if __name__ == "__main__":
    populate()
