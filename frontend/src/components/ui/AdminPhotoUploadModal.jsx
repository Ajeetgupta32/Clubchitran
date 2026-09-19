import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const AdminPhotoUploadModal = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [studentName, setStudentName] = useState('Chitran Photo Feature');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [caption, setCaption] = useState('');
  const [activityId, setActivityId] = useState('');
  const [activities, setActivities] = useState([]);
  const [isTopPick, setIsTopPick] = useState(false);
  const [topPickRank, setTopPickRank] = useState('1');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities/public');
        if (res.data.success && res.data.activities) {
          setActivities(res.data.activities);
          if (res.data.activities.length > 0) {
            setActivityId(res.data.activities[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch activities list:', err);
      }
    };
    fetchActivities();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG, WEBP).');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB.');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a photograph to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('studentName', studentName.trim() || 'Club Photographer');
      formData.append('branch', branch.trim());
      formData.append('caption', caption.trim());
      if (activityId) {
        formData.append('activityId', activityId);
      }
      formData.append('isTopPick', isTopPick);
      if (isTopPick) {
        formData.append('topPickRank', topPickRank);
      }

      const res = await api.post('/submissions/admin-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Photograph uploaded and published to website gallery!');
        if (onUploaded) onUploaded();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading photograph');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Upload Photo to Exhibition Gallery
              </h3>
              <p className="text-xs text-stone-500">Instantly publishes verified photo on your website</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo Dropzone / File Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Photograph File *
            </label>

            {preview ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D5] bg-stone-900 group">
                <img src={preview} alt="Preview" className="w-full h-52 object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-stone-950/80 text-white rounded-full hover:bg-rose-600 transition-colors border border-white/20 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E8E2D5] hover:border-amber-700/60 rounded-2xl p-6 cursor-pointer bg-[#FAF8F5] hover:bg-amber-50/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">Click to choose image or drag & drop</p>
                <p className="text-[11px] text-stone-500 mt-1">High-resolution photography upload (JPG, PNG, WEBP)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Photographer Attribution & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Photographer Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Patel / Self"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Department / Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science & Engg"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Caption / Photograph Title
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Morning mist over Manikarnika Ghat at sunrise"
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Associated Activity */}
          {activities.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Associated Activity (Optional)
              </label>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              >
                <option value="">General Club Exhibition</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Top 3 Pick Option for Home Page */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTopPick}
                onChange={(e) => setIsTopPick(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-700 cursor-pointer"
              />
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                Feature on Home Page (Top 3 Winning Exhibition)
              </span>
            </label>

            {isTopPick && (
              <div className="flex items-center gap-3 pt-1 pl-6">
                <span className="text-xs text-stone-600 font-medium">Assign Rank:</span>
                {[
                  { rank: '1', label: '#1 Gold' },
                  { rank: '2', label: '#2 Silver' },
                  { rank: '3', label: '#3 Bronze' }
                ].map((item) => (
                  <label key={item.rank} className="flex items-center gap-1.5 text-xs text-stone-800 cursor-pointer">
                    <input
                      type="radio"
                      name="topPickRank"
                      value={item.rank}
                      checked={topPickRank === item.rank}
                      onChange={(e) => setTopPickRank(e.target.value)}
                      className="text-amber-700 focus:ring-amber-700"
                    />
                    <span className="font-semibold">{item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              {uploading ? 'Uploading Photo...' : 'Publish to Gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPhotoUploadModal;
