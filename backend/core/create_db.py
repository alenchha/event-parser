import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.model.models import User, Base
from backend.core.config import get_password_hash


def main():
    DATABASE_URL = os.getenv("DATABASE_URL")
    os.makedirs("/app/data", exist_ok=True)

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    Base.metadata.create_all(bind=engine)

    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")

    existing_admin = db.query(User).filter(User.role == "admin").first()

    if not existing_admin:
        db_admin = User(
            username=admin_username,
            password=get_password_hash(admin_password),
            role="admin"
        )
        db.add(db_admin)
        db.commit()
        print("Admin created")
    else:
        print("Admin already exists")

    db.close()


if __name__ == "__main__":
    main()
