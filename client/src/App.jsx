import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please <Link to="/login">Login</Link> to view this page.</div>;
  return children;
};

// Navigation Component
const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <nav style={{ padding: '1rem', background: '#333', color: '#fff' }}>
      <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Home</Link>
      {user ? (
        <>
          <Link to="/bookings" style={{ color: '#fff', marginRight: '1rem' }}>My Bookings</Link>
          {user.role === 'admin' && <Link to="/admin" style={{ color: '#fff', marginRight: '1rem' }}>Admin Dashboard</Link>}
          <button onClick={logout}>Logout ({user.first_name})</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: '#fff', marginRight: '1rem' }}>Login</Link>
          <Link to="/register" style={{ color: '#fff' }}>Register</Link>
        </>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route
              path="/bookings"
              element={
                <PrivateRoute>
                  <Bookings />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
