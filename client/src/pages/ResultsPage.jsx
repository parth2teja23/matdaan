import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BarChart3, ArrowLeft, Trophy, Users } from 'lucide-react';

export default function ResultsPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (electionId) {
      fetchResults(electionId);
    } else {
      setLoading(false);
    }
  }, [electionId]);

  const fetchResults = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/results/${id}/dashboard`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (!electionId) {
    return <ResultsIndex />;
  }

  if (loading) {
    return <div className="page-loader">Loading results...</div>;
  }

  if (!data) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Results not available</h2>
          <button onClick={() => navigate('/elections')} className="btn btn--primary">
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  const maxVotes = Math.max(...data.results.map((r) => r.votes), 1);
  const winner = data.results[0];

  const BAR_COLORS = ['#e85d04', '#f48c06', '#ffba08', '#06d6a0', '#118ab2', '#073b4c'];

  return (
    <div className="page-container">
      <button onClick={() => navigate('/results')} className="back-btn">
        <ArrowLeft size={18} /> All Results
      </button>

      <div className="results-header">
        <BarChart3 size={32} />
        <h1>{data.election.title}</h1>
        <div className="results-meta">
          <span><Users size={16} /> {data.totalVotes} total votes</span>
        </div>
      </div>

      {data.totalVotes > 0 && winner && (
        <div className="winner-banner">
          <Trophy size={24} />
          <div>
            <span className="winner-label">Leading</span>
            <strong>{winner.name}</strong>
            <span className="winner-party">{winner.party} — {winner.percentage}%</span>
          </div>
        </div>
      )}

      <div className="results-chart">
        {data.results.map((result, i) => (
          <div key={result.candidateId} className="result-bar-row">
            <div className="result-bar-label">
              <span className="result-name">{result.name}</span>
              <span className="result-party">{result.party}</span>
            </div>
            <div className="result-bar-track">
              <div
                className="result-bar-fill"
                style={{
                  width: `${Math.max((result.votes / maxVotes) * 100, 2)}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>
            <div className="result-bar-value">
              <strong>{result.votes}</strong>
              <span>{result.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsIndex() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/elections');
        setElections(res.data.elections);
      } catch {
        toast.error('Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Election Results</h1>
        <p>Select an election to view its results</p>
      </div>

      {elections.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={48} />
          <h2>No elections found</h2>
        </div>
      ) : (
        <div className="results-list">
          {elections.map((el) => (
            <Link key={el.id} to={`/results/${el.id}`} className="results-list-item">
              <div>
                <h3>{el.title}</h3>
                {el.description && <p>{el.description}</p>}
              </div>
              <BarChart3 size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
