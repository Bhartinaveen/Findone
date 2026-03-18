import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api';
import { User, Mail, Lock, Rocket } from 'lucide-react';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${getApiUrl()}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-up">
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 52,
                        height: 52,
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.15) 100%)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        marginBottom: '1.25rem'
                    }}>
                        <Rocket size={22} color="#34d399" />
                    </div>
                </div>

                <h2 className="auth-title">Join FindNow</h2>
                <p className="auth-subtitle">Create your free account today</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="auth-input"
                            style={{ paddingLeft: '2.75rem', marginBottom: 0 }}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            style={{ paddingLeft: '2.75rem', marginBottom: 0 }}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            style={{ paddingLeft: '2.75rem', marginBottom: 0 }}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login">Sign in →</Link>
                </p>
            </div>
        </div>
    );
}
