import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]); // Changed to array
    const [selectedShowtime, setSelectedShowtime] = useState(null);

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

    const handleBook = async () => {
        if (!user) {
            alert('Please login to book tickets');
            navigate('/login');
            return;
        }

        if (!selectedShowtime) {
            alert('Please select a showtime');
            return;
        }

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

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
            alert('Booking successful!');
            navigate('/bookings');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Booking failed');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!movie) return <div>Movie not found</div>;

    return (
        <div>
            <h1>{movie.title}</h1>
            <p>{movie.description}</p>
            <p>Duration: {movie.duration_min} mins</p>
            {movie.poster_url && <img src={movie.poster_url} alt={movie.title} style={{ width: '200px' }} />}

            <div style={{ marginTop: '2rem' }}>
                <h3>Select Showtime</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {showtimes.map(st => (
                        <button
                            key={st.id}
                            onClick={() => {
                                setSelectedShowtime(st);
                                setSelectedSeats([]); // Reset seats on showtime change
                            }}
                            style={{
                                padding: '10px',
                                background: selectedShowtime?.id === st.id ? 'green' : '#eee',
                                color: selectedShowtime?.id === st.id ? 'white' : 'black',
                                cursor: 'pointer'
                            }}
                        >
                            {new Date(st.show_date).toLocaleDateString()} {st.show_time.substring(0, 5)} - ${st.price}
                        </button>
                    ))}
                </div>
                {showtimes.length === 0 && <p>No showtimes available.</p>}

                {selectedShowtime && (
                    <>
                        <h3>Select Seats</h3>
                        <SeatMap
                            showtimeId={selectedShowtime.id}
                            price={selectedShowtime.price}
                            onSeatSelect={toggleSeat}
                            selectedSeats={selectedSeats}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <p>Selected Seats: {selectedSeats.join(', ')}</p>
                            <p>Total: ${(selectedSeats.length * parseFloat(selectedShowtime.price)).toFixed(2)}</p>
                            <button onClick={handleBook} disabled={selectedSeats.length === 0}>Book Ticket</button>
                        </div>
                    </>
                )}
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
            alert('Login to review');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/reviews',
                { movie_id: movieId, rating, review_text: comment },
                { headers: { 'x-auth-token': token } }
            );
            setComment('');
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.msg || 'Review failed');
        }
    };

    return (
        <div style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3>Reviews</h3>
            <div>
                {reviews.map(r => (
                    <div key={r.id} style={{ background: '#f9f9f9', padding: '10px', marginBottom: '10px' }}>
                        <strong>{r.first_name} {r.last_name}</strong> - ⭐ {r.rating}/5
                        <p>{r.review_text}</p>
                        <small>{new Date(r.created_at).toLocaleDateString()}</small>
                    </div>
                ))}
                {reviews.length === 0 && <p>No reviews yet.</p>}
            </div>

            {user && (
                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <h4>Write a Review</h4>
                    <div>
                        <label>Rating: </label>
                        <select value={rating} onChange={(e) => setRating(e.target.value)}>
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Your thoughts..."
                        style={{ width: '100%', height: '80px', marginTop: '10px' }}
                    />
                    <button type="submit" style={{ marginTop: '10px' }}>Submit Review</button>
                </form>
            )}
        </div>
    );
};

export default MovieDetail;
