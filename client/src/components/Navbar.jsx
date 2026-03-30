import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Vote, Shield, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <Vote size={22} />
          <span>मतदान</span>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/elections" className="nav-link">Elections</Link>
              <Link to="/results" className="nav-link">
                <BarChart3 size={16} />
                Results
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link nav-link--admin">
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <div className="nav-user">
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-role-badge">{user.role}</span>
                <button onClick={handleLogout} className="nav-logout" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-link--cta">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
