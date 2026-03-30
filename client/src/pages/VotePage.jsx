import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Vote, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [electionId]);

  const fetchCandidates = async () => {
    try {
      const res = await api.get(`/elections/${electionId}/candidates`);
      setElection(res.data.election);
      setCandidates(res.data.candidates);
    } catch (err) {
      toast.error('Failed to load election data');
      navigate('/elections');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/votes', {
        electionId: Number(electionId),
        candidateId: selectedCandidate,
      });
      setHasVoted(true);
      toast.success('Vote cast successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cast vote';
      if (msg.includes('already voted')) {
        setHasVoted(true);
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loader">Loading ballot...</div>;
  }

  if (hasVoted) {
    return (
      <div className="page-container">
        <div className="success-state">
          <CheckCircle size={64} />
          <h2>Vote Recorded!</h2>
          <p>Your vote has been securely recorded. Thank you for participating.</p>
          <div className="success-actions">
            <button onClick={() => navigate(`/results/${electionId}`)} className="btn btn--primary">
              View Results
            </button>
            <button onClick={() => navigate('/elections')} className="btn btn--outline">
              Back to Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button onClick={() => navigate('/elections')} className="back-btn">
        <ArrowLeft size={18} /> Back to Elections
      </button>

      <div className="vote-header">
        <Vote size={32} />
        <h1>{election?.title}</h1>
        {election?.description && <p>{election.description}</p>}
      </div>

      <div className="vote-notice">
        <AlertCircle size={18} />
        <span>Select one candidate below. This action cannot be undone.</span>
      </div>

      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`candidate-card ${selectedCandidate === candidate.id ? 'candidate-card--selected' : ''}`}
            onClick={() => setSelectedCandidate(candidate.id)}
          >
            <div className="candidate-card__radio">
              <div className="radio-outer">
                {selectedCandidate === candidate.id && <div className="radio-inner" />}
              </div>
            </div>
            <div className="candidate-card__info">
              <h3>{candidate.name}</h3>
              <span className="candidate-party">{candidate.party}</span>
              {candidate.manifesto && (
                <p className="candidate-manifesto">{candidate.manifesto}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="empty-state">
          <h2>No candidates</h2>
          <p>No candidates have been added to this election yet.</p>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="vote-submit">
          <button
            onClick={handleVote}
            className="btn btn--primary btn--lg"
            disabled={!selectedCandidate || submitting}
          >
            {submitting ? 'Casting vote...' : 'Confirm & Cast Vote'}
          </button>
        </div>
      )}
    </div>
  );
}
