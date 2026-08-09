'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Trash2,
  Edit,
  Plus,
  TrendingUp,
  Award,
  Clock,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  FileText,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  CoverLetter,
  ApplicationStatus,
  getCoverLetters,
  updateCoverLetterStatus,
  deleteCoverLetter,
} from '../lib/storage';

interface ApplicationTrackerProps {
  onSelectLetter: (letter: CoverLetter) => void;
  onCreateNew: () => void;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Draft: {
    label: 'Draft',
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800',
    dot: 'bg-zinc-500',
  },
  Applied: {
    label: 'Applied',
    bg: 'bg-zinc-900',
    text: 'text-white',
    border: 'border-zinc-700',
    dot: 'bg-white',
  },
  Interviewing: {
    label: 'Interviewing',
    bg: 'bg-zinc-900',
    text: 'text-white',
    border: 'border-zinc-600',
    dot: 'bg-white',
  },
  Offer: {
    label: 'Offer',
    bg: 'gradient-active',
    text: 'text-black font-bold',
    border: 'border-white',
    dot: 'bg-black',
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-zinc-950',
    text: 'text-zinc-400',
    border: 'border-zinc-800',
    dot: 'bg-zinc-600',
  },
};

const ALL_STATUSES: ApplicationStatus[] = ['Draft', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export function ApplicationTracker({ onSelectLetter, onCreateNew }: ApplicationTrackerProps) {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const data = await getCoverLetters();
      setLetters(data);
    } catch (err) {
      console.error('Error fetching cover letters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const updated = await updateCoverLetterStatus(id, newStatus);
      if (updated) {
        setLetters((prev) => prev.map((l) => (l.id === id ? updated : l)));
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoverLetter(id);
      setLetters((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Error deleting letter', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return letters.filter((l) => {
      const company = (l.company || '').toLowerCase();
      const jobTitle = (l.jobTitle || '').toLowerCase();
      const title = (l.title || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        company.includes(query) || jobTitle.includes(query) || title.includes(query);
      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [letters, searchQuery, statusFilter]);

  // Analytics Stats
  const stats = useMemo(() => {
    const total = letters.length;
    const applied = letters.filter((l) => l.status === 'Applied').length;
    const interviewing = letters.filter((l) => l.status === 'Interviewing').length;
    const offer = letters.filter((l) => l.status === 'Offer').length;
    const rejected = letters.filter((l) => l.status === 'Rejected').length;
    const responseRate =
      total > 0
        ? Math.round(
            ((interviewing + offer) /
              Math.max(total - letters.filter((l) => l.status === 'Draft').length, 1)) *
              100
          )
        : 0;

    return { total, applied, interviewing, offer, rejected, responseRate };
  }, [letters]);

  return (
    <div className="flex flex-col h-full w-full bg-black text-white p-4 sm:p-6 space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <Briefcase className="w-7 h-7 text-white" />
            <span className="gradient-text-animated">Job Application Tracker</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage, track status, and quickly reload your AI-generated cover letters.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-btn font-extrabold text-xs shadow-lg transition self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          New Cover Letter
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Letters</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.applied + stats.interviewing}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Job Offers</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.offer}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Response Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.responseRate}%</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 shadow-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white placeholder-zinc-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'gradient-active'
                : 'text-zinc-400 hover:text-white bg-black border border-zinc-800'
            }`}
          >
            All ({letters.length})
          </button>
          {ALL_STATUSES.map((status) => {
            const count = letters.filter((l) => l.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'gradient-active font-extrabold'
                    : 'text-zinc-400 hover:text-white bg-black border border-zinc-800'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-black rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('board')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'board' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Kanban Board View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="List Table View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-white mr-2" />
          Loading applications...
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/60 rounded-3xl border border-dashed border-zinc-800 text-center p-6 space-y-3 shadow-xl">
          <Building2 className="w-12 h-12 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No applications found</h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try clearing your search query or status filter.'
              : 'You have not created any cover letters yet. Start by generating a cover letter.'}
          </p>
          <button
            onClick={onCreateNew}
            className="mt-2 px-4 py-2 text-xs font-extrabold rounded-xl bg-white text-black hover:bg-zinc-200 transition cursor-pointer"
          >
            Create First Cover Letter
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* Status Board / Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {ALL_STATUSES.map((status) => {
            const columnLetters = filteredLetters.filter((l) => l.status === status);
            const cfg = STATUS_CONFIG[status];

            return (
              <div key={status} className="bg-zinc-950 rounded-2xl border border-zinc-800 p-3.5 space-y-3.5 shadow-xl">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cfg.label}</h4>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-zinc-300 bg-black px-2 py-0.5 rounded border border-zinc-800">
                    {columnLetters.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 min-h-[150px]">
                  {columnLetters.map((letter) => (
                    <div
                      key={letter.id}
                      className="group bg-black p-4 rounded-xl border border-zinc-800 hover:border-zinc-600 shadow-md transition flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                            {letter.matchScore ?? 0}% Match
                          </span>

                          <button
                            onClick={() => setDeletingId(letter.id)}
                            className="text-zinc-500 hover:text-white p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition cursor-pointer"
                            title="Delete letter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h5 className="text-sm font-bold text-white mt-2.5 group-hover:text-white transition line-clamp-1">
                          {letter.company || "Untitled"}
                        </h5>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{letter.jobTitle || "Role"}</p>
                      </div>

                      <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 pt-2 border-t border-zinc-900">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        {new Date(letter.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <select
                          value={letter.status}
                          onChange={(e) => handleStatusChange(letter.id, e.target.value as ApplicationStatus)}
                          className="text-[11px] bg-zinc-900 text-white border border-zinc-800 rounded-lg px-2 py-1 focus:outline-none focus:border-white"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => onSelectLetter(letter)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg gradient-btn transition shadow-sm cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-black text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="p-4">Company & Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Match Score</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredLetters.map((letter) => {
                  const cfg = STATUS_CONFIG[letter.status] || STATUS_CONFIG.Draft;
                  return (
                    <tr key={letter.id} className="hover:bg-zinc-900/60 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{letter.company || "Untitled"}</div>
                        <div className="text-zinc-400 text-xs">{letter.jobTitle}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={letter.status}
                          onChange={(e) => handleStatusChange(letter.id, e.target.value as ApplicationStatus)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-black text-white">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-white">{letter.matchScore ?? 0}%</span>
                      </td>
                      <td className="p-4 text-zinc-400 font-mono">
                        {new Date(letter.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectLetter(letter)}
                            className="px-3 py-1.5 rounded-lg gradient-btn font-extrabold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Load into Editor
                          </button>
                          <button
                            onClick={() => setDeletingId(letter.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Cover Letter?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this cover letter? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 text-xs font-extrabold rounded-xl gradient-btn transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
