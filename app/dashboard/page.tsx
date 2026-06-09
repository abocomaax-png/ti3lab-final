'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, getAllLabs, getLeaderboard, User, Lab } from '@/lib/firestore';
import LabCard from '@/components/LabCard';
import { 
  Award, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Flame,
  Trophy,
  ArrowRight,
  Activity,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [recentLabs, setRecentLabs] = useState<Lab[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      try {
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setUser(userProfile);
        }

        const allLabs = await getAllLabs();
        setLabs(allLabs);

        // Get recommended labs based on difficulty progression
        const solvedCount = userProfile?.solvedLabs.length || 0;
        let recommendedDifficulty: 'easy' | 'medium' | 'hard' = 'easy';
        
        if (solvedCount > 10) recommendedDifficulty = 'medium';
        if (solvedCount > 25) recommendedDifficulty = 'hard';

        const unsolved = allLabs
          .filter((lab) => !userProfile?.solvedLabs.includes(lab.id))
          .sort((a, b) => {
            // Prioritize recommended difficulty
            if (a.difficulty === recommendedDifficulty && b.difficulty !== recommendedDifficulty) return -1;
            if (a.difficulty !== recommendedDifficulty && b.difficulty === recommendedDifficulty) return 1;
            // Then sort by solve count (popular labs)
            return (b.solveCount || 0) - (a.solveCount || 0);
          })
          .slice(0, 6);
        
        setRecentLabs(unsolved);

        // Get user rank
        const leaderboard = await getLeaderboard(1000);
        const rank = leaderboard.findIndex(u => u.uid === currentUser.uid) + 1;
        setUserRank(rank);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const solvedCount = user.solvedLabs.length;
  const totalLabs = labs.length;
  const progressPercentage = totalLabs > 0 ? (solvedCount / totalLabs) * 100 : 0;
  
  // Calculate stats
  const easyLabs = labs.filter(l => l.difficulty === 'easy');
  const mediumLabs = labs.filter(l => l.difficulty === 'medium');
  const hardLabs = labs.filter(l => l.difficulty === 'hard');
  
  const easySolved = easyLabs.filter(l => user.solvedLabs.includes(l.id)).length;
  const mediumSolved = mediumLabs.filter(l => user.solvedLabs.includes(l.id)).length;
  const hardSolved = hardLabs.filter(l => user.solvedLabs.includes(l.id)).length;

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Welcome back, <span className="gradient-text">{user.displayName}</span>
          </h1>
          <p className="text-gray-400 text-lg">Track your progress and continue learning</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Points */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/30 rounded-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{user.points.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Points</p>
          </div>

          {/* Global Rank */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/leaderboard')}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold mb-1">#{userRank > 0 ? userRank : '-'}</p>
            <p className="text-gray-400 text-sm">Global Rank</p>
          </div>

          {/* Solved Labs */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{solvedCount}</p>
            <p className="text-gray-400 text-sm">Labs Completed</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{progressPercentage.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm">Completion Rate</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Progress Card */}
          <div className="lg:col-span-2 bg-dark-light border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Progress</h2>
              <Activity className="w-6 h-6 text-primary" />
            </div>

            <div className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-400">Overall Completion</span>
                  <span className="text-sm font-bold text-white">{solvedCount}/{totalLabs} Labs</span>
                </div>
                <div className="w-full bg-dark h-4 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-400">Easy</span>
                  </div>
                  <p className="text-xl font-bold">{easySolved}/{easyLabs.length}</p>
                  <div className="w-full bg-gray-800 h-1 rounded-full mt-2">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${easyLabs.length > 0 ? (easySolved / easyLabs.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-400">Medium</span>
                  </div>
                  <p className="text-xl font-bold">{mediumSolved}/{mediumLabs.length}</p>
                  <div className="w-full bg-gray-800 h-1 rounded-full mt-2">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${mediumLabs.length > 0 ? (mediumSolved / mediumLabs.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-400">Hard</span>
                  </div>
                  <p className="text-xl font-bold">{hardSolved}/{hardLabs.length}</p>
                  <div className="w-full bg-gray-800 h-1 rounded-full mt-2">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${hardLabs.length > 0 ? (hardSolved / hardLabs.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-dark-light border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm text-gray-400">Remaining</span>
                </div>
                <span className="font-bold">{totalLabs - solvedCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-400">Avg Points/Lab</span>
                </div>
                <span className="font-bold">
                  {solvedCount > 0 ? Math.round(user.points / solvedCount) : 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Total Labs</span>
                </div>
                <span className="font-bold">{totalLabs}</span>
              </div>

              <button
                onClick={() => router.push('/leaderboard')}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Trophy className="w-5 h-5" />
                View Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Labs */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Recommended For You</h2>
              <p className="text-gray-400 text-sm">Based on your progress and skill level</p>
            </div>
            <button
              onClick={() => router.push('/labs')}
              className="text-primary hover:text-primary-light text-sm transition-colors flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentLabs.length === 0 ? (
            <div className="bg-dark-light border border-gray-800 rounded-xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">All Labs Completed!</h3>
              <p className="text-gray-400 mb-6">
                Congratulations! You've completed all available labs.
              </p>
              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
              >
                View Leaderboard
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  isSolved={user.solvedLabs.includes(lab.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready for More Challenges?</h3>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Explore more labs and improve your penetration testing skills
          </p>
          <button
            onClick={() => router.push('/labs')}
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            Browse All Labs
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
