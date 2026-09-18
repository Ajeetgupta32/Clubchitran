import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Aperture,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  ChevronRight,
  Camera
} from 'lucide-react';
import ClubLogo from '../../components/ui/ClubLogo';
import api from '../../services/api';

export const PublicActivitiesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await api.get('/activities/public');
        if (res.data.success) {
          setActivities(res.data.activities || []);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COORDINATOR') return '/coordinator/dashboard';
    return '/student/dashboard';
  };

  const filteredActivities = activities.filter((act) => {
    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    const matchesSearch =
      !search ||
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.category.toLowerCase().includes(search.toLowerCase()) ||
      act.venue.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 scroll-smooth selection:bg-amber-900/15 selection:text-amber-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <ClubLogo size="md" title="Chitran Club" subtitle="ACTIVITIES & PHOTO WALKS" dark={false} />
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
            <Link to="/activities" className="text-amber-800 font-bold border-b-2 border-amber-700 pb-0.5">
              Activities
            </Link>
            <Link to="/leaderboard" className="hover:text-amber-800 transition-colors">
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
                  <span>Join Club</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-3 border border-amber-200/80 shadow-xs">
                <Aperture className="w-3.5 h-3.5 text-amber-700" />
                <span>Extracurricular College Activity Credit</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Photo Walks, Masterclasses & Challenges
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
                Participate in organized photowalks along Varanasi Ghats, architectural surveys, and studio lighting sessions. Verified photo submissions grant academic attendance and exposure points.
              </p>
            </div>

            {/* Total Count */}
            <div className="shrink-0 p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                <Aperture className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-stone-900">{activities.length}</p>
                <p className="text-[11px] text-stone-500 font-semibold">Scheduled Events</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D5] shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search photo walks, venues, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E8E2D5] text-stone-800 outline-none focus:ring-2 focus:ring-amber-700"
              >
                <option value="ALL">All Activities</option>
                <option value="PUBLISHED">Active & Upcoming</option>
                <option value="COMPLETED">Archived & Completed</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E2D5]">
              <Aperture className="w-10 h-10 text-amber-700 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-800">Loading activities schedule...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D5] p-16 text-center shadow-xs">
              <Aperture className="w-12 h-12 text-amber-700/60 mx-auto mb-3" />
              <h3 className="text-stone-900 font-bold text-base">No activities match your search</h3>
              <p className="text-stone-500 text-xs mt-1">Please try different keywords or check back soon for new photo walks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-amber-600/40 hover:shadow-xl transition-all group"
                >
                  <div className="h-44 bg-stone-100 relative overflow-hidden">
                    <img
                      src={act.bannerUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-stone-900/80 backdrop-blur-sm text-amber-400 text-[11px] font-bold rounded-lg uppercase border border-stone-700 shadow-sm">
                        {act.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-stone-900 text-base line-clamp-1">{act.title}</h3>
                    <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">{act.description}</p>

                    <div className="space-y-2 mt-4 pt-3 border-t border-[#E8E2D5] text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>
                          {new Date(act.eventDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{act.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">Mentors: {act.coordinators?.join(', ') || 'Faculty Curators'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#E8E2D5] flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500">
                        {act.participantCount || 0} Photographers
                      </span>

                      <Link
                        to={
                          isAuthenticated
                            ? user?.role === 'STUDENT'
                              ? '/student/activities'
                              : getDashboardLink()
                            : '/login'
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                      >
                        <span>{isAuthenticated ? 'Join Event' : 'Sign In to Register'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default PublicActivitiesPage;
