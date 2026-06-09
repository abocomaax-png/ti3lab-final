'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, User } from '@/lib/firestore';
import { Trophy, Award, Target, Crown, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(100);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
      case 2:
        return 'bg-gray-400/20 border-gray-400 text-gray-400';
      case 3:
        return 'bg-amber-700/20 border-amber-700 text-amber-700';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-400';
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 3) return `${username[0]}***@${domain}`;
    return `${username.substring(0, 3)}***@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Top performers on the platform
          </p>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Second Place */}
            <div className="md:order-1 order-2">
              <div className="bg-gradient-to-b from-gray-400/10 to-transparent border border-gray-400 rounded-xl p-6 text-center transform md:translate-y-8 hover:scale-105 transition-transform">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Medal className="w-8 h-8 text-gray-400" />
                  <span className="text-4xl font-bold text-gray-400">2</span>
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {users[1].displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold mb-1">{users[1].displayName}</h3>
                <p className="text-xs text-gray-500 mb-4">{maskEmail(users[1].email)}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-bold text-lg">{users[1].points.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">pts</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-400">{users[1].solvedLabs.length} solved</span>
                </div>
              </div>
            </div>

            {/* First Place */}
            <div className="md:order-2 order-1">
              <div className="bg-gradient-to-b from-yellow-500/20 to-transparent border-2 border-yellow-500 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
                  <span className="text-5xl font-bold text-yellow-500">1</span>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-yellow-500/50">
                  {users[0].displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold mb-1">{users[0].displayName}</h3>
                <p className="text-xs text-gray-500 mb-4">{maskEmail(users[0].email)}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{users[0].points.toLocaleString()}</span>
                  <span className="text-gray-400">pts</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-400">{users[0].solvedLabs.length} solved</span>
                </div>
              </div>
            </div>

            {/* Third Place */}
            <div className="md:order-3 order-3">
              <div className="bg-gradient-to-b from-amber-700/10 to-transparent border border-amber-700 rounded-xl p-6 text-center transform md:translate-y-16 hover:scale-105 transition-transform">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Medal className="w-7 h-7 text-amber-700" />
                  <span className="text-3xl font-bold text-amber-700">3</span>
                </div>
                <div className="w-18 h-18 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {users[2].displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold mb-1">{users[2].displayName}</h3>
                <p className="text-xs text-gray-500 mb-4">{maskEmail(users[2].email)}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-bold">{users[2].points.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">pts</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-400">{users[2].solvedLabs.length} solved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-dark-light border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-dark border-b border-gray-800 px-6 py-4">
            <h2 className="text-xl font-bold">All Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Labs Solved
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Avg Points/Lab
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user, index) => {
                  const avgPointsPerLab = user.solvedLabs.length > 0 
                    ? Math.round(user.points / user.solvedLabs.length) 
                    : 0;
                  
                  return (
                    <tr
                      key={user.uid}
                      className={`hover:bg-dark/50 transition-colors ${
                        index < 3 ? 'bg-dark/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border font-bold ${getRankBadgeColor(
                              index + 1
                            )}`}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center font-bold text-lg">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{user.displayName}</p>
                            <p className="text-xs text-gray-500">{maskEmail(user.email)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          <span className="font-bold text-xl">{user.points.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-lg">{user.solvedLabs.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 font-medium">{avgPointsPerLab}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No users yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}
