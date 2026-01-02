import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

const SeatMap = ({ showtimeId, price, onSeatSelect, selectedSeats }) => {
    const rows = 10;
    const cols = 10;
    const [bookedSeats, setBookedSeats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!showtimeId) return;
        const fetchBookedSeats = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/showtimes/${showtimeId}/seats`);
                const data = await res.json();
                setBookedSeats(data);
            } catch (err) {
                console.error("Failed to fetch booked seats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookedSeats();
    }, [showtimeId]);

    const handleSeatClick = (seatLabel) => {
        if (bookedSeats.includes(seatLabel)) return;
        onSeatSelect(seatLabel);
    };

    const renderSeats = () => {
        let grid = [];
        for (let r = 0; r < rows; r++) {
            let rowSeats = [];
            for (let c = 1; c <= cols; c++) {
                const rowLabel = String.fromCharCode(65 + r);
                const seatLabel = `${rowLabel}${c}`;
                const isBooked = bookedSeats.includes(seatLabel);
                const isSelected = selectedSeats.includes(seatLabel);

                rowSeats.push(
                    <div
                        key={seatLabel}
                        className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSeatClick(seatLabel)}
                        title={isBooked ? 'Booked' : `Seat ${seatLabel} - $${price}`}
                    >
                        {seatLabel}
                    </div>
                );
            }
            grid.push(
                <div key={r} style={{ display: 'flex', gap: '12px' }}>
                    {rowSeats}
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="fade-in-up" style={{ marginTop: '2rem' }}>
            <div className="cinema-screen"></div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Preparing seat selection...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    {renderSeats()}
                </div>
            )}

            <div style={{
                display: 'flex',
                gap: '30px',
                justifyContent: 'center',
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--glass-border)'
            }}>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--color-primary)' }}></div>
                    <span>Selected</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#252538' }}></div>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    );
};

export default SeatMap;
