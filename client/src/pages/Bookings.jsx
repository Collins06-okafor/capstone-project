import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { QRCodeSVG } from 'qrcode.react';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/bookings`, {
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

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="fade-in">
            <h1 className="text-gold" style={{ marginBottom: '2rem' }}>My Ticket Wallet</h1>

            {bookings.length === 0 ? (
                <div className="text-center" style={{ marginTop: '4rem', opacity: 0.6 }}>
                    <h3>No tickets found 🎟️</h3>
                    <p>Go book some movies to fill your wallet!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {bookings.map(booking => (
                        <div key={booking.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: booking.booking_status === 'cancelled' ? 0.7 : 1 }}>
                            <div style={{ background: booking.booking_status === 'cancelled' ? '#555' : 'var(--color-primary)', padding: '1rem', color: '#000', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{booking.booking_status === 'cancelled' ? 'CANCELLED' : 'MOVIE TICKET'}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>#{booking.booking_reference || booking.id}</span>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>{booking.title}</h2>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#ccc', fontSize: '0.9rem' }}>
                                    <div>
                                        <div style={{ opacity: 0.6 }}>DATE</div>
                                        <div>{new Date(booking.show_date).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ opacity: 0.6 }}>TIME</div>
                                        <div>{booking.show_time ? booking.show_time.substring(0, 5) : 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', margin: '1rem 0' }}></div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>SEATS</div>
                                    <div style={{ fontSize: '1.2rem', color: booking.booking_status === 'cancelled' ? '#aaa' : 'var(--color-primary)', fontWeight: 'bold' }}>
                                        {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
                                    </div>
                                </div>
                                {booking.booking_status !== 'cancelled' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: '#fff', padding: 5, borderRadius: '4px' }}>
                                            <QRCodeSVG
                                                value={booking.booking_reference || booking.id.toString()}
                                                size={80}
                                                level={"H"}
                                                includeMargin={false}
                                            />
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#aaa', maxWidth: '120px' }}>
                                            Scan for entry.
                                        </div>
                                    </div>
                                )}

                                {booking.booking_status === 'cancelled' && (
                                    <div style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '5px' }}>REFUNDED</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings;
