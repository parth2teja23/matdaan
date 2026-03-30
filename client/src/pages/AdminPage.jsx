import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Shield, Plus, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminPage() {
  const [elections, setElections] = useState([]);
  const [showElectionForm, setShowElectionForm] = useState(false);
  const [expandedElection, setExpandedElection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Election form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creatingElection, setCreatingElection] = useState(false);

  // Candidate form
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [candidateManifesto, setCandidateManifesto] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

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

  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      toast.error('Title, start date and end date are required');
      return;
    }
    setCreatingElection(true);
    try {
      await api.post('/elections', {
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      toast.success('Election created!');
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setShowElectionForm(false);
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create election');
    } finally {
      setCreatingElection(false);
    }
  };

  const handleAddCandidate = async (e, electionId) => {
    e.preventDefault();
    if (!candidateName || !candidateParty) {
      toast.error('Name and party are required');
      return;
    }
    setAddingCandidate(true);
    try {
      await api.post(`/elections/${electionId}/candidates`, {
        name: candidateName,
        party: candidateParty,
        manifesto: candidateManifesto || undefined,
      });
      toast.success('Candidate added!');
      setCandidateName('');
      setCandidateParty('');
      setCandidateManifesto('');
      // Refresh candidates
      setExpandedElection(null);
      setTimeout(() => setExpandedElection(electionId), 50);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setAddingCandidate(false);
    }
  };

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Shield size={28} /> Admin Panel</h1>
        <p>Manage elections and candidates</p>
      </div>

      {/* Create Election */}
      <div className="admin-section">
        <button
          className="btn btn--primary"
          onClick={() => setShowElectionForm(!showElectionForm)}
        >
          <Plus size={18} /> New Election
        </button>

        {showElectionForm && (
          <form onSubmit={handleCreateElection} className="admin-form">
            <h3>Create Election</h3>
            <div className="form-grid">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Election title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={creatingElection}>
                {creatingElection ? 'Creating...' : 'Create Election'}
              </button>
              <button type="button" className="btn btn--outline" onClick={() => setShowElectionForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Elections list with candidate management */}
      <div className="admin-elections">
        <h2>All Elections ({elections.length})</h2>

        {elections.map((election) => (
          <ElectionAdminCard
            key={election.id}
            election={election}
            isExpanded={expandedElection === election.id}
            onToggle={() =>
              setExpandedElection(expandedElection === election.id ? null : election.id)
            }
            candidateName={candidateName}
            candidateParty={candidateParty}
            candidateManifesto={candidateManifesto}
            setCandidateName={setCandidateName}
            setCandidateParty={setCandidateParty}
            setCandidateManifesto={setCandidateManifesto}
            onAddCandidate={handleAddCandidate}
            addingCandidate={addingCandidate}
          />
        ))}
      </div>
    </div>
  );
}

function ElectionAdminCard({
  election,
  isExpanded,
  onToggle,
  candidateName,
  candidateParty,
  candidateManifesto,
  setCandidateName,
  setCandidateParty,
  setCandidateManifesto,
  onAddCandidate,
  addingCandidate,
}) {
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchCandidates();
    }
  }, [isExpanded]);

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await api.get(`/elections/${election.id}/candidates`);
      setCandidates(res.data.candidates);
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoadingCandidates(false);
    }
  };

  return (
    <div className="admin-election-card">
      <div className="admin-election-card__header" onClick={onToggle}>
        <div>
          <h3>{election.title}</h3>
          <span className="admin-election-date">
            <Calendar size={14} />
            {new Date(election.startDate).toLocaleDateString()} — {new Date(election.endDate).toLocaleDateString()}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="admin-election-card__body">
          <h4><Users size={16} /> Candidates ({candidates.length})</h4>

          {loadingCandidates ? (
            <p className="text-muted">Loading candidates...</p>
          ) : (
            <>
              {candidates.length > 0 && (
                <div className="admin-candidates-list">
                  {candidates.map((c) => (
                    <div key={c.id} className="admin-candidate-row">
                      <strong>{c.name}</strong>
                      <span className="candidate-party">{c.party}</span>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  onAddCandidate(e, election.id);
                  setTimeout(fetchCandidates, 500);
                }}
                className="admin-candidate-form"
              >
                <h5>Add Candidate</h5>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Candidate name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Party name"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Manifesto (optional)"
                  value={candidateManifesto}
                  onChange={(e) => setCandidateManifesto(e.target.value)}
                  className="full-width-input"
                />
                <button type="submit" className="btn btn--primary btn--sm" disabled={addingCandidate}>
                  {addingCandidate ? 'Adding...' : 'Add Candidate'}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
