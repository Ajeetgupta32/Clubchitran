import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  GraduationCap
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const AdminAttendance = () => {
  const [searchParams] = useSearchParams();
  const initialActivityId = searchParams.get('activityId') || 'ALL';

  const [attendanceList, setAttendanceList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [meta, setMeta] = useState({ branches: [], sections: [], years: [] });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [selectedActivity, setSelectedActivity] = useState(initialActivityId);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities');
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await api.get('/users/meta/branches-sections');
      if (res.data.success) {
        setMeta({
          branches: res.data.branches || [],
          sections: res.data.sections || [],
          years: res.data.years || []
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance', {
        params: {
          activityId: selectedActivity !== 'ALL' ? selectedActivity : undefined,
          branch: branchFilter !== 'ALL' ? branchFilter : undefined,
          section: sectionFilter !== 'ALL' ? sectionFilter : undefined,
          year: yearFilter !== 'ALL' ? yearFilter : undefined,
          search: search || undefined
        }
      });
      if (res.data.success) {
        setAttendanceList(res.data.attendances || []);
      }
    } catch (error) {
      toast.error('Failed to load attendance list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedActivity, branchFilter, sectionFilter, yearFilter]);

  const handleExportExcel = async () => {
    if (selectedActivity === 'ALL') {
      toast.error('Please select a specific activity from the dropdown to export its attendance sheet.');
      return;
    }

    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/export/${selectedActivity}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Extract filename from header or fallback
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'Attendance_Report.xlsx';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel attendance report downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Error exporting Excel report');
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-stone-900 tracking-tight">
            Attendance Records & Excel Reports
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Only verified photo submissions are confirmed as Present and recorded in attendance
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D4F38] hover:bg-[#233F2D] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating Excel...' : 'Download Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* Filter and Activity Selector */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Filter by Club Activity
          </label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] font-medium text-stone-900"
          >
            <option value="ALL">All Activities (Overview)</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto self-end">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400 w-44"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
          </form>

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
        </div>
      </div>

      {/* Summary Banner */}
      <div className="flex items-center justify-between p-4 bg-[#F2F7F4] border border-[#D5E3DA] rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3F5E4D]/15 text-[#2D4F38] border border-[#3F5E4D]/25 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D4F38] uppercase tracking-wider">Verified Attendance Count</h4>
            <p className="text-sm font-black text-stone-900 mt-0.5">
              {attendanceList.length} Student(s) Confirmed Present
            </p>
          </div>
        </div>
        {selectedActivity !== 'ALL' && (
          <button
            onClick={handleExportExcel}
            className="text-xs font-bold text-[#2D4F38] hover:text-[#233F2D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export This Activity Sheet</span>
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Student ID</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Branch</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Year / Sem</th>
                <th className="px-5 py-3.5">Activity Name</th>
                <th className="px-5 py-3.5">Activity Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5] text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-stone-500">
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-stone-500">
                    No verified attendance records found. (Students must submit photos and coordinators must approve them to appear here.)
                  </td>
                </tr>
              ) : (
                attendanceList.map((att) => (
                  <tr key={att.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-stone-900">{att.studentId}</td>
                    <td className="px-5 py-3.5 font-semibold text-stone-900">{att.studentName}</td>
                    <td className="px-5 py-3.5 text-stone-600">{att.branch}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded font-semibold text-stone-700">
                        {att.section}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">{att.year} / {att.semester}</td>
                    <td className="px-5 py-3.5 font-semibold text-stone-900">{att.activityName}</td>
                    <td className="px-5 py-3.5 text-stone-500">
                      {new Date(att.activityDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF5EF] text-[#246A3E] border border-[#CDE5D5]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Present
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 text-[11px]">
                      {att.markedByName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
