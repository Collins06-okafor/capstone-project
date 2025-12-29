import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetail from "./pages/MovieDetail";
import Bookings from "./pages/Bookings";
import Success from "./pages/Success";
import AdminDashboard from "./pages/AdminDashboard";

import SeatMap from "./components/SeatMap";

// =======================
// Protected Route
// =======================
const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>
        Please <Link to="/login">Login</Link> to view this page.
      </div>
    );
  }

  return children;
};

// =======================
// Navbar
// =======================
const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);

  return (
    <nav
      style={{
        padding: "1rem 2rem",
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Link to="/" style={{ color: "#fff", marginRight: "1.5rem" }}>
        Home
      </Link>

      {user ? (
        <>
          <Link to="/bookings" style={{ color: "#fff", marginRight: "1.5rem" }}>
            My Bookings
          </Link>

          {user.role === "admin" && (
            <Link to="/admin" style={{ color: "#fff", marginRight: "1.5rem" }}>
              Admin
            </Link>
          )}

          <button
            onClick={logout}
            style={{
              marginLeft: "auto",
              background: "#d100c9",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: "#fff", marginRight: "1.5rem" }}>
            Login
          </Link>
          <Link to="/register" style={{ color: "#fff" }}>
            Register
          </Link>
        </>
      )}
    </nav>
  );
};

// =======================
// App
// =======================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/movie/:id" element={<MovieDetail />} />

          <Route
            path="/seats"
            element={
              <PrivateRoute>
                <SeatMap />
              </PrivateRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <Bookings />
              </PrivateRoute>
            }
          />

          <Route
            path="/success"
            element={
              <PrivateRoute>
                <Success />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
