import { useLocation, useNavigate } from "react-router-dom";
import "./Success.css";

const Success = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="success-container">
        <h2>No booking data found.</h2>
      </div>
    );
  }

  const { movie, time, seats, total } = state;

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="checkmark">✔</div>

        <h1>Booking Successful!</h1>
        <p className="subtitle">Enjoy your movie 🎬</p>

        <div className="details">
          <p><strong>Movie:</strong> {movie.title}</p>
          <p><strong>Showtime:</strong> {time}</p>
          <p><strong>Seats:</strong> {seats.join(", ")}</p>
          <p className="total"><strong>Total Paid:</strong> ${total}</p>
        </div>

        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Success;
