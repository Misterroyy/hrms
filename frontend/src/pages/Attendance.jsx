import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAttendance, getEmployees, markAttendance, deleteAttendance } from '../api/api';
import { CalendarCheck, Plus, Trash2, Search, Filter, X, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function initForm() {
    return { employee_id: '', date: todayStr(), status: 'Present' };
}

export default function Attendance() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(initForm());
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Filters
    const [filterEmp, setFilterEmp] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Sync filter from URL params if present
        const empIdFromUrl = searchParams.get('employee_id');
        if (empIdFromUrl && empIdFromUrl !== filterEmp) {
            setFilterEmp(empIdFromUrl);
        }

        setLoading(true);
        const params = {};
        // Prioritize URL param if present, otherwise use state
        if (empIdFromUrl || filterEmp) params.employee_id = empIdFromUrl || filterEmp;
        if (filterDate) params.date = filterDate;

        Promise.all([
            getAttendance(params),
            getEmployees(),
        ])
            .then(([attRes, empRes]) => {
                setRecords(attRes.data);
                setEmployees(empRes.data);
            })
            .catch(() => toast.error('Failed to load attendance'))
            .finally(() => setLoading(false));
    }, [filterEmp, filterDate, searchParams]); // Add searchParams to dependencies

    const validate = () => {
        const errs = {};
        if (!form.employee_id) errs.employee_id = 'Please select an employee';
        if (!form.date) errs.date = 'Date is required';
        if (!form.status) errs.status = 'Status is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            await markAttendance(form);
            toast.success('Attendance marked!');
            setShowModal(false);
            setForm(initForm());
            setErrors({});
            // Re-fetch data after successful submission
            const empIdFromUrl = searchParams.get('employee_id');
            setLoading(true);
            const params = {};
            if (empIdFromUrl || filterEmp) params.employee_id = empIdFromUrl || filterEmp;
            if (filterDate) params.date = filterDate;

            Promise.all([
                getAttendance(params),
                getEmployees(),
            ])
                .then(([attRes, empRes]) => {
                    setRecords(attRes.data);
                    setEmployees(empRes.data);
                })
                .catch(() => toast.error('Failed to load attendance'))
                .finally(() => setLoading(false));
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to mark attendance');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteAttendance(deleteTarget.id);
            toast.success('Attendance record removed');
            setDeleteTarget(null);
            // Re-fetch data after successful deletion
            const empIdFromUrl = searchParams.get('employee_id');
            setLoading(true);
            const params = {};
            if (empIdFromUrl || filterEmp) params.employee_id = empIdFromUrl || filterEmp;
            if (filterDate) params.date = filterDate;

            Promise.all([
                getAttendance(params),
                getEmployees(),
            ])
                .then(([attRes, empRes]) => {
                    setRecords(attRes.data);
                    setEmployees(empRes.data);
                })
                .catch(() => toast.error('Failed to load attendance'))
                .finally(() => setLoading(false));
        } catch {
            toast.error('Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = records.filter(r =>
        r.full_name.toLowerCase().includes(search.toLowerCase()) ||
        r.employee_id.toLowerCase().includes(search.toLowerCase())
    );

    const clearFilters = () => {
        setSearchParams({}); // Clear URL parameters
        setFilterEmp('');
        setFilterDate('');
        setSearch('');
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Attendance</h2>
                    <p>{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(initForm()); setErrors({}); setShowModal(true); }}>
                    <Plus size={16} /> Mark Attendance
                </button>
            </div>

            {/* Filters */}
            <div className="toolbar">
                <div className="search-box">
                    <Search />
                    <input
                        className="form-control"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="form-control"
                    style={{ width: 'auto', minWidth: 180 }}
                    value={filterEmp}
                    onChange={e => setFilterEmp(e.target.value)}
                >
                    <option value="">All Employees</option>
                    {employees.map(e => (
                        <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
                    ))}
                </select>

                <input
                    type="date"
                    className="form-control"
                    style={{ width: 'auto' }}
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                />

                {(filterEmp || filterDate || search) && (
                    <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                        <X size={14} /> Clear
                    </button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <Spinner />
            ) : filtered.length === 0 ? (
                <div className="state-box">
                    <CalendarDays size={48} />
                    <h3 style={{ fontSize: '1rem', color: 'var(--clr-text)', marginBottom: 4 }}>
                        No attendance records
                    </h3>
                    <p>
                        {(filterEmp || filterDate || search)
                            ? 'No records match your filters.'
                            : 'Click "Mark Attendance" to get started.'}
                    </p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Employee ID</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(rec => (
                                <tr key={rec.id}>
                                    <td style={{ fontWeight: 500 }}>{rec.full_name}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)', fontSize: '.82rem' }}>
                                        {rec.employee_id}
                                    </td>
                                    <td><span className="badge badge-dept">{rec.department}</span></td>
                                    <td style={{ color: 'var(--clr-text-muted)' }}>
                                        {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${rec.status.toLowerCase()}`}>
                                            {rec.status === 'Present' ? '✓' : '✗'} {rec.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-sm btn-icon"
                                            style={{ color: 'var(--clr-danger)' }}
                                            onClick={() => setDeleteTarget(rec)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mark Attendance Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><CalendarCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Mark Attendance</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Employee <span>*</span></label>
                                    <select
                                        className="form-control"
                                        value={form.employee_id}
                                        onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                                    >
                                        <option value="">Select employee</option>
                                        {employees.map(e => (
                                            <option key={e.employee_id} value={e.employee_id}>
                                                {e.full_name} ({e.employee_id})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employee_id && <p className="form-error">{errors.employee_id}</p>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Date <span>*</span></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={form.date}
                                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                        />
                                        {errors.date && <p className="form-error">{errors.date}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Status <span>*</span></label>
                                        <select
                                            className="form-control"
                                            value={form.status}
                                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        >
                                            <option>Present</option>
                                            <option>Absent</option>
                                        </select>
                                        {errors.status && <p className="form-error">{errors.status}</p>}
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--clr-primary-bg)', border: '1px solid rgba(99,102,241,.2)',
                                    borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '.8rem',
                                    color: 'var(--clr-primary-h)', marginTop: 4
                                }}>
                                    ℹ️ If attendance already exists for the selected date, it will be updated.
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <span className="spinner-sm" /> : <CalendarCheck size={16} />}
                                    Mark Attendance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Attendance Record"
                    message={`Remove attendance for ${deleteTarget.full_name} on ${deleteTarget.date}?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
}
