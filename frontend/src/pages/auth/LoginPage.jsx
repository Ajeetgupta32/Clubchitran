import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Compass,
  Sparkles,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ClubLogo from '../../components/ui/ClubLogo';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);

        if (res.data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (res.data.user.role === 'COORDINATOR') {
          navigate('/coordinator/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-stone-900">
      {/* Ambient warm background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Public Home */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-stone-50 border border-[#E8E2D5] rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 shadow-xs transition-all"
        >
          <Home className="w-3.5 h-3.5 text-stone-500" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="flex justify-center mb-4">
          <Link to="/" className="hover:scale-105 transition-transform duration-200">
            <ClubLogo size="xl" showText={false} dark={false} />
          </Link>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Sign In to Chitran Club
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-amber-800 font-semibold">
          Official Photography Society • Kashi Group of Institutions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs rounded-3xl border border-[#E8E2D5]">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                College Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@college.edu"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Student Registration Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-stone-500">
              New student?{' '}
              <Link to="/register" className="font-bold text-amber-800 hover:text-amber-900 underline transition-colors">
                Register as Student
              </Link>
            </p>
          </div>

          {/* 1-Click Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-[#E8E2D5]">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center mb-3">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@college.edu', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 transition-all text-amber-950 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700 mb-0.5" />
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-amber-800/80">Dean Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('coordinator1@college.edu', 'Coord@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-all text-emerald-950 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4 text-emerald-700 mb-0.5" />
                <span className="text-[11px] font-bold">Coordinator</span>
                <span className="text-[9px] text-emerald-800/80">CSE Branch</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('student1@college.edu', 'Student@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 bg-stone-100/70 hover:bg-stone-200/70 transition-all text-stone-900 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-stone-700 mb-0.5" />
                <span className="text-[11px] font-bold">Student</span>
                <span className="text-[9px] text-stone-600">Aarav Patel</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => fillCredentials('student2@college.edu', 'Student@123')}
                className="p-1.5 rounded-lg border border-[#E8E2D5] bg-[#FAF8F5] hover:bg-stone-100 text-[10px] text-stone-600 hover:text-stone-900 font-medium text-center truncate transition-colors cursor-pointer"
              >
                Student 2 (Pending Proof)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('student3@college.edu', 'Student@123')}
                className="p-1.5 rounded-lg border border-[#E8E2D5] bg-[#FAF8F5] hover:bg-stone-100 text-[10px] text-stone-600 hover:text-stone-900 font-medium text-center truncate transition-colors cursor-pointer"
              >
                Student 3 (Rejected Proof)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
