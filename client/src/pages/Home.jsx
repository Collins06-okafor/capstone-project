import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('');

    const fetchMovies = async (searchVal = '', genreVal = '') => {
        setLoading(true);
        try {
            let url = `${API_URL}/api/movies?`;
            if (searchVal) url += `search=${searchVal}&`;
            if (genreVal) url += `genre=${genreVal}&`;
            const res = await axios.get(url);
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMovies(search, genre);
    };

    const handleGenreSelect = (g) => {
        const newGenre = g === 'All' ? '' : g;
        setGenre(newGenre);
        fetchMovies(search, newGenre);
    };

    const featuredMovie = movies.length > 0 ? movies[0] : null;

    if (loading && movies.length === 0) return <div className="loading-spinner"></div>;

    return (
        <div className="fade-in-up">
            {/* Cinematic Hero Section */}
            {!search && !genre && featuredMovie && (
                <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    marginBottom: '4rem',
                    aspectRatio: '21/9',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${featuredMovie.poster_url?.startsWith('http') ? featuredMovie.poster_url : `${API_URL}${featuredMovie.poster_url}`})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 20%',
                        filter: 'brightness(0.5) saturate(1.2)'
                    }}></div>

                    {/* Hero Gradient Overlay */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(90deg, rgba(6,6,15,0.9) 0%, rgba(6,6,15,0.4) 50%, transparent 100%)'
                    }}></div>

                    <div style={{
                        position: 'relative',
                        padding: '4rem',
                        maxWidth: '800px',
                        zIndex: 1
                    }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            background: 'var(--color-primary)',
                            color: '#000',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '900',
                            marginBottom: '1rem',
                            letterSpacing: '1px'
                        }}>FEATURED EXCLUSIVE</div>

                        <h1 style={{ marginBottom: '1rem', lineHeight: '1.1' }}>{featuredMovie.title}</h1>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
                            <span style={{ color: 'var(--color-primary)' }}>★ {featuredMovie.rating || '8.4'}</span>
                            <span>{featuredMovie.genre}</span>
                            <span>{featuredMovie.duration_min} min</span>
                        </div>

                        <p style={{ fontSize: '1.1rem', color: '#ccc', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            {featuredMovie.description.substring(0, 180)}...
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to={`/movie/${featuredMovie.id}`} className="btn">
                                Book Tickets
                            </Link>
                            <Link to={`/movie/${featuredMovie.id}`} className="btn btn-secondary">
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '2rem'
                }}>
                    <div>
                        <h2 className="text-gold" style={{ margin: 0, fontSize: '2rem' }}>
                            {search || genre ? `Results for ${search || genre}` : 'Now Showing'}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6 }}>Explore the latest blockbusters in premium quality</p>
                    </div>

                    <form onSubmit={handleSearch} style={{
                        display: 'flex',
                        gap: '10px',
                        background: 'var(--glass-bg)',
                        padding: '8px 24px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--glass-border)',
                        backdropFilter: 'blur(10px)',
                        transition: 'var(--transition-smooth)',
                        width: 'clamp(300px, 40vw, 500px)'
                    }}>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '10px 0', color: 'white', outline: 'none', width: '100%', marginBottom: 0 }}
                        />
                        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 5px', fontSize: '1.2rem' }}>
                            🔍
                        </button>
                    </form>
                </div>

                {/* Modern Genre Selection */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '15px',
                    scrollbarWidth: 'none'
                }}>
                    {['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation'].map(g => {
                        const isActive = (g === 'All' && genre === '') || g === genre;
                        return (
                            <button
                                key={g}
                                onClick={() => handleGenreSelect(g)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid',
                                    borderColor: isActive ? 'var(--color-primary)' : 'var(--glass-border)',
                                    background: isActive ? 'var(--color-primary)' : 'var(--glass-bg)',
                                    color: isActive ? '#000' : '#fff',
                                    fontWeight: isActive ? '700' : '400',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-smooth)',
                                    whiteSpace: 'nowrap',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                {g}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Movie Grid */}
            <div className="movie-grid">
                {movies.map((movie, index) => (
                    <Link
                        to={`/movie/${movie.id}`}
                        key={movie.id}
                        className="fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="movie-card">
                            <img
                                src={!movie.poster_url ? "https://via.placeholder.com/300x450?text=No+Poster" : (movie.poster_url.startsWith('http') ? movie.poster_url : `${API_URL}${movie.poster_url}`)}
                                alt={movie.title}
                                className="movie-poster"
                            />

                            {/* Card Content Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '2rem 1.5rem 1.5rem',
                                background: 'linear-gradient(to top, rgba(6,6,15,1) 0%, rgba(6,6,15,0.8) 40%, transparent 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transform: 'translateY(10px)',
                                transition: 'var(--transition-smooth)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>★ {movie.rating || '8.2'}</span>
                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{movie.genre}</span>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {movies.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1remOpacity: 0.3' }}>🎬</div>
                    <h3 style={{ color: 'var(--color-text-muted)' }}>No movies found matching your criteria.</h3>
                    <button className="btn btn-secondary mt-2" onClick={() => fetchMovies()}>View All Movies</button>
                </div>
            )}
        </div>
    );
};

export default Home;
