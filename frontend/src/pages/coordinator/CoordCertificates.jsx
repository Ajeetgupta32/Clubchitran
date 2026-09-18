import React, { useState, useEffect } from 'react';
import { Award, Plus, Clock, CheckCircle2, XCircle, Eye, Building2 } from 'lucide-react';
import RequestCertificateModal from '../../components/ui/RequestCertificateModal';
import CertificateModal from '../../components/ui/CertificateModal';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const CoordCertificates = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/coordinator/requests');
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load certificate requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <span>Certificate Requests</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {requests.length} Requests
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Recommend outstanding students from your assigned branch to Admin for official certificates
          </p>
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Request Student Certificate</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Proposed Title</th>
                <th className="px-5 py-4">Event / Context</th>
                <th className="px-5 py-4">Justification Note</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Submitted</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-stone-400">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-stone-400">
                    No certificate requests submitted yet. Click "Request Student Certificate" to propose one.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-900">{req.studentName}</p>
                      <p className="text-[11px] text-stone-500">{req.branch}</p>
                      {req.student?.studentId && (
                        <span className="text-[10px] text-amber-800 font-medium">Roll: {req.student.studentId}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-stone-800">
                      {req.title}
                    </td>
                    <td className="px-5 py-3.5 text-stone-700 font-medium">
                      {req.activity?.title || 'General Recognition'}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-5 py-3.5">
                      {req.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Pending Admin
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Approved & Issued
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            Declined
                          </span>
                          {req.rejectionReason && (
                            <p className="text-[10px] text-stone-500 mt-1 italic">{req.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {req.certificate ? (
                        <button
                          onClick={() => setSelectedCertificate(req.certificate)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Cert</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Modal */}
      {requestModalOpen && (
        <RequestCertificateModal
          onClose={() => setRequestModalOpen(false)}
          onSubmitted={() => fetchRequests()}
        />
      )}

      {/* View Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};

export default CoordCertificates;
