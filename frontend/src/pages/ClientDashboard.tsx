import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { caseHistoryAPI } from '../api/client';
import { CaseHistory } from '../types';

export default function ClientDashboard() {
  const [caseHistories, setCaseHistories] = useState<CaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCaseHistories();
  }, []);

  const loadCaseHistories = async () => {
    try {
      const { caseHistories } = await caseHistoryAPI.getAll();
      setCaseHistories(caseHistories);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load case histories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Case Histories</h1>
          <Link
            to="/client/intake"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            New Intake Form
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {caseHistories.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't submitted any intake forms yet.</p>
            <Link
              to="/client/intake"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Submit Your First Intake Form
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {caseHistories.map((caseHistory) => (
                <li key={caseHistory.id}>
                  <Link
                    to={`/case-history/${caseHistory.id}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            Case #{caseHistory.id.slice(0, 8)}
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {caseHistory.intakeForm ? 'Submitted' : 'Draft'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p>
                            Provider: {caseHistory.provider?.providerProfile?.firstName} {caseHistory.provider?.providerProfile?.lastName}
                            {caseHistory.provider?.providerProfile?.clinicName && ` - ${caseHistory.provider.providerProfile.clinicName}`}
                          </p>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Submitted: {caseHistory.intakeForm ? new Date(caseHistory.intakeForm.submittedAt).toLocaleDateString() : 'Not submitted'}
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
