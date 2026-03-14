from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal
from datetime import date, datetime


# ── Employee Models ──────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty")
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Department cannot be empty")
        return v


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime
    updated_at: datetime


class EmployeeWithStats(EmployeeResponse):
    total_present: int = 0
    total_absent: int = 0


# ── Attendance Models ─────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: Literal["Present", "Absent"]

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        return v


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str
    created_at: datetime
    updated_at: datetime


class AttendanceWithEmployee(AttendanceResponse):
    full_name: str
    department: str


# ── Dashboard Model ───────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    departments: list[dict]
    recent_activity: list[dict]
