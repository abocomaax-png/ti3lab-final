'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllLabs, getUserProfile, Lab, User } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Network, Terminal, Target, Globe, ChevronDown, ChevronRight, Lock, CheckCircle, Loader2, Shield, AlertCircle } from 'lucide-react';

const TRACKS = [
  { id: 'networking', name: 'Networking', icon: Network, accent: '#3b82f6' },
  { id: 'linux', name: 'Linux', icon: Terminal, accent: '#22c55e' },
  { id: 'pentesting', name: 'Pentesting', icon: Target, accent: '#f97316' },
  { id: 'web', name: 'Web', icon: Globe, accent: '#a855f7' },
];

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-400/8 border-emerald-400/25',
  medium: 'text-amber-400 bg-amber-400/8 border-amber-400/25',
  hard: 'text-red-400 bg-red-400/8 border-red-400/25',
};

export default function LabsPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({ web: true });
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [notActivated, setNotActivated] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push('/auth/signin'); return; }
      try {
        const [profile, allLabs] = await Promise.all([getUserProfile(currentUser.uid), getAllLabs()]);
        setUserProfile(profile);
        if (profile && !profile.isActivated) setNotActivated(true);
        setLabs(allLabs);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [router]);

  const grouped: Record<string, Record<string, Lab[]>> = {};
  for (const lab of labs) {
    if (!grouped[lab.track]) grouped[lab.track] = {};
    if (!grouped[lab.track][lab.topic]) grouped[lab.track][lab.topic] = [];
    grouped[lab.track][lab.topic].push(lab);
  }
  for (const track of Object.keys(grouped))
    for (const topic of Object.keys(grouped[track]))
      grouped[track][topic].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Labs</h1>
          <p className="text-gray-500 text-sm">اختر التراك وابدأ التدريب</p>
        </div>

        {notActivated && (
          <div className="mb-8 p-4 bg-amber-500/6 border border-amber-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium text-sm">الحساب لم يُفعَّل بعد</p>
              <p className="text-amber-400/60 text-xs mt-0.5">بعد الانضمام للكورس، الأدمن هيفعّل حسابك وتقدر تدخل اللابات.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {TRACKS.map(track => {
            const trackLabs = grouped[track.id] || {};
            const topicsCount = Object.keys(trackLabs).length;
            const totalLabs = Object.values(trackLabs).reduce((s, arr) => s + arr.length, 0);
            const solvedInTrack = Object.values(trackLabs).flat().filter(l => userProfile?.solvedLabs.includes(l.id)).length;
            const isOpen = openTracks[track.id];
            const TrackIcon = track.icon;

            return (
              <div key={track.id} className="border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenTracks(prev => ({ ...prev, [track.id]: !prev[track.id] }))}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-900/40 hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${track.accent}15`, border: `1px solid ${track.accent}30` }}>
                      <TrackIcon className="w-4 h-4" style={{ color: track.accent }} />
                    </div>
                    <span className="font-semibold text-white">{track.name}</span>
                    {totalLabs > 0 && (
                      <span className="text-xs text-gray-500">{topicsCount} topics · {totalLabs} labs</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {totalLabs > 0 && (
                      <span className="text-xs text-gray-500">{solvedInTrack}/{totalLabs}</span>
                    )}
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="bg-black/60 divide-y divide-gray-800/40">
                    {topicsCount === 0 ? (
                      <p className="px-6 py-5 text-gray-600 text-sm">لا توجد لابات في هذا التراك بعد</p>
                    ) : (
                      Object.entries(trackLabs).map(([topic, topicLabs]) => {
                        const topicKey = `${track.id}-${topic}`;
                        const isTopicOpen = openTopics[topicKey];
                        const solvedInTopic = topicLabs.filter(l => userProfile?.solvedLabs.includes(l.id)).length;

                        return (
                          <div key={topic}>
                            <button
                              onClick={() => setOpenTopics(prev => ({ ...prev, [topicKey]: !prev[topicKey] }))}
                              className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-900/30 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isTopicOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                                <span className="text-sm font-medium text-gray-300">{topic}</span>
                                <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{topicLabs.length}</span>
                              </div>
                              <span className="text-xs text-gray-600">{solvedInTopic}/{topicLabs.length}</span>
                            </button>

                            {isTopicOpen && (
                              <div className="px-6 pb-3 space-y-1.5">
                                {topicLabs.map(lab => {
                                  const isSolved = userProfile?.solvedLabs.includes(lab.id);
                                  const isLocked = lab.isLocked || notActivated;

                                  return (
                                    <div
                                      key={lab.id}
                                      onClick={() => !isLocked && router.push(`/labs/${lab.id}`)}
                                      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                                        isLocked
                                          ? 'border-gray-800/50 bg-gray-900/20 cursor-not-allowed opacity-50'
                                          : isSolved
                                          ? 'border-emerald-500/20 bg-emerald-500/4 cursor-pointer hover:bg-emerald-500/8'
                                          : 'border-gray-800 bg-gray-900/30 cursor-pointer hover:border-gray-700 hover:bg-gray-900/60'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {isLocked ? (
                                          <Lock className="w-3.5 h-3.5 text-gray-700" />
                                        ) : isSolved ? (
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Shield className="w-3.5 h-3.5 text-gray-600" />
                                        )}
                                        <div>
                                          <p className={`text-sm font-medium ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                                            {lab.titleAr || lab.title}
                                          </p>
                                          {lab.descriptionAr && (
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{lab.descriptionAr}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${DIFFICULTY_STYLE[lab.difficulty]}`}>
                                          {lab.difficulty}
                                        </span>
                                        <span className="text-xs text-gray-600">{lab.points}p</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
