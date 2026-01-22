import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { caseHistoryAPI } from '../api/client';
import { CaseHistory } from '../types';
import { useAuth } from '../context/AuthContext';

export default function CaseHistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseHistory, setCaseHistory] = useState<CaseHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providerNotes, setProviderNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (id) {
      loadCaseHistory();
    }
  }, [id]);

  const loadCaseHistory = async () => {
    if (!id) return;
    try {
      const { caseHistory } = await caseHistoryAPI.getById(id);
      setCaseHistory(caseHistory);
      setProviderNotes(caseHistory.intakeForm?.providerNotes || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load case history');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProviderNotes = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      await caseHistoryAPI.updateProviderNotes(id, { providerNotes });
      await loadCaseHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save provider notes');
    } finally {
      setSavingNotes(false);
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

  if (error && !caseHistory) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </Layout>
    );
  }

  if (!caseHistory) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Case history not found.</p>
        </div>
      </Layout>
    );
  }

  const isProvider = user?.role === 'PROVIDER';
  const intakeForm = caseHistory.intakeForm;

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back
              </button>
              {isProvider && (
                <button
                  onClick={() => navigate(`/provider/session/new?caseHistoryId=${caseHistory.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Start New Session
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Case History #{caseHistory.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Created: {new Date(caseHistory.createdAt).toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Case Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Client: </span>
                  <span className="text-gray-600">
                    {caseHistory.client?.clientProfile?.firstName} {caseHistory.client?.clientProfile?.lastName}
                    {caseHistory.client?.email && ` (${caseHistory.client.email})`}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Provider: </span>
                  <span className="text-gray-600">
                    {caseHistory.provider?.providerProfile?.firstName} {caseHistory.provider?.providerProfile?.lastName}
                    {caseHistory.provider?.providerProfile?.clinicName && ` - ${caseHistory.provider.providerProfile.clinicName}`}
                  </span>
                </div>
              </div>
            </div>

            {intakeForm ? (
              <>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Intake Form</h2>
                  <div className="space-y-6">
                    {intakeForm.presentingProblem && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Presenting Problem</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                          {intakeForm.presentingProblem}
                        </p>
                      </div>
                    )}

                    {intakeForm.medicalHistory && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Medical History</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                          {intakeForm.medicalHistory}
                        </p>
                      </div>
                    )}

                    {intakeForm.mentalHealthHistory && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Mental Health History</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                          {intakeForm.mentalHealthHistory}
                        </p>
                      </div>
                    )}

                    {intakeForm.medications && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Medications</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                          {intakeForm.medications}
                        </p>
                      </div>
                    )}

                    {intakeForm.freeTextNotes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                          {intakeForm.freeTextNotes}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Consent</h3>
                      <p className="text-sm text-gray-600">
                        {intakeForm.consentAcknowledged ? '✓ Acknowledged' : '✗ Not acknowledged'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(intakeForm.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {isProvider && (
                  <div className="border-t pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Provider Notes</h2>
                    <textarea
                      value={providerNotes}
                      onChange={(e) => setProviderNotes(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add your clinical notes here. These notes are only visible to providers."
                    />
                    <div className="mt-4">
                      <button
                        onClick={handleSaveProviderNotes}
                        disabled={savingNotes}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {savingNotes ? 'Saving...' : 'Save Provider Notes'}
                      </button>
                    </div>
                    {intakeForm.providerNotes && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Last updated: {new Date(intakeForm.updatedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {!isProvider && intakeForm.providerNotes && (
                  <div className="border-t pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Provider Notes</h2>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                      {intakeForm.providerNotes}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Intake form not yet submitted.</p>
              </div>
            )}

            {/* Session Logs Section */}
            {caseHistory.sessionLogs && caseHistory.sessionLogs.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Therapy Sessions</h2>
                <div className="space-y-6">
                  {caseHistory.sessionLogs.map((sessionLog) => (
                    <div key={sessionLog.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          Session on {new Date(sessionLog.sessionDate).toLocaleDateString()}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(sessionLog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        {sessionLog.presentingTopics && (
                          <div>
                            <span className="font-medium text-gray-700">Presenting Topics: </span>
                            <span className="text-gray-600 whitespace-pre-wrap">{sessionLog.presentingTopics}</span>
                          </div>
                        )}
                        
                        {sessionLog.therapistObservations && (
                          <div>
                            <span className="font-medium text-gray-700">Observations: </span>
                            <span className="text-gray-600 whitespace-pre-wrap">{sessionLog.therapistObservations}</span>
                          </div>
                        )}
                        
                        {sessionLog.clientAffect && (
                          <div>
                            <span className="font-medium text-gray-700">Client Affect: </span>
                            <span className="text-gray-600 whitespace-pre-wrap">{sessionLog.clientAffect}</span>
                          </div>
                        )}
                        
                        {sessionLog.interventionsUsed && (
                          <div>
                            <span className="font-medium text-gray-700">Interventions: </span>
                            <span className="text-gray-600 whitespace-pre-wrap">{sessionLog.interventionsUsed}</span>
                          </div>
                        )}
                        
                        {sessionLog.progressNotes && (
                          <div>
                            <span className="font-medium text-gray-700">Progress Notes: </span>
                            <span className="text-gray-600 whitespace-pre-wrap">{sessionLog.progressNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {caseHistory.sessionLogs && caseHistory.sessionLogs.length === 0 && isProvider && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Therapy Sessions</h2>
                <p className="text-sm text-gray-500 mb-4">No session logs yet.</p>
                <button
                  onClick={() => navigate('/provider/session/new')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Start New Session →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
