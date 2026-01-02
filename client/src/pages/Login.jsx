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
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="text-center" style={{ marginBottom: '2.5rem', fontSize: '2.2rem' }}>
                    Welcome <span className="text-gold">Back</span>
                </h1>

                {error && <div className="error-banner">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="auth-form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Sign In
                    </button>

                    <p className="auth-footer-text">
                        Don't have an account? <span className="auth-link" onClick={() => navigate('/register')}>Join the club</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
