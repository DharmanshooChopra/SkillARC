import sqlite3
import string
import random

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def update_db():
    conn = sqlite3.connect("backend/sql_app.db")
    cursor = conn.cursor()
    
    # Try adding the column (may fail if it already exists)
    try:
        cursor.execute("ALTER TABLE classrooms ADD COLUMN class_code VARCHAR;")
        print("Added class_code column.")
    except sqlite3.OperationalError as e:
        print("Column may already exist:", e)
        
    # Update existing classrooms
    cursor.execute("SELECT id FROM classrooms WHERE class_code IS NULL;")
    rows = cursor.fetchall()
    
    for (row_id,) in rows:
        code = generate_code()
        cursor.execute("UPDATE classrooms SET class_code = ? WHERE id = ?", (code, row_id))
        
    conn.commit()
    conn.close()
    print("Database updated successfully.")

if __name__ == "__main__":
    update_db()
