import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Employees ─────────────────────────────────────────────────────────────

export const getEmployees = () => api.get('/employees/');

export const createEmployee = (data) => api.post('/employees/', data);

export const deleteEmployee = (employeeId) => api.delete(`/employees/${employeeId}`);

export const getEmployee = (employeeId) => api.get(`/employees/${employeeId}`);

// ── Attendance ────────────────────────────────────────────────────────────

export const getAttendance = (params = {}) => api.get('/attendance/', { params });

export const markAttendance = (data) => api.post('/attendance/', data);

export const deleteAttendance = (attendanceId) => api.delete(`/attendance/${attendanceId}`);

// ── Dashboard ─────────────────────────────────────────────────────────────

export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
