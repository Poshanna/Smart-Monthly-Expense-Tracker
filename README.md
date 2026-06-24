# Smart Expense Tracker

A full-stack expense tracking application with AI-powered receipt scanning!

## Features

- Add, edit, and delete expenses
- Multi-currency support (INR, USD, EUR, GBP)
- Receipt scanning using OCR (EasyOCR)
- Budget management
- Savings goals
- Expense analytics and insights
- Financial health score

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy (ORM)
- SQLite
- EasyOCR
- Passlib (password hashing)
- Python-Jose (JWT)

### Frontend
- React.js
- Tailwind CSS
- Axios
- Recharts

## Getting Started

### Backend Setup

1. Navigate to `backend/`
2. Create and activate virtual environment:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate (Windows)
   source venv/bin/activate (Linux/Mac)
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run backend server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run frontend server:
   ```bash
   npm run dev
   ```

## Usage

1. Register an account or log in
2. Add expenses manually or scan receipts
3. Set budgets and savings goals
4. View analytics and insights
