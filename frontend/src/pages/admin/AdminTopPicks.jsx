import React, { useState, useEffect } from 'react';
import {
  Award,
  Medal,
  Save,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import downloadImage from '../../utils/downloadHelper';
import { resolveImageUrl } from '../../utils/imageUrl';

export const AdminTopPicks = () => {
  const [verifiedSubmissions, setVerifiedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Selected pick IDs: { 1: subId, 2: subId, 3: subId }
  const [picks, setPicks] = useState({ 1: null, 2: null, 3: null });

  const fetchSubmissionsAndPicks = async () => {
    try {
      setLoading(true);
      const [subRes, topRes] = await Promise.all([
        api.get('/submissions', { params: { status: 'VERIFIED' } }),
        api.get('/submissions/top-picks')
      ]);

      if (subRes.data.success) {
        setVerifiedSubmissions(subRes.data.submissions || []);
      }

      if (topRes.data.success) {
        const currentPicks = { 1: null, 2: null, 3: null };
        topRes.data.topPicks.forEach((p) => {
          if (p.rank >= 1 && p.rank <= 3) {
            currentPicks[p.rank] = p.id;
          }
        });
        setPicks(currentPicks);
      }
    } catch (error) {
      toast.error('Failed to load verified submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsAndPicks();
  }, []);

  const handleAssignRank = (subId, rank) => {
    const updated = { ...picks };

    // If this subId was in another rank, clear that rank
    Object.keys(updated).forEach((r) => {
      if (updated[r] === subId) updated[r] = null;
    });

    // If rank is already assigned to this subId, toggle off
    if (picks[rank] === subId) {
      updated[rank] = null;
    } else {
      updated[rank] = subId;
    }

    setPicks(updated);
  };

  const handleSaveTopPicks = async () => {
    const payload = [];
    if (picks[1]) payload.push({ submissionId: picks[1], rank: 1 });
    if (picks[2]) payload.push({ submissionId: picks[2], rank: 2 });
    if (picks[3]) payload.push({ submissionId: picks[3], rank: 3 });

    try {
      setSaving(true);
      const res = await api.post('/submissions/top-picks', { picks: payload });
      if (res.data.success) {
        toast.success(res.data.message || 'Top 3 Photo Picks saved!');
        fetchSubmissionsAndPicks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving Top 3 picks');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (e, sub) => {
    e.stopPropagation();
    try {
      const safeTitle = (sub.activityTitle || 'activity').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sub.studentId || 'student'}_${safeTitle}_proof.jpg`;
      await downloadImage(sub.photoUrl, filename);
      toast.success('Downloading photo...');
    } catch {
      toast.error('Failed to download photo');
    }
  };

  const filteredSubmissions = verifiedSubmissions.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(term) ||
      s.studentId.toLowerCase().includes(term) ||
      s.activityTitle.toLowerCase().includes(term) ||
      s.branch.toLowerCase().includes(term)
    );
  });

  const getSubById = (id) => verifiedSubmissions.find((s) => s.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>Honors & Recognition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Top 3 Photo Picks Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Select the 3 best student photographs. Selected students are spotlighted on the home page and receive a <strong>Club Certificate</strong>.
          </p>
        </div>

        <button
          onClick={handleSaveTopPicks}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>{saving ? 'Publishing...' : 'Publish Top 3 Picks'}</span>
        </button>
      </div>

      {/* Currently Selected 3 Slots Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((rank) => {
          const subId = picks[rank];
          const sub = getSubById(subId);
          const rankColors = [
            'border-amber-400 bg-gradient-to-b from-amber-50 to-white',
            'border-stone-300 bg-gradient-to-b from-stone-100 to-white',
            'border-amber-700/40 bg-gradient-to-b from-[#F5F0E8] to-white'
          ];
          const rankTitles = ['1st Place (Gold Medal)', '2nd Place (Silver Medal)', '3rd Place (Bronze Medal)'];

          return (
            <div
              key={rank}
              className={`rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                sub ? rankColors[rank - 1] : 'border-dashed border-[#E8E2D5] bg-[#FAF8F5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-amber-700" />
                    Slot #{rank}: {rankTitles[rank - 1]}
                  </span>
                  {sub && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDownload(e, sub)}
                        className="text-stone-500 hover:text-stone-900 p-1 rounded hover:bg-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-700" />
                      </button>
                      <button
                        onClick={() => handleAssignRank(sub.id, rank)}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-800 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {sub ? (
                  <div className="space-y-3">
                    <div className="h-44 rounded-2xl overflow-hidden bg-stone-900 border border-[#E8E2D5] relative group">
                      <img
                        src={resolveImageUrl(sub.photoUrl)}
                        alt="Top pick"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => handleDownload(e, sub)}
                        className="absolute bottom-2 right-2 p-1.5 bg-stone-950/80 text-white rounded-lg border border-stone-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download photo"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{sub.studentName}</h4>
                      <p className="text-xs text-stone-500">
                        Roll: <span className="text-stone-800 font-semibold">{sub.studentId}</span> • {sub.branch} ({sub.section})
                      </p>
                      <p className="text-xs text-stone-700 mt-1 line-clamp-1 font-medium">
                        Activity: {sub.activityTitle}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#E8E2D5] rounded-2xl">
                    <Award className="w-8 h-8 text-stone-400 mb-2" />
                    <p className="text-xs font-bold text-stone-600">Slot #{rank} Empty</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Assign a verified photograph below
                    </p>
                  </div>
                )}
              </div>

              {sub && (
                <div className="mt-4 pt-3 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Club Certificate Awardee
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verified Submissions Gallery for Selection */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Verified Student Photographs ({filteredSubmissions.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any rank button (1st, 2nd, 3rd) on a photo card to assign it to the Top 3 picks.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search student or activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No verified photo submissions found. As students attend activities and their photos are verified, they will appear here for Top 3 selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubmissions.map((sub) => {
              const currentRank = Object.keys(picks).find((r) => picks[r] === sub.id);

              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all group ${
                    currentRank
                      ? 'border-amber-700 bg-amber-50/70 shadow-xs ring-1 ring-amber-700/30'
                      : 'border-[#E8E2D5] bg-white hover:border-stone-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="h-44 rounded-xl overflow-hidden bg-stone-900 relative">
                      <img
                        src={resolveImageUrl(sub.photoUrl)}
                        alt={sub.studentName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {currentRank && (
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-stone-900 text-amber-400 font-black text-xs shadow-md border border-amber-500/30">
                          Rank #{currentRank} Pick
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDownload(e, sub)}
                        className="absolute bottom-2 right-2 p-1.5 bg-stone-950/80 text-white rounded-lg border border-stone-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download photograph"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-stone-900 text-sm">{sub.studentName}</h4>
                        <span className="text-xs font-bold text-stone-800 bg-[#F5F0E8] px-2 py-0.5 rounded border border-[#E8E2D5]">
                          {sub.studentId}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {sub.branch} (Sec {sub.section})
                      </p>
                      <p className="text-xs text-stone-700 font-medium mt-1.5 line-clamp-1">
                        Activity: {sub.activityTitle}
                      </p>
                    </div>
                  </div>

                  {/* Rank Assignment Buttons & Download */}
                  <div className="mt-4 pt-3 border-t border-[#E8E2D5] flex items-center justify-between gap-1.5">
                    <button
                      onClick={(e) => handleDownload(e, sub)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-lg transition-colors cursor-pointer"
                      title="Download photo"
                    >
                      <Download className="w-4 h-4 text-stone-700" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Assign:</span>
                      {[1, 2, 3].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleAssignRank(sub.id, r)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            picks[r] === sub.id
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'bg-[#F5F0E8] text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          #{r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTopPicks;
