import os
from sqlmodel import create_engine, Session, SQLModel

# Support environment variable override for DB URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:root@127.0.0.1:3306/school_db"
)

# If port 3606 was explicitly requested in user configuration, handle fallback/check
# We will use 3306 as default, but database_url can be adjusted.
engine = create_engine(
    DATABASE_URL,
    connect_args={"connect_timeout": 3},
    echo=True,
    pool_recycle=3600
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
