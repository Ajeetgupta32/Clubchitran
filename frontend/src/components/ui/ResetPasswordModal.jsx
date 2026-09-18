import React, { useState } from 'react';
import { X, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const ResetPasswordModal = ({ targetUser, onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userId = targetUser?.userId || targetUser?.id;
  const userName = targetUser?.name || 'User';
  const userEmail = targetUser?.email || '';
  const userRole = targetUser?.role || (targetUser?.studentId ? 'Student' : 'Coordinator');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/users/reset-password', {
        userId,
        newPassword
      });

      if (res.data.success) {
        toast.success(res.data.message || `Password reset successfully for ${userName}`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user password');
    } finally {
      setSubmitting(false);
    }
  };

  const setPresetPassword = (val) => {
    setNewPassword(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Admin Password Management</h3>
              <p className="text-xs text-stone-500">Reset or set a new password for account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Target Account</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                {userRole}
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900">{userName}</p>
            <p className="text-xs text-stone-500">{userEmail}</p>
            {targetUser?.studentId && (
              <p className="text-[11px] text-amber-800 font-medium">Roll ID: {targetUser.studentId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new 6+ char password"
                className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Minimum 6 characters. The user can immediately log in with this new password.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold text-stone-600">Quick Set Presets:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPresetPassword('Student@123')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E8] text-stone-700 border border-[#E8E2D5] transition-colors cursor-pointer"
              >
                Student@123
              </button>
              <button
                type="button"
                onClick={() => setPresetPassword('Coord@123')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E8] text-stone-700 border border-[#E8E2D5] transition-colors cursor-pointer"
              >
                Coord@123
              </button>
              <button
                type="button"
                onClick={() => setPresetPassword('ResetPass@2026')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E8] text-stone-700 border border-[#E8E2D5] transition-colors cursor-pointer"
              >
                ResetPass@2026
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !newPassword || newPassword.length < 6}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              {submitting ? 'Updating...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
