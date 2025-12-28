import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import { ToastContext } from '../context/ToastContext';

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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="glass-card fade-in-up" style={{ width: '400px', maxWidth: '90%', background: '#1a1a2e', border: '1px solid var(--color-primary)' }}>
                <h2 className="text-gold text-center" style={{ marginBottom: '20px' }}>Checkout</h2>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#ccc' }}>Total Amount</p>
                    <h1 style={{ fontSize: '3rem', margin: 0 }}>${amount.toFixed(2)}</h1>
                </div>

                <form onSubmit={handlePay}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#aaa', fontSize: '0.8rem' }}>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" required style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.8rem' }}>Expiry</label>
                            <input type="text" placeholder="MM/YY" defaultValue="12/25" required style={{ background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.8rem' }}>CVC</label>
                            <input type="text" placeholder="123" defaultValue="123" required style={{ background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', padding: '15px', opacity: processing ? 0.7 : 1 }} disabled={processing}>
                        {processing ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
                    </button>
                    <button type="button" onClick={onClose} style={{ width: '100%', padding: '10px', marginTop: '10px', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }} disabled={processing}>
                        Cancel
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await axios.get(`http://localhost:5000/api/movies/${id}`);
                setMovie(movieRes.data);
                const showRes = await axios.get(`http://localhost:5000/api/movies/${id}/showtimes`);
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
                'http://localhost:5000/api/bookings',
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

    return (
        <div className="fade-in">
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
                    backgroundImage: `url(${movie.poster_url})`,
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
                    <img src={movie.poster_url} alt={movie.title} style={{ height: '300px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
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
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {showtimes.map(st => (
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
                                {new Date(st.show_date).toLocaleDateString()} <br />
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{st.show_time.substring(0, 5)}</span>
                            </button>
                        ))}
                    </div>
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
            const res = await axios.get(`http://localhost:5000/api/reviews/${movieId}`);
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
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/reviews',
                { movie_id: movieId, rating, review_text: comment },
                { headers: { 'x-auth-token': token } }
            );
            setComment('');
            addToast('Review submitted!', 'success');
            fetchReviews();
        } catch (err) {
            addToast(err.response?.data?.msg || 'Review failed', 'error');
        }
    };

    return (
        <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
            <h3 className="text-gold" style={{ marginBottom: '20px' }}>Reviews & Ratings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {reviews.map(r => (
                        <div key={r.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>{r.first_name} {r.last_name}</strong>
                                <span style={{ color: 'var(--color-primary)' }}>{'★'.repeat(r.rating)}</span>
                            </div>
                            <p style={{ color: '#ccc', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{r.review_text}"</p>
                            <small style={{ color: '#666' }}>{new Date(r.created_at).toLocaleDateString()}</small>
                        </div>
                    ))}
                    {reviews.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
                </div>

                {user ? (
                    <div className="glass-card">
                        <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Rating</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <div
                                            key={n}
                                            onClick={() => setRating(n)}
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '1.5rem',
                                                color: n <= rating ? 'var(--color-primary)' : '#444'
                                            }}
                                        >
                                            ★
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about the movie..."
                                style={{ width: '100%', height: '100px', resize: 'none' }}
                            />
                            <button type="submit" className="btn" style={{ marginTop: '10px', width: '100%' }}>Submit Review</button>
                        </form>
                    </div>
                ) : (
                    <div className="glass-card flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                        <p>Please login to leave a review.</p>
                        <button className="btn mt-2" onClick={() => navigate('/login')}>Login Now</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetail;

