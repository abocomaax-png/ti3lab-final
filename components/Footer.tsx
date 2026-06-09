'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Linkedin, Mail, Shield } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المعامل', href: '/labs' },
    { name: 'الأسعار', href: '/pricing' },
    { name: 'المتصدرين', href: '/leaderboard' },
  ];

  const legalLinks = [
    { name: 'الشروط والأحكام', href: '/legal/terms' },
    { name: 'سياسة الخصوصية', href: '/legal/privacy' },
    { name: 'سياسة الاسترجاع', href: '/legal/refund' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-dark border-t border-gray-800 mt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 space-x-reverse group">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/logo.png"
                  alt="Ti3lab Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold gradient-text font-cairo">Ti3lab</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              منصة تدريب احترافية في مجال الأمن السيبراني، نوفر معامل تفاعلية ومحتوى تعليمي عالي الجودة.
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">تعلم الاختراق الأخلاقي</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">الشروط والسياسات</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">تواصل معنا</h3>
            <div className="space-y-3 mb-4">
              <a href="mailto:support@ti3lab.com" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm" dir="ltr">
                <Mail className="w-4 h-4" />
                <span>support@ti3lab.com</span>
              </a>
            </div>
            
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors group" aria-label={social.name}>
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-right">
              © {currentYear} Ti3lab. جميع الحقوق محفوظة.
            </p>
            <p className="text-gray-500 text-xs text-center md:text-left">
              صُنع بـ ❤️ من أجل مجتمع الأمن السيبراني العربي
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
