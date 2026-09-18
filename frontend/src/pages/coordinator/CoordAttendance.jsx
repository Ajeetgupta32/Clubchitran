import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const CoordAttendance = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialActivityId = searchParams.get('activityId') || 'ALL';

  const [attendanceList, setAttendanceList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState(initialActivityId);
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities', { params: { assignedOnly: 'true' } });
      if (res.data.success) {
        setActivities(res.data.activities || []);
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
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedActivity]);

  const handleExportExcel = async () => {
    if (selectedActivity === 'ALL') {
      toast.error('Please select an activity from the dropdown to export its attendance sheet.');
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
      toast.success('Attendance Excel file exported!');
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
            Assigned Activities Attendance
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex flex-wrap items-center gap-1.5">
            <span>Branch Scope:</span>
            <span className="font-bold text-[#246A3E] bg-[#EBF5EF] px-2 py-0.5 rounded border border-[#CDE5D5]">
              {user?.coordinator?.assignedBranch || user?.coordinator?.department || 'Computer Science & Engineering'}
              {user?.coordinator?.assignedSection ? ` (Sec ${user?.coordinator?.assignedSection})` : ' (All Sections)'}
            </span>
            <span className="text-stone-400">• Excel export filtered exclusively to your supervised branch</span>
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
            Filter by Assigned Activity
          </label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] font-medium text-stone-900"
          >
            <option value="ALL">All Assigned Activities</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-64 self-end">
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
        </form>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-[#F2F7F4] border border-[#D5E3DA] rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3F5E4D]/15 text-[#2D4F38] border border-[#3F5E4D]/25 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D4F38] uppercase tracking-wider">Verified Attendees</h4>
            <p className="text-sm font-black text-stone-900 mt-0.5">
              {attendanceList.length} Student(s) Confirmed Present
            </p>
          </div>
        </div>
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
                <th className="px-5 py-3.5">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5] text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-stone-500">
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-stone-500">
                    No verified attendees found for your assigned activities yet.
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

export default CoordAttendance;
