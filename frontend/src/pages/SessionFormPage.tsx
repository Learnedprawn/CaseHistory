import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { sessionLogAPI, caseHistoryAPI } from '../api/client';
import { CaseHistory } from '../types';
import { useAuth } from '../context/AuthContext';

export default function SessionFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [caseHistories, setCaseHistories] = useState<CaseHistory[]>([]);
  const [selectedCaseHistoryId, setSelectedCaseHistoryId] = useState<string>(
    searchParams.get('caseHistoryId') || ''
  );
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    presentingTopics: '',
    therapistObservations: '',
    clientAffect: '',
    interventionsUsed: '',
    progressNotes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    if (user?.role !== 'PROVIDER') {
      navigate('/provider/dashboard');
      return;
    }
    loadCaseHistories();
  }, [user, navigate]);

  const loadCaseHistories = async () => {
    try {
      const { caseHistories } = await caseHistoryAPI.getAll();
      setCaseHistories(caseHistories.filter(ch => ch.intakeForm)); // Only show cases with completed intake
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load case histories');
    } finally {
      setLoadingCases(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCaseHistoryId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);

    try {
      await sessionLogAPI.create({
        caseHistoryId: selectedCaseHistoryId,
        ...formData,
      });
      navigate(`/case-history/${selectedCaseHistoryId}`);
    } catch (err: any) {
      const backend = err.response?.data;
      const firstValidationMsg = Array.isArray(backend?.errors) ? backend.errors[0]?.msg : undefined;
      setError(firstValidationMsg || backend?.error || 'Failed to submit session log');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'PROVIDER') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Only providers can create session logs.</p>
        </div>
      </Layout>
    );
  }

  if (loadingCases) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">New Therapy Session</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="selectedCaseHistoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Client *
              </label>
              <select
                id="selectedCaseHistoryId"
                name="selectedCaseHistoryId"
                required
                value={selectedCaseHistoryId}
                onChange={(e) => setSelectedCaseHistoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a client --</option>
                {caseHistories.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.client?.clientProfile?.firstName} {ch.client?.clientProfile?.lastName}
                    {ch.client?.email && ` (${ch.client.email})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700 mb-2">
                Session Date
              </label>
              <input
                id="sessionDate"
                name="sessionDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.sessionDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="presentingTopics" className="block text-sm font-medium text-gray-700 mb-2">
                Presenting Topics
              </label>
              <textarea
                id="presentingTopics"
                name="presentingTopics"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Topics discussed during this session..."
                value={formData.presentingTopics}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="therapistObservations" className="block text-sm font-medium text-gray-700 mb-2">
                Therapist Observations
              </label>
              <textarea
                id="therapistObservations"
                name="therapistObservations"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your clinical observations..."
                value={formData.therapistObservations}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="clientAffect" className="block text-sm font-medium text-gray-700 mb-2">
                Client Affect
              </label>
              <textarea
                id="clientAffect"
                name="clientAffect"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observed mood, affect, and presentation..."
                value={formData.clientAffect}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="interventionsUsed" className="block text-sm font-medium text-gray-700 mb-2">
                Interventions Used
              </label>
              <textarea
                id="interventionsUsed"
                name="interventionsUsed"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Therapeutic techniques and interventions applied..."
                value={formData.interventionsUsed}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="progressNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Progress Notes
              </label>
              <textarea
                id="progressNotes"
                name="progressNotes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes on client progress, goals, and next steps..."
                value={formData.progressNotes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/provider/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedCaseHistoryId}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Session Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
