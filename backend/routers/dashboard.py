from fastapi import APIRouter, Depends, HTTPException
from mysql.connector import Error as MySQLError
from datetime import date

from database import get_db
from models import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)
        today = date.today()

        # Total employees
        cursor.execute("SELECT COUNT(*) AS total FROM employees")
        total_employees = cursor.fetchone()["total"]

        # Today's attendance
        cursor.execute(
            "SELECT status, COUNT(*) AS count FROM attendance WHERE date = %s GROUP BY status",
            (today,)
        )
        attendance_today = {row["status"]: row["count"] for row in cursor.fetchall()}

        # Department breakdown
        cursor.execute("""
            SELECT department, COUNT(*) AS count
            FROM employees
            GROUP BY department
            ORDER BY count DESC
        """)
        departments = cursor.fetchall()

        # Recent Activity (Last 5 attendance marks)
        cursor.execute("""
            SELECT a.id, e.full_name, a.date, a.status, a.updated_at
            FROM attendance a
            JOIN employees e ON a.employee_id = e.employee_id
            ORDER BY a.updated_at DESC
            LIMIT 5
        """)
        recent_activity = cursor.fetchall()

        cursor.close()

        return {
            "total_employees": total_employees,
            "total_present_today": attendance_today.get("Present", 0),
            "total_absent_today": attendance_today.get("Absent", 0),
            "departments": departments,
            "recent_activity": recent_activity
        }

    except MySQLError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
