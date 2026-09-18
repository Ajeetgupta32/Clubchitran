import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Award,
  Trophy,
  ExternalLink
} from 'lucide-react';
import ClubLogo from '../ui/ClubLogo';
import toast from 'react-hot-toast';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/activities', label: 'Club Activities', icon: Calendar },
    { to: '/admin/students', label: 'Students & Directory', icon: Users },
    { to: '/admin/submissions', label: 'Review Submissions', icon: CheckSquare },
    { to: '/admin/top-picks', label: 'Top 3 Photo Picks', icon: Award },
    { to: '/admin/certificates', label: 'Certificates Hub', icon: Trophy },
    { to: '/admin/leaderboard', label: 'Points & Awards', icon: ShieldCheck },
    { to: '/admin/attendance', label: 'Attendance & Excel', icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row text-stone-900">
      {/* Desktop Dark Lens Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#18181B] border-r border-stone-800 shrink-0 select-none shadow-xl text-stone-200">
        {/* Brand with Club Logo */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
          <ClubLogo size="md" subtitle="Admin Portal" dark={true} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-900/30 text-amber-400 shadow-xs border border-amber-600/30 font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Public Home Link */}
        <div className="px-3 pb-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors border border-dashed border-stone-800"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View Public Home</span>
            </span>
            <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/25 font-semibold">Live</span>
          </Link>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#18181B] border-b border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 text-white">
        <ClubLogo size="sm" subtitle="Admin" dark={true} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18181B] border-b border-stone-800 p-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-amber-900/30 text-amber-400 border border-amber-600/30 font-bold'
                      : 'text-stone-300 hover:bg-stone-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-xs font-bold text-white">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#FAF8F5]">
        {/* Desktop Top Sub-Bar */}
        <header className="hidden md:flex h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-stone-500">Workspace</span>
            <span>/</span>
            <span className="font-bold text-stone-900">Club Administration</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-[#E8E2D5] text-xs text-stone-800 shadow-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Full System Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
