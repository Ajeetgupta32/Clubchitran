import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const PhotoUploadModal = ({ activity, onClose, onUploaded, previousRejectionReason }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!activity) return null;

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
      toast.error('Please select a photo proof to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('activityId', activity.id);
      formData.append('photo', file);
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Photograph uploaded! Pending coordinator verification.');
        onUploaded();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading proof photograph');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              {previousRejectionReason ? 'Re-upload Proof Photograph' : 'Upload Participation Proof'}
            </h3>
            <p className="text-xs text-stone-500 truncate max-w-sm">{activity.title}</p>
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
          {previousRejectionReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <span className="font-bold text-rose-800">Previous Submission Rejected: </span>
                <span>{previousRejectionReason}</span>
              </div>
            </div>
          )}

          {/* Photo Dropzone / File Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Activity Photo (Selfie at venue or with badge)
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
                <p className="text-[11px] text-stone-500 mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Optional Caption */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Caption / Participation Note (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Attended session at CS Lab 4, team #12"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-950">Notice:</strong> Uploading photo does not mark attendance immediately.
              A coordinator will review and verify your proof to confirm your attendance.
            </p>
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
              {uploading ? 'Uploading...' : 'Submit Photo Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
