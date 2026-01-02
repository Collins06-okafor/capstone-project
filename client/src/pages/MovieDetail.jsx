import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config/api';

// Payment Modal Component
const PaymentModal = ({ show, onClose, onConfirm, amount }) => {
    const [processing, setProcessing] = useState(false);

    if (!show) return null;

    const handlePay = async (e) => {
        e.preventDefault();
        setProcessing(true);
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        await onConfirm();
        setProcessing(false);
    };

    return (
        <div className="payment-modal-overlay">
            <div className="auth-card" style={{ maxWidth: '440px', padding: '2.5rem' }}>
                <h2 className="text-gold text-center" style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Express Checkout</h2>

                {/* Visual Card Preview */}
                <div className="payment-card-visual">
                    <div className="card-chip"></div>
                    <div className="card-number-display">•••• •••• •••• 4242</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div className="payment-input-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>Card Holder</div>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sardor Ergashev</div>
                        </div>
                        <div>
                            <div className="payment-input-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>Expires</div>
                            <div style={{ fontSize: '0.9rem' }}>12/28</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handlePay}>
                    <div className="payment-input-group">
                        <label className="payment-input-label">Card Number</label>
                        <input type="text" className="payment-input" placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="payment-input-group" style={{ marginBottom: 0 }}>
                            <label className="payment-input-label">Expiry Date</label>
                            <input type="text" className="payment-input" placeholder="MM/YY" defaultValue="12/28" required />
                        </div>
                        <div className="payment-input-group" style={{ marginBottom: 0 }}>
                            <label className="payment-input-label">CVC / CVV</label>
                            <input type="password" className="payment-input" placeholder="•••" defaultValue="123" required />
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginBottom: '1rem' }} disabled={processing}>
                        {processing ? 'Authorizing...' : `Confirm Payment: $${amount.toFixed(2)}`}
                    </button>
                    <button type="button" className="auth-link" onClick={onClose} style={{ display: 'block', margin: '0 auto', fontSize: '0.9rem', background: 'none', border: 'none' }} disabled={processing}>
                        Go Back
                    </button>
                </form>
            </div>
        </div>
    );
};

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Group showtimes by date
    const uniqueDates = [...new Set(showtimes.map(st => new Date(st.show_date).toDateString()))];

    // Sort dates
    uniqueDates.sort((a, b) => new Date(a) - new Date(b));

    // Select first date by default
    useEffect(() => {
        if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [uniqueDates, selectedDate]);

    const getDayLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const filteredShowtimes = showtimes.filter(st => new Date(st.show_date).toDateString() === selectedDate);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await axios.get(`${API_URL}/api/movies/${id}`);
                setMovie(movieRes.data);
                const showRes = await axios.get(`${API_URL}/api/movies/${id}/showtimes`);
                setShowtimes(showRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const toggleSeat = (seatLabel) => {
        if (selectedSeats.includes(seatLabel)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatLabel));
        } else {
            setSelectedSeats([...selectedSeats, seatLabel]);
        }
    };

    const initiateBooking = () => {
        if (!user) {
            addToast('Please login to book tickets', 'error');
            navigate('/login');
            return;
        }

        if (!selectedShowtime) {
            addToast('Please select a showtime', 'error');
            return;
        }

        if (selectedSeats.length === 0) {
            addToast('Please select at least one seat', 'error');
            return;
        }

        setShowPayment(true);
    };

    const confirmBooking = async () => {
        try {
            const token = localStorage.getItem('token');
            const totalAmount = selectedSeats.length * parseFloat(selectedShowtime.price);

            await axios.post(
                `${API_URL}/api/bookings`,
                {
                    showtime_id: selectedShowtime.id,
                    seats: selectedSeats,
                    total_amount: totalAmount
                },
                { headers: { 'x-auth-token': token } }
            );
            addToast('Booking successful! Enjoy your movie.', 'success');
            setShowPayment(false);
            navigate('/bookings');
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.msg || 'Booking failed', 'error');
            setShowPayment(false); // Close modal on error too
        }
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (!movie) return <div className="text-center mt-2">Movie not found</div>;

    const posterUrl = movie.poster_url?.startsWith('http') ? movie.poster_url : `${API_URL}${movie.poster_url}`;

    return (
        <div className="fade-in-up">
            {/* Payment Modal */}
            <PaymentModal
                show={showPayment}
                onClose={() => setShowPayment(false)}
                onConfirm={confirmBooking}
                amount={selectedSeats.length * (selectedShowtime ? parseFloat(selectedShowtime.price) : 0)}
            />

            {/* Hero Section */}
            <div style={{
                position: 'relative',
                height: '400px',
                borderRadius: '24px',
                overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${movie.poster_url && movie.poster_url.startsWith('http') ? movie.poster_url : `${API_URL}${movie.poster_url}`})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top',
                    filter: 'blur(10px) brightness(0.4)'
                }}></div>
                <div style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2rem',
                    gap: '2rem'
                }}>
                    <img src={movie.poster_url && movie.poster_url.startsWith('http') ? movie.poster_url : `${API_URL}${movie.poster_url}`} alt={movie.title} style={{ height: '300px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                    <div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{movie.title}</h1>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', color: '#ccc' }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px' }}>{movie.genre}</span>
                            <span>{movie.duration || movie.duration_min} mins</span>
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                        </div>
                        <p style={{ maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>{movie.description}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-card">
                    <h3 className="text-gold" style={{ marginBottom: '1.5rem' }}>Select Showtime</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '5px' }}>
                        {uniqueDates.map(dateStr => (
                            <button
                                key={dateStr}
                                onClick={() => {
                                    setSelectedDate(dateStr);
                                    setSelectedShowtime(null);
                                    setSelectedSeats([]);
                                }}
                                className="btn"
                                style={{
                                    background: selectedDate === dateStr ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    color: selectedDate === dateStr ? '#000' : '#aaa',
                                    border: selectedDate === dateStr ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 16px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {getDayLabel(dateStr)}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {filteredShowtimes.map(st => (
                            <button
                                key={st.id}
                                onClick={() => {
                                    setSelectedShowtime(st);
                                    setSelectedSeats([]);
                                }}
                                className="btn"
                                style={{
                                    background: selectedShowtime?.id === st.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    color: selectedShowtime?.id === st.id ? '#000' : '#fff',
                                    border: 'none'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{st.show_time.substring(0, 5)}</span>
                            </button>
                        ))}
                    </div>
                    {filteredShowtimes.length === 0 && <p style={{ color: '#aaa' }}>No showtimes for this date.</p>}
                    {showtimes.length === 0 && <p>No showtimes available.</p>}

                    {selectedShowtime && (
                        <div className="fade-in-up">
                            <h3 className="text-gold">Select Seats</h3>
                            <SeatMap
                                showtimeId={selectedShowtime.id}
                                price={selectedShowtime.price}
                                onSeatSelect={toggleSeat}
                                selectedSeats={selectedSeats}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Booking Summary</h3>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#aaa' }}>Movie</span>
                            <span>{movie.title}</span>
                        </div>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#aaa' }}>Showtime</span>
                            <span>{selectedShowtime ? `${new Date(selectedShowtime.show_date).toLocaleDateString()} ${selectedShowtime.show_time.substring(0, 5)}` : '-'}</span>
                        </div>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#aaa' }}>Seats</span>
                            <span style={{ color: 'var(--color-primary)' }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
                        </div>
                        <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span>${(selectedSeats.length * (selectedShowtime ? parseFloat(selectedShowtime.price) : 0)).toFixed(2)}</span>
                        </div>

                        <button
                            className="btn"
                            style={{ width: '100%', padding: '15px' }}
                            onClick={initiateBooking}
                            disabled={!selectedShowtime || selectedSeats.length === 0}
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>

            <ReviewsSection movieId={id} />
        </div>
    );
};

const ReviewsSection = ({ movieId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const { user } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reviews/${movieId}`);
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (movieId) fetchReviews();
    }, [movieId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            addToast('Login to review', 'error');
            return;
        }
        if (!comment.trim()) {
            addToast('Please enter a comment', 'error');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/reviews`,
                { movie_id: movieId, rating, review_text: comment },
                { headers: { 'x-auth-token': token } }
            );
            setComment('');
            setRating(5);
            addToast('Review submitted!', 'success');
            fetchReviews();
        } catch (err) {
            addToast(err.response?.data?.msg || 'Review failed', 'error');
        }
    };

    return (
        <div className="reviews-container">
            <h2 className="text-gold" style={{ marginBottom: '3rem', fontSize: '2rem' }}>Viewer <span style={{ color: '#fff' }}>Reviews</span></h2>

            <div className="review-grid">
                <div className="review-list">
                    {reviews.map(r => (
                        <div key={r.id} className="review-card">
                            <div className="review-header">
                                <span className="review-author">{r.first_name} {r.last_name}</span>
                                <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                            </div>
                            <p className="review-text">"{r.review_text}"</p>
                            <div className="review-date">{new Date(r.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>No reviews yet. Be the first to share your experience!</p>
                        </div>
                    )}
                </div>

                <div className="review-form-container">
                    {user ? (
                        <div className="auth-card" style={{ padding: '2.5rem' }}>
                            <h3 className="review-form-title">
                                <span className="text-gold">★</span> Write a Review
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="auth-form-group">
                                    <label className="auth-label">Rating</label>
                                    <div className="star-rating-input">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setRating(n)}
                                                className={`star-btn ${n <= rating ? 'active' : 'inactive'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-label">Your Impression</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="What did you think of the cinematography, plot, and performance?"
                                        className="review-textarea"
                                    />
                                </div>
                                <button type="submit" className="btn" style={{ width: '100%' }}>
                                    Post Review
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="auth-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Join the Conversation</h3>
                            <p className="text-muted" style={{ marginBottom: '2rem' }}>Please log in to share your thoughts with the community.</p>
                            <button className="btn" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                                Sign In to Review
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;

