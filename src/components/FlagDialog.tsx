// src/components/FlagDialog.tsx

import React, { useState } from 'react';
import { Flag } from 'lucide-react';

interface FlagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const FlagDialog: React.FC<FlagDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }
    onSubmit(reason);
    setReason('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <Flag className="text-orange-500 w-6 h-6 mr-2" />
          <h2 className="text-xl font-bold text-blue-900">Flag Event</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-700 mb-2">
              Reason for flagging
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-orange-400"
              rows={4}
              placeholder="Please describe why you're flagging this event..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-blue-700 hover:text-blue-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Submit Flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagDialog;