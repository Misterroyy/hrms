# HRMS Lite – Human Resource Management System

A lightweight, full-stack HRMS application for managing employee records and daily attendance tracking.

---

## 🚀 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | _(deploy to Vercel/Netlify – see Deployment section)_ |
| Backend  | _(deploy to Render/Railway – see Deployment section)_ |

---

## 🛠 Tech Stack

| Layer     | Technology                      |
|-----------|---------------------------------|
| Frontend  | React 19, Vite 6, React Router, Axios, Lucide-React, react-hot-toast |
| Backend   | Python 3.11+, FastAPI 0.110, Uvicorn |
| Database  | MySQL 8.x (`hrms_lite` schema)  |
| ORM/DB    | `mysql-connector-python` (raw SQL via connection pooling) |

---

## 📁 Project Structure

```
hrms/
├── backend/
│   ├── main.py            # FastAPI application entry point
│   ├── database.py        # MySQL connection pool
│   ├── models.py          # Pydantic request/response models
│   ├── routers/
│   │   ├── employees.py   # Employee CRUD API
│   │   ├── attendance.py  # Attendance API
│   │   └── dashboard.py   # Dashboard stats API
│   ├── .env               # Environment variables (not committed)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/api.js      # Axios API client
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Spinner.jsx
    │   │   └── ConfirmDialog.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   └── Attendance.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css       # Design system + global styles
    ├── .env
    └── index.html
```

---

## ⚙️ Running Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- MySQL 8.x running locally

### 1. Clone & Database Setup

```bash
git clone <repo-url>
cd hrms
```

Connect to MySQL and create the database:

```sql
CREATE DATABASE IF NOT EXISTS hrms_lite;

CREATE TABLE IF NOT EXISTS hrms_lite.employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hrms_lite.attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES hrms_lite.employees(employee_id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (employee_id, date)
);
```

### 2. Backend Setup

```bash
cd backend

# Create & configure .env
cp .env.example .env
# Edit .env with your MySQL credentials

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Configure backend URL
echo "VITE_API_URL=http://localhost:8000" > .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend: http://localhost:5173

---

## 📡 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/employees/` | List all employees (with total present/absent days) |
| POST   | `/employees/` | Add a new employee |
| GET    | `/employees/{employee_id}` | Get single employee |
| DELETE | `/employees/{employee_id}` | Delete employee (cascades attendance) |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/attendance/` | List records (filter: `?employee_id=&date=`) |
| POST   | `/attendance/` | Mark/update attendance |
| DELETE | `/attendance/{id}` | Delete a record |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/dashboard/stats` | KPI summary for today |

---

## ✨ Features

### Core
- ✅ Add / View / Delete employees
- ✅ Mark attendance (Present / Absent) per employee per day
- ✅ View all attendance records
- ✅ Server-side validation (required fields, email format, duplicate ID/email)
- ✅ Proper HTTP status codes & meaningful error messages
- ✅ Cascade delete (deleting employee removes all attendance)

### Bonus
- ✅ Filter attendance by employee and/or date
- ✅ Total present/absent days displayed per employee
- ✅ Dashboard with KPI cards, attendance snapshot, department breakdown
- ✅ Search across employee list and attendance records

### UI/UX
- ✅ Dark-mode premium design system
- ✅ Loading states for all async operations
- ✅ Empty states with clear CTAs
- ✅ Toast notifications for success/error
- ✅ Confirmation dialog before deletes
- ✅ Responsive sidebar layout

---

## ☁️ Deployment

### Backend → Render
1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables from `.env`

### Frontend → Vercel / Netlify
1. Set `VITE_API_URL` to your Render backend URL
2. Deploy from the `frontend/` directory
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## ⚠️ Assumptions & Limitations

- **Single admin, no authentication** – The system assumes a single admin user with full access
- **No leave/payroll management** – Out of scope per assignment
- **Attendance upserts** – Marking attendance for the same employee on the same date updates the existing record rather than creating a duplicate
- **UTC dates** – Dates are stored in UTC; display is localized to `en-IN`
