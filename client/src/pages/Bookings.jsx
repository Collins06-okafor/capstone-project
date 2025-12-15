import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { 'x-auth-token': token }
                });
                setBookings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div>
            <h1>My Bookings</h1>
            <ul>
                {bookings.map(booking => (
                    <li key={booking.id}>
                        <strong>{booking.title}</strong> -
                        Date: {new Date(booking.show_date).toLocaleDateString()} {booking.show_time?.substring(0, 5)} -
                        Seats: {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats} -
                        Total: ${booking.total_amount}
                    </li>
                ))}
            </ul>
            {bookings.length === 0 && <p>No bookings found.</p>}
        </div>
    );
};

export default Bookings;
