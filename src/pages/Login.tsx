import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Sun, Moon, Monitor, ShieldCheck, Building2, Laptop, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialUsers, defaultCurrentUser } from '../store/data';

const CAROUSEL_SLIDES = [
  {
    image: '/cover-1.jpg',
    fallback: '/cover.jpg',
    title: 'Gedung Kampus SMK IT Ibnul Qayyim',
    subtitle: 'Mewujudkan lingkungan pendidikan vokasi islami yang modern, berkarakter, dan berdaya saing global.',
    icon: Building2,
    tag: 'Fasilitas Kampus'
  },
  {
    image: '/cover-2.jpg',
    fallback: '/cover-lab.jpg',
    title: 'Laboratorium Komputer & Teknologi Informasi',
    subtitle: 'Dukungan sarana prasarana canggih untuk mencetak talenta digital dan ahli teknologi masa depan.',
    icon: Laptop,
    tag: 'Lab Multimedia & Komputer'
  },
  {
    image: '/cover-3.jpg',
    fallback: '/cover-perpus.jpg',
    title: 'Pusat Riset & Perpustakaan Terpadu',
    subtitle: 'Inventarisasi dan pengelolaan aset pendidikan yang tertib, transparan, dan akuntabel.',
    icon: BookOpen,
    tag: 'Sarpras & Fasilitas'
  }
];

export default function Login() {
  const [users] = useLocalStorage('iq-users', initialUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<any>('iq-current-user', defaultCurrentUser);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('iq-auth-logged-in', false);

  const [email, setEmail] = useState('admin@smkit.sch.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const executeLogin = (userToLogin: any) => {
    setCurrentUser(userToLogin);
    setIsAuthenticated(true);
    setSuccessMessage(`Selamat datang, ${userToLogin.name}! Mengalihkan ke dashboard...`);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Match against current users stored in localStorage
    const matchedUser = users.find((u: any) => u.email.toLowerCase().trim() === cleanEmail);

    if (!matchedUser) {
      setErrorMessage(`Email "${email}" tidak terdaftar dalam sistem kelola pengguna.`);
      return;
    }

    const expectedPassword = matchedUser.password || 'password123';
    if (cleanPassword !== expectedPassword) {
      setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
      return;
    }

    if (matchedUser.status === 'Nonaktif') {
      setErrorMessage('Akun Anda saat ini berstatus Nonaktif. Silakan hubungi Administrator.');
      return;
    }

    executeLogin(matchedUser);
  };

  const activeSlide = CAROUSEL_SLIDES[currentSlide];
  const SlideIcon = activeSlide.icon;

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 font-sans">
      {/* Left section - Image Carousel */}
      <div className="hidden lg:flex w-[55%] relative bg-slate-900 overflow-hidden select-none">
        {/* Background Image Carousel with smooth crossfade */}
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== window.location.origin + slide.fallback) {
                  target.src = slide.fallback;
                }
              }}
            />
            {/* Elegant dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
          </div>
        ))}

        {/* Top Branding Badge on Cover */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-10 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <img 
            src="/logo.svg" 
            alt="Logo SMK IT" 
            className="w-7 h-7 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
          <span className="text-white font-semibold text-xs tracking-wider uppercase">SMK IT Ibnul Qayyim</span>
        </div>

        {/* Slide Info & Captions */}
        <div className="absolute bottom-12 left-10 right-10 z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-sm">
            <SlideIcon className="w-3.5 h-3.5" />
            {activeSlide.tag}
          </div>
          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white drop-shadow-md">
            {activeSlide.title}
          </h2>
          <p className="text-slate-200 text-sm xl:text-base mt-2 max-w-xl leading-relaxed drop-shadow">
            {activeSlide.subtitle}
          </p>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {CAROUSEL_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none z-10">
          <button 
            type="button"
            onClick={handlePrevSlide}
            className="pointer-events-auto w-11 h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={handleNextSlide}
            className="pointer-events-auto w-11 h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right section - Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center relative p-8 sm:p-12 md:p-14 overflow-y-auto">
        {/* Theme Toggles (Top Right) */}
        <div className="absolute top-6 right-6 flex items-center border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden bg-white dark:bg-slate-900 shadow-sm text-slate-400">
          <button onClick={() => setTheme('light')} className={`p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${theme === 'light' ? 'text-emerald-600 bg-slate-50 dark:bg-slate-800' : ''}`} title="Tema Terang">
            <Sun className="w-4 h-4" />
          </button>
          <button onClick={() => setTheme('dark')} className={`p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-l border-r border-slate-200 dark:border-slate-800 transition-colors ${theme === 'dark' ? 'text-emerald-600 bg-slate-50 dark:bg-slate-800' : ''}`} title="Tema Gelap">
            <Moon className="w-4 h-4" />
          </button>
          <button onClick={() => setTheme('system')} className={`p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${theme === 'system' ? 'text-emerald-600 bg-slate-50 dark:bg-slate-800' : ''}`} title="Ikuti Sistem">
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full max-w-[420px] space-y-6 my-auto pt-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
              <img 
                src="/logo.svg" 
                alt="Logo SMK IT Ibnul Qayyim" 
                className="h-16 w-16 object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-md">
                Sistem Sarpras & Aset
              </span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-1">SMK IT Ibnul Qayyim</h2>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Asalamu'alaikum</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              Masuk dengan akun terdaftar di sistem kelola pengguna.
            </p>
          </div>

          {/* Active Session Notice if already logged in */}
          {isAuthenticated && currentUser && (
            <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-xs text-emerald-900 dark:text-emerald-100 flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-[11px] text-emerald-700 dark:text-emerald-400">Sesi Login Sedang Aktif:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">({currentUser.role})</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Online
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 flex-1"
                >
                  Lanjut ke Dashboard
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  className="text-xs h-8 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50"
                >
                  Ganti Akun
                </Button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Email Pengguna</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-[18px] w-[18px]" />
                </div>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smkit.sch.id" 
                  className="pl-11 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-600 bg-slate-50/50 dark:bg-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Kata Sandi</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-[18px] w-[18px]" />
                </div>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi" 
                  className="pl-11 pr-11 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-600 bg-slate-50/50 dark:bg-slate-900 text-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Ingat sesi saya</span>
              </label>
            </div>

            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 rounded-xl text-sm font-bold tracking-wide mt-1 shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.01] active:scale-[0.99]">
              <ShieldCheck className="w-4 h-4 mr-2 text-slate-950 font-bold" /> Masuk ke Dashboard Sarpras
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

