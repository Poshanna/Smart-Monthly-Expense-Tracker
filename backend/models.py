from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="owner", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="owner", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="owner", cascade="all, delete-orphan")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    currency = Column(String, default="INR")
    category = Column(String, index=True)
    description = Column(Text)
    payment_method = Column(String)
    expense_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    monthly_budget = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="budgets")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal_name = Column(String)
    target_amount = Column(Float)
    saved_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="goals")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="notifications")
