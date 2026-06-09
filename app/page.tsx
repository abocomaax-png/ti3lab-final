import Link from 'next/link';
import Image from 'next/image';
import { Target, Award, Users, Code, Lock, Zap, BookOpen, Database, Shield, Network, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary-900/10 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo Animation */}
            <div className="inline-block mb-8 animate-float">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <Image
                  src="/logo.png"
                  alt="Ti3lab Logo"
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="gradient-text">Ti3lab</span>
            </h1>
            
            <p className="text-2xl lg:text-3xl text-gray-200 mb-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
              First Arabic Platform for Penetration Testing Labs
            </p>
            
            <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              Master web application security through hands-on interactive labs and real-world scenarios
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Link
                href="/labs"
                className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-primary/50 hover:shadow-primary/70 hover:scale-105 inline-block"
              >
                Start Learning Now
              </Link>
              <Link
                href="/auth/signup"
                className="bg-dark-light border-2 border-primary/30 hover:border-primary text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
              >
                Create Free Account
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
              {[
                { num: '50+', label: 'Interactive Labs', icon: Code },
                { num: '1,000+', label: 'Active Learners', icon: Users },
                { num: '12', label: 'Categories', icon: BookOpen },
                { num: '24/7', label: 'Available', icon: Zap }
              ].map((stat, i) => (
                <div key={i} className="bg-dark-light border border-gray-800 hover:border-primary/50 rounded-xl p-6 transition-all hover:scale-105 animate-slide-up" style={{animationDelay: `${0.4 + i * 0.1}s`}}>
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-4xl font-bold text-white mb-2">{stat.num}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-light/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">Ti3lab</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience a unique learning journey combining theory with hands-on practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Target, 
                title: 'Hands-On Labs', 
                desc: 'Practice on real vulnerabilities in a safe, controlled environment',
                color: 'text-red-500',
                bgColor: 'bg-red-500/10'
              },
              { 
                icon: BookOpen, 
                title: 'Comprehensive Content', 
                desc: 'Learn from beginner to advanced with structured learning paths',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10'
              },
              { 
                icon: Award, 
                title: 'Gamified Learning', 
                desc: 'Earn points, badges, and compete on the global leaderboard',
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10'
              },
              { 
                icon: Users, 
                title: 'Active Community', 
                desc: 'Join thousands of cybersecurity professionals and enthusiasts',
                color: 'text-green-500',
                bgColor: 'bg-green-500/10'
              },
              { 
                icon: Lock, 
                title: 'Secure Environment', 
                desc: 'Practice safely in isolated, sandboxed lab environments',
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10'
              },
              { 
                icon: Zap, 
                title: 'Regular Updates', 
                desc: 'New labs added regularly to keep up with latest vulnerabilities',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-dark-light border border-gray-800 hover:border-primary/50 rounded-xl p-8 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/10 animate-slide-up group"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Lab <span className="gradient-text">Categories</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Master different types of vulnerabilities and penetration testing techniques
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Database, 
                title: 'SQL Injection', 
                count: '15 Labs', 
                color: 'from-red-500/20 to-red-900/20',
                borderColor: 'border-red-500/30',
                iconColor: 'text-red-500'
              },
              { 
                icon: Code, 
                title: 'XSS', 
                count: '12 Labs', 
                color: 'from-yellow-500/20 to-yellow-900/20',
                borderColor: 'border-yellow-500/30',
                iconColor: 'text-yellow-500'
              },
              { 
                icon: Lock, 
                title: 'Authentication', 
                count: '10 Labs', 
                color: 'from-blue-500/20 to-blue-900/20',
                borderColor: 'border-blue-500/30',
                iconColor: 'text-blue-500'
              },
              { 
                icon: Shield, 
                title: 'CSRF', 
                count: '8 Labs', 
                color: 'from-green-500/20 to-green-900/20',
                borderColor: 'border-green-500/30',
                iconColor: 'text-green-500'
              },
              { 
                icon: Network, 
                title: 'SSRF', 
                count: '6 Labs', 
                color: 'from-purple-500/20 to-purple-900/20',
                borderColor: 'border-purple-500/30',
                iconColor: 'text-purple-500'
              },
              { 
                icon: FileText, 
                title: 'Business Logic', 
                count: '9 Labs', 
                color: 'from-cyan-500/20 to-cyan-900/20',
                borderColor: 'border-cyan-500/30',
                iconColor: 'text-cyan-500'
              },
              { 
                icon: Code, 
                title: 'API Security', 
                count: '7 Labs', 
                color: 'from-pink-500/20 to-pink-900/20',
                borderColor: 'border-pink-500/30',
                iconColor: 'text-pink-500'
              },
              { 
                icon: Target, 
                title: 'Access Control', 
                count: '11 Labs', 
                color: 'from-orange-500/20 to-orange-900/20',
                borderColor: 'border-orange-500/30',
                iconColor: 'text-orange-500'
              }
            ].map((cat, i) => (
              <Link 
                key={i} 
                href="/labs"
                className={`bg-dark-light border ${cat.borderColor} rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-xl bg-gradient-to-br ${cat.color} animate-slide-up group`}
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <cat.icon className={`w-12 h-12 mx-auto mb-4 ${cat.iconColor} group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg font-bold mb-2">{cat.title}</h3>
                <p className="text-gray-400 text-sm">{cat.count}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/labs"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors text-lg font-semibold"
            >
              View All Categories
              <Zap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-primary/30 to-primary-900/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl lg:text-2xl mb-10 text-gray-200">
            Join thousands of learners and master penetration testing skills today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-primary hover:bg-gray-100 px-12 py-5 rounded-xl text-xl font-bold transition-all shadow-2xl hover:shadow-white/20 hover:scale-105 inline-block"
            >
              Get Started Free
            </Link>
            <Link
              href="/labs"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-12 py-5 rounded-xl text-xl font-bold transition-all hover:scale-105 inline-block"
            >
              Browse Labs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
