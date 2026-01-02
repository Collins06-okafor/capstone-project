import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [formData, setFormData] = useState({
        title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: '', end_date: ''
    });
    const [editingId, setEditingId] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchMovies = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/movies`);
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const [stats, setStats] = useState({ users: 0, movies: 0, bookings: 0, revenue: 0, movieStats: [], dailyStats: [] });
    const [activeAdminTab, setActiveAdminTab] = useState('movies');
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        fetchMovies();
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeAdminTab === 'users') {
            const fetchUsers = async () => {
                const token = localStorage.getItem('token');
                try {
                    const res = await axios.get(`${API_URL}/api/admin/users`, { headers: { 'x-auth-token': token } });
                    setUsersList(res.data);
                } catch (err) { console.error(err); }
            };
            fetchUsers();
        }
    }, [activeAdminTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/stats`, { headers: { 'x-auth-token': token } });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        try {
            if (editingId) {
                await axios.put(`${API_URL}/api/movies/${editingId}`, formData, config);
                alert('Movie Updated');
            } else {
                await axios.post(`${API_URL}/api/movies`, formData, config);
                alert('Movie Created');
            }
            setFormData({ title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: '', end_date: '' });
            setEditingId(null);
            fetchMovies();
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        }
    };

    const handleEdit = (movie) => {
        setFormData({
            title: movie.title,
            genre: movie.genre || '',
            description: movie.description || '',
            duration_min: movie.duration || movie.duration_min || '',
            poster_url: movie.poster_url || '',
            poster_url: movie.poster_url || '',
            release_date: movie.release_date ? movie.release_date.substring(0, 10) : '',
            end_date: movie.end_date ? movie.end_date.substring(0, 10) : ''
        });
        setEditingId(movie.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/api/movies/${id}`, { headers: { 'x-auth-token': token } });
            fetchMovies();
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        }
    };

    const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
    const [selectedMovieForShowtime, setSelectedMovieForShowtime] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [showtimeForm, setShowtimeForm] = useState({ start_date: '', end_date: '', time: '', price: '' });

    const openShowtimeManager = async (movie) => {
        setSelectedMovieForShowtime(movie);
        setShowtimeModalOpen(true);
        fetchShowtimes(movie.id);
    };

    const fetchShowtimes = async (movieId) => {
        try {
            const res = await axios.get(`${API_URL}/api/movies/${movieId}/showtimes`);
            setShowtimes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShowtimeSubmit = async (e) => {
        e.preventDefault();
        const now = new Date();
        const start = new Date(`${showtimeForm.start_date}T${showtimeForm.time}`);
        if (start < now) {
            alert('Cannot add a showtime in the past!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/showtimes`,
                {
                    movie_id: selectedMovieForShowtime.id,
                    start_date: showtimeForm.start_date,
                    end_date: showtimeForm.end_date,
                    show_time: showtimeForm.time,
                    price: showtimeForm.price
                },
                { headers: { 'x-auth-token': token } }
            );
            alert('Showtime Added');
            setShowtimeForm({ start_date: '', end_date: '', time: '', price: '' });
            fetchShowtimes(selectedMovieForShowtime.id); // Refresh
        } catch (err) {
            console.error(err);
            alert('Failed to add showtime');
        }
    };

    return (
        <div className="fade-in-up container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 className="text-gold" style={{ margin: 0 }}>Command Center</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Manage movies, users, and platform analytics</p>
                </div>
                <div style={{ padding: '10px 20px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 10, height: 10, background: '#2ecc71', borderRadius: '50%', boxShadow: '0 0 10px #2ecc71' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Admin: {user?.first_name}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <div className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>💰</div>
                    <p style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Revenue</p>
                    <h3 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gold">${stats.revenue?.toLocaleString()}</h3>
                </div>
                <div className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>🎟️</div>
                    <p style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Bookings</p>
                    <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{stats.bookings?.toLocaleString()}</h3>
                </div>
                <div className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>👥</div>
                    <p style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.5rem' }}>Users</p>
                    <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{stats.users?.toLocaleString()}</h3>
                </div>
                <div className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>🎬</div>
                    <p style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.5rem' }}>Live Movies</p>
                    <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{stats.movies?.toLocaleString()}</h3>
                </div>
            </div>

            {/* Modern Tabs */}
            <div style={{
                marginBottom: '3rem',
                display: 'flex',
                gap: '10px',
                background: 'var(--glass-bg)',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                width: 'fit-content',
                border: '1px solid var(--glass-border)'
            }}>
                {['movies', 'users', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveAdminTab(tab)}
                        className={`btn ${activeAdminTab === tab ? '' : 'btn-secondary'}`}
                        style={{
                            padding: '10px 25px',
                            fontSize: '0.9rem',
                            borderRadius: 'calc(var(--radius-md) - 4px)',
                            border: 'none',
                            background: activeAdminTab === tab ? 'var(--color-primary)' : 'transparent',
                            color: activeAdminTab === tab ? '#000' : 'var(--color-text-dim)'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeAdminTab === 'users' ? (
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <h3 style={{ margin: 0 }}>User Management</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>User</th>
                                    <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Email</th>
                                    <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Role</th>
                                    <th style={{ padding: '1.2rem 2rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map(u => (
                                    <tr key={u.id} style={{ transition: 'var(--transition-smooth)' }} className="table-row-hover">
                                        <td style={{ padding: '1.2rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
                                                    {u.first_name?.[0]}{u.last_name?.[0]}
                                                </div>
                                                <span style={{ fontWeight: '600' }}>{u.first_name} {u.last_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 2rem', color: 'var(--color-text-dim)' }}>{u.email}</td>
                                        <td style={{ padding: '1.2rem 2rem' }}>
                                            <span style={{
                                                background: u.role === 'admin' ? 'var(--color-primary)' : 'var(--glass-bg)',
                                                color: u.role === 'admin' ? '#000' : 'var(--color-text-dim)',
                                                padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 'bold',
                                                border: '1px solid', borderColor: u.role === 'admin' ? 'var(--color-primary)' : 'var(--glass-border)'
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                                            {u.role !== 'admin' && u.role !== 'super_admin' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm('Delete this user permanently?')) return;
                                                        const token = localStorage.getItem('token');
                                                        try {
                                                            await axios.delete(`${API_URL}/api/admin/users/${u.id}`, { headers: { 'x-auth-token': token } });
                                                            const res = await axios.get(`${API_URL}/api/admin/users`, { headers: { 'x-auth-token': token } });
                                                            setUsersList(res.data);
                                                            fetchStats();
                                                        } catch (e) { console.error(e); }
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '8px 16px', fontSize: '0.75rem', borderColor: 'rgba(231, 76, 60, 0.3)', color: '#e74c3c' }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeAdminTab === 'analytics' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem' }}>
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0 }}>Movie Performance</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Title</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Bookings</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.movieStats?.map((stat, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1.2rem 2rem', fontWeight: 'bold' }}>{stat.title}</td>
                                            <td style={{ padding: '1.2rem 2rem', textAlign: 'center' }}>{stat.total_bookings}</td>
                                            <td style={{ padding: '1.2rem 2rem', textAlign: 'right', color: 'var(--color-primary)', fontWeight: 'bold' }}>${parseFloat(stat.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0 }}>Daily Trends</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Date</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Bookings</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.dailyStats?.map((stat, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1.2rem 2rem', color: 'var(--color-text-dim)' }}>{new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td style={{ padding: '1.2rem 2rem', textAlign: 'center' }}>{stat.total_bookings}</td>
                                            <td style={{ padding: '1.2rem 2rem', textAlign: 'right', color: 'var(--color-primary)', fontWeight: 'bold' }}>${parseFloat(stat.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
                    <div className="glass-card" style={{ position: 'sticky', top: '120px' }}>
                        <h3 className="text-gold" style={{ marginBottom: '2rem' }}>{editingId ? 'Update Masterpiece' : 'Add New Feature'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="admin-form">
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Movie Title</label>
                                <input name="title" placeholder="e.g. Inception" value={formData.title} onChange={handleChange} required
                                    style={{ width: '100%', padding: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Genre</label>
                                    <select name="genre" value={formData.genre} onChange={handleChange} required
                                        style={{ width: '100%', padding: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }}>
                                        <option value="" disabled>Select</option>
                                        {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation'].map(g => (
                                            <option key={g} value={g} style={{ color: '#000' }}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Duration (min)</label>
                                    <input name="duration_min" type="number" placeholder="120" value={formData.duration_min} onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Description</label>
                                <textarea name="description" placeholder="A brief odyssey..." value={formData.description} onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px', minHeight: '120px', resize: 'vertical' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Poster Image</label>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '5px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="file"
                                            id="image-file"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formDataObj = new FormData();
                                                formDataObj.append('image', file);
                                                try {
                                                    const res = await axios.post(`${API_URL}/api/upload`, formDataObj, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    });
                                                    setFormData(prev => ({ ...prev, poster_url: res.data }));
                                                } catch (err) { alert('Upload failed'); }
                                            }}
                                        />
                                        <label htmlFor="image-file" className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                            Choose File
                                        </label>
                                    </div>
                                    {formData.poster_url && (
                                        <img
                                            src={formData.poster_url.startsWith('http') ? formData.poster_url : `${API_URL}${formData.poster_url}`}
                                            alt="Preview"
                                            style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border-bright)' }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn" style={{ flex: 2 }}>{editingId ? 'Update Movie' : 'Save Movie'}</button>
                                {editingId && (
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                                        onClick={() => { setEditingId(null); setFormData({ title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: '', end_date: '' }); }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0 }}>Active Movie Library</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Film</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Genre</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movies.map(m => (
                                        <tr key={m.id} style={{ transition: 'var(--transition-smooth)' }} className="table-row-hover">
                                            <td style={{ padding: '1.2rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <img
                                                        src={m.poster_url?.startsWith('http') ? m.poster_url : `${API_URL}${m.poster_url}`}
                                                        alt={m.title}
                                                        style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                    <span style={{ fontWeight: 'bold' }}>{m.title}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 2rem' }}>
                                                <span style={{ opacity: 0.7 }}>{m.genre}</span>
                                            </td>
                                            <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => openShowtimeManager(m)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary-glow)' }}>Schedule</button>
                                                    <button onClick={() => handleEdit(m)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Edit</button>
                                                    <button onClick={() => handleDelete(m.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ff3d71', borderColor: 'rgba(255,61,113,0.2)' }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Showtime Modal Redesign */}
            {showtimeModalOpen && selectedMovieForShowtime && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Manage Showtimes</h3>
                                <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 'bold', margin: '5px 0 0' }}>{selectedMovieForShowtime.title}</p>
                            </div>
                            <button onClick={() => setShowtimeModalOpen(false)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                        </div>

                        <div style={{ overflowY: 'auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '3rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Create Bulk Schedule</h4>
                                <form onSubmit={handleShowtimeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>START DATE</label>
                                            <input type="date" required min={new Date().toISOString().split('T')[0]} value={showtimeForm.start_date} onChange={e => setShowtimeForm({ ...showtimeForm, start_date: e.target.value })}
                                                style={{ width: '100%', padding: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>END DATE</label>
                                            <input type="date" required min={showtimeForm.start_date || new Date().toISOString().split('T')[0]} value={showtimeForm.end_date} onChange={e => setShowtimeForm({ ...showtimeForm, end_date: e.target.value })}
                                                style={{ width: '100%', padding: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>TIME</label>
                                            <input type="time" required value={showtimeForm.time} onChange={e => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                                                style={{ width: '100%', padding: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>PRICE ($)</label>
                                            <input type="number" step="0.01" required value={showtimeForm.price} onChange={e => setShowtimeForm({ ...showtimeForm, price: e.target.value })}
                                                style={{ width: '100%', padding: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: 'var(--radius-sm)', marginTop: '5px' }} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn" style={{ marginTop: '10px' }}>Generate Schedule</button>
                                </form>
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(245, 197, 24, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 197, 24, 0.1)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', margin: 0, lineHeight: '1.6' }}>
                                        <strong>Pro Tip:</strong> Setting a date range will create a showtime for every day in that interval at the specified time.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Scheduled Sessions</h4>
                                {showtimes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
                                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No sessions found for this title.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                                        {showtimes.map(st => (
                                            <div key={st.id} style={{
                                                padding: '12px',
                                                background: 'var(--glass-bg)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '5px'
                                            }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                                                    {new Date(st.show_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{st.show_time.substring(0, 5)}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>${st.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
