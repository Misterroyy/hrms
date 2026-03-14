import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, createEmployee, deleteEmployee } from '../api/api';
import { Users, Plus, Trash2, Search, UserPlus, X, History } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

const DEPARTMENTS = [
    'Engineering', 'Product', 'Design', 'Marketing',
    'Sales', 'Finance', 'HR', 'Operations', 'Legal', 'Support'
];

function initForm() {
    return { employee_id: '', full_name: '', email: '', department: '' };
}

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(initForm());
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = () => {
        setLoading(true);
        getEmployees()
            .then(r => setEmployees(r.data))
            .catch(() => toast.error('Failed to load employees'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required';
        if (!form.full_name.trim()) errs.full_name = 'Full name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
        if (!form.department) errs.department = 'Department is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            await createEmployee(form);
            toast.success('Employee added successfully!');
            setShowModal(false);
            setForm(initForm());
            setErrors({});
            load();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to add employee';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteEmployee(deleteTarget.employee_id);
            toast.success(`${deleteTarget.full_name} removed`);
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = employees.filter(e =>
        e.full_name.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    const initials = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Employees</h2>
                    <p>{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(initForm()); setErrors({}); setShowModal(true); }}>
                    <Plus size={16} /> Add Employee
                </button>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-box">
                    <Search />
                    <input
                        className="form-control"
                        placeholder="Search by name, ID, department..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <Spinner />
            ) : filtered.length === 0 ? (
                <div className="state-box">
                    <Users size={48} />
                    <h3 style={{ fontSize: '1rem', color: 'var(--clr-text)', marginBottom: 4 }}>
                        {search ? 'No results found' : 'No employees yet'}
                    </h3>
                    <p>
                        {search ? 'Try a different search term' : 'Click "Add Employee" to get started'}
                    </p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Employee ID</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Present Days</th>
                                <th>Absent Days</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(emp => (
                                <tr key={emp.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="avatar">{initials(emp.full_name)}</div>
                                            <span style={{ fontWeight: 500 }}>{emp.full_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--clr-text-muted)', fontSize: '.82rem' }}>
                                        {emp.employee_id}
                                    </td>
                                    <td style={{ color: 'var(--clr-text-muted)' }}>{emp.email}</td>
                                    <td><span className="badge badge-dept">{emp.department}</span></td>
                                    <td>
                                        <span style={{ color: 'var(--clr-success)', fontWeight: 600 }}>{emp.total_present}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--clr-danger)', fontWeight: 600 }}>{emp.total_absent}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <Link
                                                to={`/attendance?employee_id=${emp.employee_id}`}
                                                className="btn btn-ghost btn-sm btn-icon"
                                                title="View Attendance History"
                                            >
                                                <History size={16} color="var(--clr-primary)" />
                                            </Link>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon"
                                                style={{ color: 'var(--clr-danger)' }}
                                                onClick={() => setDeleteTarget(emp)}
                                                title="Delete employee"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Employee Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><UserPlus size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Add Employee</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Employee ID <span>*</span></label>
                                        <input
                                            className="form-control"
                                            placeholder="e.g. EMP-001"
                                            value={form.employee_id}
                                            onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                                        />
                                        {errors.employee_id && <p className="form-error">{errors.employee_id}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Full Name <span>*</span></label>
                                        <input
                                            className="form-control"
                                            placeholder="John Doe"
                                            value={form.full_name}
                                            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        />
                                        {errors.full_name && <p className="form-error">{errors.full_name}</p>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address <span>*</span></label>
                                    <input
                                        className="form-control"
                                        type="email"
                                        placeholder="john@company.com"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    />
                                    {errors.email && <p className="form-error">{errors.email}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department <span>*</span></label>
                                    <select
                                        className="form-control"
                                        value={form.department}
                                        onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                                    >
                                        <option value="">Select department</option>
                                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                    {errors.department && <p className="form-error">{errors.department}</p>}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <span className="spinner-sm" /> : <Plus size={16} />}
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Employee"
                    message={`Are you sure you want to delete ${deleteTarget.full_name}? This will also remove all their attendance records.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
}
