import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="auth-container fade-in-up">
            <div className="auth-card">
                <h1 className="text-center" style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Welcome Back</h1>
                {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '10px', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', padding: '15px' }}>Sign In</button>

                    <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Don't have an account? <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => navigate('/register')}>Register here</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
