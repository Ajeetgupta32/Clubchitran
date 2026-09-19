import React, { useState, useEffect } from 'react';
import { Award, Download, Eye, Calendar, Sparkles, Trophy, CheckCircle2, PackageCheck, Clock } from 'lucide-react';
import CertificateModal from '../../components/ui/CertificateModal';
import toast from 'react-hot-toast';
import api from '../../services/api';

const getPhysicalStatusBadge = (status) => {
  switch (status) {
    case 'PRINTED':
      return { label: '📜 Printed & Embossed', color: 'bg-blue-50 text-blue-900 border-blue-200' };
    case 'READY_FOR_COLLECTION':
      return { label: '📍 Ready for Collection', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' };
    case 'DISPATCHED':
      return { label: '🚚 Dispatched', color: 'bg-purple-50 text-purple-900 border-purple-200' };
    case 'HANDED_OVER':
      return { label: '🎖️ Handed Over', color: 'bg-stone-100 text-stone-800 border-stone-300' };
    case 'PENDING_PRINT':
    default:
      return { label: '🖨️ In Print Queue', color: 'bg-amber-50 text-amber-900 border-amber-200' };
  }
};

export const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/my');
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <span>My Official Certificates</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              {certificates.length} Issued
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Official credentials & awards earned from Chitran Photography Club events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-[#F5F0E8] border border-[#E8E2D5] text-amber-900 text-xs font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-700" />
            <span>Verifiable Credentials</span>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2D5] shadow-xs">
          <p className="text-stone-500 text-sm">Loading your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E8E2D5] shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No Certificates Issued Yet</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Participate in club activities, upload your photography proofs, and get recognized in the Top 3 Photo Picks or receive coordinator recommendations to earn official certificates!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-[#E8E2D5] hover:border-amber-700/50 p-5 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 duration-200 group"
            >
              <div className="space-y-3">
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F0E8] text-stone-600 border border-[#E8E2D5]">
                    {cert.certificateNo}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {cert.deliveryType === 'PHYSICAL' || cert.isPhysical ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                        <Trophy className="w-3 h-3 text-amber-700" />
                        {cert.rank ? `Physical • Rank #${cert.rank}` : 'Physical Award'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {cert.certificateType === 'PARTICIPATION' ? 'Digital Attendee' : 'Verified'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Certificate Title */}
                <div>
                  <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-amber-800 transition-colors">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {cert.description || 'Awarded for active visual excellence in club events.'}
                  </p>
                </div>

                {/* Physical Certificate Collection Status Callout */}
                {(cert.deliveryType === 'PHYSICAL' || cert.isPhysical) && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <PackageCheck className="w-3.5 h-3.5 text-amber-700" />
                        Physical Copy:
                      </span>
                      {(() => {
                        const b = getPhysicalStatusBadge(cert.physicalStatus);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${b.color}`}>
                            {b.label}
                          </span>
                        );
                      })()}
                    </div>
                    {cert.physicalRemarks && (
                      <p className="text-[10px] text-amber-800/80 italic pt-0.5">
                        Note: {cert.physicalRemarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center justify-between">
                    <span>Issued To:</span>
                    <span className="font-semibold text-stone-900">{cert.studentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="font-medium text-stone-800">{cert.branch}</span>
                  </div>
                  {cert.activity && (
                    <div className="flex items-center justify-between">
                      <span>Event:</span>
                      <span className="font-medium text-amber-800 truncate max-w-[160px]">{cert.activity.title}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D5]">
                    <span>Award Date:</span>
                    <span className="font-medium text-stone-900">
                      {new Date(cert.issuedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2">
                <button
                  onClick={() => setSelectedCertificate(cert)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 shadow-xs transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>View & Download Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View & Download Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};

export default StudentCertificates;
