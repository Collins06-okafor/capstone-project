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

    useEffect(() => {
        fetchMovies();
    }, []);

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
            duration_min: movie.duration_min || '',
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

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>

            <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px' }}>
                <h3>{editingId ? 'Edit Movie' : 'Add New Movie'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}>
                    <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                    <input name="genre" placeholder="Genre" value={formData.genre} onChange={handleChange} />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                    <input name="duration_min" type="number" placeholder="Duration (min)" value={formData.duration_min} onChange={handleChange} />
                    <input name="poster_url" placeholder="Poster URL" value={formData.poster_url} onChange={handleChange} />
                    <input name="release_date" type="date" placeholder="Release Date" value={formData.release_date} onChange={handleChange} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', genre: '', description: '', duration_min: '', poster_url: '', release_date: '' }); }}>Cancel</button>}
                    </div>
                </form>
            </div>

            <h3>Existing Movies</h3>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Genre</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map(m => (
                        <tr key={m.id}>
                            <td>{m.title}</td>
                            <td>{m.genre}</td>
                            <td>
                                <button onClick={() => handleEdit(m)}>Edit</button>
                                <button onClick={() => handleDelete(m.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
