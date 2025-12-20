import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Heart } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                try {
                    const res = await fetch('http://localhost:5000/api/notifications', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (res.ok) setNotifications(await res.json());
                } catch (e) { console.error(e); }
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const markRead = async (id) => {
        await fetch(`http://localhost:5000/api/notifications/read/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>FindNow AI</Link>

            <div style={styles.links}>
                {user ? (
                    <>
                        <Link to="/wishlist" style={styles.iconBtn} title="My Wishlist">
                            <Heart size={20} />
                        </Link>

                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNotifs(!showNotifs)} style={styles.iconBtn} title="Notifications">
                                <Bell size={20} />
                                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
                            </button>

                            {showNotifs && (
                                <div style={styles.dropdown}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Notifications</h4>
                                    {notifications.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No new alerts</p> : (
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {notifications.map(n => (
                                                <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '0.5rem', borderBottom: '1px solid #334155', opacity: n.is_read ? 0.5 : 1, cursor: 'pointer' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <span style={styles.user}>Hello, {user.fullName || 'User'}</span>
                        <button onClick={logout} style={styles.btn}>
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={{ ...styles.link, ...styles.primary }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#0f172a', borderBottom: '1px solid #1e293b' },
    logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa', textDecoration: 'none' },
    links: { display: 'flex', gap: '1rem', alignItems: 'center' },
    link: { color: '#94a3b8', textDecoration: 'none', fontWeight: '500' },
    user: { color: 'white', marginRight: '1rem' },
    btn: { background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    primary: { background: '#2563eb', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.4rem' },
    iconBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'relative', padding: '0.5rem' },
    badge: { position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: '0.6rem', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    dropdown: { position: 'absolute', top: '100%', right: 0, width: '250px', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1rem', zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }
};
