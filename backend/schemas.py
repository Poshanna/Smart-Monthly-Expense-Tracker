from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class ExpenseBase(BaseModel):
    amount: float
    currency: str = "INR"
    category: str
    description: str
    payment_method: str
    expense_date: datetime


class ExpenseCreate(ExpenseBase):
    pass


class Expense(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetBase(BaseModel):
    monthly_budget: float


class BudgetCreate(BudgetBase):
    pass


class Budget(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    goal_name: str
    target_amount: float
    saved_amount: float = 0.0


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    goal_name: Optional[str] = None
    target_amount: Optional[float] = None
    saved_amount: Optional[float] = None


class Goal(GoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    message: str


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class OCRResult(BaseModel):
    merchant_name: Optional[str] = None
    date: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = "INR"
    tax: Optional[float] = None
    items: Optional[List[str]] = None


class FinancialHealthScore(BaseModel):
    score: int
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]


class AIInsight(BaseModel):
    insight: str
    type: str
