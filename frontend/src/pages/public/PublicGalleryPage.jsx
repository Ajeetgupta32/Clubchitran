import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Camera,
  Calendar,
  MapPin,
  Download,
  Search,
  Star,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Filter,
  Eye,
  Upload
} from 'lucide-react';
import ClubLogo from '../../components/ui/ClubLogo';
import { downloadImage } from '../../utils/downloadHelper';
import { resolveImageUrl } from '../../utils/imageUrl';
import AdminPhotoUploadModal from '../../components/ui/AdminPhotoUploadModal';
import api from '../../services/api';

export const PublicGalleryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState(null);
  const [showAdminUpload, setShowAdminUpload] = useState(false);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions/gallery');
      if (res.data.success) {
        setGalleryPhotos(res.data.gallery || []);
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGallery();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COORDINATOR') return '/coordinator/dashboard';
    return '/student/dashboard';
  };

  const categories = ['ALL', 'Landscape', 'Street', 'Portrait', 'Heritage', 'Architecture', 'Nature', 'Technical'];

  const filteredPhotos = galleryPhotos.filter((p) => {
    const matchesCategory =
      category === 'ALL' ||
      (p.activityCategory && p.activityCategory.toLowerCase().includes(category.toLowerCase()));
    const matchesSearch =
      !search ||
      (p.activityTitle && p.activityTitle.toLowerCase().includes(search.toLowerCase())) ||
      (p.studentName && p.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (p.studentBranch && p.studentBranch.toLowerCase().includes(search.toLowerCase())) ||
      (p.caption && p.caption.toLowerCase().includes(search.toLowerCase())) ||
      (p.venue && p.venue.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 scroll-smooth selection:bg-amber-900/15 selection:text-amber-900 flex flex-col">
      {/* Paper & Lens Translucent Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <ClubLogo size="md" title="Chitran Club" subtitle="EXHIBITION GALLERY" dark={false} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <Link to="/" className="hover:text-stone-950 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-stone-400" />
              <span>Back to Home</span>
            </Link>
            <Link to="/gallery" className="text-amber-800 font-bold border-b-2 border-amber-700 pb-0.5">
              Gallery
            </Link>
            <Link to="/activities" className="hover:text-amber-800 transition-colors">
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

      {/* Main Exhibition Content */}
      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-3 border border-amber-200/80 shadow-xs">
                <Camera className="w-3.5 h-3.5 text-amber-700" />
                <span>Curated Fine-Art Visuals</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Public Photography Exhibition Gallery
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
                Explore every verified photograph captured during club photo walks, heritage trails, and masterclasses across Varanasi. Verified by faculty coordinators with certified college attendance credit.
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Total Count Badge */}
              <div className="shrink-0 p-3.5 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-stone-900">{galleryPhotos.length}</p>
                  <p className="text-[10px] text-stone-500 font-semibold">Verified Photos</p>
                </div>
              </div>

              {/* Admin Quick Upload Button */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <button
                  onClick={() => setShowAdminUpload(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-2xl shadow-xs border border-stone-800 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Category Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D5] shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search photographer, activity, caption..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    category === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-600 hover:text-stone-900 border border-[#E8E2D5]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Genres' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Grid */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E2D5]">
              <Camera className="w-10 h-10 text-amber-700 animate-pulse mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-800">Loading fine-art gallery photographs...</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E2D5] p-16 text-center shadow-xs">
              <Camera className="w-12 h-12 text-amber-700/60 mx-auto mb-3" />
              <h3 className="text-stone-900 font-bold text-base">No photographs found</h3>
              <p className="text-stone-500 text-xs mt-1">
                {search || category !== 'ALL'
                  ? 'Try changing your search keywords or genre filter.'
                  : 'Verified student submissions will appear here once approved by coordinators.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => {
                const eventDateFormatted = photo.activityDate
                  ? new Date(photo.activityDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : new Date(photo.submittedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                return (
                  <div
                    key={photo.id}
                    className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col group hover:border-amber-600/40 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Photo Viewport */}
                    <div className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer">
                      <img
                        src={resolveImageUrl(photo.photoUrl)}
                        alt={photo.caption || photo.activityTitle || 'Verified Club Photo'}
                        onClick={() => setSelectedLightboxPhoto(photo)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Category Tag */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-stone-700 shadow">
                          {photo.activityCategory || 'Exhibition'}
                        </span>
                      </div>

                      {/* Top Pick Star */}
                      {photo.isTopPick && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-stone-950" />
                            <span>Top #{photo.topPickRank || 1}</span>
                          </span>
                        </div>
                      )}

                      {/* Download Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(photo.photoUrl, `${photo.studentName}_${photo.activityTitle}_ChitranClub`);
                        }}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-stone-900/85 hover:bg-stone-900 hover:text-amber-300 text-stone-200 backdrop-blur-md border border-stone-700 shadow-md transition-all cursor-pointer"
                        title="Download Original High-Res Photograph"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                      <div>
                        <p className="text-xs font-extrabold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                          {photo.activityTitle}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold mt-1">
                          <Calendar className="w-3 h-3 shrink-0 text-amber-700" />
                          <span>{eventDateFormatted}</span>
                          {photo.venue && <span className="text-stone-500 truncate">• {photo.venue}</span>}
                        </div>

                        {photo.caption && (
                          <p className="text-[11px] text-stone-500 italic line-clamp-2 mt-1.5">
                            "{photo.caption}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-stone-900 text-[11px]">{photo.studentName}</p>
                          <p className="text-[10px] text-stone-500">{photo.studentBranch || 'Student'}</p>
                        </div>
                        <button
                          onClick={() => setSelectedLightboxPhoto(photo)}
                          className="text-[10px] font-bold text-amber-800 hover:text-amber-900 underline cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div
            className="bg-[#1C1917] rounded-3xl max-w-4xl w-full overflow-hidden border border-stone-800 shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={resolveImageUrl(selectedLightboxPhoto.photoUrl)}
                alt={selectedLightboxPhoto.activityTitle}
                className="max-h-[65vh] w-auto object-contain mx-auto"
              />
              <button
                onClick={() => setSelectedLightboxPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-700 backdrop-blur-md cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1917]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                    {selectedLightboxPhoto.activityCategory || 'Exhibition'}
                  </span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {selectedLightboxPhoto.activityDate
                      ? new Date(selectedLightboxPhoto.activityDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : new Date(selectedLightboxPhoto.submittedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{selectedLightboxPhoto.activityTitle}</h3>
                <p className="text-xs text-stone-300">
                  Photographer:{' '}
                  <span className="font-bold text-amber-400">{selectedLightboxPhoto.studentName}</span> (
                  {selectedLightboxPhoto.studentBranch})
                </p>
                {selectedLightboxPhoto.caption && (
                  <p className="text-xs text-stone-400 italic">"{selectedLightboxPhoto.caption}"</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    downloadImage(
                      selectedLightboxPhoto.photoUrl,
                      `${selectedLightboxPhoto.studentName}_${selectedLightboxPhoto.activityTitle}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Photo Upload Modal */}
      {showAdminUpload && (
        <AdminPhotoUploadModal
          onClose={() => setShowAdminUpload(false)}
          onUploaded={fetchGallery}
        />
      )}

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

export default PublicGalleryPage;
