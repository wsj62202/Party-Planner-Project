// src/components/FlagEventButton.tsx

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

interface FlagEventButtonProps {
  eventId: string;
}

const FlagEventButton: React.FC<FlagEventButtonProps> = ({ eventId }) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError('You must be logged in to flag events');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'flaggedEvents'), {
        eventId,
        reporterId: user.uid,
        reason,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      setShowModal(false);
      setReason('');
    } catch (err) {
      console.error('Error flagging event:', err);
      setError('Failed to flag event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center text-red-500 hover:text-red-600"
      >
        <Flag size={16} className="mr-1" />
        Flag Event
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Flag Event</h3>

            <form onSubmit={handleFlag}>
              <div className="mb-4">
                <label className="block text-blue-800 mb-2">
                  Reason for flagging
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded"
                  rows={4}
                  required
                />
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                >
                  {loading ? 'Submitting...' : 'Submit Flag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagEventButton;