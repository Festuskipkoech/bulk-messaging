# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MySQL Database Configuration
DATABASE_URL = "mysql+pymysql://root:@localhost/bulk_messenger"
try:
    # Create SQLAlchemy engine
    engine = create_engine(DATABASE_URL)

    # Create SessionLocal class
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create Base class for models
    Base = declarative_base()

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

except SQLAlchemyError as e:
    print(f"Database connection error: {e}")
    raise