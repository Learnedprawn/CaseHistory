import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { caseHistoryAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function IntakeFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    presentingProblem: '',
    medicalHistory: '',
    mentalHealthHistory: '',
    medications: '',
    consentAcknowledged: false,
    freeTextNotes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.consentAcknowledged) {
      setError('You must acknowledge consent to proceed');
      return;
    }

    setLoading(true);

    try {
      const { caseHistory } = await caseHistoryAPI.create(formData);
      navigate(`/case-history/${caseHistory.id}`);
    } catch (err: any) {
      // Backend validation errors come back as { errors: [{ msg, path, ... }, ...] }
      const backend = err.response?.data;
      const firstValidationMsg = Array.isArray(backend?.errors) ? backend.errors[0]?.msg : undefined;
      setError(firstValidationMsg || backend?.error || 'Failed to submit intake form');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'CLIENT') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Only clients can submit intake forms.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Intake Form</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="presentingProblem" className="block text-sm font-medium text-gray-700 mb-2">
                Presenting Problem
              </label>
              <textarea
                id="presentingProblem"
                name="presentingProblem"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe the primary reason for seeking services..."
                value={formData.presentingProblem}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please list any relevant medical conditions, surgeries, or health concerns..."
                value={formData.medicalHistory}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="mentalHealthHistory" className="block text-sm font-medium text-gray-700 mb-2">
                Mental Health History
              </label>
              <textarea
                id="mentalHealthHistory"
                name="mentalHealthHistory"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe any previous mental health treatment, diagnoses, or therapy experiences..."
                value={formData.mentalHealthHistory}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <textarea
                id="medications"
                name="medications"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please list all current medications, including dosages if known..."
                value={formData.medications}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="freeTextNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="freeTextNotes"
                name="freeTextNotes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information you'd like to share..."
                value={formData.freeTextNotes}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-start">
              <input
                id="consentAcknowledged"
                name="consentAcknowledged"
                type="checkbox"
                checked={formData.consentAcknowledged}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                required
              />
              <label htmlFor="consentAcknowledged" className="ml-3 text-sm text-gray-700">
                I acknowledge that I have read and understand the privacy policy and consent to the collection and use of my information for treatment purposes.
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/client/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.consentAcknowledged}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Intake Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
