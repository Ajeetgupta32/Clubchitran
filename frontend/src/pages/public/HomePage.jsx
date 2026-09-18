import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Award,
  Trophy,
  Users,
  Compass,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Medal,
  Star,
  ExternalLink,
  ChevronRight,
  Gift,
  Building2,
  ShieldCheck,
  BadgeCheck,
  Download,
  Camera,
  Aperture,
  Film
} from 'lucide-react';
import ClubLogo from '../../components/ui/ClubLogo';
import { downloadImage } from '../../utils/downloadHelper';
import { resolveImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [topPicks, setTopPicks] = useState([]);
  const [stats, setStats] = useState({ activitiesCount: 0, verifiedCount: 0, studentsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [topRes, actRes, galleryRes, leadRes] = await Promise.all([
          api.get('/submissions/top-picks'),
          api.get('/activities/public'),
          api.get('/submissions/gallery'),
          api.get('/stats/leaderboard?limit=1')
        ]);

        if (topRes.data.success) {
          // Strictly limit to Top 3 images only
          setTopPicks((topRes.data.topPicks || []).slice(0, 3));
        }

        setStats({
          activitiesCount: actRes.data.activities?.length || 0,
          verifiedCount: galleryRes.data.count || galleryRes.data.gallery?.length || 0,
          studentsCount: leadRes.data.total || 45
        });
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COORDINATOR') return '/coordinator/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 scroll-smooth selection:bg-amber-900/15 selection:text-amber-900 flex flex-col">
      {/* Paper & Lens Translucent Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <ClubLogo size="md" title="Chitran Club" subtitle="PHOTOGRAPHY & CREATIVE COMMUNITY" dark={false} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a href="#about" className="hover:text-stone-950 transition-colors">About</a>
            <a href="#top-picks" className="hover:text-amber-800 transition-colors flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Top 3 Picks</span>
            </a>
            <Link to="/gallery" className="hover:text-amber-800 transition-colors flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>Gallery</span>
            </Link>
            <Link to="/activities" className="hover:text-amber-800 transition-colors flex items-center gap-1">
              <Aperture className="w-3.5 h-3.5 text-amber-700" />
              <span>Activities</span>
            </Link>
            <Link to="/leaderboard" className="hover:text-amber-800 transition-colors flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-700" />
              <span>Leaderboard</span>
            </Link>
            <a href="#coordinators" className="hover:text-stone-950 transition-colors">Team</a>
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
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl border border-transparent transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <span>Join Chitran Club</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        {/* 1. Hero & Club Introduction Section */}
        <section id="about" className="relative pt-14 pb-20 lg:pt-22 lg:pb-28 overflow-hidden border-b border-[#E8E2D5] bg-[#FAF8F5]">
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#D6CFC4_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-5 border border-amber-200/80 shadow-xs">
                <Camera className="w-4 h-4 text-amber-700" />
                <span>Official Photography Society • Kashi Group of Institutions</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight">
                Through The Viewfinder <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-700 to-orange-700">
                  Where Every Frame Tells a Story
                </span>
              </h1>
              <p className="mt-5 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
                Welcome to <strong>Chitran Club</strong>, the premier photography and visual arts society of Kashi Group of Institutions, Varanasi. Experience campus photo walks, masterclasses, and showcase your frames for authenticated college credit and certificates.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="#top-picks"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md shadow-stone-900/10 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>View Top 3 Picks</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-[#E8E2D5] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Aperture className="w-4 h-4 text-amber-700" />
                  <span>Explore Exhibition Gallery</span>
                </Link>
              </div>

              {/* Photography Stat Counter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#E8E2D5] text-center">
                <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-amber-600/30 transition-all">
                  <p className="text-2xl sm:text-3xl font-black text-stone-900">{stats.activitiesCount}+</p>
                  <p className="text-xs font-semibold text-stone-500 mt-0.5">Photo Walks & Events</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-amber-600/30 transition-all">
                  <p className="text-2xl sm:text-3xl font-black text-amber-800">100%</p>
                  <p className="text-xs font-semibold text-stone-500 mt-0.5">Photo Verified</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-amber-600/30 transition-all">
                  <p className="text-2xl sm:text-3xl font-black text-orange-700">+100</p>
                  <p className="text-xs font-semibold text-stone-500 mt-0.5">Points Per Frame</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-amber-600/30 transition-all">
                  <p className="text-2xl sm:text-3xl font-black text-amber-800">Monthly</p>
                  <p className="text-xs font-semibold text-stone-500 mt-0.5">Framed Shutter Awards</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Top 3 Photo Picks Section (THE ONLY 3 IMAGES DISPLAYED ON HOMEPAGE) */}
        <section id="top-picks" className="py-18 bg-[#F5F0E8]/50 border-b border-[#E8E2D5] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-2 border border-amber-200/80 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Curated Monthly Honors</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Top 3 Student Photographs & Exhibition Showcase
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                  The three standout captures selected by the Club Administrator. Awarded students receive the official <strong className="text-amber-800">Chitran Certificate of Photographic Excellence</strong>!
                </p>
              </div>

              <Link
                to="/gallery"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors"
              >
                <span>View Full Gallery (All Photographs)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {topPicks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs">
                <Award className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <h3 className="font-bold text-stone-800 text-sm">Top 3 picks being selected</h3>
                <p className="text-xs text-stone-500 mt-1">Admin will announce this month's Top 3 photo picks soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topPicks.map((pick, index) => {
                  const rankLabels = ['1st Place Winner', '2nd Place Runner-Up', '3rd Place Honor'];
                  const rankBadges = [
                    'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-xs',
                    'bg-gradient-to-r from-stone-300 to-stone-400 text-stone-950 font-black shadow-xs',
                    'bg-gradient-to-r from-amber-700 to-amber-800 text-white font-bold shadow-xs'
                  ];

                  return (
                    <div
                      key={pick.id}
                      className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-amber-600/40 hover:shadow-xl transition-all duration-300 group relative"
                    >
                      {/* Photo Viewport - ONLY Top 3 images */}
                      <div className="relative h-56 bg-stone-100 overflow-hidden">
                        <img
                          src={resolveImageUrl(pick.photoUrl)}
                          alt={pick.studentName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/club-logo.jpeg';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider ${rankBadges[index] || 'bg-stone-900 text-white'}`}>
                            <Medal className="w-3.5 h-3.5" />
                            <span>#{pick.rank || index + 1} {rankLabels[index]}</span>
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-stone-700">
                            {pick.activityCategory}
                          </span>
                        </div>

                        {/* Photo Download Button */}
                        <button
                          onClick={() => downloadImage(pick.photoUrl, `${pick.studentName}_${pick.activityTitle}_TopPick`)}
                          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/85 hover:bg-stone-900 text-white text-[11px] font-bold backdrop-blur-md border border-stone-700 shadow-md transition-all cursor-pointer"
                          title="Download High-Res Photograph"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Download</span>
                        </button>
                      </div>

                      {/* Information Mat */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-stone-900 text-base">{pick.studentName}</h3>
                            <span className="text-xs font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                              {pick.studentId}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 font-medium">
                            {pick.branch} • Sec {pick.section}
                          </p>

                          <div className="mt-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Activity</p>
                            <p className="text-xs font-bold text-stone-800 mt-0.5">{pick.activityTitle}</p>
                            {pick.caption && (
                              <p className="text-[11px] text-stone-500 italic mt-1 line-clamp-2">"{pick.caption}"</p>
                            )}
                          </div>
                        </div>

                        {/* Official Club Certificate Guarantee Pill */}
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center gap-2.5">
                          <Award className="w-5 h-5 text-amber-700 shrink-0" />
                          <div className="text-xs text-amber-900">
                            <span className="font-bold">Official Club Certificate Awarded</span>
                            <p className="text-[10px] text-amber-800/80">Recognized on official college records</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 3. Explore Portals (Redirects to New Dedicated Pages) */}
        <section className="py-18 bg-[#FAF8F5] border-b border-[#E8E2D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-2 border border-amber-200/80 shadow-xs">
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Explore Club Portals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Discover More Beyond the Spotlight
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Access full dedicated portals for our exhibition gallery, scheduled events, and live exposure rankings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Portal 1: Full Exhibition Gallery */}
              <div className="bg-white rounded-3xl border border-[#E8E2D5] p-7 shadow-xs flex flex-col justify-between hover:border-amber-600/40 hover:shadow-xl transition-all group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold mb-4">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-stone-900 text-lg group-hover:text-amber-800 transition-colors">
                    Public Exhibition Gallery
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    View every single verified photograph taken during photo walks, street challenges, and lighting sessions across all departments. Includes genre filters, full-resolution inspection, and original downloads.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E2D5]">
                  <Link
                    to="/gallery"
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Open Full Gallery ({stats.verifiedCount} Photos)</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              </div>

              {/* Portal 2: Activities & Photo Walks */}
              <div className="bg-white rounded-3xl border border-[#E8E2D5] p-7 shadow-xs flex flex-col justify-between hover:border-amber-600/40 hover:shadow-xl transition-all group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold mb-4">
                    <Aperture className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-stone-900 text-lg group-hover:text-amber-800 transition-colors">
                    Photo Walks & Events Calendar
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    Browse active, upcoming, and past photo walks, masterclasses, and photography hackathons. Sign in with your student credentials to participate and earn verified attendance credits.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E2D5]">
                  <Link
                    to="/activities"
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Browse All Activities</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              </div>

              {/* Portal 3: Leaderboard & Points */}
              <div className="bg-white rounded-3xl border border-[#E8E2D5] p-7 shadow-xs flex flex-col justify-between hover:border-amber-600/40 hover:shadow-xl transition-all group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold mb-4">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-stone-900 text-lg group-hover:text-amber-800 transition-colors">
                    Exposure Points Leaderboard
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    See who is leading the visual arts leaderboard across all departments. Top monthly performers receive customized framed physical certificates and special photography gifts during college assembly.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E2D5]">
                  <Link
                    to="/leaderboard"
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>View Full Rankings</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Student Achievements Section */}
        <section id="achievements" className="py-18 bg-[#F5F0E8]/50 border-b border-[#E8E2D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-2 border border-amber-200/80 shadow-xs">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Honors & Milestones</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Student Achievements & Recognitions
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Celebrating top performance, verified commitment, and creative excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-3 hover:border-amber-600/30 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-lg">
                  ★
                </div>
                <h3 className="font-extrabold text-stone-900 text-base">Monthly Star Recognitions</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Top performers on the points leaderboard receive a customized framed physical certificate and gift package presented during college assembly.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-3 hover:border-amber-600/30 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-bold text-lg">
                  🏆
                </div>
                <h3 className="font-extrabold text-stone-900 text-base">Top 3 Photo Pick Certificates</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Photographs selected for outstanding creativity, composition, or visual storytelling receive official digital and printed Club Certificates.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-3 hover:border-amber-600/30 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <h3 className="font-extrabold text-stone-900 text-base">Academic Attendance Credit</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Every verified photograph generates an exportable attendance record credited towards extracurricular college diploma requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Club Team & Coordinators Section */}
        <section id="coordinators" className="py-18 bg-[#FAF8F5] border-b border-[#E8E2D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-2 border border-emerald-200/80 shadow-xs">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Curators & Faculty</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Club Team & Branch Coordinators
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Each academic department is guided by a dedicated Coordinator ensuring fair activity oversight and verified attendance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Faculty Dean / Admin */}
              <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-xs flex flex-col items-center text-center hover:border-amber-600/30 hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xl mb-4 shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold rounded-full uppercase">
                  Club Administration
                </span>
                <h3 className="font-extrabold text-stone-900 text-base mt-2">Dr. Rajesh Sharma</h3>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">Dean of Student Affairs & Club Patron</p>
                <p className="text-xs text-stone-600 mt-3 border-t border-[#E8E2D5] pt-3">
                  Oversees institutional activities, validates top picks, and awards monthly certificates.
                </p>
              </div>

              {/* Coordinator 1: CSE */}
              <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-xs flex flex-col items-center text-center hover:border-amber-600/30 hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 shadow-xs">
                  <Compass className="w-8 h-8" />
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold rounded-full uppercase">
                  CSE Branch Coordinator
                </span>
                <h3 className="font-extrabold text-stone-900 text-base mt-2">Prof. Priya Verma</h3>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">Computer Science & Engineering</p>
                <p className="text-xs text-stone-600 mt-3 border-t border-[#E8E2D5] pt-3">
                  Reviews photography submissions, creative workshops, and verifies CSE student participation proofs.
                </p>
              </div>

              {/* Coordinator 2: ECE */}
              <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-xs flex flex-col items-center text-center hover:border-amber-600/30 hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 shadow-xs">
                  <Compass className="w-8 h-8" />
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold rounded-full uppercase">
                  ECE Branch Coordinator
                </span>
                <h3 className="font-extrabold text-stone-900 text-base mt-2">Prof. Vikram Malhotra</h3>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">Electronics & Communication Engineering</p>
                <p className="text-xs text-stone-600 mt-3 border-t border-[#E8E2D5] pt-3">
                  Coordinates visual arts events, creative media exhibitions, and supervises ECE student verifications.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-[#E8E2D5] text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ClubLogo size="sm" title="Chitran Club" subtitle="PHOTOGRAPHY & CREATIVE COMMUNITY" dark={false} />
          </Link>
          <div className="flex items-center gap-4 text-stone-500">
            <Link to="/gallery" className="hover:text-stone-800 transition-colors">Exhibition Gallery</Link>
            <Link to="/activities" className="hover:text-stone-800 transition-colors">Activities</Link>
            <Link to="/leaderboard" className="hover:text-stone-800 transition-colors">Leaderboard</Link>
          </div>
          <p className="text-stone-500">© 2026 Chitran Photography Club. Kashi Group of Institutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
