from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class ClassSectionCombination(SQLModel, table=True):
    __tablename__ = "class_section_combinations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    teacher_id: Optional[int] = Field(default=None, foreign_key="teachers.id", nullable=True)
    
    # Monthly Total Working Days
    working_days_jun: Optional[int] = Field(default=None, nullable=True)
    working_days_jul: Optional[int] = Field(default=None, nullable=True)
    working_days_aug: Optional[int] = Field(default=None, nullable=True)
    working_days_sep: Optional[int] = Field(default=None, nullable=True)
    working_days_oct: Optional[int] = Field(default=None, nullable=True)
    working_days_nov: Optional[int] = Field(default=None, nullable=True)
    working_days_dec: Optional[int] = Field(default=None, nullable=True)
    working_days_jan: Optional[int] = Field(default=None, nullable=True)
    working_days_feb: Optional[int] = Field(default=None, nullable=True)
    working_days_mar: Optional[int] = Field(default=None, nullable=True)
    working_days_apr: Optional[int] = Field(default=None, nullable=True)
    working_days_may: Optional[int] = Field(default=None, nullable=True)
    
    students: List["Student"] = Relationship(back_populates="combination")
    teacher: Optional["Teacher"] = Relationship(back_populates="combinations")

class Student(SQLModel, table=True):
    __tablename__ = "students"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    roll_no: int = Field(nullable=False)
    combination_id: int = Field(foreign_key="class_section_combinations.id", nullable=False)
    
    # Main Evaluation
    fa1: Optional[int] = Field(default=None, nullable=True)
    fa2: Optional[int] = Field(default=None, nullable=True)
    sa1: Optional[int] = Field(default=None, nullable=True)
    fa3: Optional[int] = Field(default=None, nullable=True)
    fa4: Optional[int] = Field(default=None, nullable=True)
    sa2: Optional[int] = Field(default=None, nullable=True)
    
    # Previous Year Main Evaluation
    prev_fa1: Optional[int] = Field(default=None, nullable=True)
    prev_fa2: Optional[int] = Field(default=None, nullable=True)
    prev_sa1: Optional[int] = Field(default=None, nullable=True)
    prev_fa3: Optional[int] = Field(default=None, nullable=True)
    prev_fa4: Optional[int] = Field(default=None, nullable=True)
    prev_sa2: Optional[int] = Field(default=None, nullable=True)
    
    # 2 Years Ago Main Evaluation
    prev2_fa1: Optional[int] = Field(default=None, nullable=True)
    prev2_fa2: Optional[int] = Field(default=None, nullable=True)
    prev2_sa1: Optional[int] = Field(default=None, nullable=True)
    prev2_fa3: Optional[int] = Field(default=None, nullable=True)
    prev2_fa4: Optional[int] = Field(default=None, nullable=True)
    prev2_sa2: Optional[int] = Field(default=None, nullable=True)
    
    # Grammar
    g1: Optional[int] = Field(default=None, nullable=True)
    g2: Optional[int] = Field(default=None, nullable=True)
    g3: Optional[int] = Field(default=None, nullable=True)
    

    
    # Vocabulary
    v1: Optional[int] = Field(default=None, nullable=True)
    v2: Optional[int] = Field(default=None, nullable=True)
    v3: Optional[int] = Field(default=None, nullable=True)
    

    
    # Creative Work
    r1: Optional[int] = Field(default=None, nullable=True)
    p1: Optional[int] = Field(default=None, nullable=True)
    cw1: Optional[int] = Field(default=None, nullable=True)
    r2: Optional[int] = Field(default=None, nullable=True)
    p2: Optional[int] = Field(default=None, nullable=True)
    cw2: Optional[int] = Field(default=None, nullable=True)
    r3: Optional[int] = Field(default=None, nullable=True)
    p3: Optional[int] = Field(default=None, nullable=True)
    cw3: Optional[int] = Field(default=None, nullable=True)
    

    
    # Slip Tests
    st1: Optional[int] = Field(default=None, nullable=True)
    st2: Optional[int] = Field(default=None, nullable=True)
    st3: Optional[int] = Field(default=None, nullable=True)
    st4: Optional[int] = Field(default=None, nullable=True)
    st5: Optional[int] = Field(default=None, nullable=True)
    st6: Optional[int] = Field(default=None, nullable=True)
    st7: Optional[int] = Field(default=None, nullable=True)
    st8: Optional[int] = Field(default=None, nullable=True)
    st9: Optional[int] = Field(default=None, nullable=True)
    st10: Optional[int] = Field(default=None, nullable=True)
    
    # Monthly Days Attended
    att_jun: Optional[int] = Field(default=None, nullable=True)
    att_jul: Optional[int] = Field(default=None, nullable=True)
    att_aug: Optional[int] = Field(default=None, nullable=True)
    att_sep: Optional[int] = Field(default=None, nullable=True)
    att_oct: Optional[int] = Field(default=None, nullable=True)
    att_nov: Optional[int] = Field(default=None, nullable=True)
    att_dec: Optional[int] = Field(default=None, nullable=True)
    att_jan: Optional[int] = Field(default=None, nullable=True)
    att_feb: Optional[int] = Field(default=None, nullable=True)
    att_mar: Optional[int] = Field(default=None, nullable=True)
    att_apr: Optional[int] = Field(default=None, nullable=True)
    att_may: Optional[int] = Field(default=None, nullable=True)
    
    # Spoken English (vp, p, a, aa, g, e)
    listening: Optional[str] = Field(default=None, nullable=True)
    speaking: Optional[str] = Field(default=None, nullable=True)
    reading: Optional[str] = Field(default=None, nullable=True)
    writing: Optional[str] = Field(default=None, nullable=True)
    
    # Remarks
    remarks: Optional[str] = Field(default=None, nullable=True)
    
    combination: Optional[ClassSectionCombination] = Relationship(back_populates="students")

class Teacher(SQLModel, table=True):
    __tablename__ = "teachers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    full_name: str = Field(nullable=False)
    email: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    
    combinations: List[ClassSectionCombination] = Relationship(back_populates="teacher")


