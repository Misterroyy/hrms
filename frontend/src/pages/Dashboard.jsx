import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/api';
import {
    Users, CheckCircle2, XCircle, Building2,
    TrendingUp, CalendarDays
} from 'lucide-react';
import Spinner from '../components/Spinner';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDashboardStats()
            .then(r => setStats(r.data))
            .catch(e => setError(e.response?.data?.detail || 'Failed to load stats'))
            .finally(() => setLoading(false));
    }, []);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const maxDept = stats?.departments?.[0]?.count || 1;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Dashboard</h2>
                    <p>{today}</p>
                </div>
            </div>

            {loading && <Spinner />}
            {error && (
                <div className="state-box">
                    <XCircle size={40} />
                    <h3 style={{ fontSize: '1rem', marginBottom: 4, color: 'var(--clr-text)' }}>Unable to load</h3>
                    <p>{error}</p>
                </div>
            )}

            {stats && (
                <>
                    {/* KPI Cards */}
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-icon indigo"><Users /></div>
                            <div className="stat-body">
                                <div className="stat-label">Total Employees</div>
                                <div className="stat-value">{stats.total_employees}</div>
                                <div className="stat-sub">in the system</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green"><CheckCircle2 /></div>
                            <div className="stat-body">
                                <div className="stat-label">Present Today</div>
                                <div className="stat-value" style={{ color: 'var(--clr-success)' }}>
                                    {stats.total_present_today}
                                </div>
                                <div className="stat-sub">marked present</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon red"><XCircle /></div>
                            <div className="stat-body">
                                <div className="stat-label">Absent Today</div>
                                <div className="stat-value" style={{ color: 'var(--clr-danger)' }}>
                                    {stats.total_absent_today}
                                </div>
                                <div className="stat-sub">marked absent</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon amber"><Building2 /></div>
                            <div className="stat-body">
                                <div className="stat-label">Departments</div>
                                <div className="stat-value" style={{ color: 'var(--clr-warning)' }}>
                                    {stats.departments.length}
                                </div>
                                <div className="stat-sub">active departments</div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Summary & Dept Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flexWrap: 'wrap' }}>
                        {/* Today's Attendance Snapshot */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                <CalendarDays size={18} color="var(--clr-primary)" />
                                <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Today's Attendance</h3>
                            </div>
                            {stats.total_present_today + stats.total_absent_today === 0 ? (
                                <div style={{ color: 'var(--clr-text-faint)', fontSize: '.85rem', textAlign: 'center', padding: '20px 0' }}>
                                    No attendance marked today
                                </div>
                            ) : (
                                <>
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 5 }}>
                                            <span style={{ color: 'var(--clr-success)', fontWeight: 600 }}>Present</span>
                                            <span style={{ color: 'var(--clr-text-muted)' }}>{stats.total_present_today}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-bar-fill fill-green"
                                                style={{ width: `${(stats.total_present_today / (stats.total_present_today + stats.total_absent_today)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 5 }}>
                                            <span style={{ color: 'var(--clr-danger)', fontWeight: 600 }}>Absent</span>
                                            <span style={{ color: 'var(--clr-text-muted)' }}>{stats.total_absent_today}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-bar-fill fill-red"
                                                style={{ width: `${(stats.total_absent_today / (stats.total_present_today + stats.total_absent_today)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Department Breakdown */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                <TrendingUp size={18} color="var(--clr-primary)" />
                                <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Department Breakdown</h3>
                            </div>
                            {stats.departments.length === 0 ? (
                                <div style={{ color: 'var(--clr-text-faint)', fontSize: '.85rem', textAlign: 'center', padding: '20px 0' }}>
                                    No departments yet
                                </div>
                            ) : (
                                <div className="dept-list">
                                    {stats.departments.map((dept, i) => (
                                        <div key={i} className="dept-item">
                                            <div className="dept-row">
                                                <span className="dept-name">{dept.department}</span>
                                                <span className="dept-count">{dept.count} emp.</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-bar-fill fill-indigo"
                                                    style={{ width: `${(dept.count / maxDept) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
