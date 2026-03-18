import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api';
import { LogOut, Bell, Heart, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                try {
                    const res = await fetch(`${getApiUrl()}/notifications`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (res.ok) setNotifications(await res.json());
                } catch (e) { console.error(e); }
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markRead = async (id) => {
        await fetch(`${getApiUrl()}/notifications/read/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <Sparkles size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                FindNow AI
            </Link>

            <div className="navbar-links">
                {user ? (
                    <>
                        <button onClick={toggleTheme} className="navbar-icon-btn" title="Toggle Theme" style={{ marginRight: '4px' }}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/wishlist" className="navbar-icon-btn" title="My Wishlist">
                            <Heart size={18} />
                        </Link>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                className="navbar-icon-btn"
                                title="Notifications"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="navbar-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showNotifs && (
                                <div className="navbar-dropdown">
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700 }}>
                                        Notifications
                                    </h4>
                                    {notifications.length === 0 ? (
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                                            No new alerts
                                        </p>
                                    ) : (
                                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markRead(n.id)}
                                                    style={{
                                                        padding: '0.6rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.08)',
                                                        border: '1px solid var(--border)',
                                                        opacity: n.is_read ? 0.5 : 1,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.4 }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <span className="navbar-user-name">Hi, {user.fullName?.split(' ')[0] || 'User'} 👋</span>

                        <button onClick={logout} className="navbar-logout-btn">
                            <LogOut size={15} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={toggleTheme} className="navbar-icon-btn" title="Toggle Theme" style={{ marginRight: '8px' }}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="navbar-btn-primary">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
