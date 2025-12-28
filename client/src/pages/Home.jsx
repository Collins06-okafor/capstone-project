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

    const featuredMovie = movies.length > 0 ? movies[0] : null;
    const otherMovies = movies.length > 0 ? movies.slice(1) : [];

    if (loading && movies.length === 0) return <div className="loading-spinner"></div>;

    return (
        <div className="fade-in">
            {/* Hero Section */}
            {featuredMovie && (
                <div style={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '3rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    aspectRatio: '21/9',
                    display: 'flex',
                    alignItems: 'end'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${featuredMovie.poster_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.6)'
                    }}></div>
                    <div style={{
                        position: 'relative',
                        padding: '3rem',
                        width: '100%',
                        background: 'linear-gradient(to top, rgba(15,12,41,0.95), transparent)'
                    }}>
                        <span style={{
                            background: 'var(--color-primary)',
                            color: '#000',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            marginBottom: '10px',
                            display: 'inline-block'
                        }}>FEATURED</span>
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{featuredMovie.title}</h1>
                        <p style={{ maxWidth: '600px', fontSize: '1.1rem', color: '#ddd', marginBottom: '1.5rem' }}>{featuredMovie.description.substring(0, 150)}...</p>
                        <Link to={`/movie/${featuredMovie.id}`} className="btn" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                            Book Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="text-gold" style={{ margin: 0 }}>Now Showing</h2>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <input
                            type="text"
                            placeholder="Find a movie..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '10px', color: 'white', outline: 'none', width: '250px' }}
                        />
                        <button type="submit" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', border: 'none', cursor: 'pointer', alignSelf: 'center' }}>
                            🔍
                        </button>
                    </form>
                </div>

                {/* Genre Pills */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation'].map(g => (
                        <button
                            key={g}
                            onClick={() => {
                                const newGenre = g === 'All' ? '' : g;
                                setGenre(newGenre);
                                // Trigger filter immediately
                                setLoading(true);
                                let url = 'http://localhost:5000/api/movies?';
                                if (search) url += `search=${search}&`;
                                if (newGenre) url += `genre=${newGenre}&`;
                                axios.get(url).then(res => setMovies(res.data)).finally(() => setLoading(false));
                            }}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '30px',
                                border: '1px solid var(--color-primary)',
                                background: genre === g || (g === 'All' && genre === '') ? 'var(--color-primary)' : 'transparent',
                                color: genre === g || (g === 'All' && genre === '') ? '#000' : '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="movie-grid">
                {otherMovies.map(movie => (
                    <Link to={`/movie/${movie.id}`} key={movie.id}>
                        <div className="movie-card">
                            <img
                                src={movie.poster_url || "https://via.placeholder.com/300x450?text=No+Poster"}
                                alt={movie.title}
                                className="movie-poster"
                            />
                            <div className="movie-info">
                                <h3 className="movie-title">{movie.title}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="movie-genre">{movie.genre}</span>
                                    <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>★ {movie.rating || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {featuredMovie && <Link to={`/movie/${featuredMovie.id}`} key={featuredMovie.id} style={{ display: 'none' }}></Link>}
                {/* Trick to keep featured movie available in list logic if we wanted, but here we split them. 
                    Actually, if we filter, the featured one might disappear from query. 
                    Better logic: if search is active, show all in grid. If no search, show Hero + Grid.
                */}
            </div>
            {movies.length === 0 && <p className="text-center mt-2">No movies found.</p>}
        </div>
    );
};

export default Home;
