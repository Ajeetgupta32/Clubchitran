import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Edit3, 
  Building2, 
  User, 
  Calendar,
  AlertCircle,
  FileCheck,
  Trash2,
  Trophy,
  PackageCheck,
  Send,
  Sparkles,
  Medal,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CertificateModal from '../../components/ui/CertificateModal';
import EditCertificateModal from '../../components/ui/EditCertificateModal';
import DirectIssueCertificateModal from '../../components/ui/DirectIssueCertificateModal';
import ApproveCertificateModal from '../../components/ui/ApproveCertificateModal';
import BulkIssueWorkshopCertificatesModal from '../../components/ui/BulkIssueWorkshopCertificatesModal';
import IssueTopPerformerModal from '../../components/ui/IssueTopPerformerModal';

export const AdminCertificates = () => {
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'issued'
  
  // Proposals state
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState('ALL');
  const [requestSearch, setRequestSearch] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Issued certificates state
  const [certificates, setCertificates] = useState([]);
  const [certSearch, setCertSearch] = useState('');
  const [certBranch, setCertBranch] = useState('ALL');
  const [certDeliveryFilter, setCertDeliveryFilter] = useState('ALL'); // 'ALL' | 'DIGITAL' | 'PHYSICAL'
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [updatingPhysicalId, setUpdatingPhysicalId] = useState(null);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [approvingRequest, setApprovingRequest] = useState(null);
  const [directIssueOpen, setDirectIssueOpen] = useState(false);
  const [bulkWorkshopModalOpen, setBulkWorkshopModalOpen] = useState(false);
  const [topPerformerModalOpen, setTopPerformerModalOpen] = useState(false);

  // Load Requests
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const params = {};
      if (requestFilter !== 'ALL') params.status = requestFilter;
      if (requestSearch) params.search = requestSearch;
      
      const res = await api.get('/certificates/admin/requests', { params });
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error('Failed to load coordinator proposals');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load Issued Certificates
  const fetchCertificates = async () => {
    try {
      setLoadingCerts(true);
      const params = {};
      if (certSearch) params.search = certSearch;
      if (certBranch !== 'ALL') params.branch = certBranch;
      if (certDeliveryFilter !== 'ALL') params.deliveryType = certDeliveryFilter;

      const res = await api.get('/certificates/admin/all', { params });
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      toast.error('Failed to load certificates directory');
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'proposals') {
      fetchRequests();
    } else {
      fetchCertificates();
    }
  }, [activeTab, requestFilter, certBranch, certDeliveryFilter]);

  // Handle Physical Certificate Dispatch Status Update
  const handleUpdatePhysicalStatus = async (certId, status) => {
    try {
      setUpdatingPhysicalId(certId);
      const res = await api.patch(`/certificates/admin/${certId}/physical-status`, {
        physicalStatus: status
      });
      if (res.data.success) {
        toast.success(`Physical status updated: ${status.replace(/_/g, ' ')}`);
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update physical status');
    } finally {
      setUpdatingPhysicalId(null);
    }
  };

  // Handle Decline Proposal
  const handleReject = async (requestId, studentName) => {
    const reason = window.prompt(`Decline certificate proposal for ${studentName}? Enter optional reason:`, 'Insufficient participation record');
    if (reason === null) return; // User cancelled prompt

    try {
      const res = await api.put(`/certificates/admin/requests/${requestId}/reject`, {
        rejectionReason: reason || 'Declined by Administrator'
      });
      if (res.data.success) {
        toast.success('Certificate proposal declined');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline proposal');
    }
  };

  const handleDeleteCertificate = async (cert) => {
    if (window.confirm(`Are you sure you want to permanently delete / revoke Certificate ${cert.certificateNo} issued to ${cert.studentName}?`)) {
      try {
        const res = await api.delete(`/certificates/admin/${cert.id}`);
        if (res.data.success) {
          toast.success(res.data.message || 'Certificate deleted successfully');
          fetchCertificates();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete certificate');
      }
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-3">
              <span>Club Certificates Hub</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                Admin Center
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Issue digital certificates to workshop attendees, parchment physical awards to top performers, and review coordinator proposals
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setBulkWorkshopModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            title="Send bulk verified digital certificates to all attendees of an activity or workshop"
          >
            <Send className="w-4 h-4 text-emerald-300" />
            <span>Send Workshop Certs</span>
          </button>

          <button
            onClick={() => setTopPerformerModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            title="Award physical parchment certificate with rank and dispatch tracking"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Award Physical Cert</span>
          </button>

          <button
            onClick={() => setDirectIssueOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Direct Issue</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'proposals'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white border border-transparent hover:border-[#E8E2D5]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Coordinator Proposals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('issued')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'issued'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white border border-transparent hover:border-[#E8E2D5]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Issued Certificates Directory</span>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold text-[10px]">
            {certificates.length}
          </span>
        </button>
      </div>

      {/* TAB 1: COORDINATOR PROPOSALS */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
                  placeholder="Search student or branch..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-[#FDFCFB] rounded-xl border border-[#E8E2D5] text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
              <button
                onClick={fetchRequests}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    requestFilter === st
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-600 hover:text-stone-900 border border-[#E8E2D5]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Proposals Table */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Proposed Title</th>
                    <th className="px-5 py-4">Proposed By</th>
                    <th className="px-5 py-4">Justification</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {loadingRequests ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-stone-500">
                        Loading coordinator proposals...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-stone-500">
                        No proposals found matching the selected filter.
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
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-stone-800">{req.title}</p>
                          <p className="text-[11px] text-stone-600 font-medium">
                            {req.activity?.title || 'General Recognition'}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-emerald-800">{req.coordinator?.user?.name || 'Coordinator'}</p>
                          <p className="text-[10px] text-stone-400">{req.coordinator?.user?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <p className="text-stone-600 text-[11px] line-clamp-2 italic" title={req.reason}>
                            "{req.reason}"
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          {req.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                              <Clock className="w-3 h-3 text-amber-700" />
                              Pending Review
                            </span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Issued
                            </span>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 text-[11px] font-bold">
                              <XCircle className="w-3 h-3 text-rose-700" />
                              Declined
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {req.status === 'PENDING' && (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setApprovingRequest(req)}
                                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
                              >
                                Review & Issue
                              </button>
                              <button
                                onClick={() => handleReject(req.id, req.studentName)}
                                className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-700 rounded-lg text-xs font-bold border border-[#E8E2D5] transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {req.status === 'APPROVED' && (
                            <div className="inline-flex items-center gap-2">
                              {req.certificate && (
                                <>
                                  <button
                                    onClick={() => setSelectedCertificate(req.certificate)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 rounded-lg font-bold text-xs border border-[#E8E2D5] transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingCertificate(req.certificate)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 rounded-lg font-bold text-xs border border-[#E8E2D5] transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Edit</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ISSUED CERTIFICATES DIRECTORY */}
      {activeTab === 'issued' && (
        <div className="space-y-4">
          {/* Search / Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchCertificates()}
                  placeholder="Search certificate no or student..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-[#FDFCFB] rounded-xl border border-[#E8E2D5] text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
              <button
                onClick={fetchCertificates}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Delivery Type Quick Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Formats' },
                { id: 'DIGITAL', label: '🎓 Digital' },
                { id: 'PHYSICAL', label: '🏆 Physical' }
              ].map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setCertDeliveryFilter(dt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    certDeliveryFilter === dt.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-600 hover:text-stone-900 border border-[#E8E2D5]'
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={certBranch}
                onChange={(e) => setCertBranch(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E8E2D5] text-stone-800 outline-none focus:ring-2 focus:ring-amber-700"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          {/* Issued Certificates Table */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Certificate ID</th>
                    <th className="px-5 py-4">Recipient Student</th>
                    <th className="px-5 py-4">Certificate Honor / Title</th>
                    <th className="px-5 py-4">Format & Dispatch</th>
                    <th className="px-5 py-4">Issue Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {loadingCerts ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-stone-500">
                        Loading issued certificates...
                      </td>
                    </tr>
                  ) : certificates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-stone-500">
                        No issued certificates found matching the filter. Use "Send Workshop Certs" or "Award Physical Cert" to issue.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-amber-900 text-xs px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
                            {cert.certificateNo}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-stone-900">{cert.studentName}</p>
                          <p className="text-[11px] text-stone-500">{cert.branch}</p>
                          {cert.student?.studentId && (
                            <span className="text-[10px] text-stone-500 font-medium">Roll: {cert.student.studentId}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-stone-800">{cert.title}</p>
                          {cert.activity && (
                            <p className="text-[11px] text-amber-800 font-medium">{cert.activity.title}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {cert.deliveryType === 'PHYSICAL' || cert.isPhysical ? (
                            <div className="space-y-1.5 min-w-[170px]">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[10px] border border-amber-300 shadow-2xs">
                                <Trophy className="w-3 h-3 text-amber-700" />
                                {cert.rank ? `Physical Parchment • Rank #${cert.rank}` : 'Physical Parchment • Top Performer'}
                              </span>
                              <div className="flex items-center gap-1">
                                <select
                                  value={cert.physicalStatus || 'PENDING_PRINT'}
                                  onChange={(e) => handleUpdatePhysicalStatus(cert.id, e.target.value)}
                                  disabled={updatingPhysicalId === cert.id}
                                  className="text-[10px] font-semibold px-2 py-1 bg-white rounded-md border border-amber-300 text-stone-800 outline-none cursor-pointer focus:ring-1 focus:ring-amber-700 w-full"
                                >
                                  <option value="PENDING_PRINT">🖨️ Pending Print</option>
                                  <option value="PRINTED">📜 Printed & Ready</option>
                                  <option value="READY_FOR_COLLECTION">📍 Ready for Collection</option>
                                  <option value="DISPATCHED">🚚 Dispatched</option>
                                  <option value="HANDED_OVER">🎖️ Handed Over</option>
                                </select>
                              </div>
                              {cert.physicalRemarks && (
                                <p className="text-[10px] text-stone-500 italic max-w-xs truncate" title={cert.physicalRemarks}>
                                  {cert.physicalRemarks}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-bold text-[10px] border border-emerald-200">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                {cert.certificateType === 'PARTICIPATION' ? 'Digital Attendee' : 'Digital E-Certificate'}
                              </span>
                              <p className="text-[10px] text-stone-400">Verifiable E-Credential</p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-stone-600">
                          {new Date(cert.issuedDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            cert.status === 'ISSUED'
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-rose-50 text-rose-900 border border-rose-200'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            {cert.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCertificate(cert)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 rounded-lg font-bold text-xs border border-[#E8E2D5] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>View & Download</span>
                            </button>
                            <button
                              onClick={() => setEditingCertificate(cert)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 rounded-lg font-bold text-xs border border-[#E8E2D5] transition-colors cursor-pointer"
                              title="Edit Certificate Details"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCertificate(cert)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Permanently Delete / Revoke Certificate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview & Download Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* Edit Certificate Modal */}
      {editingCertificate && (
        <EditCertificateModal
          certificate={editingCertificate}
          onClose={() => setEditingCertificate(null)}
          onSaved={() => {
            fetchCertificates();
            fetchRequests();
          }}
        />
      )}

      {/* Approve & Issue Proposal Modal */}
      {approvingRequest && (
        <ApproveCertificateModal
          request={approvingRequest}
          onClose={() => setApprovingRequest(null)}
          onApproved={() => {
            fetchRequests();
            fetchCertificates();
          }}
        />
      )}

      {/* Direct Issue Certificate Modal */}
      {directIssueOpen && (
        <DirectIssueCertificateModal
          onClose={() => setDirectIssueOpen(false)}
          onIssued={() => {
            fetchCertificates();
            setActiveTab('issued');
          }}
        />
      )}

      {/* Bulk Issue Workshop Certificates to All Attendees Modal */}
      {bulkWorkshopModalOpen && (
        <BulkIssueWorkshopCertificatesModal
          onClose={() => setBulkWorkshopModalOpen(false)}
          onIssued={() => {
            fetchCertificates();
            setActiveTab('issued');
          }}
        />
      )}

      {/* Issue Top Performer Physical Certificate Modal */}
      {topPerformerModalOpen && (
        <IssueTopPerformerModal
          onClose={() => setTopPerformerModalOpen(false)}
          onIssued={() => {
            fetchCertificates();
            setActiveTab('issued');
          }}
        />
      )}
    </div>
  );
};

export default AdminCertificates;
