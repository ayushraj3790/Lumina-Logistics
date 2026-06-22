import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDriverApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_URL}/driver-applications`, {
        params,
        withCredentials: true,
      });
      setApplications(response.data.applications);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (application, actionType) => {
    setSelectedApplication(application);
    setAction(actionType);
    setReason('');
    setNotes('');
    setShowModal(true);
  };

  const submitAction = async () => {
    if (!selectedApplication) return;

    if (action === 'reject' && !reason) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      let endpoint = '';
      const data = { notes };

      if (action === 'approve') {
        endpoint = `${API_URL}/driver-applications/${selectedApplication._id}/approve`;
      } else if (action === 'reject') {
        endpoint = `${API_URL}/driver-applications/${selectedApplication._id}/reject`;
        data.reason = reason;
      } else if (action === 'suspend') {
        endpoint = `${API_URL}/driver-applications/${selectedApplication._id}/suspend`;
        data.reason = reason;
      } else if (action === 'activate') {
        endpoint = `${API_URL}/driver-applications/${selectedApplication._id}/activate`;
      }

      await axios.post(endpoint, data, { withCredentials: true });
      toast.success(`Driver ${action}ed successfully`);
      setShowModal(false);
      fetchApplications();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lumina-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Driver Applications</h1>
        <select
          className="input-field w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4">Driver</th>
              <th className="text-left p-4">Vehicle</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Applied</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-b border-slate-700 hover:bg-slate-800/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{app.fullName}</p>
                    <p className="text-sm text-slate-400">{app.email}</p>
                    <p className="text-sm text-slate-400">{app.phone}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="capitalize">{app.vehicleType}</p>
                  <p className="text-sm text-slate-400">{app.vehicleNumber}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-400">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {app.status === 'pending' || app.status === 'under_review' ? (
                      <>
                        <button
                          onClick={() => handleAction(app, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(app, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    ) : app.status === 'approved' ? (
                      <button
                        onClick={() => handleAction(app, 'suspend')}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Suspend
                      </button>
                    ) : app.status === 'suspended' ? (
                      <button
                        onClick={() => handleAction(app, 'activate')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Activate
                      </button>
                    ) : null}
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <p className="text-center py-8 text-slate-400">No applications found</p>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {action === 'approve' ? 'Approve Driver' : action === 'reject' ? 'Reject Driver' : action === 'suspend' ? 'Suspend Driver' : 'Activate Driver'}
            </h2>
            
            {(action === 'reject' || action === 'suspend') && (
              <div className="mb-4">
                <label className="block text-sm mb-2">Reason</label>
                <textarea
                  className="input-field w-full"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  required
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm mb-2">Notes (Optional)</label>
              <textarea
                className="input-field w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                className="btn-primary flex-1"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedApplication && !showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Driver Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lumina-600 mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-slate-400">Name:</span> {selectedApplication.fullName}</p>
                  <p><span className="text-slate-400">Email:</span> {selectedApplication.email}</p>
                  <p><span className="text-slate-400">Phone:</span> {selectedApplication.phone}</p>
                  <p><span className="text-slate-400">Aadhaar:</span> {selectedApplication.aadhaar}</p>
                  <p><span className="text-slate-400">PAN:</span> {selectedApplication.pan}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lumina-600 mb-2">License Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-slate-400">License Number:</span> {selectedApplication.licenseNumber}</p>
                  <p><span className="text-slate-400">License:</span> <a href={selectedApplication.licenseUpload} target="_blank" className="text-lumina-600 hover:underline">View Document</a></p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lumina-600 mb-2">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-slate-400">Vehicle Type:</span> <span className="capitalize">{selectedApplication.vehicleType}</span></p>
                  <p><span className="text-slate-400">Vehicle Number:</span> {selectedApplication.vehicleNumber}</p>
                  <p><span className="text-slate-400">RC:</span> <a href={selectedApplication.rcUpload} target="_blank" className="text-lumina-600 hover:underline">View Document</a></p>
                  <p><span className="text-slate-400">Insurance:</span> <a href={selectedApplication.insuranceUpload} target="_blank" className="text-lumina-600 hover:underline">View Document</a></p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lumina-600 mb-2">Bank Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-slate-400">Bank:</span> {selectedApplication.bankName}</p>
                  <p><span className="text-slate-400">Account Holder:</span> {selectedApplication.accountHolder}</p>
                  <p><span className="text-slate-400">Account:</span> {selectedApplication.accountNumber}</p>
                  <p><span className="text-slate-400">IFSC:</span> {selectedApplication.ifsc}</p>
                  <p><span className="text-slate-400">Cheque:</span> <a href={selectedApplication.cancelledChequeUpload} target="_blank" className="text-lumina-600 hover:underline">View Document</a></p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lumina-600 mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-slate-400">Name:</span> {selectedApplication.emergencyContactName}</p>
                  <p><span className="text-slate-400">Phone:</span> {selectedApplication.emergencyContactPhone}</p>
                  <p><span className="text-slate-400">Relation:</span> {selectedApplication.emergencyContactRelation}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lumina-600 mb-2">Address</h3>
                <p className="text-sm">{selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state} - {selectedApplication.pincode}</p>
              </div>

              {selectedApplication.status !== 'pending' && (
                <div>
                  <h3 className="font-semibold text-lumina-600 mb-2">Review Information</h3>
                  <div className="text-sm">
                    <p><span className="text-slate-400">Status:</span> <span className={`px-2 py-1 rounded ${getStatusColor(selectedApplication.status)}`}>{selectedApplication.status.replace('_', ' ')}</span></p>
                    {selectedApplication.rejectionReason && (
                      <p><span className="text-slate-400">Rejection Reason:</span> {selectedApplication.rejectionReason}</p>
                    )}
                    {selectedApplication.notes && (
                      <p><span className="text-slate-400">Notes:</span> {selectedApplication.notes}</p>
                    )}
                    {selectedApplication.reviewedBy && (
                      <p><span className="text-slate-400">Reviewed By:</span> {selectedApplication.reviewedBy?.name}</p>
                    )}
                    {selectedApplication.reviewedAt && (
                      <p><span className="text-slate-400">Reviewed At:</span> {new Date(selectedApplication.reviewedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.status === 'pending' || selectedApplication.status === 'under_review' ? (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => { setSelectedApplication(null); handleAction(selectedApplication, 'approve'); }}
                    className="btn-primary flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { setSelectedApplication(null); handleAction(selectedApplication, 'reject'); }}
                    className="btn-secondary flex-1"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
