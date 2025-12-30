import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

const SeatMap = ({ showtimeId, price, onSeatSelect, selectedSeats }) => {
    // Mock 10x10 grid
    const rows = 10;
    const cols = 10;
    const [bookedSeats, setBookedSeats] = useState([]);
    const [loading, setLoading] = useState(false); // Don't block render on loading if possible, but here we need booked status

    useEffect(() => {
        if (!showtimeId) return;
        const fetchBookedSeats = async () => {
            setLoading(true);
            try {
                // Fetch booked seats for this showtime
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
                const rowLabel = String.fromCharCode(65 + r); // A, B, C...
                const seatLabel = `${rowLabel}${c}`;
                const isBooked = bookedSeats.includes(seatLabel);
                const isSelected = selectedSeats.includes(seatLabel);

                rowSeats.push(
                    <div
                        key={seatLabel}
                        onClick={() => handleSeatClick(seatLabel)}
                        style={{
                            width: '30px',
                            height: '30px',
                            margin: '5px',
                            backgroundColor: isBooked ? '#e74c3c' : isSelected ? '#f1c40f' : '#2ecc71',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#fff',
                            borderRadius: '4px'
                        }}
                        title={isBooked ? 'Booked' : `Seat ${seatLabel} - $${price}`}
                    >
                        {seatLabel}
                    </div>
                );
            }
            grid.push(<div key={r} style={{ display: 'flex' }}>{rowSeats}</div>);
        }
        return grid;
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h4>Select Seats (Screen this way)</h4>
            <div style={{
                width: '100%',
                height: '20px',
                background: '#ccc',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '12px',
                lineHeight: '20px'
            }}>SCREEN</div>

            {loading ? <p>Loading seat map...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {renderSeats()}
                </div>
            )}

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: 20, height: 20, background: '#2ecc71', marginRight: 5 }}></div> Available</div>
                <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: 20, height: 20, background: '#e74c3c', marginRight: 5 }}></div> Booked</div>
                <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: 20, height: 20, background: '#f1c40f', marginRight: 5 }}></div> Selected</div>
            </div>
        </div>
    );
};

export default SeatMap;
