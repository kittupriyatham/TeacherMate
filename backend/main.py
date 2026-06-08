from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import bcrypt
from pydantic import BaseModel

from database import get_session, init_db
from models import ClassSectionCombination, Student, Teacher

app = FastAPI(title="TeacherMate API")

# Enable CORS for the React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication and JWT Configuration
SECRET_KEY = "SUPER_SECRET_TEACHERMATE_KEY_CHANGE_THIS_IN_PROD"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

security = HTTPBearer()

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Pydantic schemas for request/response validation
class TeacherRegister(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    bio: Optional[str] = None

class TeacherLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TeacherOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None

class CombinationCreate(BaseModel):
    name: str

class ComboOut(BaseModel):
    id: int
    name: str
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None

    class Config:
        from_attributes = True



# Dependency to fetch currently logged-in teacher
def get_current_teacher(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_session)) -> Teacher:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    teacher = db.exec(select(Teacher).where(Teacher.username == username)).first()
    if teacher is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Teacher not found")
    return teacher

@app.on_event("startup")
def on_startup():
    try:
        init_db()
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Database initialization failed: {e}")

# --- Authentication Endpoints ---
@app.post("/api/auth/register", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
def register_teacher(teacher_data: TeacherRegister, db: Session = Depends(get_session)):
    # Check if username exists
    existing = db.exec(select(Teacher).where(Teacher.username == teacher_data.username)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    hashed = hash_password(teacher_data.password)
    new_teacher = Teacher(
        username=teacher_data.username,
        hashed_password=hashed,
        full_name=teacher_data.full_name,
        email=teacher_data.email,
        bio=teacher_data.bio
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher

@app.post("/api/auth/login", response_model=Token)
def login_teacher(login_data: TeacherLogin, db: Session = Depends(get_session)):
    teacher = db.exec(select(Teacher).where(Teacher.username == login_data.username)).first()
    if not teacher or not verify_password(login_data.password, teacher.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": teacher.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Teacher Profile Endpoints ---
@app.get("/api/teachers/me", response_model=TeacherOut)
def get_profile(current_teacher: Teacher = Depends(get_current_teacher)):
    return current_teacher

@app.put("/api/teachers/me", response_model=TeacherOut)
def update_profile(update_data: TeacherUpdate, current_teacher: Teacher = Depends(get_current_teacher), db: Session = Depends(get_session)):
    if update_data.full_name is not None:
        current_teacher.full_name = update_data.full_name
    if update_data.email is not None:
        current_teacher.email = update_data.email
    if update_data.bio is not None:
        current_teacher.bio = update_data.bio
    db.add(current_teacher)
    db.commit()
    db.refresh(current_teacher)
    return current_teacher

@app.get("/api/teachers/me/combinations", response_model=List[ClassSectionCombination])
def get_my_combinations(current_teacher: Teacher = Depends(get_current_teacher)):
    return current_teacher.combinations

@app.post("/api/teachers/me/combinations", response_model=List[ClassSectionCombination])
def set_my_combinations(combo_ids: List[int], current_teacher: Teacher = Depends(get_current_teacher), db: Session = Depends(get_session)):
    # 1. Unassign all combinations currently assigned to this teacher (in memory/session state)
    my_combos = db.exec(select(ClassSectionCombination).where(ClassSectionCombination.teacher_id == current_teacher.id)).all()
    for combo in my_combos:
        combo.teacher_id = None
        db.add(combo)
    
    # 2. Assign the new list of combinations
    for c_id in combo_ids:
        combo = db.get(ClassSectionCombination, c_id)
        if combo:
            # Check if it is assigned to someone else
            if combo.teacher_id is not None and combo.teacher_id != current_teacher.id:
                # We rollback so we don't save half-finished assignments
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Class combination '{combo.name}' is already assigned to another teacher."
                )
            combo.teacher_id = current_teacher.id
            db.add(combo)
    db.commit()
    db.refresh(current_teacher)
    return current_teacher.combinations

# --- Combinations (All & CRUD) ---
@app.get("/api/combinations", response_model=List[ComboOut])
def read_combinations(db: Session = Depends(get_session), current_teacher: Teacher = Depends(get_current_teacher)):
    combos = db.exec(select(ClassSectionCombination)).all()
    out = []
    for combo in combos:
        teacher_name = None
        if combo.teacher_id:
            t = db.get(Teacher, combo.teacher_id)
            if t:
                teacher_name = t.full_name
        out.append(ComboOut(
            id=combo.id,
            name=combo.name,
            teacher_id=combo.teacher_id,
            teacher_name=teacher_name
        ))
    return out

@app.post("/api/combinations", response_model=ClassSectionCombination, status_code=status.HTTP_201_CREATED)
def create_combination(
    combo_data: CombinationCreate,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_session)
):
    name_stripped = combo_data.name.strip()
    if not name_stripped:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Combination name cannot be empty")
        
    # Check if combination name already exists
    existing = db.exec(select(ClassSectionCombination).where(ClassSectionCombination.name == name_stripped)).first()
    if existing:
        # Check if it is already assigned to someone else
        if existing.teacher_id is not None and existing.teacher_id != current_teacher.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Class combination '{existing.name}' already exists and is assigned to another teacher."
            )
        # If unassigned, assign it to the current teacher
        if existing.teacher_id is None:
            existing.teacher_id = current_teacher.id
            db.add(existing)
            db.commit()
        return existing
        
    new_combo = ClassSectionCombination(name=name_stripped, teacher_id=current_teacher.id)
    db.add(new_combo)
    db.commit()
    db.refresh(new_combo)
    return new_combo

@app.delete("/api/combinations/{combo_id}")
def delete_combination(
    combo_id: int,
    current_teacher: Teacher = Depends(get_current_teacher),
    db: Session = Depends(get_session)
):
    combo = db.get(ClassSectionCombination, combo_id)
    if not combo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class combination not found")
        
    # Prevent teachers from deleting other teachers' combinations
    if combo.teacher_id is not None and combo.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete class combinations assigned to other teachers."
        )
        
    # Delete associated students (cascade delete)
    students = db.exec(select(Student).where(Student.combination_id == combo_id)).all()
    for student in students:
        db.delete(student)
        
    db.delete(combo)
    db.commit()
    return {"message": f"Successfully deleted combination and all associated student profiles"}

# --- Students inside a Combination ---
@app.get("/api/combinations/{combo_id}/students", response_model=List[Student])
def read_students_by_combination(combo_id: int, db: Session = Depends(get_session), current_teacher: Teacher = Depends(get_current_teacher)):
    combo = db.get(ClassSectionCombination, combo_id)
    if not combo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Class combination not found"
        )
    return db.exec(select(Student).where(Student.combination_id == combo_id)).all()

# --- Single Student Details ---
@app.get("/api/students/{student_id}", response_model=Student)
def read_student_detail(student_id: int, db: Session = Depends(get_session), current_teacher: Teacher = Depends(get_current_teacher)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student not found"
        )
    return student

# --- Student CRUD Actions ---
@app.post("/api/students", response_model=Student, status_code=status.HTTP_201_CREATED)
def create_student(student: Student, db: Session = Depends(get_session), current_teacher: Teacher = Depends(get_current_teacher)):
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@app.put("/api/students/{student_id}", response_model=Student)
def update_student(student_id: int, updated_data: Student, db: Session = Depends(get_session), current_teacher: Teacher = Depends(get_current_teacher)):
    db_student = db.get(Student, student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student not found"
        )
    
    data = updated_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key != 'id':
            setattr(db_student, key, value)
            
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/api/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_session), current_teacher: Teacher = Depends(get_current_teacher)):
    db_student = db.get(Student, student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student not found"
        )
    db.delete(db_student)
    db.commit()
    return {"message": f"Successfully deleted student profile {student_id}"}


# --- Class Combination Details & Bulk Attendance ---

@app.get("/api/combinations/{combo_id}", response_model=ClassSectionCombination)
def read_combination(
    combo_id: int,
    db: Session = Depends(get_session),
    current_teacher: Teacher = Depends(get_current_teacher)
):
    combo = db.get(ClassSectionCombination, combo_id)
    if not combo:
        raise HTTPException(status_code=404, detail="Class combination not found")
    if combo.teacher_id != current_teacher.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this class combination")
    return combo


class StudentAttendanceUpdate(BaseModel):
    id: int
    attendance: Optional[int] = None

class BulkAttendanceSave(BaseModel):
    month: str
    working_days: Optional[int] = None
    students_attendance: List[StudentAttendanceUpdate]

@app.post("/api/combinations/{combo_id}/attendance")
def save_bulk_attendance(
    combo_id: int,
    payload: BulkAttendanceSave,
    db: Session = Depends(get_session),
    current_teacher: Teacher = Depends(get_current_teacher)
):
    combo = db.get(ClassSectionCombination, combo_id)
    if not combo:
        raise HTTPException(status_code=404, detail="Class combination not found")
    if combo.teacher_id != current_teacher.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this class combination")
        
    month_key = payload.month.lower().strip()
    valid_months = ["jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may"]
    if month_key not in valid_months:
        raise HTTPException(status_code=400, detail="Invalid month code")
        
    # Set the working days field for the combination
    setattr(combo, f"working_days_{month_key}", payload.working_days)
    db.add(combo)
    
    # Update each student's attendance
    for item in payload.students_attendance:
        student = db.get(Student, item.id)
        if student:
            if student.combination_id != combo_id:
                raise HTTPException(status_code=400, detail=f"Student ID {item.id} is not in this class combination")
            setattr(student, f"att_{month_key}", item.attendance)
            db.add(student)
            
    db.commit()
    return {"message": f"Successfully updated attendance for {month_key.upper()} with {payload.working_days} working days."}

