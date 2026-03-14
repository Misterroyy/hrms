from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import employees, attendance, dashboard

app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System - Lite Edition",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – allow the React dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "HRMS Lite API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
