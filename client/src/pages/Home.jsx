import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                let url = 'http://localhost:5000/api/movies?';
                if (search) url += `search=${search}&`;
                if (genre) url += `genre=${genre}&`;

                const res = await axios.get(url);
                setMovies(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        // Debounce or just fetch on effect dependency triggers can be tricky with typing.
        // For simplicity, let's fetch when dependency changes, but user might want a "Search" button or debounce.
        // "Very basic design" -> Search button is safer/easier.
        // OR just fetch on mount and have a "Apply" button.
        // Let's do a separate function `handleSearch` and call it. 
        // Initial load:
        fetchMovies();
    }, []); // Only mount

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/movies?';
            if (search) url += `search=${search}&`;
            if (genre) url += `genre=${genre}&`;
            const res = await axios.get(url);
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && movies.length === 0) return <div>Loading movies...</div>;

    return (
        <div>
            <h1>Now Showing</h1>

            <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '5px' }}
                />
                <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '5px' }}>
                    <option value="">All Genres</option>
                    <option value="Action">Action</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Drama">Drama</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Horror">Horror</option>
                    <option value="Romance">Romance</option>
                </select>
                <button type="submit">Search</button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {movies.map(movie => (
                    <div key={movie.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
                        {movie.poster_url && <img src={movie.poster_url} alt={movie.title} style={{ width: '100%' }} />}
                        <h3>{movie.title}</h3>
                        <p>{movie.genre}</p>
                        <Link to={`/movie/${movie.id}`}>View Details</Link>
                    </div>
                ))}
            </div>
            {movies.length === 0 && <p>No movies found. (Database might be empty)</p>}
        </div>
    );
};

export default Home;
