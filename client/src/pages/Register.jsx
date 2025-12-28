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
        <div className="auth-container fade-in-up">
            <div className="auth-card">
                <h1 className="text-center" style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Create Account</h1>
                {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '10px', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>First Name</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="John" style={{ background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Last Name</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" style={{ background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={{ background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', padding: '15px' }}>Register</button>

                    <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Already have an account? <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => navigate('/login')}>Login here</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
