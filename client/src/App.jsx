import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
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

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          HI<span style={{ color: 'var(--color-primary)' }}>MOVIE</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Catalog</Link>
          {user ? (
            <>
              <Link to="/bookings" className="nav-link">Bookings</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ color: 'var(--color-primary)' }}>
                  Admin
                </Link>
              )}

              <div className="nav-separator"></div>

              <Link to="/profile" className="nav-profile">
                <div className="nav-profile-avatar">
                  {user.first_name[0]}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Profile</span>
              </Link>

              <button onClick={handleLogout} className="btn-signout">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="btn" style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <h3 className="nav-logo" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>HIMOVIE</h3>
          <p className="footer-text">
            Experience the future of cinema booking. Premium features, seamless interface, and the best movies curated just for you.
          </p>
        </div>
        <div>
          <h4 className="footer-heading">Explore</h4>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Catalog</Link></li>
            <li><Link to="/bookings" className="footer-link">My Tickets</Link></li>
            <li><Link to="/profile" className="footer-link">Profile Settings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><a href="#" className="footer-link">Help Center</a></li>
            <li><a href="#" className="footer-link">Terms of Service</a></li>
            <li><a href="#" className="footer-link">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">Newsletter</h4>
          <p className="footer-text" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Get the latest updates on blockbusters and special screenings.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="email" placeholder="Your email" className="footer-newsletter-input" />
            <button className="btn" style={{ padding: '10px' }}>Join</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} HiMovie Premium Cinema. All rights reserved.</p>
        <div className="footer-socials">
          <span className="footer-link footer-social-link">Instagram</span>
          <span className="footer-link footer-social-link">Twitter</span>
          <span className="footer-link footer-social-link">Facebook</span>
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem', flex: 1 }}>
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
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
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
