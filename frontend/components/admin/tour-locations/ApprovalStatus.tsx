'use client';

import { useState } from 'react';
import { approveTourLocation } from '@/lib/tour-location';

interface ApprovalStatusProps {
  locationId: string;
  contentApproved: boolean;
  approvedAt?: Date | null;
  approvalNotes?: string | null;
  onApprovalChange?: (approved: boolean) => void;
}

export default function ApprovalStatus({
  locationId,
  contentApproved,
  approvedAt,
  approvalNotes,
  onApprovalChange,
}: ApprovalStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Get status badge color
  const getStatusColor = () => {
    if (contentApproved) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  // Get status text
  const getStatusText = () => {
    if (contentApproved) return 'Approved';
    return 'Pending Review';
  };

  // Handle approval action
  const handleAction = async (approve: boolean) => {
    setAction(approve ? 'approve' : 'reject');
    if (!approve && !rejectNotes.trim()) {
      setError('Please provide rejection notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await approveTourLocation(locationId, approve, rejectNotes);
      showToast(
        approve ? 'Location approved successfully' : 'Location rejected',
        'success'
      );
      if (onApprovalChange) {
        onApprovalChange(approve);
      }
      setShowModal(false);
      setRejectNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to update approval status');
      showToast(
        err.message || 'Failed to update approval status',
        'error'
      );
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>

          {/* Approved Info */}
          {contentApproved && approvedAt && (
            <div className="text-sm text-gray-600">
              Approved on{' '}
              <time dateTime={approvedAt.toString()}>
                {new Date(approvedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
          )}
        </div>

        {/* Approval Notes */}
        {approvalNotes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Approval Notes</p>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">{approvalNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!contentApproved && (
            <>
              <button
                onClick={() => setShowModal(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isLoading && action === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => {
                  setAction('reject');
                  setShowModal(true);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isLoading && action === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          )}
          {contentApproved && (
            <button
              onClick={() => {
                setAction('reject');
                setShowModal(true);
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isLoading && action === 'reject' ? 'Rejecting...' : 'Revoke Approval'}
            </button>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {action === 'approve'
                  ? 'Approve Location'
                  : contentApproved
                    ? 'Revoke Approval'
                    : 'Reject Location'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {action === 'approve'
                  ? 'This will mark the location as approved and make it visible.'
                  : 'Please provide notes explaining why this content is being rejected.'}
              </p>
            </div>

            {/* Notes Input */}
            {action !== 'approve' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rejection Notes
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => {
                    setRejectNotes(e.target.value);
                    setError(null);
                  }}
                  placeholder="Explain the reason for rejection..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectNotes('');
                  setError(null);
                  setAction(null);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(action === 'approve')}
                disabled={isLoading || (action !== 'approve' && !rejectNotes.trim())}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading
                  ? 'Processing...'
                  : action === 'approve'
                    ? 'Approve'
                    : contentApproved
                      ? 'Revoke'
                      : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
