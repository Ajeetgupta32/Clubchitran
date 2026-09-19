import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Sparkles, CheckCircle2, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const IssueTopPerformerModal = ({ onClose, onIssued }) => {
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoIssuing, setAutoIssuing] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [activityId, setActivityId] = useState('');
  const [rank, setRank] = useState('1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [physicalStatus, setPhysicalStatus] = useState('READY_FOR_COLLECTION');
  const [physicalRemarks, setPhysicalRemarks] = useState(
    'Official gold-foil parchment certificate with institutional seal & excellence medallion'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [studRes, actRes] = await Promise.all([
          api.get('/users/students'),
          api.get('/activities/public')
        ]);

        if (studRes.data.success && studRes.data.students?.length > 0) {
          setStudents(studRes.data.students);
          setStudentId(studRes.data.students[0].id);
        }

        if (actRes.data.success && actRes.data.activities?.length > 0) {
          setActivities(actRes.data.activities);
          setActivityId(actRes.data.activities[0].id);
        }
      } catch (err) {
        console.error('Error fetching modal data:', err);
        toast.error('Failed to load students or activities');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Update default title & description when rank or activity changes
  useEffect(() => {
    const selectedAct = activities.find((a) => a.id === activityId);
    const rankNum = parseInt(rank, 10);
    const rankLabel =
      rankNum === 1
        ? '1st Place Winner'
        : rankNum === 2
        ? '2nd Place Runner-Up'
        : rankNum === 3
        ? '3rd Place Honor'
        : `Rank #${rankNum} Top Performer`;

    const actName = selectedAct ? selectedAct.title : 'Exhibition';
    setTitle(`Certificate of Excellence - ${rankLabel} (${actName})`);
    setDescription(
      `Conferred with highest honors for photographic mastery, visual composition, and securing ${rankLabel} in the ${actName} creative workshop.`
    );
  }, [activityId, rank, activities]);

  // 1-Click Auto-Award to All Top 3 Photo Picks
  const handleAutoAwardTopPicks = async () => {
    if (!activityId) {
      toast.error('Please select an activity first');
      return;
    }

    try {
      setAutoIssuing(true);
      const res = await api.post('/certificates/admin/issue-top-picks', { activityId });
      if (res.data.success) {
        toast.success(res.data.message || 'Physical certificates awarded to Top 3 picks!');
        if (onIssued) onIssued();
        onClose();
      }
    } catch (err) {
      console.error('Auto award error:', err);
      toast.error(err.response?.data?.message || 'Failed to auto-issue top pick certificates');
    } finally {
      setAutoIssuing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Please select a student');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/certificates/admin/issue-top-performer', {
        studentId,
        activityId: activityId || null,
        rank: parseInt(rank, 10),
        title: title.trim(),
        description: description.trim(),
        physicalStatus,
        physicalRemarks: physicalRemarks.trim()
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Physical certificate issued successfully!');
        if (onIssued) onIssued();
        onClose();
      }
    } catch (err) {
      console.error('Issue top performer error:', err);
      toast.error(err.response?.data?.message || 'Failed to issue physical certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden border border-[#E8E2D5] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Award Physical Certificate</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                  Top Performer
                </span>
              </h2>
              <p className="text-xs text-stone-300">Official printed parchment credentials with delivery tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Auto-Award Shortcut */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3">
            <div className="text-xs text-amber-950">
              <span className="font-extrabold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-700" />
                1-Click Top 3 Auto-Award
              </span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Automatically generate physical certificates for all verified Top 3 Photo Picks of the selected activity.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoAwardTopPicks}
              disabled={autoIssuing || !activityId}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {autoIssuing ? 'Awarding...' : 'Auto-Award Top 3'}
            </button>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Top Performer (Student)
            </label>
            {loadingData ? (
              <div className="py-2 text-xs text-stone-400">Loading student directory...</div>
            ) : (
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} • {s.branch} ({s.studentId})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Activity Selector & Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Associated Workshop / Activity
              </label>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
              >
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Performer Rank
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-xs font-black text-amber-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
              >
                <option value="1">🏆 Rank #1 (Winner)</option>
                <option value="2">🥈 Rank #2 (Runner-Up)</option>
                <option value="3">🥉 Rank #3 (Honor)</option>
                <option value="4">⭐ Top Performer</option>
              </select>
            </div>
          </div>

          {/* Certificate Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Certificate Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Excellence Citation / Wording
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 leading-relaxed font-medium"
            />
          </div>

          {/* Physical Delivery Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5]">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Physical Status
              </label>
              <select
                value={physicalStatus}
                onChange={(e) => setPhysicalStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-lg text-xs font-bold text-stone-800 focus:outline-hidden"
              >
                <option value="READY_FOR_COLLECTION">📦 Ready for Collection (Office)</option>
                <option value="PRINTED">🖨️ Printed (Parchment & Seal)</option>
                <option value="PENDING_PRINT">⏳ Queued for Printing</option>
                <option value="DISPATCHED">🚚 Dispatched / In Transit</option>
                <option value="HANDED_OVER">✅ Handed Over / Presented</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Handover / Parcel Notes
              </label>
              <input
                type="text"
                value={physicalRemarks}
                onChange={(e) => setPhysicalRemarks(e.target.value)}
                placeholder="e.g. Dean Office Desk 4"
                className="w-full px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-lg text-xs text-stone-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Attributes Info */}
          <div className="text-[11px] text-amber-900 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              Tagged with <code className="font-bold">deliveryType: PHYSICAL</code> and <code className="font-bold">certificateType: TOP_PERFORMER</code>. Shows gold parchment visual badge & medal on the certificate.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !studentId}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Issuing Physical Certificate...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Award Physical Certificate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueTopPerformerModal;
