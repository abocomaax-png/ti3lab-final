'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getLabById, getUserProfile, submitFlag,
  addSolvedLab, updateUserPoints, incrementLabSolveCount, Lab,
} from '@/lib/firestore';
import {
  Award, Users, AlertCircle, CheckCircle, Download,
  Lightbulb, Loader2, ArrowLeft, Lock, Terminal, Flag,
} from 'lucide-react';

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'text-emerald-400 bg-emerald-400/8 border-emerald-400/25',
  medium: 'text-amber-400 bg-amber-400/8 border-amber-400/25',
  hard:   'text-red-400 bg-red-400/8 border-red-400/25',
};

export default function SingleLabPage() {
  const params   = useParams();
  const router   = useRouter();
  const labId    = params.id as string;

  const [lab,          setLab]          = useState<Lab | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [user,         setUser]         = useState<any>(null);
  const [flagInput,    setFlagInput]    = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [message,      setMessage]      = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSolved,     setIsSolved]     = useState(false);
  const [showHints,    setShowHints]    = useState(false);
  const [isActivated,  setIsActivated]  = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labData = await getLabById(labId);
        if (!labData) { router.push('/labs'); return; }
        setLab(labData);
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
          if (!currentUser) { router.push('/auth/signin'); return; }
          setUser(currentUser);
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setIsSolved(profile.solvedLabs.includes(labId));
            setIsActivated(profile.isActivated);
          }
        });
        return () => unsub();
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [labId, router]);

  const handleSubmitFlag = async () => {
    if (!flagInput.trim() || !user || !lab) return;
    setSubmitting(true);
    try {
      const correct = await submitFlag(user.uid, labId, flagInput, lab.flag);
      if (correct) {
        const profile = await getUserProfile(user.uid);
        await addSolvedLab(user.uid, labId);
        await updateUserPoints(user.uid, (profile?.points || 0) + lab.points);
        await incrementLabSolveCount(labId);
        setIsSolved(true);
        setMessage({ type: 'success', text: `صح! كسبت ${lab.points} نقطة 🎉` });
      } else {
        setMessage({ type: 'error', text: 'فلاج غلط، حاول تاني' });
      }
    } catch {
      setMessage({ type: 'error', text: 'حصل خطأ، حاول تاني' });
    } finally {
      setSubmitting(false);
      setFlagInput('');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  if (!lab) return null;

  const isLocked = lab.isLocked || !isActivated;

  // Parse setup instructions into steps array
  const setupSteps = lab.setupInstructions
    ? lab.setupInstructions.split('\n').filter((l: string) => l.trim())
    : [];

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <button
          onClick={() => router.push('/labs')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Labs
        </button>

        {/* Locked Banner */}
        {isLocked && (
          <div className="mb-6 p-4 bg-amber-500/6 border border-amber-500/20 rounded-lg flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium text-sm">
                {!isActivated ? 'الحساب لم يُفعَّل بعد' : 'هذا اللاب مقفول'}
              </p>
              <p className="text-amber-400/60 text-xs mt-0.5">
                {!isActivated
                  ? 'تواصل مع الأدمن لتفعيل حسابك بعد التسجيل في الكورس.'
                  : 'سيفتح هذا اللاب بعد السيشن المقابل.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="border border-gray-800 rounded-xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                {lab.track} / {lab.topic}
              </p>
              <h1 className="text-xl font-bold text-white">{lab.titleAr || lab.title}</h1>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                {lab.descriptionAr || lab.description}
              </p>
            </div>
            {isSolved && (
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                Solved
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded border ${DIFFICULTY_STYLE[lab.difficulty]}`}>
              {lab.difficulty}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Award className="w-3.5 h-3.5" />
              <span>{lab.points} pts</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>{lab.solveCount || 0} solves</span>
            </div>
          </div>
        </div>

        {/* ── Download Lab File ── */}
        {!isLocked && lab.dockerFileUrl && (
          <div className="border border-gray-800 rounded-xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Lab Files
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              حمّل الملف وشغّل البيئة محلياً على جهازك
            </p>
            <a
              href={lab.dockerFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Lab
            </a>
          </div>
        )}

        {/* ── Setup Instructions ── */}
        {!isLocked && setupSteps.length > 0 && (
          <div className="border border-gray-800 rounded-xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Setup Instructions
            </h2>
            <ol className="space-y-2">
              {setupSteps.map((step: string, i: number) => {
                // strip leading "1. " or "- " numbering if present
                const clean = step.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
                // detect if it looks like a command (starts with common CLI words)
                const isCmd = /^(docker|sudo|cd|git|curl|wget|chmod|bash|sh|python|pip|npm|yarn)\b/i.test(clean);
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 text-gray-500 text-xs flex items-center justify-center mt-0.5 font-mono">
                      {i + 1}
                    </span>
                    {isCmd ? (
                      <code className="flex-1 text-xs bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-primary font-mono leading-relaxed">
                        {clean}
                      </code>
                    ) : (
                      <span className="flex-1 text-sm text-gray-400 leading-relaxed">{clean}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* ── Submit Flag ── */}
        {!isLocked && !isSolved && (
          <div className="border border-gray-800 rounded-xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-primary" />
              Submit Flag
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={flagInput}
                onChange={e => setFlagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitFlag()}
                placeholder="ti3lab{...}"
                className="flex-1 bg-black border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 font-mono text-sm focus:outline-none focus:border-gray-600 transition-colors"
              />
              <button
                onClick={handleSubmitFlag}
                disabled={submitting || !flagInput.trim()}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
              </button>
            </div>
            {message && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-xs ${
                message.type === 'success'
                  ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/8 border border-red-500/20 text-red-400'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle className="w-3.5 h-3.5" />
                  : <AlertCircle className="w-3.5 h-3.5" />}
                {message.text}
              </div>
            )}
          </div>
        )}

        {/* ── Solved Banner ── */}
        {isSolved && (
          <div className="border border-emerald-500/20 bg-emerald-500/4 rounded-xl p-5 mb-5 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-emerald-400 font-semibold text-sm">تم حل هذا اللاب</p>
              <p className="text-emerald-400/60 text-xs">كسبت {lab.points} نقطة</p>
            </div>
          </div>
        )}

        {/* ── Hints ── */}
        {!isLocked && lab.hints && lab.hints.length > 0 && (
          <div className="border border-gray-800 rounded-xl p-5">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              {showHints ? 'إخفاء التلميحات' : 'إظهار التلميحات'}
            </button>
            {showHints && (
              <div className="mt-3 space-y-2">
                {lab.hints.map((hint, i) => (
                  <div key={i} className="bg-amber-500/6 border border-amber-500/15 rounded-lg p-3 text-amber-300/80 text-xs">
                    <span className="text-amber-400 font-semibold">Hint {i + 1}:</span> {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
