import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Gift,
  Award,
  Sparkles,
  Search,
  Edit,
  CheckCircle2,
  X,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Edit Points Modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editPoints, setEditPoints] = useState(0);
  const [editAwardStatus, setEditAwardStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/leaderboard', {
        params: {
          branch: branchFilter !== 'ALL' ? branchFilter : undefined,
          limit: 100
        }
      });
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [branchFilter]);

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditPoints(student.points);
    setEditAwardStatus(student.awardStatus || '');
  };

  const handleSavePoints = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setSaving(true);
      const res = await api.patch(`/stats/student/${editingStudent.id}/points`, {
        points: Number(editPoints),
        awardStatus: editAwardStatus ? editAwardStatus.trim() : null
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Points and award status updated');
        setEditingStudent(null);
        fetchLeaderboard();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating student');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickGiftAward = async (student) => {
    const nextAward = student.awardStatus ? null : 'Monthly Star: Certificate & Gift Winner';
    try {
      const res = await api.patch(`/stats/student/${student.id}/points`, {
        awardStatus: nextAward
      });
      if (res.data.success) {
        toast.success(nextAward ? `Awarded Monthly Certificate & Gift to ${student.name}` : `Cleared award for ${student.name}`);
        fetchLeaderboard();
      }
    } catch (error) {
      toast.error('Error toggling award');
    }
  };

  const filteredLeaderboard = leaderboard.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.studentId.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>Leaderboard & Points Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-stone-900 tracking-tight">
            Student Points & Monthly Recognition
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Students earn +100 points per verified activity photograph. Recognize top-performing students with physical certificates and gifts.
          </p>
        </div>

        {/* Notice Badge */}
        <div className="p-3.5 bg-[#F5F0E8] border border-[#E8E2D5] rounded-2xl flex items-center gap-2.5 text-xs text-stone-700">
          <Gift className="w-5 h-5 text-amber-700 shrink-0" />
          <span>
            <strong className="text-stone-900">Monthly Gift Program:</strong> Recognize monthly leaders with physical gift packages and certificates.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
        </div>

        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
        >
          <option value="ALL">All Branches</option>
          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center">Rank</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-center">Section</th>
                <th className="px-6 py-4 text-center">Verified Activities</th>
                <th className="px-6 py-4 text-center">Total Points</th>
                <th className="px-6 py-4">Award Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5] text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-stone-500">
                    Loading leaderboard...
                  </td>
                </tr>
              ) : filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-stone-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((student, index) => {
                  const isTop3 = index < 3;
                  const rankMedals = ['🥇', '🥈', '🥉'];

                  return (
                    <tr key={student.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4 text-center">
                        {isTop3 ? (
                          <span className="text-lg">{rankMedals[index]}</span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#E8E2D5] text-stone-700 font-bold inline-flex items-center justify-center text-xs">
                            {student.rank || index + 1}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-stone-900">{student.name}</p>
                        <p className="text-[11px] text-stone-500">{student.studentId}</p>
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-medium">{student.branch}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded font-bold text-stone-700">
                          {student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-stone-800">
                        {student.verifiedActivitiesCount || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          {student.points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {student.awardStatus ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Gift className="w-3.5 h-3.5 text-amber-600" />
                            {student.awardStatus}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px] italic">No award set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickGiftAward(student)}
                            title="Toggle Monthly Gift Award"
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              student.awardStatus
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                : 'bg-[#F5F0E8] text-stone-600 border border-[#E8E2D5] hover:bg-amber-50 hover:text-amber-800'
                            }`}
                          >
                            <Gift className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            title="Edit Points"
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Points & Award Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">Manage Student Points</h3>
                  <p className="text-[11px] text-stone-500">{editingStudent.name} ({editingStudent.studentId})</p>
                </div>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-[#F5F0E8] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoints} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Activity Points
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFCFB] outline-none focus:ring-2 focus:ring-amber-700 font-bold text-stone-900"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditPoints(Number(editPoints) + 50)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    +50 Bonus
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPoints(Number(editPoints) + 100)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    +100 Activity
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Award Recognition Status
                </label>
                <select
                  value={editAwardStatus}
                  onChange={(e) => setEditAwardStatus(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FDFCFB] outline-none focus:ring-2 focus:ring-amber-700 text-stone-900 font-medium"
                >
                  <option value="">None (Standard Participation)</option>
                  <option value="Monthly Star: Certificate & Gift Winner">Monthly Star: Certificate & Gift Winner</option>
                  <option value="Certificate of Excellence">Certificate of Excellence</option>
                  <option value="Top Hackathon Finalist">Top Hackathon Finalist</option>
                  <option value="Robotics Club Champion">Robotics Club Champion</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Update Student Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboard;
