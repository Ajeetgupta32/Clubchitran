import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Compass,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Filter,
  Edit2,
  ShieldCheck,
  Trophy,
  Award,
  Sparkles,
  KeyRound,
  Trash2
} from 'lucide-react';
import StudentModal from '../../components/ui/StudentModal';
import EditStudentModal from '../../components/ui/EditStudentModal';
import CoordinatorModal from '../../components/ui/CoordinatorModal';
import PromoteCoordinatorModal from '../../components/ui/PromoteCoordinatorModal';
import ResetPasswordModal from '../../components/ui/ResetPasswordModal';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const AdminStudents = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'coordinators'

  const [students, setStudents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  const [meta, setMeta] = useState({ branches: [], sections: [], years: [] });
  const [branchStrength, setBranchStrength] = useState(null);

  // Modals
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [promotingStudent, setPromotingStudent] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  const fetchMeta = async () => {
    try {
      const [metaRes, strengthRes] = await Promise.all([
        api.get('/users/meta/branches-sections'),
        api.get('/users/branches/strength')
      ]);

      if (metaRes.data.success) {
        setMeta({
          branches: metaRes.data.branches || [],
          sections: metaRes.data.sections || [],
          years: metaRes.data.years || []
        });
      }

      if (strengthRes.data.success) {
        setBranchStrength(strengthRes.data.strength);
      }
    } catch (e) {
      console.error('Error fetching meta:', e);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/students', {
        params: {
          search: search || undefined,
          branch: branchFilter !== 'ALL' ? branchFilter : undefined,
          section: sectionFilter !== 'ALL' ? sectionFilter : undefined,
          year: yearFilter !== 'ALL' ? yearFilter : undefined
        }
      });
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (error) {
      toast.error('Failed to load student list');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/coordinators');
      if (res.data.success) {
        setCoordinators(res.data.coordinators || []);
      }
    } catch (error) {
      toast.error('Failed to load coordinator list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else {
      fetchCoordinators();
    }
  }, [activeTab, branchFilter, sectionFilter, yearFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'students') fetchStudents();
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to permanently delete student "${student.name}" (${student.studentId})? This will delete their account, photo submissions, and participation history.`)) {
      try {
        const res = await api.delete(`/users/students/${student.id}`);
        if (res.data.success) {
          toast.success(res.data.message || 'Student account deleted');
          fetchStudents();
          fetchMeta();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleDeleteCoordinator = async (coord) => {
    if (window.confirm(`Are you sure you want to remove coordinator "${coord.name}"?`)) {
      try {
        const res = await api.delete(`/users/coordinators/${coord.id}`);
        if (res.data.success) {
          toast.success(res.data.message || 'Coordinator removed');
          fetchCoordinators();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove coordinator');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            User Management Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage student profiles, branch breakdown, points, and assigned club coordinators
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'students' ? (
            <button
              onClick={() => setStudentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Student</span>
            </button>
          ) : (
            <button
              onClick={() => setCoordinatorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Coordinator</span>
            </button>
          )}
        </div>
      </div>

      {/* Branch Strength Overview Bar */}
      {branchStrength && (
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Branch Student Strength Breakdown</span>
            </h3>
            <span className="text-[11px] text-stone-500">Click a branch to filter table</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(branchStrength).map(([branchName, bData]) => {
              const isSelected = branchFilter === branchName;
              return (
                <div
                  key={branchName}
                  onClick={() => setBranchFilter(isSelected ? 'ALL' : branchName)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50/70 shadow-xs ring-1 ring-amber-700'
                      : 'border-[#E8E2D5] bg-[#FAF8F5] hover:bg-[#F5F0E8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-900 truncate max-w-[180px]">{branchName}</p>
                    <span className="text-xs font-black text-amber-900 bg-[#F5F0E8] border border-[#E8E2D5] px-2 py-0.5 rounded-md">
                      {bData.totalStudents} total
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {Object.entries(bData.sections || {}).map(([sec, count]) => (
                      <span
                        key={sec}
                        className="text-[10px] px-1.5 py-0.5 bg-white border border-[#E8E2D5] rounded font-semibold text-stone-700"
                      >
                        Sec {sec}: <strong className="text-stone-900">{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D5]">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'students'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coordinators')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'coordinators'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Club Coordinators ({coordinators.length})</span>
        </button>
      </div>

      {/* Tab 1: Students */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by Roll ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </form>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              >
                <option value="ALL">All Branches</option>
                {meta.branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              >
                <option value="ALL">All Sections</option>
                {meta.sections.map((s) => (
                  <option key={s} value={s}>Sec {s}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              >
                <option value="ALL">All Years</option>
                {meta.years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {(branchFilter !== 'ALL' || sectionFilter !== 'ALL' || yearFilter !== 'ALL' || search) && (
                <button
                  onClick={() => {
                    setBranchFilter('ALL');
                    setSectionFilter('ALL');
                    setYearFilter('ALL');
                    setSearch('');
                  }}
                  className="text-xs px-3 py-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Roll ID</th>
                    <th className="px-5 py-4">Student Name</th>
                    <th className="px-5 py-4">Branch & Sec</th>
                    <th className="px-5 py-4">Year / Sem</th>
                    <th className="px-5 py-4">Club Points</th>
                    <th className="px-5 py-4">Events</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-stone-400">
                        Loading students...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-stone-400">
                        No students found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-5 py-3.5 font-bold text-stone-900">{s.studentId}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-stone-900">{s.name}</p>
                          <p className="text-[11px] text-stone-500">{s.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-stone-700">
                          <div>
                            <span className="font-medium text-stone-900">{s.branch}</span>
                            <span className="ml-1.5 px-2 py-0.5 bg-[#F5F0E8] border border-[#E8E2D5] text-stone-700 rounded font-semibold text-[11px]">
                              Sec {s.section}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-stone-700">{s.year} / {s.semester}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-black border border-amber-200">
                              <Trophy className="w-3.5 h-3.5 text-amber-700" />
                              <span>{s.points || 0} pts</span>
                            </div>
                            {s.awardStatus && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#F5F0E8] text-stone-800 border border-[#E8E2D5] font-bold rounded-md">
                                {s.awardStatus}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-[#F5F0E8] text-stone-800 border border-[#E8E2D5] rounded font-bold">
                            {s.totalParticipations}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-500">
                          {s.phone || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setResetPasswordUser(s)}
                              className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-[#F5F0E8] rounded-lg transition-colors cursor-pointer"
                              title="Manage / Reset Student Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingStudent(s)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-lg transition-colors cursor-pointer"
                              title="Edit Student Profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPromotingStudent(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-stone-800 bg-[#F5F0E8] hover:bg-stone-200 border border-[#E8E2D5] rounded-lg transition-colors cursor-pointer"
                              title="Promote to Coordinator"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                              <span>Promote</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Permanently Delete Student Account"
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

      {/* Tab 2: Coordinators */}
      {activeTab === 'coordinators' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Coordinator Name</th>
                  <th className="px-5 py-4">Supervised Branch (1-Branch Rule)</th>
                  <th className="px-5 py-4">Assigned Section</th>
                  <th className="px-5 py-4">Assigned Activities</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-stone-400">
                      Loading coordinators...
                    </td>
                  </tr>
                ) : coordinators.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-stone-400">
                      No coordinators found. Click "Add Coordinator" to register one.
                    </td>
                  </tr>
                ) : (
                  coordinators.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-stone-900">{c.name}</p>
                        <p className="text-[11px] text-stone-500">{c.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-200 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          {c.assignedBranch || c.department || 'Computer Science & Engineering'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-[#F5F0E8] border border-[#E8E2D5] text-stone-700 rounded font-semibold text-xs">
                          {c.assignedSection ? `Section ${c.assignedSection}` : 'All Sections'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.assignedActivities.length === 0 ? (
                          <span className="text-stone-400 italic">No activities assigned</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {c.assignedActivities.map((a) => (
                              <span
                                key={a.id}
                                className="px-2 py-0.5 bg-[#F5F0E8] text-stone-800 rounded font-medium text-[11px] border border-[#E8E2D5]"
                              >
                                {a.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-stone-500">{c.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setResetPasswordUser({ ...c, role: 'COORDINATOR' })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-stone-800 bg-[#F5F0E8] hover:bg-stone-200 border border-[#E8E2D5] rounded-lg transition-colors cursor-pointer"
                            title="Manage / Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                            <span>Reset Pass</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCoordinator(c)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Coordinator"
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
      )}

      {studentModalOpen && (
        <StudentModal
          onClose={() => setStudentModalOpen(false)}
          onSaved={() => {
            fetchStudents();
            fetchMeta();
          }}
        />
      )}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSaved={() => {
            fetchStudents();
            fetchMeta();
          }}
        />
      )}

      {promotingStudent && (
        <PromoteCoordinatorModal
          student={promotingStudent}
          onClose={() => setPromotingStudent(null)}
          onSaved={() => {
            fetchStudents();
            fetchCoordinators();
            fetchMeta();
          }}
        />
      )}

      {coordinatorModalOpen && (
        <CoordinatorModal
          onClose={() => setCoordinatorModalOpen(false)}
          onSaved={() => {
            fetchCoordinators();
            fetchMeta();
          }}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          targetUser={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={() => {
            if (activeTab === 'students') fetchStudents();
            else fetchCoordinators();
          }}
        />
      )}
    </div>
  );
};

export default AdminStudents;
