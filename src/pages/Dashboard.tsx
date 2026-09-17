import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { 
  Box, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  Wrench, 
  Check, 
  X, 
  ChevronRight, 
  Building2, 
  Layers, 
  ArrowUpRight,
  ShieldAlert,
  Inbox,
  Sparkles,
  Search,
  QrCode,
  PieChart as PieChartIcon,
  Wallet,
  Landmark,
  FileSpreadsheet,
  BookOpen,
  Bookmark,
  ClipboardCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialAssets, initialConsumables, initialLoans, initialMaintenanceRecords, initialBooks, initialBookLoans, Book, BookLoan } from '../store/data';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ensureAssetUnits, AssetUnit, FUNDING_SOURCES, FundingSource } from '../lib/assetUtils';

const usageData = [
  { name: 'Jan', peminjaman: 45, pengembalian: 40 },
  { name: 'Feb', peminjaman: 52, pengembalian: 48 },
  { name: 'Mar', peminjaman: 38, pengembalian: 35 },
  { name: 'Apr', peminjaman: 65, pengembalian: 60 },
  { name: 'May', peminjaman: 48, pengembalian: 45 },
  { name: 'Jun', peminjaman: 30, pengembalian: 35 },
];

export default function Dashboard() {
  const [assets] = useLocalStorage('iq-assets', initialAssets);
  const [consumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [loans, setLoans] = useLocalStorage('iq-loans', initialLoans);
  const [books] = useLocalStorage<Book[]>('iq-books', initialBooks);
  const [bookLoans] = useLocalStorage<BookLoan[]>('iq-book-loans', initialBookLoans);
  const navigate = useNavigate();

  const [damagedFilter, setDamagedFilter] = useState<'ALL' | 'RUSAK_RINGAN' | 'RUSAK_BERAT'>('ALL');

  // --- 1. Total Assets Calculation ---
  const totalAssetTypes = assets.length;
  let totalPhysicalUnits = 0;
  let totalValuation = 0;
  let goodUnitsCount = 0;
  let rusakRinganCount = 0;
  let rusakBeratCount = 0;

  interface DamagedUnitDetail {
    assetId: string;
    assetName: string;
    category: string;
    location: string;
    unitId: string;
    unitCode: string;
    unitNumber: number;
    condition: 'RUSAK_RINGAN' | 'RUSAK_BERAT';
    notes?: string;
    serialNumber?: string;
  }

  const damagedUnitsList: DamagedUnitDetail[] = [];

  assets.forEach((asset: any) => {
    const units: AssetUnit[] = ensureAssetUnits(asset);
    totalPhysicalUnits += units.length;
    totalValuation += (Number(asset.price) || 0) * units.length;

    units.forEach((u) => {
      if (u.condition === 'RUSAK_RINGAN') {
        rusakRinganCount++;
        damagedUnitsList.push({
          assetId: asset.id,
          assetName: asset.name,
          category: asset.category,
          location: u.location || asset.location,
          unitId: u.id,
          unitCode: u.unitCode,
          unitNumber: u.unitNumber,
          condition: 'RUSAK_RINGAN',
          notes: u.notes || 'Butuh perbaikan ringan',
          serialNumber: u.serialNumber
        });
      } else if (u.condition === 'RUSAK_BERAT') {
        rusakBeratCount++;
        damagedUnitsList.push({
          assetId: asset.id,
          assetName: asset.name,
          category: asset.category,
          location: u.location || asset.location,
          unitId: u.id,
          unitCode: u.unitCode,
          unitNumber: u.unitNumber,
          condition: 'RUSAK_BERAT',
          notes: u.notes || 'Butuh pergantian suku cadang / penanganan teknisi',
          serialNumber: u.serialNumber
        });
      } else {
        goodUnitsCount++;
      }
    });
  });

  const totalDamagedUnits = rusakRinganCount + rusakBeratCount;
  const goodConditionPercent = totalPhysicalUnits > 0 
    ? Math.round((goodUnitsCount / totalPhysicalUnits) * 100) 
    : 100;

  // --- Funding Sources Categorization & Valuation ---
  const FUNDING_COLORS: Record<string, { hex: string; bg: string; text: string; border: string; desc: string }> = {
    'BOSP Reguler': { 
      hex: '#2563EB', 
      bg: 'bg-blue-50 dark:bg-blue-950/50', 
      text: 'text-blue-700 dark:text-blue-300', 
      border: 'border-blue-200 dark:border-blue-800',
      desc: 'Bantuan Operasional Satuan Pendidikan Reguler'
    },
    'BOSP Kinerja': { 
      hex: '#7C3AED', 
      bg: 'bg-purple-50 dark:bg-purple-950/50', 
      text: 'text-purple-700 dark:text-purple-300', 
      border: 'border-purple-200 dark:border-purple-800',
      desc: 'Alokasi Prestasi & Kinerja Kemendikbudristek'
    },
    'Operasional Sekolah': { 
      hex: '#059669', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/50', 
      text: 'text-emerald-700 dark:text-emerald-300', 
      border: 'border-emerald-200 dark:border-emerald-800',
      desc: 'Dana Yayasan & Komite Sekolah'
    },
    'Hibah': { 
      hex: '#D97706', 
      bg: 'bg-amber-50 dark:bg-amber-950/50', 
      text: 'text-amber-700 dark:text-amber-300', 
      border: 'border-amber-200 dark:border-amber-800',
      desc: 'Bantuan DUDI / Kemitraan Vokasi'
    },
    'Pinjam': { 
      hex: '#0891B2', 
      bg: 'bg-cyan-50 dark:bg-cyan-950/50', 
      text: 'text-cyan-800 dark:text-cyan-300', 
      border: 'border-cyan-200 dark:border-cyan-800',
      desc: 'Pinjaman Alat / Sarana dari Instansi / Industri / Mitra'
    },
    'Lainnya': { 
      hex: '#64748B', 
      bg: 'bg-slate-100 dark:bg-slate-900/60', 
      text: 'text-slate-700 dark:text-slate-300', 
      border: 'border-slate-200 dark:border-slate-800',
      desc: 'Sumber Anggaran / Donasi Non-Terikat Lainnya'
    },
  };

  const fundingMap: Record<string, { totalValue: number; totalUnits: number; assetCount: number }> = {
    'BOSP Reguler': { totalValue: 0, totalUnits: 0, assetCount: 0 },
    'BOSP Kinerja': { totalValue: 0, totalUnits: 0, assetCount: 0 },
    'Operasional Sekolah': { totalValue: 0, totalUnits: 0, assetCount: 0 },
    'Hibah': { totalValue: 0, totalUnits: 0, assetCount: 0 },
    'Pinjam': { totalValue: 0, totalUnits: 0, assetCount: 0 },
    'Lainnya': { totalValue: 0, totalUnits: 0, assetCount: 0 },
  };

  assets.forEach((asset: any) => {
    const source = (asset.fundingSource && fundingMap[asset.fundingSource]) ? asset.fundingSource : 'BOSP Reguler';
    const units: AssetUnit[] = ensureAssetUnits(asset);
    const val = (Number(asset.price) || 0) * units.length;

    if (!fundingMap[source]) {
      fundingMap[source] = { totalValue: 0, totalUnits: 0, assetCount: 0 };
    }
    fundingMap[source].totalValue += val;
    fundingMap[source].totalUnits += units.length;
    fundingMap[source].assetCount += 1;
  });

  const fundingChartData = Object.entries(fundingMap).map(([name, data]) => ({
    name,
    value: data.totalValue,
    totalUnits: data.totalUnits,
    assetCount: data.assetCount,
    percentage: totalValuation > 0 ? ((data.totalValue / totalValuation) * 100).toFixed(1) : '0',
    color: FUNDING_COLORS[name]?.hex || '#64748B'
  }));

  // --- 2. Consumables Calculation ---
  const lowStockItems = consumables.filter((c: any) => c.stock <= c.reorderPoint);
  const lowStockCount = lowStockItems.length;

  // --- 3. Loans & Pending Requests Calculation ---
  const pendingLoans = loans.filter((l: any) => l.status === 'MENUNGGU' || l.status === 'PENDING');
  const pendingLoansCount = pendingLoans.length;
  
  const activeLoans = loans.filter((l: any) => l.status === 'DIPINJAM' || l.status === 'TERLAMBAT' || l.status === 'DISETUJUI');

  // Handlers for quick loan actions directly on dashboard
  const handleQuickApproveLoan = (loanId: string) => {
    setLoans(loans.map((l: any) => l.id === loanId ? { ...l, status: 'DISETUJUI' } : l));
  };

  const handleQuickRejectLoan = (loanId: string) => {
    setLoans(loans.map((l: any) => l.id === loanId ? { ...l, status: 'SELESAI' } : l));
  };

  const recentStockActivities = [
    { id: 1, name: 'Kertas HVS A4 70gr', type: 'Keluar', qty: 3, unit: 'rim', date: '18/8/2026', by: 'Kelas XII TKJ' },
    { id: 2, name: 'Spidol Whiteboard', type: 'Masuk', qty: 10, unit: 'pcs', date: '17/8/2026', by: 'Pembelian Baru' },
    { id: 3, name: 'Tinta Printer Epson', type: 'Keluar', qty: 1, unit: 'botol', date: '15/8/2026', by: 'Ruang TU' },
  ];

  // High-value assets for maintenance schedule (>Rp 1,500,000)
  const highValueAssets = assets.filter((a: any) => (a.price || 0) >= 1500000);

  const maintenanceList = highValueAssets.map((asset: any) => {
    const lastDate = asset.lastServiceDate || asset.purchaseDate || '2026-01-01';
    const intervalDays = asset.maintenanceIntervalDays || 180;
    
    const lastDateObj = new Date(lastDate);
    const nextDueDateObj = new Date(lastDateObj.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    
    const today = new Date();
    const diffTime = nextDueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status = 'Aman';
    let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
    if (diffDays < 0) {
      status = 'Terlambat / Jatuh Tempo';
      badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400';
    } else if (diffDays <= 30) {
      status = `Segera (${diffDays} hr lagi)`;
      badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400';
    } else {
      status = `${diffDays} hr lagi`;
    }

    return {
      ...asset,
      lastServiceDate: lastDate,
      nextDueDate: nextDueDateObj.toISOString().split('T')[0],
      diffDays,
      status,
      badgeColor
    };
  }).sort((a, b) => a.diffDays - b.diffDays);

  const filteredDamagedUnits = damagedUnitsList.filter((item) => {
    if (damagedFilter === 'RUSAK_RINGAN') return item.condition === 'RUSAK_RINGAN';
    if (damagedFilter === 'RUSAK_BERAT') return item.condition === 'RUSAK_BERAT';
    return true;
  });

  // --- 4. Library Books Calculation ---
  const totalBookTitles = books.length;
  const totalBookCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const totalAvailableBooks = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const totalBorrowedBooks = books.reduce((acc, b) => acc + (b.borrowedCopies || 0), 0);
  const activeBookLoansList = bookLoans.filter(l => l.status === 'DIPINJAM' || l.status === 'TERLAMBAT');
  const overdueBookLoansList = bookLoans.filter(l => l.status === 'TERLAMBAT');

  return (
    <div className="space-y-6">
      {/* Header section with HSI / Mahazi Inspired Deep Forest Teal & Golden Amber Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              <span className="text-[#FFB800]">Ringkasan Inventaris</span> & Sarpras Terpadu.
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Sistem informasi monitoring sarana prasarana sekolah secara komprehensif, akurat, dan transparan sesuai standar mutu kelembagaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/stock-opname')} 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <ClipboardCheck className="w-4 h-4 mr-2 text-[#FFB800]" /> Stok Opname
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/inventory')} 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <Layers className="w-4 h-4 mr-2 text-[#FFB800]" /> Kelola Daftar Aset
            </Button>
            <Button 
              onClick={() => navigate('/scanner')} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Pindai QR / Barcode
            </Button>
          </div>
        </div>
      </div>
      
      {/* ========================================================================= */}
      {/* PRIMARY DASHBOARD SUMMARY CARDS VIEW (Total Assets, Damaged Items, Pending Loans) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Indikator Utama Sarana & Prasarana
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan kuantitas fisik, kondisi fisik aset, dan antrean pengajuan peminjaman.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. TOTAL ASSETS CARD */}
          <Card 
            id="card-summary-total-assets"
            className="p-5 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group bg-white dark:bg-slate-900"
            onClick={() => navigate('/inventory')}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Aset Sekolah
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalPhysicalUnits}
              </h3>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unit Fisik</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">{totalAssetTypes}</strong> Kategori Master
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Lihat Aset <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            
            <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Nilai Aset: <span className="text-slate-700 dark:text-slate-300 font-semibold">Rp {totalValuation.toLocaleString('id-ID')}</span>
            </div>
          </Card>

          {/* 2. DAMAGED ITEMS COUNT CARD */}
          <Card 
            id="card-summary-damaged-items"
            className="p-5 border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group bg-white dark:bg-slate-900"
            onClick={() => {
              const damagedSection = document.getElementById('damaged-items-section');
              if (damagedSection) {
                damagedSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                Barang Rusak
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {totalDamagedUnits}
              </h3>
              <span className="text-xs font-bold text-rose-600/80 dark:text-rose-400/80">Unit Butuh Servis</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 text-[10px] px-2 py-0.5">
                {rusakRinganCount} Rusak Ringan
              </Badge>
              <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 text-[10px] px-2 py-0.5">
                {rusakBeratCount} Rusak Berat
              </Badge>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Perlu pemeliharaan</span>
              <span className="text-slate-400 group-hover:text-rose-600 transition-colors flex items-center gap-0.5">
                Rincian <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Card>

          {/* 3. PENDING LOAN REQUESTS CARD */}
          <Card 
            id="card-summary-pending-loans"
            className="p-5 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group bg-white dark:bg-slate-900"
            onClick={() => navigate('/loans')}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                Pengajuan Pinjam
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Inbox className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {pendingLoansCount}
              </h3>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Menunggu Persetujuan</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">{activeLoans.length}</strong> Peminjaman Aktif
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Verifikasi <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-400/90 font-medium">
              {pendingLoansCount > 0 ? '⚠️ Butuh tinjauan admin sarpras' : '✓ Semua permohonan telah diproses'}
            </div>
          </Card>

          {/* 4. READY INVENTORY & OPERATIONAL READINESS */}
          <Card 
            id="card-summary-operational-readiness"
            className="p-5 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group bg-white dark:bg-slate-900"
            onClick={() => navigate('/inventory')}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Kondisi Baik & Siap
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                {goodUnitsCount}
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Unit ({goodConditionPercent}%)</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Stok BHP Menipis: <strong className={`font-semibold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{lowStockCount}</strong>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                {goodConditionPercent >= 80 ? 'Kesiapan Tinggi' : 'Perlu Atensi'}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Siap digunakan dalam kegiatan KBM & Praktik
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIONABLE PANELS: PENDING LOAN REQUESTS & DAMAGED ASSETS BREAKDOWN */}
      {/* ========================================================================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PENDING LOAN REQUESTS CARD PANEL */}
        <Card id="pending-loans-section" className="p-6 border-amber-200/80 dark:border-amber-900/40 shadow-xs flex flex-col bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Pengajuan Peminjaman Menunggu ({pendingLoansCount})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permohonan inventaris & ruangan yang butuh persetujuan</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/loans')}
              className="text-xs h-8 gap-1 border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300"
            >
              Semua Permohonan <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3 flex-1">
            {pendingLoans.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada pengajuan yang menunggu</p>
                <p className="text-xs text-slate-400 mt-1">Semua permohonan peminjaman inventaris & ruangan sudah diproses.</p>
              </div>
            ) : (
              pendingLoans.map((loan: any) => (
                <div 
                  key={loan.id} 
                  className="border border-amber-100 dark:border-amber-950/80 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-4 transition-all hover:shadow-xs hover:border-amber-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {loan.itemName}
                        </span>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-none text-[10px] px-2 py-0.5">
                          {loan.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Pemohon: <span className="font-semibold text-slate-900 dark:text-slate-200">{loan.borrowerName}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700 shrink-0">
                      📅 {loan.startDate} s/d {loan.endDate}
                    </span>
                  </div>

                  {loan.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mb-3 italic">
                      &ldquo;{loan.notes}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100/60 dark:border-slate-800/80">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickRejectLoan(loan.id)}
                      className="h-7 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200 dark:border-rose-900/50 gap-1 px-2.5"
                    >
                      <X className="w-3.5 h-3.5" /> Tolak
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleQuickApproveLoan(loan.id)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1 px-3 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui Permohonan
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* DAMAGED ITEMS BREAKDOWN CARD PANEL */}
        <Card id="damaged-items-section" className="p-6 border-rose-200/80 dark:border-rose-900/40 shadow-xs flex flex-col bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-rose-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Daftar Barang Rusak ({totalDamagedUnits} Unit)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Unit inventaris dengan kondisi rusak ringan & rusak berat</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto text-xs">
              <button
                onClick={() => setDamagedFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  damagedFilter === 'ALL' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Semua ({totalDamagedUnits})
              </button>
              <button
                onClick={() => setDamagedFilter('RUSAK_RINGAN')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  damagedFilter === 'RUSAK_RINGAN' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Ringan ({rusakRinganCount})
              </button>
              <button
                onClick={() => setDamagedFilter('RUSAK_BERAT')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  damagedFilter === 'RUSAK_BERAT' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Berat ({rusakBeratCount})
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 max-h-[360px] overflow-y-auto pr-1">
            {filteredDamagedUnits.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada barang dalam kategori ini</p>
                <p className="text-xs text-slate-400 mt-1">Seluruh unit aset berada dalam kondisi siap pakai.</p>
              </div>
            ) : (
              filteredDamagedUnits.map((item) => (
                <div 
                  key={item.unitId} 
                  className="border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3.5 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
                        {item.unitCode}
                      </span>
                      <Badge className={
                        item.condition === 'RUSAK_BERAT'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-none text-[10px] font-bold'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-none text-[10px] font-bold'
                      }>
                        {item.condition === 'RUSAK_BERAT' ? 'Rusak Berat' : 'Rusak Ringan'}
                      </Badge>
                      <span className="text-[11px] text-slate-400">&bull; {item.location}</span>
                    </div>

                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                      {item.assetName} (Unit #{item.unitNumber})
                    </h4>
                    
                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        Keterangan: <span className="text-slate-700 dark:text-slate-300">{item.notes}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/maintenance')}
                      className="h-8 text-xs gap-1 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Wrench className="w-3 h-3" /> Perbaiki
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/inventory')}
                      className="h-8 text-xs gap-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Detail <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL SUMMARY: ASSET VALUE BY FUNDING SOURCES (DONUT CHART & BREAKDOWN) */}
      {/* ========================================================================= */}
      <Card id="card-funding-sources-summary" className="p-6 border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Landmark className="w-3 h-3" /> Akuntabilitas Keuangan Sarpras
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                6 Sumber Perolehan & Anggaran
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Distribusi Nilai Aset Berdasarkan Sumber Anggaran & Pengadaan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Visualisasi proporsi investasi barang inventaris dan sarana pembelajaran berdasarkan alokasi dana & pengadaan: BOSP Reguler, BOSP Kinerja, Operasional Sekolah, Hibah, Pinjam (Mitra/DUDI), dan Lainnya.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Akumulasi Aset</span>
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                Rp {totalValuation.toLocaleString('id-ID')}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/inventory')}
              className="text-xs h-9 gap-1.5 border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <Box className="w-3.5 h-3.5" /> Buka Buku Inventaris
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Donut Chart Container - Scaled & Proportioned */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2">
            <div className="h-[320px] sm:h-[340px] w-full max-w-[360px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <div className="flex items-center gap-2 font-bold">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              <span>{data.name}</span>
                            </div>
                            <p className="text-emerald-300 font-extrabold text-sm">
                              Rp {Number(data.value).toLocaleString('id-ID')}
                            </p>
                            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-700/80 flex justify-between gap-4">
                              <span>Porsi Anggaran: <strong>{data.percentage}%</strong></span>
                              <span>Fisik: <strong>{data.totalUnits} unit</strong></span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={fundingChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={88}
                    outerRadius={128}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {fundingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Badge - Proportionate Typography */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Total Nilai</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight my-0.5">
                  {totalValuation >= 1000000000 
                    ? `Rp ${(totalValuation / 1000000000).toFixed(1)} M`
                    : totalValuation >= 1000000 
                    ? `Rp ${(totalValuation / 1000000).toFixed(1)} Jt`
                    : `Rp ${totalValuation.toLocaleString('id-ID')}`}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {totalPhysicalUnits} Unit Fisik
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Arahkan kursor ke cincin grafik untuk melihat rincian</span>
            </div>
          </div>

          {/* Funding Sources Cards Breakdown - 2-Column Responsive Grid matching chart height */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fundingChartData.map((item) => {
              const meta = FUNDING_COLORS[item.name] || FUNDING_COLORS['Lainnya'];
              return (
                <div
                  key={item.name}
                  onClick={() => navigate('/inventory')}
                  className={`p-3 rounded-xl border transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between gap-2.5 ${meta.bg} ${meta.border}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-xs" 
                      style={{ backgroundColor: meta.hex }} 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border bg-white dark:bg-slate-900 shrink-0 ${meta.text} ${meta.border}`}>
                          {item.percentage}%
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {meta.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Rp {item.value.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.totalUnits} Unit &bull; {item.assetCount} Item
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION: PERPUSTAKAAN, KOLEKSI BUKU & SIRKULASI PEMINJAMAN               */}
      {/* ========================================================================= */}
      <Card id="card-library-books-overview" className="p-6 border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#FFB800]" /> Literasi & Sumber Belajar
              </span>
              <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Kurikulum Merdeka Vokasi
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Perpustakaan & Sirkulasi Buku Vokasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Status ketersediaan judul buku kejuruan RPL, Bisnis Digital, Keislaman, serta monitoring peminjaman dan kondisi fisik eksemplar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/books')}
              className="text-xs h-9 gap-1.5 border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#FFB800]" /> Buka Modul Perpustakaan &rarr;
            </Button>
          </div>
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Koleksi Judul</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalBookTitles} <span className="text-xs font-normal text-slate-500">Judul</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {totalBookCopies} Eksemplar Fisik
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Tersedia di Rak</span>
            <div className="text-xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">
              {totalAvailableBooks} <span className="text-xs font-normal text-blue-600">Eksemplar</span>
            </div>
            <p className="text-[11px] text-blue-600/80 dark:text-blue-400 mt-0.5">
              Ready dipinjam ({totalBookCopies > 0 ? Math.round((totalAvailableBooks / totalBookCopies) * 100) : 100}%)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Sedang Dipinjam</span>
            <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
              {totalBorrowedBooks} <span className="text-xs font-normal text-amber-600">Eksemplar</span>
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400 mt-0.5">
              {activeBookLoansList.length} Transaksi Siswa/Guru
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">Jatuh Tempo / Terlambat</span>
            <div className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
              {overdueBookLoansList.length} <span className="text-xs font-normal text-rose-600">Buku</span>
            </div>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400 mt-0.5">
              Perlu pengingat sirkulasi
            </p>
          </div>
        </div>

        {/* Featured Book Titles List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Koleksi Buku Terkini & Ketersediaan Fisik
            </span>
            <button
              onClick={() => navigate('/books')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              Lihat Seluruh Koleksi ({books.length}) &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {books.slice(0, 3).map((b) => (
              <div
                key={b.id}
                onClick={() => navigate('/books')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {b.bookCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                    {b.category.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                    {b.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {b.author}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {b.availableCopies} Ready di Rak
                  </span>
                  <span className="text-slate-400 font-normal">
                    {b.borrowedCopies} Dipinjam / {b.totalCopies} Eks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Chart and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden flex flex-col border-slate-200/80 dark:border-slate-800">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Tren Peminjaman & Pengembalian Aset</h4>
              <p className="text-xs text-slate-400">Statistik transaksi peminjaman semester berjalan (2026)</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-200/50">
              Live Sync
            </span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-end">
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="peminjaman" fill="#10B981" radius={[4, 4, 0, 0]} name="Peminjaman" barSize={32} />
                  <Bar dataKey="pengembalian" fill="#34D399" radius={[4, 4, 0, 0]} name="Pengembalian" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Quick Action Box */}
        <div className="bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between border border-[#095445]/50">
          <div>
            <h4 className="font-bold mb-1 text-[#FFB800] flex items-center gap-2">
              <span>⚡</span> Menu Cepat Sarpras
            </h4>
            <p className="text-xs text-emerald-100/70 mb-5">Pintasan operasional tata usaha dan petugas inventaris</p>

            <div className="space-y-2.5">
              <button 
                onClick={() => navigate('/inventory')} 
                className="w-full bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] py-3 px-4 rounded-xl font-bold text-sm text-slate-950 flex items-center justify-between transition-all shadow-md shadow-amber-950/20 cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-slate-950">
                  <Box className="w-4 h-4 text-slate-950" /> Kelola Master Aset & Unit
                </span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>

              <button 
                onClick={() => navigate('/loans')} 
                className="w-full bg-[#064237]/60 hover:bg-[#064237] py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-between transition-colors border border-[#0F5C4E]/50 cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-emerald-100">
                  <Clock className="w-4 h-4 text-[#FFB800]" /> Peminjaman ({pendingLoansCount} Menunggu)
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </button>

              <button 
                onClick={() => navigate('/consumables')} 
                className="w-full bg-[#064237]/60 hover:bg-[#064237] py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-between transition-colors border border-[#0F5C4E]/50 cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" /> Restok Barang Habis Pakai
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </button>

              <button 
                onClick={() => navigate('/facilities')} 
                className="w-full bg-[#064237]/60 hover:bg-[#064237] py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-between transition-colors border border-[#0F5C4E]/50 cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-emerald-100">
                  <Building2 className="w-4 h-4 text-[#FFB800]" /> Reservasi Lab & Ruangan
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </button>
            </div>
          </div>

          <div className="mt-6 bg-[#021C16]/90 rounded-xl p-3.5 border border-[#08483B] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800] animate-pulse"></div>
              <span className="text-xs text-emerald-100/90 font-medium">Sistem Sarpras Online</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#FFB800] bg-[#032C24] px-2.5 py-0.5 rounded border border-[#095445]">
              v2.4 Ready
            </span>
          </div>
        </div>
      </div>

      {/* Maintenance Deadline Widget for High-Value Inventory */}
      <Card className="p-6 border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-950/60 p-2.5 rounded-xl text-emerald-700 dark:text-emerald-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Jadwal Pemeliharaan Aset Bernilai Tinggi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tenggat servis & pemeliharaan berkala berdasarkan tanggal servis terakhir (&gt;Rp 1.500.000)</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200/60 dark:border-emerald-800">
            {maintenanceList.length} Aset Terpantau
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maintenanceList.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">
              Tidak ada aset bernilai tinggi yang terdaftar.
            </div>
          ) : (
            maintenanceList.map((item: any) => (
              <div key={item.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-200 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{item.assetCode}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Nilai: <span className="font-medium text-slate-700 dark:text-slate-300">Rp {item.price?.toLocaleString('id-ID')}</span> &bull; {item.location}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Servis Terakhir</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.lastServiceDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Jatuh Tempo Servis</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.nextDueDate}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 3 Contextual Info Cards: Stock Alert, Recent Activity, Active Loans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Peringatan Stok Menipis */}
        <Card className="p-5 border-amber-200/80 dark:border-amber-900/50 shadow-xs flex flex-col bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Peringatan Stok Menipis</h4>
          </div>
          <div className="space-y-3 flex-1">
            {lowStockItems.length === 0 ? (
              <div className="h-full flex items-center justify-center min-h-[120px]">
                <p className="text-sm text-slate-500">Semua stok terpantau aman.</p>
              </div>
            ) : (
              lowStockItems.map((item: any, idx: number) => (
                <div key={idx} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100/60 dark:border-amber-900/50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.itemCode || item.code}</p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {item.stock} {item.unit}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 2. Aktivitas Stok Terbaru */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col bg-white dark:bg-slate-900">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Aktivitas Stok Terbaru</h4>
          <div className="space-y-4 flex-1">
            {recentStockActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0">
                <div className="mt-0.5">
                  {act.type === 'Keluar' ? <ArrowUpCircle className="h-4 w-4 text-rose-500" /> : <ArrowDownCircle className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{act.name}</p>
                    <span className="text-[10px] text-slate-400">{act.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{act.type} &bull; {act.qty} {act.unit} &bull; {act.by}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Barang Sedang Dipinjam */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#047857]" />
              Sedang Dipinjam
            </h4>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {activeLoans.length}
            </span>
          </div>
          <div className="space-y-3 flex-1">
            {activeLoans.length === 0 ? (
              <div className="h-full flex items-center justify-center min-h-[120px]">
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center">Tidak ada barang inventaris yang sedang dipinjam.</p>
              </div>
            ) : (
              activeLoans.slice(0, 3).map((loan: any) => (
                <div key={loan.id} className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{loan.itemName}</p>
                  <div className="flex justify-between mt-2 items-center">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-400"/> {loan.endDate}</p>
                    <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-xs">{loan.borrowerName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Asset Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 dark:text-slate-100">Log Aset Terbaru</h4>
          <button className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-medium" onClick={() => navigate('/reports')}>
            Lihat Semua Laporan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Aset</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Kondisi</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Beli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assets.slice(0, 5).map((asset: any) => (
                <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        asset.condition === 'BAIK' ? 'bg-emerald-500' : 
                        asset.condition === 'RUSAK_RINGAN' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></div>
                      <div>
                        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium block">{asset.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{asset.assetCode} &bull; {asset.quantity || 1} Unit</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">{asset.category}</td>
                  <td className="px-6 py-3.5 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      asset.condition === 'RUSAK_RINGAN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {asset.condition === 'BAIK' ? 'BAIK' : asset.condition === 'RUSAK_RINGAN' ? 'RUSAK RINGAN' : 'RUSAK BERAT'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">{asset.location}</td>
                  <td className="px-6 py-3.5 text-right text-xs text-slate-400 font-mono">{asset.purchaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
