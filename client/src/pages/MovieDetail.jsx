import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./MovieDetail.css";

const movies = [
  {
    id: "1",
    title: "Interstellar",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: "2",
    title: "Inception",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given an inverse task.",
  },
];

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const movie = movies.find((m) => m.id === id);
  const [selectedTime, setSelectedTime] = useState("");

  if (!movie) {
    return <h2 style={{ color: "white", padding: "50px" }}>Movie not found</h2>;
  }

  const handleBook = () => {
    if (!selectedTime) {
      alert("Please select a showtime");
      return;
    }

    navigate("/seats", {
      state: {
        movie,
        time: selectedTime,
      },
    });
  };

  return (
    <div className="movie-detail-container">
      <div className="movie-left">
        <img src={movie.poster} alt={movie.title} />
      </div>

      <div className="movie-right">
        <h1>{movie.title}</h1>
        <p className="description">{movie.description}</p>

        <h3>Select Showtime</h3>
        <div className="times">
          {["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"].map((time) => (
            <button
              key={time}
              className={selectedTime === time ? "time active" : "time"}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>

        <button className="book-btn" onClick={handleBook}>
          Book Seats
        </button>
      </div>
    </div>
  );
};

export default MovieDetail;
