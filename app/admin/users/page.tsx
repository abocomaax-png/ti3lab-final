'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { User } from '@/lib/firestore';
import {
  Users as UsersIcon, Search, Loader2, Award, Trash2, Edit,
  Plus, Minus, AlertCircle, ArrowLeft, Shield, X, Save
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', points: 0, pointsToAdd: 0 });

  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch('/api/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.isAdmin;
    } catch { return false; }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isUserAdmin = await checkAdminStatus(currentUser.email || '');
        setIsAdmin(isUserAdmin);
        if (!isUserAdmin) { router.push('/labs'); }
        else { await fetchUsers(); }
      } else { router.push('/auth/signin'); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
      usersData.sort((a, b) => b.points - a.points);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch { setMessage({ type: 'error', text: 'Failed to fetch users' }); }
  };

  useEffect(() => {
    let result = [...users];
    if (searchQuery) {
      result = result.filter(u =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredUsers(result);
  }, [searchQuery, users]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}?`)) return;
    setDeletingId(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.uid !== userId));
      showMsg('success', 'User deleted successfully');
    } catch { showMsg('error', 'Failed to delete user'); }
    finally { setDeletingId(null); }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const newPoints = editForm.points + editForm.pointsToAdd;
      await updateDoc(doc(db, 'users', editingUser.uid), {
        displayName: editForm.displayName,
        points: newPoints,
      });
      setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, displayName: editForm.displayName, points: newPoints } : u));
      showMsg('success', 'User updated successfully');
      setEditingUser(null);
    } catch { showMsg('error', 'Failed to update user'); }
  };

  const quickAddPoints = async (userId: string, pts: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), { points: increment(pts) });
      setUsers(users.map(u => u.uid === userId ? { ...u, points: u.points + pts } : u));
      showMsg('success', `${pts > 0 ? 'Added' : 'Removed'} ${Math.abs(pts)} points`);
    } catch { showMsg('error', 'Failed to update points'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin h-16 w-16 text-primary" />
    </div>
  );

  if (!isAdmin) return null;

  const stats = {
    total: users.length,
    totalSolved: users.reduce((s, u) => s + (u.solvedLabs?.length || 0), 0),
    avgPoints: users.length > 0 ? Math.round(users.reduce((s, u) => s + u.points, 0) / users.length) : 0,
  };

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin</span>
          </button>
          <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Manage Users</span></h1>
          <p className="text-gray-400">إدارة حسابات الطلاب والنقاط</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total, icon: UsersIcon, color: 'text-primary', border: 'border-primary/30' },
            { label: 'Total Solves', value: stats.totalSolved, icon: Shield, color: 'text-yellow-500', border: 'border-yellow-500/30' },
            { label: 'Avg Points', value: stats.avgPoints, icon: Award, color: 'text-blue-500', border: 'border-blue-500/30' },
          ].map(s => (
            <div key={s.label} className={`bg-dark-light border ${s.border} rounded-xl p-5`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-dark-light border border-gray-800 rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الإيميل..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-dark border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-500' : 'bg-red-500/10 border border-red-500 text-red-500'}`}>
            <AlertCircle className="w-5 h-5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-dark-light border border-gray-800 rounded-xl">
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        ) : (
          <div className="bg-dark-light border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Points</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Solved</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quick Pts</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-dark transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold">{u.displayName?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-white">{u.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-primary font-semibold">{u.points}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{u.solvedLabs?.length || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => quickAddPoints(u.uid, 100)} className="p-1.5 bg-green-500/10 border border-green-500/50 text-green-500 rounded hover:bg-green-500/20 transition-colors" title="+100">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => quickAddPoints(u.uid, -100)} className="p-1.5 bg-red-500/10 border border-red-500/50 text-red-500 rounded hover:bg-red-500/20 transition-colors" title="-100">
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingUser(u); setEditForm({ displayName: u.displayName, points: u.points, pointsToAdd: 0 }); }}
                            className="p-2 bg-blue-500/10 border border-blue-500/50 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.uid, u.email)}
                            disabled={deletingId === u.uid}
                            className="p-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {deletingId === u.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-light border border-gray-800 rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Edit User</h2>
                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input type="text" value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Points</label>
                  <div className="bg-dark border border-gray-700 rounded-lg px-4 py-3">
                    <span className="text-primary font-bold text-xl">{editForm.points}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Add/Remove Points</label>
                  <input type="number" value={editForm.pointsToAdd} onChange={e => setEditForm({ ...editForm, pointsToAdd: parseInt(e.target.value) || 0 })}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors" />
                  <p className="text-xs text-gray-400 mt-1">New total: <span className="text-primary font-semibold">{editForm.points + editForm.pointsToAdd}</span></p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditingUser(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors">Cancel</button>
                <button onClick={handleUpdateUser} className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
