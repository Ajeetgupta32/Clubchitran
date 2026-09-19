import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Users, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUrl';

export const ActivityModal = ({ activity, onClose, onSaved }) => {
  const isEditing = Boolean(activity);

  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [category, setCategory] = useState(activity?.category || 'Technical');
  const [venue, setVenue] = useState(activity?.venue || '');
  const [eventDate, setEventDate] = useState(
    activity?.eventDate ? new Date(activity.eventDate).toISOString().slice(0, 16) : ''
  );
  const [deadline, setDeadline] = useState(
    activity?.deadline ? new Date(activity.deadline).toISOString().slice(0, 16) : ''
  );
  const [selectedCoordinators, setSelectedCoordinators] = useState(
    activity?.coordinators ? activity.coordinators.map((c) => c.coordinator?.id || c.coordinatorId) : []
  );
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(activity?.bannerUrl || null);

  const [availableCoordinators, setAvailableCoordinators] = useState([]);
  const [loadingCoords, setLoadingCoords] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const res = await api.get('/users/coordinators');
        if (res.data.success) {
          setAvailableCoordinators(res.data.coordinators || []);
        }
      } catch (error) {
        console.error('Error fetching coordinators:', error);
      } finally {
        setLoadingCoords(false);
      }
    };

    fetchCoordinators();
  }, []);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const toggleCoordinator = (coordId) => {
    if (selectedCoordinators.includes(coordId)) {
      setSelectedCoordinators(selectedCoordinators.filter((id) => id !== coordId));
    } else {
      setSelectedCoordinators([...selectedCoordinators, coordId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category || !venue || !eventDate || !deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('venue', venue.trim());
      formData.append('eventDate', new Date(eventDate).toISOString());
      formData.append('deadline', new Date(deadline).toISOString());
      formData.append('coordinatorIds', JSON.stringify(selectedCoordinators));

      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      if (isEditing) {
        const res = await api.put(`/activities/${activity.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          toast.success('Activity updated successfully!');
          onSaved();
          onClose();
        }
      } else {
        const res = await api.post('/activities', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          toast.success('Activity created and published successfully!');
          onSaved();
          onClose();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">
              {isEditing ? 'Edit Club Activity' : 'Create New Club Activity'}
            </h3>
            <p className="text-xs text-stone-500">Configure event details and assign coordinators</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Activity Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Photography Walk 2026"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] focus:ring-2 focus:ring-amber-700 outline-none bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] focus:ring-2 focus:ring-amber-700 outline-none bg-[#FDFCFB] text-stone-900"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
                <option value="Academic">Academic</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>

          {/* Venue & Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Venue / Location *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Main Auditorium / Lab 3"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] focus:ring-2 focus:ring-amber-700 outline-none bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Banner Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5F0E8] file:text-stone-800 hover:file:bg-stone-200"
              />
              {bannerPreview && (
                <div className="mt-2 relative h-20 w-full rounded-xl overflow-hidden border border-[#E8E2D5] bg-stone-900 group">
                  <img
                    src={bannerPreview.startsWith('blob:') ? bannerPreview : (resolveImageUrl(bannerPreview) || bannerPreview)}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    className="absolute top-1 right-1 px-2 py-0.5 bg-stone-900/80 text-white rounded-md text-[10px] font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dates: Event Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Event Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] focus:ring-2 focus:ring-amber-700 outline-none bg-[#FDFCFB] text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Registration Deadline *</label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] focus:ring-2 focus:ring-amber-700 outline-none bg-[#FDFCFB] text-stone-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Description & Guidelines *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the activity, rules, and expectations..."
              className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] focus:ring-2 focus:ring-amber-700 outline-none bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Coordinator Assignment Section */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Assign Activity Coordinators
            </label>
            {loadingCoords ? (
              <p className="text-xs text-stone-400">Loading coordinators...</p>
            ) : availableCoordinators.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No coordinators available to assign.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
                {availableCoordinators.map((coord) => {
                  const isChecked = selectedCoordinators.includes(coord.id);
                  return (
                    <div
                      key={coord.id}
                      onClick={() => toggleCoordinator(coord.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer border text-xs transition-all ${
                        isChecked
                          ? 'bg-amber-50 border-amber-300 text-stone-900 font-semibold shadow-2xs'
                          : 'bg-white border-[#E8E2D5] text-stone-600 hover:bg-[#F5F0E8] hover:text-stone-900'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-stone-900 border-stone-900 text-white' : 'border-[#E8E2D5] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-semibold text-stone-900">{coord.name}</p>
                        <p className="text-[10px] text-stone-500">{coord.department}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Activity' : 'Publish Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;
