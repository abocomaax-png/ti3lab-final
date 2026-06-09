'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { Lab } from '@/lib/firestore';
import { Plus, List, Users as UsersIcon, Award, TrendingUp, Loader2, ArrowRight, Shield, Tag } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [userStats, setUserStats] = useState({ totalUsers: 0, totalSolved: 0 });

  const checkAdminStatus = async (email: string) => {
    try {
      const res = await fetch('/api/check-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      return (await res.json()).isAdmin;
    } catch { return false; }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const isUserAdmin = await checkAdminStatus(currentUser.email || '');
        setIsAdmin(isUserAdmin);
        if (!isUserAdmin) { router.push('/labs'); return; }
        await fetchData();
      } else { router.push('/auth/signin'); }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const fetchData = async () => {
    try {
      const [labsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'labs')),
        getDocs(collection(db, 'users')),
      ]);
      setLabs(labsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lab)));
      let totalSolved = 0;
      usersSnap.docs.forEach(d => { totalSolved += (d.data().solvedLabs || []).length; });
      setUserStats({ totalUsers: usersSnap.size, totalSolved });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!isAdmin) return null;

  const labStats = {
    total: labs.length,
    unlocked: labs.filter(l => !l.isLocked).length,
    locked: labs.filter(l => l.isLocked).length,
    totalSolves: labs.reduce((s, l) => s + (l.solveCount || 0), 0),
    easy: labs.filter(l => l.difficulty === 'easy').length,
    medium: labs.filter(l => l.difficulty === 'medium').length,
    hard: labs.filter(l => l.difficulty === 'hard').length,
  };

  const topLabs = [...labs].sort((a, b) => (b.solveCount || 0) - (a.solveCount || 0)).slice(0, 5);

  const NavCard = ({ label, desc, color, icon: Icon, to }: any) => (
    <button onClick={() => router.push(to)}
      className={`group flex items-center justify-between p-5 border rounded-xl transition-all hover:border-gray-600 text-left bg-gray-900/20 border-gray-800`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{label}</p>
          <p className="text-gray-600 text-xs mt-0.5">{desc}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
    </button>
  );

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-white">Admin</h1>
          </div>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <NavCard label="Add Lab" desc="إضافة لاب جديد" color="bg-primary" icon={Plus} to="/admin/labs/add" />
          <NavCard label="Manage Labs" desc="فتح وقفل اللابات" color="bg-blue-600" icon={List} to="/admin/labs/manage" />
          <NavCard label="Users" desc="إدارة المستخدمين" color="bg-emerald-600" icon={UsersIcon} to="/admin/users" />
          <NavCard label="Categories" desc="إدارة الكاتيجوريز" color="bg-violet-600" icon={Tag} to="/admin/categories" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Labs', value: labStats.total, icon: List, color: 'text-primary' },
            { label: 'Users', value: userStats.totalUsers, icon: UsersIcon, color: 'text-emerald-400' },
            { label: 'Total Solves', value: labStats.totalSolves, icon: Award, color: 'text-amber-400' },
            { label: 'Unlocked', value: labStats.unlocked, icon: TrendingUp, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="border border-gray-800 rounded-xl p-4">
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-gray-600 text-xs mb-0.5">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Difficulty distribution */}
          <div className="border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Lab Distribution</h3>
            {[
              { label: 'Easy', value: labStats.easy, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Medium', value: labStats.medium, color: 'bg-amber-500', textColor: 'text-amber-400' },
              { label: 'Hard', value: labStats.hard, color: 'bg-red-500', textColor: 'text-red-400' },
            ].map(d => (
              <div key={d.label} className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-medium ${d.textColor}`}>{d.label}</span>
                  <span className="text-xs text-gray-600">{d.value} labs</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-1.5">
                  <div className={`${d.color} h-1.5 rounded-full transition-all`}
                    style={{ width: labStats.total > 0 ? `${(d.value / labStats.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Most solved */}
          <div className="border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Most Solved</h3>
            {topLabs.length === 0 ? (
              <p className="text-gray-600 text-xs py-6 text-center">لا توجد حلول بعد</p>
            ) : (
              <div className="space-y-2">
                {topLabs.map((lab, i) => (
                  <div key={lab.id} className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-700 w-4">{i + 1}</span>
                      <div>
                        <p className="text-sm text-white font-medium">{lab.titleAr || lab.title}</p>
                        <p className="text-xs text-gray-600">{lab.track} · {lab.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <UsersIcon className="w-3 h-3" />
                      {lab.solveCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
