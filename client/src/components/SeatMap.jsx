import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SeatMap.css";

const rows = ["A", "B", "C", "D", "E"];
const cols = 8;
const SEAT_PRICE = 25;

// Fake booked seats (later from backend)
const bookedSeats = ["A3", "B4", "C5"];

const SeatMap = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);

  if (!state) {
    return <h2 style={{ color: "white" }}>No booking data</h2>;
  }

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;

    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    navigate("/bookings", {
      state: {
        movie: state.movie,
        time: state.time,
        seats: selectedSeats,
        total: selectedSeats.length * SEAT_PRICE,
      },
    });
  };

  return (
    <div className="seat-page">
      <h1>Cinema Seat Selection</h1>

      <div className="screen">SCREEN</div>

      <div className="seats">
        {rows.map((row) =>
          [...Array(cols)].map((_, i) => {
            const seat = `${row}${i + 1}`;
            const isBooked = bookedSeats.includes(seat);
            const isSelected = selectedSeats.includes(seat);

            return (
              <div
                key={seat}
                className={`seat 
                  ${isBooked ? "booked" : ""}
                  ${isSelected ? "selected" : ""}
                `}
                onClick={() => toggleSeat(seat)}
              >
                {seat}
              </div>
            );
          })
        )}
      </div>

      <div className="summary">
        <p>
          Selected Seats:{" "}
          <strong>{selectedSeats.join(", ") || "None"}</strong>
        </p>
        <p>
          Total Price: <strong>${selectedSeats.length * SEAT_PRICE}</strong>
        </p>

        <button onClick={handleConfirm}>Confirm Booking</button>
      </div>
    </div>
  );
};

export default SeatMap;
