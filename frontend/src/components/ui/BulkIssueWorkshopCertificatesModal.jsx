import React, { useState, useEffect } from 'react';
import { X, Award, Users, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const BulkIssueWorkshopCertificatesModal = ({ onClose, onIssued }) => {
  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [issuing, setIssuing] = useState(false);

  // Customization
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // Selected Activity Info
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const res = await api.get('/activities/public');
        if (res.data.success && res.data.activities?.length > 0) {
          setActivities(res.data.activities);
          setSelectedActivityId(res.data.activities[0].id);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        toast.error('Failed to load workshops list');
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      setCustomTitle(`Certificate of Participation - ${selectedActivity.title}`);
      const formattedDate = new Date(selectedActivity.eventDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setCustomDescription(
        `Awarded for active visual creativity, dedicated presence, and successful completion of the "${selectedActivity.title}" workshop held at ${selectedActivity.venue || 'Campus Center'} on ${formattedDate}.`
      );
    }
  }, [selectedActivityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivityId) {
      toast.error('Please select a workshop or activity');
      return;
    }

    try {
      setIssuing(true);
      const res = await api.post('/certificates/admin/issue-workshop-attendees', {
        activityId: selectedActivityId,
        customTitle: customTitle.trim(),
        customDescription: customDescription.trim()
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Certificates successfully issued!');
        if (onIssued) onIssued();
        onClose();
      }
    } catch (err) {
      console.error('Issue attendee certificates error:', err);
      toast.error(err.response?.data?.message || 'Failed to issue certificates');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden border border-[#E8E2D5] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Send Certificates to All Attendees</h2>
              <p className="text-xs text-stone-400">1-Click verified digital certificates for workshop members</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Workshop Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Select Workshop / Activity
            </label>
            {loadingActivities ? (
              <div className="py-2 text-xs text-stone-400">Loading activities...</div>
            ) : (
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
              >
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Activity Summary Info */}
          {selectedActivity && (
            <div className="p-4 rounded-2xl bg-[#F5F0E8] border border-[#E8E2D5] space-y-2 text-xs text-stone-700">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>{selectedActivity.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-400 text-[10px] uppercase">
                  {selectedActivity.category}
                </span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Venue: {selectedActivity.venue} • Event Date:{' '}
                {new Date(selectedActivity.eventDate).toLocaleDateString()}
              </p>
              <div className="pt-2 border-t border-[#E8E2D5] flex items-center gap-2 text-[11px] text-amber-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Only students with marked/verified attendance (Present) will receive this credential. Duplicate issuing is automatically prevented.
                </span>
              </div>
            </div>
          )}

          {/* Certificate Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Certificate Title Template
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Certificate of Participation - Workshop Title"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
            />
          </div>

          {/* Citation / Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Citation & Achievement Wording
            </label>
            <textarea
              rows={3}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Enter official certificate description text..."
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 leading-relaxed font-medium"
            />
          </div>

          {/* Delivery Details Note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Attribute Assignment:</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Certificates generated through this action are tagged with{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">deliveryType: DIGITAL</code> and{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">certificateType: PARTICIPATION</code>.
                Students can immediately view and download high-res copies from their student portal.
              </p>
            </div>
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
              disabled={issuing || !selectedActivityId}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {issuing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Issuing Certificates...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Send Certificates to Attendees</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkIssueWorkshopCertificatesModal;
