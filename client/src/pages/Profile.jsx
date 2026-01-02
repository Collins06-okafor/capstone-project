import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const [activeTab, setActiveTab] = useState('info');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Profile Sync: Token present?', !!token);
                if (token) {
                    const fetchUrl = `${API_URL || ''}/api/auth/me`;
                    console.log('Profile Sync: Fetching from:', fetchUrl);
                    const res = await axios.get(fetchUrl, {
                        headers: { 'x-auth-token': token }
                    });
                    console.log('Profile Sync: Success. Data received:', res.data);
                    setProfileData(res.data);
                } else {
                    console.warn('Profile Sync: No token found in localStorage');
                }
            } catch (err) {
                console.error('Profile Sync: Error:', err);
                setError(err.response?.data?.msg || err.message || 'Verification failed');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
        else {
            console.log('Profile Sync: No user in context, checking localStorage backup');
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                console.log('Profile Sync: Found backup user in localStorage');
                fetchProfile();
            } else {
                setLoading(false);
            }
        }
    }, [user]);

    if (loading) return <div className="loading-spinner"></div>;

    const displayUser = profileData || user;

    if (!displayUser) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2 className="text-gold">Authentication Required</h2>
            <p className="text-muted">Please sign in to access your profile dashboard.</p>
            <button className="btn mt-2" onClick={() => window.location.href = '/login'}>Login</button>
        </div>
    );

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 className="text-center" style={{ marginBottom: '3rem', fontSize: '2.5rem' }}>
                My <span className="text-gold">Profile</span>
            </h1>

            {error && <div className="error-banner" style={{ maxWidth: '680px', margin: '0 auto 1.5rem' }}>
                Server Sync Error: {error}. showing offline data.
            </div>}

            <div className="glass-card" style={{ maxWidth: '680px', margin: '0 auto', padding: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '3rem' }}>
                    <div className="nav-profile-avatar" style={{ width: '90px', height: '90px', fontSize: '2.5rem' }}>
                        {displayUser.first_name ? displayUser.first_name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{displayUser.first_name} {displayUser.last_name}</h2>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                background: 'rgba(245, 197, 24, 0.1)',
                                color: 'var(--color-primary)',
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {displayUser.role || 'Member'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', color: activeTab === 'info' ? 'var(--color-primary)' : 'inherit', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                    >
                        Account Info
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', color: activeTab === 'settings' ? 'var(--color-primary)' : 'inherit', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                    >
                        Settings
                    </button>
                </div>

                {activeTab === 'info' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div className="auth-form-group">
                                <label className="auth-label">Full Name</label>
                                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500' }}>{displayUser.first_name} {displayUser.last_name}</div>
                            </div>
                            <div className="auth-form-group">
                                <label className="auth-label">Email Address</label>
                                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500' }}>{displayUser.email || <span style={{ color: '#ff4444' }}>Email missing (Debug: {Object.keys(displayUser).join(',')})</span>}</div>
                            </div>
                            <div className="auth-form-group">
                                <label className="auth-label">Member Since</label>
                                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '500' }}>{displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                            </div>
                            <div className="auth-form-group">
                                <label className="auth-label">Account Security</label>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Verified Member</div>
                            </div>
                        </div>

                        {!displayUser.email && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
                                <p className="text-gold">Diagnostic Info:</p>
                                <code>{JSON.stringify(displayUser)}</code>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="fade-in">
                        <p className="text-muted" style={{ marginBottom: '2rem' }}>Update your security preferences and notifications.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-secondary" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Change Password (Coming Soon)</button>
                            <button onClick={logout} className="btn-signout" style={{ width: '100%', marginTop: '1rem' }}>Terminate Session</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
