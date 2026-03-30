import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

function getElectionStatus(election) {
  const now = new Date();
  const start = new Date(election.startDate);
  const end = new Date(election.endDate);

  if (!election.isActive) return { label: 'Inactive', className: 'status--inactive' };
  if (now < start) return { label: 'Upcoming', className: 'status--upcoming' };
  if (now > end) return { label: 'Ended', className: 'status--ended' };
  return { label: 'Active', className: 'status--active' };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data.elections);
    } catch (err) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader">Loading elections...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Elections</h1>
        <p>Browse and participate in active elections</p>
      </div>

      {elections.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h2>No elections yet</h2>
          <p>Elections will appear here once created by an admin.</p>
        </div>
      ) : (
        <div className="election-grid">
          {elections.map((election) => {
            const status = getElectionStatus(election);
            const isVotable = status.label === 'Active';

            return (
              <div key={election.id} className="election-card">
                <div className="election-card__top">
                  <span className={`status-badge ${status.className}`}>
                    {status.label === 'Active' && <CheckCircle2 size={14} />}
                    {status.label === 'Ended' && <XCircle size={14} />}
                    {status.label === 'Upcoming' && <Clock size={14} />}
                    {status.label}
                  </span>
                  <h3>{election.title}</h3>
                  {election.description && (
                    <p className="election-card__desc">{election.description}</p>
                  )}
                </div>

                <div className="election-card__dates">
                  <div>
                    <span className="date-label">Start</span>
                    <span>{formatDate(election.startDate)}</span>
                  </div>
                  <div>
                    <span className="date-label">End</span>
                    <span>{formatDate(election.endDate)}</span>
                  </div>
                </div>

                <div className="election-card__actions">
                  {isVotable && (
                    <Link to={`/vote/${election.id}`} className="btn btn--primary">
                      Cast Vote <ChevronRight size={16} />
                    </Link>
                  )}
                  <Link to={`/results/${election.id}`} className="btn btn--outline">
                    View Results
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
