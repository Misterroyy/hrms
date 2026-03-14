import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getDashboardStats } from '../api/api';
import {
    LayoutDashboard, Users, CalendarCheck, ChevronRight,
    Building2, ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
];

export default function Sidebar() {
    const [count, setCount] = useState(null);

    useEffect(() => {
        getDashboardStats().then(r => setCount(r.data.total_employees)).catch(() => { });
    }, []);

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-mark">
                    <div className="logo-icon">
                        <Building2 />
                    </div>
                    <div className="logo-text">
                        <h1>HRMS Lite</h1>
                        <span>Admin Panel</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section-title">Main Menu</div>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        <Icon className="nav-icon" />
                        <span>{label}</span>
                        {label === 'Employees' && count !== null && (
                            <span className="nav-badge">{count}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} />
                    <span>v1.0.0 · Admin</span>
                </div>
            </div>
        </aside>
    );
}
