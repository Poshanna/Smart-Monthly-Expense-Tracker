# 💸 Smart Expense Tracker

A modern, full-stack expense tracking application with AI-powered receipt scanning, budget management, and financial insights!

## 🌐 Live Demo

- **Frontend**: https://smart-monthly-expense-tracker.vercel.app/
- **Backend API**: https://smart-monthly-expense-tracker-1.onrender.com/
- **Backend API Docs**: https://smart-monthly-expense-tracker-1.onrender.com/docs

## 🎯 Features

- **Expense Management**: Add, edit, delete, and view all your expenses
- **Multi-Currency Support**: Track expenses in INR, USD, EUR, or GBP with real-time currency symbols
- **Receipt Scanning**: Scan receipts using OCR (EasyOCR) to auto-fill expense details
- **Budget Management**: Set monthly budgets per category
- **Savings Goals**: Create and track progress towards savings goals
- **Analytics & Insights**: Visualize spending patterns with interactive charts
- **Financial Health Score**: Get a score based on your spending habits
- **Secure Authentication**: JWT-based login system with password hashing

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: ORM for database interactions
- **SQLite**: Lightweight database for data storage
- **EasyOCR**: Optical Character Recognition for receipt scanning
- **Passlib**: Password hashing and verification
- **Python-Jose**: JSON Web Token (JWT) authentication
- **Uvicorn**: ASGI server

### Frontend
- **React.js**: Component-based UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Recharts**: Data visualization library
- **Vite**: Fast build tool

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux/macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```
   Backend API docs will be available at http://localhost:8001/docs

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Frontend will be available at http://localhost:5173 (or the port shown in terminal)

## 📱 Usage

1. **Register/Login**: Create an account or log in to your existing account
2. **Dashboard**: View your expense summary, recent transactions, and financial health score
3. **Add Expenses**:
   - Manually add expense details (amount, category, description, currency, etc.)
   - Or upload a receipt to auto-scan details using OCR
4. **Budgets**: Set monthly budgets per category and track spending against them
5. **Savings Goals**: Create goals and track your progress
6. **Analytics**: View detailed charts and reports of your spending habits
7. **Insights**: Get personalized financial insights

## 📁 Project Structure

```
Smart Expense Tracker/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic data validation schemas
│   ├── database.py          # Database connection setup
│   ├── auth.py              # Authentication utilities
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # React entry point
│   └── package.json         # Node.js dependencies
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /token` - Login and get access token

### Expenses
- `GET /expenses/` - Get all expenses
- `POST /expenses/` - Create a new expense
- `GET /expenses/{expense_id}` - Get expense by ID
- `PUT /expenses/{expense_id}` - Update an expense
- `DELETE /expenses/{expense_id}` - Delete an expense

### OCR
- `POST /ocr/scan` - Scan a receipt image

### Budget
- `GET /budgets/` - Get all budgets
- `POST /budgets/` - Create a budget

### Goals
- `GET /goals/` - Get all savings goals
- `POST /goals/` - Create a savings goal

### Analytics
- `GET /dashboard/summary` - Get dashboard summary
- `GET /analytics/daily` - Daily analytics
- `GET /analytics/monthly` - Monthly analytics
- `GET /financial-health` - Financial health score
- `GET /ai-insights` - AI-powered insights

## 🛡️ Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- No sensitive data is exposed in API responses

## 📄 License

This project is open source.

## 🤝 Contributing

Contributions are welcome! Feel free to open a Pull Request.

---
Built with ❤️ using FastAPI and React
