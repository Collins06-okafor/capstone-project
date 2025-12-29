import { useLocation, useNavigate } from "react-router-dom";
import "./Bookings.css";

const Bookings = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="booking-container">
        <h2>No booking information found.</h2>
      </div>
    );
  }

  const { movie, time, seats, total } = state;

  const handleConfirm = () => {
    // Later: send booking data to backend
    navigate("/success", {
      state: {
        movie,
        time,
        seats,
        total,
      },
    });
  };

  return (
    <div className="booking-container">
      <h1>Booking Details</h1>

      <div className="booking-card">
        <p>
          <strong>Movie:</strong> {movie.title}
        </p>

        <p>
          <strong>Showtime:</strong> {time}
        </p>

        <p>
          <strong>Seats:</strong> {seats.join(", ")}
        </p>

        <p className="price">
          <strong>Total Price:</strong> ${total}
        </p>

        <button onClick={handleConfirm}>Confirm Booking</button>
      </div>
    </div>
  );
};

export default Bookings;
