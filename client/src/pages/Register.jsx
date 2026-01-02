import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(firstName, lastName, email, password);
        if (res.success) {
            alert('Registration successful! Please login.');
            navigate('/login');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="text-center" style={{ marginBottom: '2.5rem', fontSize: '2.2rem' }}>
                    Create <span className="text-gold">Account</span>
                </h1>

                {error && <div className="error-banner">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="auth-form-group" style={{ marginBottom: 0 }}>
                            <label className="auth-label">First Name</label>
                            <input type="text" className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="John" />
                        </div>
                        <div className="auth-form-group" style={{ marginBottom: 0 }}>
                            <label className="auth-label">Last Name</label>
                            <input type="text" className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
                    </div>

                    <div className="auth-form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="auth-label">Password</label>
                        <input type="password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Join Now
                    </button>

                    <p className="auth-footer-text">
                        Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Sign in here</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
