import Link from 'next/link';
import { Lab } from '@/lib/firestore';
import { Award, Users, CheckCircle } from 'lucide-react';

interface LabCardProps {
  lab: Lab;
  isSolved?: boolean;
}

export default function LabCard({ lab, isSolved = false }: LabCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500 bg-green-500/10 border-green-500';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'hard':
        return 'text-red-500 bg-red-500/10 border-red-500';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'سهل';
      case 'medium':
        return 'متوسط';
      case 'hard':
        return 'صعب';
      default:
        return difficulty;
    }
  };

  return (
    <Link href={`/labs/${lab.id}`}>
      <div className="bg-dark-light border border-gray-800 rounded-xl p-6 hover:border-primary transition-all cursor-pointer relative overflow-hidden group">
        {/* Solved Badge */}
        {isSolved && (
          <div className="absolute top-4 left-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        )}

        {/* Difficulty Badge */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${getDifficultyColor(lab.difficulty)}`}>
          {getDifficultyText(lab.difficulty)}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {lab.titleAr}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {lab.descriptionAr}
        </p>

        {/* Category */}
        <div className="mb-4">
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {lab.categoryAr}
          </span>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
            <Award className="w-4 h-4" />
            <span>{lab.points} نقطة</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{lab.solveCount || 0} حلّوها</span>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    </Link>
  );
}
