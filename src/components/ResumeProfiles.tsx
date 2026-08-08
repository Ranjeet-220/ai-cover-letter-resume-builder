'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import {
  User,
  Star,
  Plus,
  Edit2,
  Trash2,
  Check,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  ResumeProfile,
  getResumeProfiles,
  saveResumeProfile,
  setDefaultResumeProfile,
  deleteResumeProfile,
} from '../lib/storage';

interface ResumeProfilesProps {
  onSelectProfile?: (profile: ResumeProfile) => void;
}

export function ResumeProfiles({ onSelectProfile }: ResumeProfilesProps) {
  const [profiles, setProfiles] = useState<ResumeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Partial<ResumeProfile>>({
    name: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    skills: [],
    experience: '',
    isDefault: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await getResumeProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error fetching resume profiles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await setDefaultResumeProfile(id);
      if (updated) {
        setProfiles((prev) =>
          prev.map((p) => ({ ...p, isDefault: p.id === id }))
        );
        if (onSelectProfile) onSelectProfile(updated);
      }
    } catch (err) {
      console.error('Error setting default profile', err);
    }
  };

  const handleOpenCreate = () => {
    setCurrentProfile({
      name: '',
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: '',
      skills: [],
      experience: '',
      isDefault: profiles.length === 0,
    });
    setSkillInput('');
    setIsEditing(true);
  };

  const handleOpenEdit = (profile: ResumeProfile) => {
    setCurrentProfile(profile);
    setSkillInput('');
    setIsEditing(true);
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!skillInput.trim()) return;
    const newSkill = skillInput.trim();
    if (!currentProfile.skills?.includes(newSkill)) {
      setCurrentProfile((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCurrentProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skillToRemove) || [],
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile.name || !currentProfile.fullName) return;

    setSaving(true);
    try {
      const saved = await saveResumeProfile({
        ...currentProfile,
        name: currentProfile.name!,
        fullName: currentProfile.fullName!,
      });
      setIsEditing(false);
      await fetchProfiles();
      if (onSelectProfile && (saved.isDefault || profiles.length === 0)) {
        onSelectProfile(saved);
      }
    } catch (err) {
      console.error('Error saving profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteResumeProfile(id);
      setDeletingId(null);
      await fetchProfiles();
    } catch (err) {
      console.error('Error deleting profile', err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <User className="w-7 h-7 text-white" />
            <span className="gradient-text-animated">Resume Profile Manager</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Store candidate profiles, skills, and contact info to personalize AI cover letters.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-btn font-extrabold text-xs shadow-lg transition self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          Add Resume Profile
        </button>
      </div>

      {/* Profiles Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-white mr-2" />
          Loading resume profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-zinc-950 rounded-3xl border border-dashed border-zinc-800 text-center p-6 space-y-3 shadow-xl">
          <User className="w-12 h-12 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No candidate profiles saved</h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            Create your candidate profile to automatically populate cover letter headers and tailor AI recommendations.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 text-xs font-extrabold rounded-xl bg-white text-black hover:bg-zinc-200 transition cursor-pointer"
          >
            Create First Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`relative bg-zinc-950 rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition shadow-xl ${
                profile.isDefault
                  ? 'border-white'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Default Badge & Actions */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{profile.name}</h3>
                    {profile.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-black text-black" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-semibold mt-0.5">{profile.fullName}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(profile)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={() => setDeletingId(profile.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-zinc-300">
                {profile.email && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mail className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Summary snippet */}
              {profile.summary && (
                <p className="text-xs text-zinc-400 line-clamp-2 italic bg-black p-2.5 rounded-xl border border-zinc-800 font-mono">
                  &quot;{profile.summary}&quot;
                </p>
              )}

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Top Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-black text-zinc-200 px-2.5 py-0.5 rounded-md border border-zinc-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 6 && (
                    <span className="text-[11px] text-zinc-500 font-mono font-semibold px-1">
                      +{profile.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Default Selector Button */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                {!profile.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(profile.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-white" /> Set as Default
                  </button>
                ) : (
                  <div className="w-full py-2 text-xs font-bold text-black bg-white rounded-xl text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Active Default Profile
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-white" />
                {currentProfile.id ? 'Edit Candidate Profile' : 'Create Resume Profile'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                    Profile Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer Profile"
                    value={currentProfile.name || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={currentProfile.fullName || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={currentProfile.email || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={currentProfile.phone || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={currentProfile.location || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">LinkedIn URL</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/alexvance"
                    value={currentProfile.linkedin || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, linkedin: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Professional Bio / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Experienced software engineer with 6+ years specializing in modern web apps..."
                  value={currentProfile.summary || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, summary: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white resize-none"
                />
              </div>

              {/* Skills Tag Management */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Technical & Professional Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill (e.g. Next.js, Node.js) & press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 text-xs font-extrabold rounded-xl gradient-btn transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentProfile.skills?.map((sk, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Key Work Experience Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Senior Software Engineer at TechCorp (2022-Present): Scaled microservices..."
                  value={currentProfile.experience || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, experience: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl bg-black border border-zinc-800 text-white focus:outline-none focus:border-white resize-none"
                />
              </div>

              {/* Default Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={currentProfile.isDefault || false}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-white bg-black border-zinc-800 focus:ring-white"
                />
                <label htmlFor="isDefaultCheck" className="text-xs text-zinc-300 font-medium cursor-pointer">
                  Set as default candidate profile for new cover letters
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-extrabold rounded-xl gradient-btn shadow-lg flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-white" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Resume Profile?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this profile? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProfile(deletingId)}
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
