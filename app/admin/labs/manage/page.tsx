'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Lab, setLabLock, setMultipleLabsLock } from '@/lib/firestore';
import { Plus, Trash2, Search, Loader2, AlertCircle, ArrowLeft, Lock, Unlock, Network, Terminal, Target, Globe, Shield, CheckSquare, Square } from 'lucide-react';

const TRACK_ICONS: Record<string, any> = { networking: Network, linux: Terminal, pentesting: Target, web: Globe };
const TRACK_COLORS: Record<string, string> = { networking: 'text-blue-400', linux: 'text-emerald-400', pentesting: 'text-orange-400', web: 'text-purple-400' };

export default function AdminManageLabsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const checkAdminStatus = async (email: string) => {
    try {
      const res = await fetch('/api/check-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      return (await res.json()).isAdmin;
    } catch { return false; }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const admin = await checkAdminStatus(currentUser.email || '');
        setIsAdmin(admin);
        if (!admin) router.push('/labs');
        else await fetchLabs();
      } else { router.push('/auth/signin'); }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const fetchLabs = async () => {
    try {
      const snap = await getDocs(collection(db, 'labs'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lab));
      data.sort((a, b) => (a.track || '').localeCompare(b.track || '') || (a.order || 0) - (b.order || 0));
      setLabs(data);
      setFilteredLabs(data);
    } catch { showMsg('error', 'فشل تحميل اللابات'); }
  };

  useEffect(() => {
    let result = [...labs];
    if (selectedTrack !== 'all') result = result.filter(l => l.track === selectedTrack);
    if (searchQuery) result = result.filter(l =>
      l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.titleAr?.includes(searchQuery) ||
      l.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLabs(result);
  }, [searchQuery, selectedTrack, labs]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleLock = async (lab: Lab) => {
    setTogglingId(lab.id);
    try {
      await setLabLock(lab.id, !lab.isLocked);
      setLabs(labs.map(l => l.id === lab.id ? { ...l, isLocked: !l.isLocked } : l));
    } catch { showMsg('error', 'فشل تغيير حالة اللاب'); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (labId: string, labTitle: string) => {
    if (!confirm(`Delete "${labTitle}"?`)) return;
    setDeletingId(labId);
    try {
      await deleteDoc(doc(db, 'labs', labId));
      setLabs(labs.filter(l => l.id !== labId));
      setSelectedIds(prev => { const s = new Set(prev); s.delete(labId); return s; });
      showMsg('success', 'تم الحذف');
    } catch { showMsg('error', 'فشل الحذف'); }
    finally { setDeletingId(null); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLabs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredLabs.map(l => l.id)));
  };

  const handleBulkLock = async (lock: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await setMultipleLabsLock(Array.from(selectedIds), lock);
      setLabs(labs.map(l => selectedIds.has(l.id) ? { ...l, isLocked: lock } : l));
      setSelectedIds(new Set());
      showMsg('success', `تم ${lock ? 'قفل' : 'فتح'} ${selectedIds.size} لاب`);
    } catch { showMsg('error', 'فشلت العملية'); }
    finally { setBulkLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-0.5">Manage Labs</h1>
            <p className="text-gray-600 text-sm">افتح أو اقفل اللابات بعد كل سيشن</p>
          </div>
          <button onClick={() => router.push('/admin/labs/add')}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />
            Add Lab
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: labs.length, color: 'text-white' },
            { label: 'Unlocked', value: labs.filter(l => !l.isLocked).length, color: 'text-emerald-400' },
            { label: 'Locked', value: labs.filter(l => l.isLocked).length, color: 'text-red-400' },
            { label: 'Solves', value: labs.reduce((s, l) => s + (l.solveCount || 0), 0), color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="border border-gray-800 rounded-xl p-4">
              <p className="text-gray-600 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Bulk Actions */}
        <div className="border border-gray-800 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input type="text" placeholder="ابحث بالاسم أو ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-gray-600 transition-colors" />
          </div>
          <select value={selectedTrack} onChange={e => setSelectedTrack(e.target.value)}
            className="bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-600">
            <option value="all">All Tracks</option>
            <option value="networking">Networking</option>
            <option value="linux">Linux</option>
            <option value="pentesting">Pentesting</option>
            <option value="web">Web</option>
          </select>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
              <span className="text-xs text-gray-500">{selectedIds.size} selected</span>
              <button onClick={() => handleBulkLock(false)} disabled={bulkLoading}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/15 disabled:opacity-50 transition-colors">
                <Unlock className="w-3.5 h-3.5" /> Unlock All
              </button>
              <button onClick={() => handleBulkLock(true)} disabled={bulkLoading}
                className="flex items-center gap-1 px-3 py-2 bg-red-500/8 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/15 disabled:opacity-50 transition-colors">
                <Lock className="w-3.5 h-3.5" /> Lock All
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/8 border border-red-500/20 text-red-400'}`}>
            <AlertCircle className="w-4 h-4" />{message.text}
          </div>
        )}

        {filteredLabs.length === 0 ? (
          <div className="text-center py-16 border border-gray-800 rounded-xl text-gray-600 text-sm">No labs found</div>
        ) : (
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-gray-900/30">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <button onClick={toggleSelectAll} className="text-gray-600 hover:text-gray-400 transition-colors">
                      {selectedIds.size === filteredLabs.length && filteredLabs.length > 0
                        ? <CheckSquare className="w-4 h-4" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Lab</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Track</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Difficulty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Solves</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredLabs.map(lab => {
                  const TrackIcon = TRACK_ICONS[lab.track] || Shield;
                  const isSelected = selectedIds.has(lab.id);
                  return (
                    <tr key={lab.id} className={`transition-colors ${isSelected ? 'bg-primary/4' : 'hover:bg-gray-900/30'}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(lab.id)} className="text-gray-600 hover:text-gray-400 transition-colors">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{lab.titleAr || lab.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 font-mono">{lab.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TrackIcon className={`w-3.5 h-3.5 ${TRACK_COLORS[lab.track] || 'text-gray-500'}`} />
                          <span className={`text-xs ${TRACK_COLORS[lab.track] || 'text-gray-500'}`}>{lab.track}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{lab.topic}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          lab.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-400/8 border-emerald-400/20'
                          : lab.difficulty === 'medium' ? 'text-amber-400 bg-amber-400/8 border-amber-400/20'
                          : 'text-red-400 bg-red-400/8 border-red-400/20'
                        }`}>{lab.difficulty}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lab.solveCount || 0}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleLock(lab)} disabled={togglingId === lab.id}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
                            lab.isLocked
                              ? 'bg-red-500/8 text-red-400 border-red-500/20 hover:bg-red-500/15'
                              : 'bg-emerald-500/8 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
                          }`}>
                          {togglingId === lab.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : lab.isLocked
                            ? <><Lock className="w-3 h-3" /> Locked</>
                            : <><Unlock className="w-3 h-3" /> Open</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(lab.id, lab.titleAr || lab.title)} disabled={deletingId === lab.id}
                          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40">
                          {deletingId === lab.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
