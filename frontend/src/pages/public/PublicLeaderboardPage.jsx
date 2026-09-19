import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Award,
  Sparkles,
  Gift,
  Search,
  ArrowLeft,
  ArrowRight,
  Film,
  Camera
} from 'lucide-react';
import ClubLogo from '../../components/ui/ClubLogo';
import api from '../../services/api';

export const PublicLeaderboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats/leaderboard?limit=50');
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard || []);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COORDINATOR') return '/coordinator/dashboard';
    return '/student/dashboard';
  };

  const branches = Array.from(new Set(leaderboard.map((s) => s.branch).filter(Boolean)));

  const filteredLeaderboard = leaderboard.filter((s) => {
    const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase());

    return matchesBranch && matchesSearch;
  });

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 scroll-smooth selection:bg-amber-900/15 selection:text-amber-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <ClubLogo size="md" title="Chitran Club" subtitle="LEADERBOARD & POINTS" dark={false} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <Link to="/" className="hover:text-stone-950 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-stone-400" />
              <span>Back to Home</span>
            </Link>
            <Link to="/gallery" className="hover:text-amber-800 transition-colors">
              Gallery
            </Link>
            <Link to="/activities" className="hover:text-amber-800 transition-colors">
              Activities
            </Link>
            <Link to="/leaderboard" className="text-amber-800 font-bold border-b-2 border-amber-700 pb-0.5">
              Leaderboard
            </Link>
          </nav>

          {/* Auth Button */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <span>Dashboard</span>
                <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] uppercase font-bold">
                  {user?.role}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-3 border border-amber-200/80 shadow-xs">
              <Film className="w-3.5 h-3.5 text-amber-700" />
              <span>Visual Exposure Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Photography Participation & Points Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Every verified photo submission earns +100 exposure points. Top performers receive a framed physical certificate and gift package during college assembly.
            </p>

            {/* Gift Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-[#E8E2D5] text-stone-800 shadow-xs flex items-center justify-center gap-3 text-xs sm:text-sm max-w-xl mx-auto">
              <Gift className="w-5 h-5 text-amber-700 shrink-0" />
              <p className="font-semibold text-left text-stone-700">
                <strong className="text-amber-900">Monthly Golden Shutter Recognition:</strong> Top-ranking student photographers receive framed certificates and special photography gifts.
              </p>
            </div>
          </div>

          {/* Top 3 Podium Highlights */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {top3.map((student, idx) => {
                const podiumTitles = ['1st Place Champion', '2nd Place Star', '3rd Place Honor'];
                const podiumMedals = ['🥇', '🥈', '🥉'];
                const podiumBg = [
                  'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md',
                  'bg-gradient-to-b from-stone-50 to-white border-stone-300 shadow-xs',
                  'bg-gradient-to-b from-amber-50/50 to-white border-[#E8E2D5] shadow-xs'
                ];

                return (
                  <div
                    key={student.id}
                    className={`rounded-3xl p-6 border text-center flex flex-col justify-between ${podiumBg[idx]}`}
                  >
                    <div>
                      <span className="text-4xl">{podiumMedals[idx]}</span>
                      <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 mt-2">
                        {podiumTitles[idx]}
                      </p>
                      <h3 className="text-lg font-black text-stone-900 mt-1">{student.name}</h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {student.branch} • Sec {student.section}
                      </p>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">{student.studentId}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-200/60">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-stone-900 text-amber-400 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{student.points} Points</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search and Branch Filter */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D5] shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search student name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Branch:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E8E2D5] text-stone-800 outline-none focus:ring-2 focus:ring-amber-700"
              >
                <option value="ALL">All Departments</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Table */}
          <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F0E8] border-b border-[#E8E2D5] text-stone-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-center">Rank</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4 text-center">Section</th>
                    <th className="px-6 py-4 text-center">Activity Points</th>
                    <th className="px-6 py-4 text-right">Recognition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-stone-400">
                        Loading student rankings...
                      </td>
                    </tr>
                  ) : filteredLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-stone-400">
                        No students found matching the selected filter.
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
                              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold inline-flex items-center justify-center text-xs">
                                {student.rank || index + 1}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold text-stone-900">
                            <p>{student.name}</p>
                            <p className="text-[11px] text-stone-500 font-normal">{student.studentId}</p>
                          </td>
                          <td className="px-6 py-4 text-stone-700 font-medium">{student.branch}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-800 rounded font-bold">
                              {student.section}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                              {student.points} pts
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {student.awardStatus ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100/70 text-amber-900 border border-amber-300/80">
                                <Gift className="w-3.5 h-3.5 text-amber-700" />
                                {student.awardStatus}
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[11px] italic">In Running</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-[#E8E2D5] text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ClubLogo size="sm" title="Chitran Club" subtitle="PHOTOGRAPHY & CREATIVE COMMUNITY" dark={false} />
          </Link>
          <p className="text-stone-500">
            © 2026 Chitran Photography Club. Kashi Group of Institutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLeaderboardPage;
