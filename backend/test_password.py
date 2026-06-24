from auth import get_password_hash
print("Testing password hash...")
try:
    hashed = get_password_hash("test123")
    print(f"Success! Hashed password: {hashed}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
