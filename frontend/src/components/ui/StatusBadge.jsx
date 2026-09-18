import React from 'react';
import { CheckCircle2, Clock, XCircle, Sparkles, BookOpen } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  if (normalized === 'VERIFIED' || normalized === 'PRESENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        {normalized === 'PRESENT' ? 'Present' : 'Verified'}
      </span>
    );
  }

  if (normalized === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs">
        <Clock className="w-3.5 h-3.5 text-amber-700" />
        Pending Review
      </span>
    );
  }

  if (normalized === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-xs">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Rejected
      </span>
    );
  }

  if (normalized === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
        Published
      </span>
    );
  }

  if (normalized === 'DRAFT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
        <BookOpen className="w-3.5 h-3.5 text-stone-500" />
        Draft
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
      {status}
    </span>
  );
};

export default StatusBadge;
