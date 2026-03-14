from fastapi import APIRouter, Depends, HTTPException, status
from mysql.connector import Error as MySQLError
import mysql.connector

from database import get_db
from models import EmployeeCreate, EmployeeResponse, EmployeeWithStats

router = APIRouter(prefix="/employees", tags=["Employees"])


def row_to_employee(row: dict) -> dict:
    return {
        "id": row["id"],
        "employee_id": row["employee_id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "department": row["department"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


# ── GET /employees ──────────────────────────────────────────────────────────

@router.get("/", response_model=list[EmployeeWithStats])
def list_employees(conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                e.*,
                COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) AS total_present,
                COALESCE(SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END), 0) AS total_absent
            FROM employees e
            LEFT JOIN attendance a ON e.employee_id = a.employee_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        return rows
    except MySQLError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── POST /employees ──────────────────────────────────────────────────────────

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)

        # Check duplicate employee_id
        cursor.execute("SELECT id FROM employees WHERE employee_id = %s", (employee.employee_id,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with ID '{employee.employee_id}' already exists"
            )

        # Check duplicate email
        cursor.execute("SELECT id FROM employees WHERE email = %s", (employee.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with email '{employee.email}' already exists"
            )

        cursor.execute(
            """INSERT INTO employees (employee_id, full_name, email, department)
               VALUES (%s, %s, %s, %s)""",
            (employee.employee_id, employee.full_name, employee.email, employee.department)
        )
        conn.commit()
        new_id = cursor.lastrowid

        cursor.execute("SELECT * FROM employees WHERE id = %s", (new_id,))
        row = cursor.fetchone()
        cursor.close()
        return row

    except HTTPException:
        raise
    except MySQLError as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── GET /employees/:id ──────────────────────────────────────────────────────

@router.get("/{employee_id}", response_model=EmployeeWithStats)
def get_employee(employee_id: str, conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                e.*,
                COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) AS total_present,
                COALESCE(SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END), 0) AS total_absent
            FROM employees e
            LEFT JOIN attendance a ON e.employee_id = a.employee_id
            WHERE e.employee_id = %s
            GROUP BY e.id
        """, (employee_id,))
        row = cursor.fetchone()
        cursor.close()
        if not row:
            raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")
        return row
    except HTTPException:
        raise
    except MySQLError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── DELETE /employees/:id ────────────────────────────────────────────────────

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM employees WHERE employee_id = %s", (employee_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")

        cursor.execute("DELETE FROM employees WHERE employee_id = %s", (employee_id,))
        conn.commit()
        cursor.close()
    except HTTPException:
        raise
    except MySQLError as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
