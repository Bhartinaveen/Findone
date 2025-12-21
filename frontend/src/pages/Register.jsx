import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api';

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
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Join the Future</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: '#60a5fa' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' },
    card: { background: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '350px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' },
    input: { width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '0.5rem', background: '#334155', border: '1px solid #475569', color: 'white' },
    button: { width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    error: { background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }
};
