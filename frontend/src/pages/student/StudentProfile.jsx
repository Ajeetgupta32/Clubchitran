import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCircle,
  Mail,
  GraduationCap,
  Phone,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const student = user?.student;

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/users/student/profile', { name, phone });
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        updateUser(res.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-stone-900 text-amber-200 flex items-center justify-center text-3xl font-serif font-extrabold shadow-sm shrink-0 border border-stone-800">
          {user?.name?.charAt(0) || 'S'}
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
            <span>Student Academic Account</span>
          </div>
          <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight">{user?.name}</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Roll: <strong className="text-stone-900">{student?.studentId}</strong> • {student?.branch}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Academic Enrollment
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
              <span className="text-[11px] text-stone-500 font-semibold uppercase">Roll / Student ID</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5">{student?.studentId}</p>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
              <span className="text-[11px] text-stone-500 font-semibold uppercase">Department / Branch</span>
              <p className="font-bold text-stone-900 mt-0.5">{student?.branch}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
                <span className="text-[11px] text-stone-500 font-semibold uppercase">Section</span>
                <p className="font-bold text-stone-900 mt-0.5">Section {student?.section}</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
                <span className="text-[11px] text-stone-500 font-semibold uppercase">Year & Sem</span>
                <p className="font-bold text-stone-900 mt-0.5">{student?.year}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-xs">
          <h2 className="text-sm font-bold font-serif text-stone-900 mb-4">Personal & Contact Information</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 font-medium bg-[#FDFCFB] text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">College Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-stone-400 cursor-not-allowed font-medium"
              />
              <p className="text-[11px] text-stone-500 mt-1">College email address is managed by administrator.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 font-medium bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
