from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from ..model.models import User, Base
from ..routes.auth import get_password_hash

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "app.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

Base.metadata.create_all(bind=engine)

admin_username = "admin"
admin_password = "admin"

existing_admin = db.query(User).filter(User.role == "admin").first()
if not existing_admin:
    db_admin = User(
        username=admin_username,
        password=get_password_hash(admin_password),
        role="admin"
    )
    db.add(db_admin)
    db.commit()
    print(f"Admin created: {admin_username} / {admin_password}")
else:
    print(f"Admin already exists: {existing_admin.username}")

db.close()
