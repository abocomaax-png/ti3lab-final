'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/labs', label: 'المعامل' },
    { href: '/leaderboard', label: 'المتصدرين' },
  ];

  return (
    <nav className="glass-dark border-b border-gray-800/50 sticky top-0 z-50 backdrop-blur-md" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 space-x-reverse group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image src="/logo.png" alt="Ti3lab Logo" fill className="object-contain" priority />
            </div>
            <span className="text-2xl font-bold gradient-text font-cairo">Ti3lab</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive(link.href) || (link.href === '/labs' && pathname?.startsWith('/labs/'))
                    ? 'text-primary'
                    : 'text-gray-300 hover:text-white'
                } transition-colors font-tajawal font-medium`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${isActive('/dashboard') ? 'text-primary' : 'text-gray-300 hover:text-white'} transition-colors font-tajawal font-medium`}
                >
                  لوحة التحكم
                </Link>
                <Link
                  href="/profile"
                  className={`${isActive('/profile') ? 'text-primary' : 'text-gray-300 hover:text-white'} transition-colors font-tajawal font-medium`}
                >
                  الملف الشخصي
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 space-x-reverse text-gray-300 hover:text-primary transition-colors font-tajawal"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors font-tajawal font-medium">
                  دخول
                </Link>
                <Link href="/auth/signup" className="btn-primary px-5 py-2 rounded-lg text-sm font-cairo font-semibold">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-slide-up">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg ${
                  isActive(link.href) || (link.href === '/labs' && pathname?.startsWith('/labs/'))
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-300 hover:bg-gray-800/50'
                } transition-colors font-tajawal`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg ${isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-300 hover:bg-gray-800/50'} transition-colors font-tajawal`}
                >
                  لوحة التحكم
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg ${isActive('/profile') ? 'text-primary bg-primary/10' : 'text-gray-300 hover:bg-gray-800/50'} transition-colors font-tajawal`}
                >
                  الملف الشخصي
                </Link>
                <button
                  onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-gray-300 hover:text-primary transition-colors font-tajawal w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors font-tajawal"
                >
                  دخول
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg btn-primary text-sm font-cairo font-semibold"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
