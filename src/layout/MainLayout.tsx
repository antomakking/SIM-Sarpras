import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Box, Warehouse, QrCode, ClipboardList, Menu, X, LogOut, Search, Sun, Moon, CalendarClock, History, Users, Bell, AlertTriangle, CheckCircle, Clock, Wrench, BookOpen, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useTheme } from '../components/ThemeProvider';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialAssets, initialConsumables, initialRooms, defaultCurrentUser, initialMaintenanceRecords, initialBooks, initialStockOpnames } from '../store/data';

const sidebarLinks = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Bahan Habis Pakai', to: '/consumables', icon: ClipboardList },
  { name: 'Inventaris Sarpras', to: '/inventory', icon: Box },
  { name: 'Stok Opname', to: '/stock-opname', icon: ClipboardCheck },
  { name: 'Perpustakaan', to: '/books', icon: BookOpen },
  { name: 'Pemeliharaan', to: '/maintenance', icon: Wrench },
  { name: 'Fasilitas dan Ruangan', to: '/facilities', icon: Warehouse },
  { name: 'Peminjaman', to: '/loans', icon: CalendarClock },
  { name: 'Laporan', to: '/reports', icon: ClipboardList },
  { name: 'Pindai QR / Barcode', to: '/scanner', icon: QrCode },
  { name: 'Log Aktivitas', to: '/activity-log', icon: History },
  { name: 'Kelola Pengguna', to: '/users', icon: Users },
];

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [assets] = useLocalStorage('iq-assets', initialAssets);
  const [consumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);
  const [currentUser, setCurrentUser] = useLocalStorage<any>('iq-current-user', defaultCurrentUser);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('iq-auth-logged-in', false);
  const [maintenances] = useLocalStorage('iq-maintenances', initialMaintenanceRecords);
  const [books] = useLocalStorage('iq-books', initialBooks);
  const [stockOpnames] = useLocalStorage('iq-stock-opnames', initialStockOpnames);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  // Redirect to login if unauthenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const lowStockCount = consumables.filter((c: any) => c.stock <= (c.reorderPoint || 5)).length;

  const notifications = [
    {
      id: 1,
      title: 'Jadwal Cuci AC & Servis Berkala',
      desc: 'AC Split Panasonic (Studio Bisnis) sudah jatuh tempo cuci rutin.',
      time: 'Hari ini',
      type: 'warning',
      link: '/maintenance'
    },
    {
      id: 2,
      title: 'Peringatan Stok BHP Menipis',
      desc: `${lowStockCount} barang membutuhkan pengadaan baru segera.`,
      time: '10 menit lalu',
      type: 'warning',
      link: '/consumables'
    },
    {
      id: 3,
      title: 'Permintaan Peminjaman Baru',
      desc: 'Peminjaman Proyektor Epson menunggu persetujuan.',
      time: 'Hari ini',
      type: 'success',
      link: '/loans'
    }
  ];

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: any[] = [];
    assets.forEach((a: any) => {
      if (a.name?.toLowerCase().includes(query) || (a.assetCode && a.assetCode.toLowerCase().includes(query))) {
        results.push({ id: a.id, title: a.name, subtitle: a.assetCode || a.category, type: 'Inventaris', link: '/inventory' });
      }
    });
    consumables.forEach((c: any) => {
      if (c.name?.toLowerCase().includes(query) || (c.itemCode && c.itemCode.toLowerCase().includes(query))) {
        results.push({ id: c.id, title: c.name, subtitle: c.itemCode || c.category, type: 'BHP', link: '/consumables' });
      }
    });
    rooms.forEach((r: any) => {
      if (r.name?.toLowerCase().includes(query)) {
        results.push({ id: r.id, title: r.name, subtitle: 'Fasilitas dan Ruangan', type: 'Fasilitas', link: '/facilities' });
      }
    });
    books.forEach((b: any) => {
      if (b.title?.toLowerCase().includes(query) || (b.bookCode && b.bookCode.toLowerCase().includes(query)) || (b.author && b.author.toLowerCase().includes(query))) {
        results.push({ id: b.id, title: b.title, subtitle: `${b.bookCode} • ${b.author}`, type: 'Buku', link: '/books' });
      }
    });
    maintenances.forEach((m: any) => {
      if (m.title?.toLowerCase().includes(query) || m.ticketNumber?.toLowerCase().includes(query)) {
        results.push({ id: m.id, title: m.title, subtitle: `${m.ticketNumber} • ${m.assetName}`, type: 'Pemeliharaan', link: '/maintenance' });
      }
    });
    stockOpnames.forEach((so: any) => {
      if (so.title?.toLowerCase().includes(query) || so.sessionCode?.toLowerCase().includes(query)) {
        results.push({ id: so.id, title: so.title, subtitle: `${so.sessionCode} • ${so.auditorName}`, type: 'Stok Opname', link: '/stock-opname' });
      }
    });
    return results.slice(0, 5);
  }, [searchQuery, assets, consumables, rooms, maintenances, books, stockOpnames]);

  return (
    <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#021C16] flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 selection:bg-[#FFB800] selection:text-slate-950">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#032C24] text-white border-b border-[#0A473B] shadow-md">
        <div className="flex items-center gap-2.5 font-bold text-lg text-white">
          <div className="w-9 h-9 rounded-lg bg-[#064237] p-1 border border-[#0E5B4C] flex items-center justify-center shadow-inner">
            <img 
              src="/logo.svg" 
              alt="Logo SMK IT" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">SMK IT Ibnul Qayyim</span>
            <span className="text-[10px] font-medium text-[#FFB800] block tracking-wide">SIM Sarpras Terpadu</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="p-2 text-slate-200 hover:bg-[#064237] rounded-lg transition-colors"
            title="Ganti Tema"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-[#FFB800]" /> : <Moon className="h-5 w-5 text-slate-200" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 text-slate-200 hover:bg-[#064237] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Harmonized Sidebar: Deep Islamic Forest Teal with Gold Accents */}
      <aside className={cn(
        "bg-[#032C24] dark:bg-[#021F19] border-r border-[#08483B] dark:border-[#073D32] w-64 flex flex-col fixed md:sticky top-0 h-screen z-40 transition-transform shadow-2xl",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-20 shrink-0 bg-transparent border-b border-[#08483B] dark:border-[#073D32] hidden md:flex items-center px-4 gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#064237] p-1.5 border border-[#0F5C4E] flex items-center justify-center shadow-md">
            <img 
              src="/logo.svg" 
              alt="Logo SMK IT Ibnul Qayyim" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-sm tracking-tight truncate">SMK IT Ibnul Qayyim</h1>
            <p className="text-[#FFB800] text-[11px] font-semibold tracking-wide flex items-center gap-1">
              SIM Sarpras Terpadu
            </p>
          </div>
        </div>
        <div className="px-3.5 py-4 flex-1 overflow-y-auto sidebar-scrollbar">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 font-bold shadow-md shadow-amber-950/30"
                        : "text-emerald-100/80 hover:bg-[#064237] hover:text-white dark:text-emerald-200/70 dark:hover:bg-[#05392F] dark:hover:text-white"
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-3.5 border-t border-[#08483B] dark:border-[#073D32] shrink-0 bg-[#02231C]/90">
          <div 
            onClick={() => navigate('/users')}
            className="flex items-center gap-3 p-2.5 bg-[#064237]/60 hover:bg-[#064237] rounded-xl mb-3 cursor-pointer transition-colors border border-[#0F5C4E]/50"
            title="Kelola Akun Pengguna"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB800] to-[#E67E00] text-slate-950 font-extrabold flex items-center justify-center text-xs shadow-xs uppercase">
              {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Admin Sarpras'}</p>
              <p className="text-[10px] text-emerald-200/70 truncate">{currentUser?.email || 'admin@smkit.sch.id'}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full justify-start text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 dark:hover:bg-rose-950/60 h-9 rounded-lg"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Keluar Sistem (Logout)
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 hidden md:flex items-center justify-between px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center max-w-md w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input 
                type="search" 
                placeholder="Cari aset, bahan habis pakai, ruangan..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <ul className="py-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {searchResults.map((res, i) => (
                        <li 
                          key={i} 
                          className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer flex justify-between items-center transition-colors"
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                            navigate(res.link);
                          }}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{res.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{res.subtitle}</p>
                          </div>
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                            {res.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      Tidak ditemukan hasil untuk "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => navigate('/scanner')}
                className="w-9 h-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200/70 dark:border-slate-700 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:border-emerald-800 transition-colors shadow-xs"
                title="Pindai QR / Barcode"
             >
                <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
             </button>

             <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200/70 dark:border-slate-700 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors shadow-xs"
                title={theme === 'dark' ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
             >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
             </button>

             {/* Notifications Popover */}
             <div className="relative">
               <button 
                 onClick={() => setNotificationsOpen(!notificationsOpen)}
                 className="w-9 h-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200/70 dark:border-slate-700 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors relative shadow-xs"
                 title="Pemberitahuan Sistem"
               >
                 <Bell className="h-4 w-4" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
               </button>

               {notificationsOpen && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-4 z-50">
                   <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-100 dark:border-slate-800">
                     <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pemberitahuan ({notifications.length})</h4>
                     <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs">Tutup</button>
                   </div>
                   <div className="space-y-2.5">
                     {notifications.map((notif) => (
                       <div 
                         key={notif.id} 
                         onClick={() => { setNotificationsOpen(false); navigate(notif.link); }}
                         className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors"
                       >
                         <div className="flex items-start gap-2.5">
                           {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                           <div className="flex-1 min-w-0">
                             <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{notif.title}</p>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.desc}</p>
                             <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {notif.time}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* User Profile Pill & Logout in Header */}
             <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200 dark:border-slate-800">
               <div 
                 onClick={() => navigate('/users')}
                 className="text-right hidden xl:block cursor-pointer hover:opacity-80 transition-opacity"
                 title="Lihat Profil Pengguna"
               >
                 <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[150px]">{currentUser?.name || 'Admin Sarpras'}</p>
                 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[150px]">{currentUser?.role || 'Pengguna'}</p>
               </div>
               <button
                 onClick={handleLogout}
                 className="h-9 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                 title="Keluar dari Sistem (Logout)"
               >
                 <LogOut className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Keluar</span>
               </button>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto main-scrollbar">
          <div className="w-full max-w-7xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
