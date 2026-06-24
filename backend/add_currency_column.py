from database import engine, Base
from sqlalchemy import text

with engine.connect() as conn:
    # Check if currency column exists
    result = conn.execute(text("PRAGMA table_info(expenses)"))
    columns = [row[1] for row in result]
    if 'currency' not in columns:
        conn.execute(text("ALTER TABLE expenses ADD COLUMN currency TEXT DEFAULT 'INR'"))
        conn.commit()
        print("Currency column added successfully!")
    else:
        print("Currency column already exists!")
