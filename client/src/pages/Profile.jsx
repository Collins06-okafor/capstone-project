import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import axios from 'axios';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const [activeTab, setActiveTab] = useState('info');

    if (!user) return <div className="text-center mt-5">Please login</div>;

    return (
        <div className="fade-in max-w-lg mx-auto">
            <h1 className="text-gold text-center mb-4">My Profile</h1>

            <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%', background: 'var(--color-primary)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '2rem', fontWeight: 'bold', color: '#000'
                    }}>
                        {user.first_name[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{user.first_name} {user.last_name}</h2>
                        <p style={{ color: '#aaa', margin: 0 }}>{user.email}</p>
                        <span style={{
                            fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)',
                            padding: '2px 8px', borderRadius: '4px', marginTop: '5px', display: 'inline-block'
                        }}>
                            {user.role}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'info' ? '' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('info')}
                        style={{ flex: 1 }}
                    >
                        Account Info
                    </button>
                    <button
                        className={`btn ${activeTab === 'settings' ? '' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('settings')}
                        style={{ flex: 1 }}
                    >
                        Settings
                    </button>
                </div>

                {activeTab === 'info' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Full Name</label>
                                <div style={{ fontSize: '1.2rem' }}>{user.first_name} {user.last_name}</div>
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Email Address</label>
                                <div style={{ fontSize: '1.2rem' }}>{user.email}</div>
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Member Since</label>
                                <div style={{ fontSize: '1.2rem' }}>{new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="fade-in">
                        <p style={{ color: '#aaa', marginBottom: '1rem' }}>Security settings coming soon.</p>
                        <button onClick={logout} className="btn btn-danger" style={{ width: '100%' }}>Sign Out</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
