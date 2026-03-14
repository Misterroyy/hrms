from fastapi import APIRouter, Depends, HTTPException, status, Query
from mysql.connector import Error as MySQLError
from datetime import date as date_type
from typing import Optional

from database import get_db
from models import AttendanceCreate, AttendanceResponse, AttendanceWithEmployee

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ── GET /attendance ──────────────────────────────────────────────────────────

@router.get("/", response_model=list[AttendanceWithEmployee])
def list_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    date: Optional[date_type] = Query(None, description="Filter by date"),
    conn=Depends(get_db)
):
    try:
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT a.*, e.full_name, e.department
            FROM attendance a
            JOIN employees e ON a.employee_id = e.employee_id
            WHERE 1=1
        """
        params = []

        if employee_id:
            query += " AND a.employee_id = %s"
            params.append(employee_id)

        if date:
            query += " AND a.date = %s"
            params.append(date)

        query += " ORDER BY a.date DESC, e.full_name ASC"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        return rows

    except MySQLError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── POST /attendance ─────────────────────────────────────────────────────────

@router.post("/", response_model=AttendanceWithEmployee, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: AttendanceCreate, conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)

        # Verify employee exists
        cursor.execute("SELECT employee_id FROM employees WHERE employee_id = %s", (attendance.employee_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail=f"Employee '{attendance.employee_id}' not found"
            )

        # Check if attendance already marked for this date
        cursor.execute(
            "SELECT id FROM attendance WHERE employee_id = %s AND date = %s",
            (attendance.employee_id, attendance.date)
        )
        existing = cursor.fetchone()

        if existing:
            # Update existing record
            cursor.execute(
                "UPDATE attendance SET status = %s WHERE employee_id = %s AND date = %s",
                (attendance.status, attendance.employee_id, attendance.date)
            )
            conn.commit()
            cursor.execute(
                """SELECT a.*, e.full_name, e.department
                   FROM attendance a JOIN employees e ON a.employee_id = e.employee_id
                   WHERE a.employee_id = %s AND a.date = %s""",
                (attendance.employee_id, attendance.date)
            )
        else:
            cursor.execute(
                "INSERT INTO attendance (employee_id, date, status) VALUES (%s, %s, %s)",
                (attendance.employee_id, attendance.date, attendance.status)
            )
            conn.commit()
            new_id = cursor.lastrowid
            cursor.execute(
                """SELECT a.*, e.full_name, e.department
                   FROM attendance a JOIN employees e ON a.employee_id = e.employee_id
                   WHERE a.id = %s""",
                (new_id,)
            )

        row = cursor.fetchone()
        cursor.close()
        return row

    except HTTPException:
        raise
    except MySQLError as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── DELETE /attendance/:id ───────────────────────────────────────────────────

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, conn=Depends(get_db)):
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM attendance WHERE id = %s", (attendance_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Attendance record not found")

        cursor.execute("DELETE FROM attendance WHERE id = %s", (attendance_id,))
        conn.commit()
        cursor.close()

    except HTTPException:
        raise
    except MySQLError as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
