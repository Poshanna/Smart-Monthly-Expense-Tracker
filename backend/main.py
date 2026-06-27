from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
import io
import re
import easyocr
from PIL import Image
from database import engine, get_db, Base
from models import User, Expense, Budget, Goal, Notification
from schemas import (
    UserCreate, User as UserSchema, Token, ExpenseCreate, Expense as ExpenseSchema,
    BudgetCreate, Budget as BudgetSchema, GoalCreate, Goal as GoalSchema,
    GoalUpdate, NotificationCreate, Notification as NotificationSchema,
    OCRResult, FinancialHealthScore, AIInsight
)
from auth import (
    authenticate_user, create_access_token, get_password_hash,
    get_current_user, get_user
)

# Initialize OCR reader (commented out for now to speed up server start)
reader = None
print("OCR disabled for testing - receipt scanning not available")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Finance Assistant API")


@app.get("/")
def read_root():
    return {"message": "Smart Finance Assistant API is running!", "docs": "/docs"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/expenses/", response_model=ExpenseSchema)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense = Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.get("/expenses/", response_model=List[ExpenseSchema])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
    return query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()


@app.get("/expenses/{expense_id}", response_model=ExpenseSchema)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@app.put("/expenses/{expense_id}", response_model=ExpenseSchema)
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for key, value in expense.model_dump().items():
        setattr(db_expense, key, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


@app.post("/budgets/", response_model=BudgetSchema)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    if existing_budget:
        existing_budget.monthly_budget = budget.monthly_budget
        db.commit()
        db.refresh(existing_budget)
        return existing_budget
    db_budget = Budget(**budget.model_dump(), user_id=current_user.id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


@app.get("/budgets/", response_model=BudgetSchema)
def get_budget(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not set")
    return budget


@app.post("/goals/", response_model=GoalSchema)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_goal = Goal(**goal.model_dump(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@app.get("/goals/", response_model=List[GoalSchema])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()


@app.put("/goals/{goal_id}", response_model=GoalSchema)
def update_goal(
    goal_id: int,
    goal: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key, value in goal.model_dump(exclude_unset=True).items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@app.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(db_goal)
    db.commit()
    return {"message": "Goal deleted successfully"}


@app.get("/notifications/", response_model=List[NotificationSchema])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()


@app.post("/ocr/scan", response_model=OCRResult)
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    global reader
    if reader is None:
        raise HTTPException(status_code=500, detail="OCR is not available")
    
    # Read the image file
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Perform OCR
    results = reader.readtext(image)
    text = "\n".join([result[1] for result in results])
    print("OCR Scanned Text:")
    print(text)
    
    # Parse merchant name (simple heuristic)
    merchant_name = None
    merchant_candidates = [
        r"Merchant:\s*(.+)",
        r"Store:\s*(.+)",
        r"From:\s*(.+)",
        r"([A-Z][A-Za-z0-9\s&]+)\s*Ltd",
        r"([A-Z][A-Za-z0-9\s&]+)\s*Inc",
    ]
    for pattern in merchant_candidates:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            merchant_name = match.group(1).strip()
            break
    
    # Parse date
    date = None
    date_patterns = [
        r"(\d{4}[-/]\d{2}[-/]\d{2})",
        r"(\d{2}[-/]\d{2}[-/]\d{4})",
        r"(\d{2}[-/]\d{2}[-/]\d{2})"
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            date = match.group(1)
            break
    
    # Parse amount and currency
    amount = None
    currency = "INR"
    text_lower = text.lower()
    amount_patterns = [
        r"Total[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"Grand Total[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"Amount[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"Rs[:.\s]*([\d,]+\.?\d{0,2})",
        r"INR[:.\s]*([\d,]+\.?\d{0,2})",
        r"([\d,]+\.?\d{0,2})\s*Rs",
        r"([\d,]+\.?\d{0,2})\s*INR",
    ]
    for pattern in amount_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            amount = float(amount_str)
            # Detect currency from symbols
            if "₹" in text or "rs" in text_lower or "inr" in text_lower:
                currency = "INR"
            elif "€" in text:
                currency = "EUR"
            elif "£" in text:
                currency = "GBP"
            elif "$" in text:
                currency = "USD"
            break
    
    # Parse tax
    tax = None
    tax_patterns = [
        r"Tax[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"GST[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"VAT[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})"
    ]
    for pattern in tax_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            tax_str = match.group(1).replace(",", "")
            tax = float(tax_str)
            break
    
    # Parse items (simple heuristic)
    items = []
    lines = text.split("\n")
    for line in lines:
        if re.search(r"\d+\s*x\s*\d+", line, re.IGNORECASE) or re.search(r"\d+\s*@\s*\d+", line, re.IGNORECASE):
            items.append(line.strip())
    
    return OCRResult(
        merchant_name=merchant_name,
        date=date,
        amount=amount,
        currency=currency,
        tax=tax,
        items=items
    )


@app.get("/dashboard/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    today_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        func.date(Expense.expense_date) == today
    ).scalar() or 0.0

    start_of_month = today.replace(day=1)
    monthly_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_of_month
    ).scalar() or 0.0

    start_of_year = today.replace(month=1, day=1)
    yearly_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_of_year
    ).scalar() or 0.0

    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id
    ).scalar() or 0.0

    total_savings = db.query(func.sum(Goal.saved_amount)).filter(
        Goal.user_id == current_user.id
    ).scalar() or 0.0

    total_transactions = db.query(func.count(Expense.id)).filter(
        Expense.user_id == current_user.id
    ).scalar() or 0

    active_goals = db.query(func.count(Goal.id)).filter(
        Goal.user_id == current_user.id,
        Goal.saved_amount < Goal.target_amount
    ).scalar() or 0

    return {
        "today_expense": today_expenses,
        "monthly_expense": monthly_expenses,
        "yearly_expense": yearly_expenses,
        "total_expenses": total_expenses,
        "total_savings": total_savings,
        "total_transactions": total_transactions,
        "active_goals": active_goals
    }


@app.get("/analytics/daily")
def get_daily_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_of_day,
        Expense.expense_date <= end_of_day
    ).all()

    total = sum(e.amount for e in expenses)
    count = len(expenses)

    category_totals = {}
    hourly_data = {h: 0 for h in range(24)}
    for e in expenses:
        category_totals[e.category] = category_totals.get(e.category, 0) + e.amount
        hour = e.expense_date.hour
        hourly_data[hour] += e.amount

    highest_category = max(category_totals.items(), key=lambda x: x[1])[0] if category_totals else None

    return {
        "total_expense": total,
        "transaction_count": count,
        "highest_category": highest_category,
        "category_distribution": category_totals,
        "hourly_trend": hourly_data
    }


@app.get("/analytics/monthly")
def get_monthly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    start_of_month = today.replace(day=1)

    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_of_month
    ).all()

    total = sum(e.amount for e in expenses)

    category_totals = {}
    weekly_data = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for e in expenses:
        category_totals[e.category] = category_totals.get(e.category, 0) + e.amount
        week = (e.expense_date.day - 1) // 7 + 1
        if week > 5:
            week = 5
        weekly_data[week] += e.amount

    return {
        "total_spending": total,
        "category_breakdown": category_totals,
        "weekly_trend": weekly_data
    }


@app.get("/analytics/yearly")
def get_yearly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    start_of_year = today.replace(month=1, day=1)

    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_of_year
    ).all()

    monthly_totals = {m: 0 for m in range(1, 13)}
    category_totals = {}
    for e in expenses:
        month = e.expense_date.month
        monthly_totals[month] += e.amount
        category_totals[e.category] = category_totals.get(e.category, 0) + e.amount

    return {
        "monthly_expenses": monthly_totals,
        "category_comparison": category_totals
    }


@app.get("/financial-health", response_model=FinancialHealthScore)
def get_financial_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    start_of_month = today.replace(day=1)
    start_of_year = today.replace(month=1, day=1)

    monthly_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_of_month
    ).scalar() or 0.0

    budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    score = 50
    strengths = []
    weaknesses = []
    recommendations = []

    if budget:
        budget_ratio = monthly_expenses / budget.monthly_budget if budget.monthly_budget > 0 else 0
        if budget_ratio <= 0.7:
            score += 20
            strengths.append("Excellent budget adherence")
        elif budget_ratio <= 0.9:
            score += 10
            strengths.append("Good budget adherence")
        else:
            weaknesses.append("Budget exceeded")
            recommendations.append("Reduce unnecessary expenses")

    if goals:
        completed_goals = sum(1 for g in goals if g.saved_amount >= g.target_amount)
        completion_rate = completed_goals / len(goals)
        if completion_rate >= 0.7:
            score += 15
            strengths.append("Great progress on savings goals")
        elif completion_rate >= 0.4:
            score += 7
        else:
            weaknesses.append("Slow progress on savings goals")
            recommendations.append("Set smaller, achievable goals")

    total_saved = sum(g.saved_amount for g in goals)
    if total_saved > 0:
        score += 15
        strengths.append("Consistent savings habit")

    score = min(100, max(0, score))

    if score < 60:
        recommendations.append("Create a detailed budget plan")
        recommendations.append("Track all expenses daily")

    return FinancialHealthScore(
        score=score,
        strengths=strengths if strengths else ["You're getting started!"],
        weaknesses=weaknesses if weaknesses else ["Keep up the good work!"],
        recommendations=recommendations if recommendations else ["Maintain your current habits"]
    )


@app.get("/ai-insights", response_model=List[AIInsight])
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    insights = []
    today = datetime.utcnow().date()

    start_this_month = today.replace(day=1)
    start_last_month = (start_this_month - timedelta(days=1)).replace(day=1)

    this_month_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_this_month
    ).scalar() or 0.0

    last_month_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_last_month,
        Expense.expense_date < start_this_month
    ).scalar() or 0.0

    if last_month_expenses > 0 and this_month_expenses > 0:
        change = ((this_month_expenses - last_month_expenses) / last_month_expenses) * 100
        if change > 20:
            insights.append(AIInsight(
                insight=f"You're spending {change:.0f}% more this month compared to last month.",
                type="warning"
            ))
        elif change < -10:
            insights.append(AIInsight(
                insight=f"Great job! You've reduced spending by {-change:.0f}% this month.",
                type="positive"
            ))

    categories = db.query(Expense.category, func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_this_month
    ).group_by(Expense.category).all()

    if categories:
        total = sum(amount for _, amount in categories)
        for category, amount in categories:
            percentage = (amount / total) * 100
            if percentage > 40:
                insights.append(AIInsight(
                    insight=f"{category} accounts for {percentage:.0f}% of your spending this month.",
                    type="info"
                ))

    budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    if budget and this_month_expenses > budget.monthly_budget * 0.8:
        if this_month_expenses >= budget.monthly_budget:
            insights.append(AIInsight(
                insight="You've exceeded your monthly budget!",
                type="alert"
            ))
        else:
            insights.append(AIInsight(
                insight="You're approaching your monthly budget limit.",
                type="warning"
            ))

    if not insights:
        insights.append(AIInsight(
            insight="Your finances look stable. Keep up the good work!",
            type="positive"
        ))

    return insights


@app.get("/reports/daily/pdf")
def get_daily_pdf_report():
    return {"message": "PDF report generation coming soon!"}


@app.get("/reports/daily/csv")
def get_daily_csv_report():
    return {"message": "CSV report generation coming soon!"}
