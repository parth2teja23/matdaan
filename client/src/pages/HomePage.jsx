import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Vote, Shield, BarChart3, Users, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Secure • Transparent • Democratic</div>
          <h1>
            <span className="hero-hindi">मतदान</span>
            <span className="hero-sub">Your Vote, Your Voice</span>
          </h1>
          <p className="hero-desc">
            A secure digital voting platform where every vote counts. 
            Participate in elections, cast your ballot, and see results in real time.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/elections" className="btn btn--primary btn--lg">
                View Elections <ChevronRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn--primary btn--lg">
                  Get Started <ChevronRight size={18} />
                </Link>
                <Link to="/login" className="btn btn--outline btn--lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <Shield size={28} />
            <h3>Secure Voting</h3>
            <p>JWT authentication, encrypted passwords, and transaction-safe vote casting.</p>
          </div>
          <div className="feature-card">
            <Vote size={28} />
            <h3>One Person, One Vote</h3>
            <p>Database-enforced uniqueness ensures fair elections with no duplicate votes.</p>
          </div>
          <div className="feature-card">
            <BarChart3 size={28} />
            <h3>Live Results</h3>
            <p>View real-time vote counts and percentages as the election progresses.</p>
          </div>
          <div className="feature-card">
            <Users size={28} />
            <h3>Role-Based Access</h3>
            <p>Admins create elections and add candidates. Voters cast their ballots securely.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
