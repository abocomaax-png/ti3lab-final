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
  Calendar, 
  Trophy, 
  Mail, 
  TrendingUp,
  CheckCircle,
  Zap,
  Medal,
  Star,
  Crown,
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [solvedLabs, setSolvedLabs] = useState<Lab[]>([]);
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

          const allLabs = await getAllLabs();
          setLabs(allLabs);

          const solved = allLabs.filter((lab) =>
            userProfile.solvedLabs.includes(lab.id)
          );
          setSolvedLabs(solved);

          // Get user rank
          const leaderboard = await getLeaderboard(1000);
          const rank = leaderboard.findIndex(u => u.uid === currentUser.uid) + 1;
          setUserRank(rank);
        }
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
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getCategoryStats = () => {
    const categories: { [key: string]: number } = {};
    solvedLabs.forEach((lab) => {
      categories[lab.category] = (categories[lab.category] || 0) + 1;
    });
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getDifficultyStats = () => {
    return {
      easy: solvedLabs.filter(l => l.difficulty === 'easy').length,
      medium: solvedLabs.filter(l => l.difficulty === 'medium').length,
      hard: solvedLabs.filter(l => l.difficulty === 'hard').length
    };
  };

  const categoryStats = getCategoryStats();
  const difficultyStats = getDifficultyStats();
  const completionRate = labs.length > 0 ? (user.solvedLabs.length / labs.length) * 100 : 0;
  const avgPointsPerLab = solvedLabs.length > 0 ? Math.round(user.points / solvedLabs.length) : 0;

  const achievements = [
    { 
      unlocked: user.solvedLabs.length >= 1, 
      icon: Target, 
      label: 'First Blood', 
      desc: 'Solved first lab',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      unlocked: user.solvedLabs.length >= 10, 
      icon: Zap, 
      label: 'Rising Star', 
      desc: '10 labs solved',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    { 
      unlocked: user.points >= 100, 
      icon: Star, 
      label: 'Point Hunter', 
      desc: '100 points earned',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      unlocked: user.solvedLabs.length >= 25, 
      icon: Medal, 
      label: 'Dedicated', 
      desc: '25 labs solved',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      unlocked: user.points >= 500, 
      icon: Trophy, 
      label: 'Elite Hacker', 
      desc: '500 points earned',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    { 
      unlocked: user.solvedLabs.length >= 50, 
      icon: Crown, 
      label: 'Master', 
      desc: '50 labs solved',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-dark-light to-dark border border-gray-800 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-5xl font-bold shadow-lg shadow-primary/50">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              {userRank > 0 && userRank <= 10 && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  #{userRank}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-3">{user.displayName}</h1>
              <div className="flex flex-col md:flex-row gap-4 text-gray-400 mb-6">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark border border-primary/30 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-xs text-gray-400">Points</span>
                  </div>
                  <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
                </div>

                <div className="bg-dark border border-green-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-400">Solved</span>
                  </div>
                  <p className="text-2xl font-bold">{user.solvedLabs.length}</p>
                </div>

                <div className="bg-dark border border-yellow-500/30 rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/leaderboard')}>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-xs text-gray-400">Rank</span>
                  </div>
                  <p className="text-2xl font-bold">#{userRank > 0 ? userRank : '-'}</p>
                </div>

                <div className="bg-dark border border-blue-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-400">Completion</span>
                  </div>
                  <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <div className="bg-dark-light border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Overall Progress</h3>
                <Activity className="w-5 h-5 text-primary" />
              </div>
              
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      className="text-gray-800"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionRate / 100)}`}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute">
                    <p className="text-4xl font-bold">{completionRate.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-gray-400">
                  {user.solvedLabs.length} of {labs.length} labs completed
                </p>
              </div>

              {/* Difficulty Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">Easy</span>
                  </div>
                  <span className="font-bold">{difficultyStats.easy}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-400">Medium</span>
                  </div>
                  <span className="font-bold">{difficultyStats.medium}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">Hard</span>
                  </div>
                  <span className="font-bold">{difficultyStats.hard}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-dark-light border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-400">Avg Points/Lab</span>
                  </div>
                  <span className="font-bold">{avgPointsPerLab}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-400">Remaining</span>
                  </div>
                  <span className="font-bold">{labs.length - user.solvedLabs.length}</span>
                </div>
              </div>
            </div>

            {/* Category Stats */}
            <div className="bg-dark-light border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Top Categories</h3>
              {categoryStats.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {categoryStats.map(([category, count]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-300 capitalize">{category.replace(/_/g, ' ')}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-dark h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-light"
                          style={{
                            width: `${(count / solvedLabs.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-dark-light border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Achievements</h3>
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`${achievement.unlocked ? achievement.bgColor : 'bg-dark border border-gray-800'} rounded-lg p-4 text-center transition-all ${achievement.unlocked ? 'hover:scale-105' : 'opacity-40'}`}
                  >
                    <achievement.icon className={`w-8 h-8 mx-auto mb-2 ${achievement.unlocked ? achievement.color : 'text-gray-600'}`} />
                    <p className="text-xs font-bold mb-1">{achievement.label}</p>
                    <p className="text-xs text-gray-400">{achievement.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Solved Labs */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Solved Labs</h2>
                <span className="text-gray-400">{solvedLabs.length} total</span>
              </div>
              
              {solvedLabs.length === 0 ? (
                <div className="bg-dark-light border border-gray-800 rounded-xl p-12 text-center">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Labs Solved Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Start solving your first lab to earn points and experience
                  </p>
                  <button
                    onClick={() => router.push('/labs')}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg transition-colors font-semibold"
                  >
                    Browse Labs
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {solvedLabs.map((lab) => (
                    <LabCard key={lab.id} lab={lab} isSolved={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
