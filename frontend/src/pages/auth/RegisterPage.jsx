import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Lock, BookOpen, Building2, Phone, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClubLogo from '../../components/ui/ClubLogo';

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    branch: 'Computer Science & Engineering',
    section: 'A',
    year: '1st Year',
    semester: '1st Sem',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const branches = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.studentId || !formData.phone) {
      toast.error('Please fill in all required fields, including mobile number');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setSubmitting(true);
      // Calls public register API which strictly sets Role = STUDENT
      const res = await api.post('/auth/register', {
        ...formData,
        phone: cleanPhone
      });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        toast.success(`Welcome to Chitran Club, ${res.data.user.name}!`);
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative text-stone-900">
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

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 hover:scale-105 transition-transform duration-200">
            <ClubLogo size="xl" showText={false} dark={false} />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Student Registration
          </h2>
          <p className="text-xs text-amber-800 font-semibold mt-1">
            Join Chitran Photography Club • Kashi Group of Institutions
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  College Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Roll / Student ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025CSE0101"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Branch / Department *
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-white text-stone-900">{b}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Section *
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
                >
                  <option value="A" className="bg-white text-stone-900">Sec A</option>
                  <option value="B" className="bg-white text-stone-900">Sec B</option>
                  <option value="C" className="bg-white text-stone-900">Sec C</option>
                  <option value="D" className="bg-white text-stone-900">Sec D</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
                >
                  <option value="1st Year" className="bg-white text-stone-900">1st Year</option>
                  <option value="2nd Year" className="bg-white text-stone-900">2nd Year</option>
                  <option value="3rd Year" className="bg-white text-stone-900">3rd Year</option>
                  <option value="4th Year" className="bg-white text-stone-900">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Sem *
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={`${s}th Sem`} className="bg-white text-stone-900">{s}th</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
                />
              </div>
              <p className="text-[11px] text-amber-800 mt-1 font-medium">
                * One student can register only once with their mobile number.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 shadow-xs transition-all cursor-pointer"
              >
                {submitting ? 'Creating Account...' : 'Register as Student'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-stone-500 pt-3 border-t border-[#E8E2D5]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-amber-800 hover:text-amber-900 underline transition-colors">
                Sign In here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
