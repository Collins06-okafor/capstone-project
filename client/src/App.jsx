import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

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
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">HiMovie 🍿</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              <Link to="/bookings" className="nav-link">My Bookings</Link>
              {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
              <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 25, height: 25, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {user.first_name[0]}
                </span>
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn" style={{ padding: '0.5rem 1rem' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => (
  <footer style={{ background: 'rgba(0,0,0,0.5)', padding: '2rem 1rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
      <div>
        <h3 className="text-gold" style={{ fontSize: '1.2rem' }}>HiMovie 🍿</h3>
        <p style={{ fontSize: '0.9rem' }}>The best place to book your tickets for the latest blockbusters.</p>
      </div>
      <div>
        <h4 style={{ fontSize: '1rem', color: '#fff' }}>Quick Links</h4>
        <ul style={{ fontSize: '0.9rem', color: '#aaa' }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/bookings">My Bookings</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </div>
      <div>
        <h4 style={{ fontSize: '1rem', color: '#fff' }}>Contact</h4>
        <p style={{ fontSize: '0.9rem' }}>support@himovie.com</p>
        <p style={{ fontSize: '0.9rem' }}>+1 (555) 123-4567</p>
      </div>
    </div>
    <div className="text-center" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#666' }}>
      &copy; {new Date().getFullYear()} HiMovie Inc. All rights reserved.
    </div>
  </footer>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div className="container" style={{ marginTop: '2rem', paddingBottom: '2rem', flex: 1 }}>
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
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
