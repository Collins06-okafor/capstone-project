import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [formData, setFormData] = useState({
        title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: ''
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
            const res = await axios.get('http://localhost:5000/api/movies');
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const [stats, setStats] = useState({ users: 0, movies: 0, bookings: 0, revenue: 0 });
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
                    const res = await axios.get('http://localhost:5000/api/admin/users', { headers: { 'x-auth-token': token } });
                    setUsersList(res.data);
                } catch (err) { console.error(err); }
            };
            fetchUsers();
        }
    }, [activeAdminTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/stats', { headers: { 'x-auth-token': token } });
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
                await axios.put(`http://localhost:5000/api/movies/${editingId}`, formData, config);
                alert('Movie Updated');
            } else {
                await axios.post('http://localhost:5000/api/movies', formData, config);
                alert('Movie Created');
            }
            setFormData({ title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: '' });
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
            release_date: movie.release_date ? movie.release_date.substring(0, 10) : ''
        });
        setEditingId(movie.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/movies/${id}`, { headers: { 'x-auth-token': token } });
            fetchMovies();
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        }
    };

    const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
    const [selectedMovieForShowtime, setSelectedMovieForShowtime] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [showtimeForm, setShowtimeForm] = useState({ date: '', time: '', price: '' });

    const openShowtimeManager = async (movie) => {
        setSelectedMovieForShowtime(movie);
        setShowtimeModalOpen(true);
        fetchShowtimes(movie.id);
    };

    const fetchShowtimes = async (movieId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/movies/${movieId}/showtimes`);
            setShowtimes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShowtimeSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/showtimes',
                {
                    movie_id: selectedMovieForShowtime.id,
                    show_date: showtimeForm.date,
                    show_time: showtimeForm.time,
                    price: showtimeForm.price
                },
                { headers: { 'x-auth-token': token } }
            );
            alert('Showtime Added');
            setShowtimeForm({ date: '', time: '', price: '' });
            fetchShowtimes(selectedMovieForShowtime.id); // Refresh
        } catch (err) {
            console.error(err);
            alert('Failed to add showtime');
        }
    };

    return (
        <div className="fade-in">
            <h1 className="text-gold" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card text-center">
                    <h3 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>${stats.revenue}</h3>
                    <p style={{ color: '#aaa' }}>Total Revenue</p>
                </div>
                <div className="glass-card text-center">
                    <h3 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{stats.bookings}</h3>
                    <p style={{ color: '#aaa' }}>Total Bookings</p>
                </div>
                <div className="glass-card text-center">
                    <h3 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{stats.users}</h3>
                    <p style={{ color: '#aaa' }}>Registered Users</p>
                </div>
                <div className="glass-card text-center">
                    <h3 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{stats.movies}</h3>
                    <p style={{ color: '#aaa' }}>active Movies</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setActiveAdminTab('movies')} className="btn" style={{ background: activeAdminTab === 'movies' ? 'var(--color-primary)' : 'transparent', color: activeAdminTab === 'movies' ? '#000' : '#fff', border: 'none', borderRadius: '0' }}>Manage Movies</button>
                <button onClick={() => setActiveAdminTab('users')} className="btn" style={{ background: activeAdminTab === 'users' ? 'var(--color-primary)' : 'transparent', color: activeAdminTab === 'users' ? '#000' : '#fff', border: 'none', borderRadius: '0' }}>Manage Users</button>
            </div>

            {activeAdminTab === 'users' ? (
                <div className="glass-card">
                    <h3>Registered Users</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Role</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px 10px' }}>{u.first_name} {u.last_name}</td>
                                    <td style={{ padding: '15px 10px' }}>{u.email}</td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <span style={{
                                            background: u.role === 'admin' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                            color: u.role === 'admin' ? '#000' : '#fff',
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Delete this user?')) return;
                                                    const token = localStorage.getItem('token');
                                                    try {
                                                        await axios.delete(`http://localhost:5000/api/admin/users/${u.id}`, { headers: { 'x-auth-token': token } });
                                                        alert('User deleted');
                                                        fetchStats(); // Using this to trigger re-fetch basically? Or create separate fetchUsers
                                                        // Quick fix: reload or simple fetchUsers function
                                                        const res = await axios.get('http://localhost:5000/api/admin/users', { headers: { 'x-auth-token': token } });
                                                        setUsersList(res.data);
                                                    } catch (e) { console.error(e); }
                                                }}
                                                className="btn btn-danger"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
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
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    {showtimeModalOpen && selectedMovieForShowtime && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div className="glass-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                                <button
                                    onClick={() => setShowtimeModalOpen(false)}
                                    style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                                >
                                    &times;
                                </button>
                                <h2 style={{ marginBottom: '1rem' }}>Manage Showtimes: <span className="text-gold">{selectedMovieForShowtime.title}</span></h2>

                                <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4>Add New Showtime</h4>
                                    <form onSubmit={handleShowtimeSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Date</label>
                                            <input type="date" required value={showtimeForm.date} onChange={e => setShowtimeForm({ ...showtimeForm, date: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Time</label>
                                            <input type="time" required value={showtimeForm.time} onChange={e => setShowtimeForm({ ...showtimeForm, time: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Price ($)</label>
                                            <input type="number" step="0.01" required value={showtimeForm.price} onChange={e => setShowtimeForm({ ...showtimeForm, price: e.target.value })} />
                                        </div>
                                        <button type="submit" className="btn">Add</button>
                                    </form>
                                </div>

                                <div>
                                    <h4>Current Showtimes</h4>
                                    {showtimes.length === 0 ? <p style={{ color: '#aaa' }}>No showtimes scheduled.</p> : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <tbody>
                                                {showtimes.map(st => (
                                                    <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '10px' }}>{new Date(st.show_date).toLocaleDateString()}</td>
                                                        <td style={{ padding: '10px' }}>{st.show_time.substring(0, 5)}</td>
                                                        <td style={{ padding: '10px' }}>${st.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{editingId ? 'Edit Movie' : 'Add New Movie'}</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                                <input name="genre" placeholder="Genre" value={formData.genre} onChange={handleChange} />
                                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{ resize: 'vertical', minHeight: '100px' }} />
                                <input name="duration_min" type="number" placeholder="Duration (min)" value={formData.duration_min} onChange={handleChange} />

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        id="image-file"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formDataObj = new FormData();
                                            formDataObj.append('image', file);
                                            try {
                                                const res = await axios.post('http://localhost:5000/api/upload', formDataObj, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                setFormData(prev => ({ ...prev, poster_url: `http://localhost:5000${res.data}` }));
                                                alert('Image Uploaded!');
                                            } catch (err) {
                                                console.error(err);
                                                alert('Upload failed');
                                            }
                                        }}
                                        style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '5px' }}
                                    />
                                    {formData.poster_url && <img src={formData.poster_url} alt="Preview" style={{ width: '50px', height: '75px', objectFit: 'cover' }} />}
                                </div>
                                <input name="poster_url" placeholder="Poster URL (or upload above)" value={formData.poster_url} onChange={handleChange} />
                                <input name="release_date" type="date" placeholder="Release Date" value={formData.release_date} onChange={handleChange} />

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" className="btn" style={{ flex: 1 }}>{editingId ? 'Update' : 'Create'}</button>
                                    {editingId && <button type="button" className="btn btn-danger" onClick={() => { setEditingId(null); setFormData({ title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: '' }); }} style={{ flex: 1 }}>Cancel</button>}
                                </div>
                            </form>
                        </div>

                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Existing Movies</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                            <th style={{ padding: '10px' }}>Title</th>
                                            <th style={{ padding: '10px' }}>Genre</th>
                                            <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map(m => (
                                            <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '15px 10px' }}>{m.title}</td>
                                                <td style={{ padding: '15px 10px', color: '#aaa' }}>{m.genre}</td>
                                                <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                                    <button onClick={() => openShowtimeManager(m)} className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', marginRight: '5px', background: 'var(--color-primary)', color: '#000' }}>Schedule</button>
                                                    <button onClick={() => handleEdit(m)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem', marginRight: '5px' }}>Edit</button>
                                                    <button onClick={() => handleDelete(m.id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
