import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  Compass,
  ExternalLink,
  Building2,
  Award
} from 'lucide-react';
import ClubLogo from '../ui/ClubLogo';
import toast from 'react-hot-toast';

export const CoordinatorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/coordinator/activities', label: 'Assigned Activities', icon: Calendar },
    { to: '/coordinator/submissions', label: 'Verify Submissions', icon: CheckSquare },
    { to: '/coordinator/certificates', label: 'Certificate Requests', icon: Award },
    { to: '/coordinator/attendance', label: 'Attendance & Excel', icon: FileSpreadsheet }
  ];

  const assignedBranch = user?.coordinator?.assignedBranch || user?.coordinator?.department || 'Coordinator';

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row text-stone-900">
      {/* Desktop Dark Lens Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#18181B] border-r border-stone-800 shrink-0 select-none shadow-xl text-stone-200">
        {/* Brand with Club Logo */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
          <ClubLogo size="md" subtitle="Coordinator" dark={true} />
        </div>

        {/* Assigned Branch Banner (Strict 1-Branch Rule) */}
        <div className="mx-3 my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Assigned Branch:</span>
          </div>
          <p className="text-xs font-extrabold text-emerald-200 leading-snug line-clamp-2">
            {assignedBranch}
          </p>
          <p className="text-[10px] text-emerald-400/80 mt-1 font-medium">
            Restricted to {assignedBranch} students only
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-900/30 text-emerald-400 shadow-xs border border-emerald-600/30 font-bold'
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
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Public Home</span>
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/25 font-semibold">Live</span>
          </Link>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'C'}
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
        <ClubLogo size="sm" subtitle="Coordinator" dark={true} />

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
          <div className="p-3 mb-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
            <p className="text-[10px] font-bold text-emerald-400 uppercase">Assigned Branch:</p>
            <p className="text-xs font-bold text-emerald-200">{assignedBranch}</p>
          </div>

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
                      ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-600/30 font-bold'
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
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
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
            <span className="font-medium text-stone-500">Coordinator</span>
            <span>/</span>
            <span className="font-bold text-stone-900">{assignedBranch}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-[#E8E2D5] text-xs text-emerald-800 shadow-xs font-semibold">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>1-Branch Supervision Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CoordinatorLayout;
