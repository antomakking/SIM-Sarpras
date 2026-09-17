import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  Wrench, 
  Handshake, 
  RotateCcw, 
  ClipboardCheck, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  Tag, 
  MapPin, 
  Printer, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Asset, 
  AssetHistoryEvent, 
  AssetHistoryEventType, 
  buildAssetHistoryTimeline, 
  calculateAssetAge, 
  formatRupiah, 
  formatConditionLabel, 
  getConditionBadgeColor, 
  getFundingSourceBadgeColor,
  ensureAssetUnits
} from '../lib/assetUtils';
import { downloadAssetHistoryPdf } from '../utils/pdfExport';
import { exportAssetHistoryExcel } from '../utils/excelExport';

interface AssetHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any | null;
  maintenances?: any[];
  loans?: any[];
  stockOpnames?: any[];
  initialUnitCode?: string;
  onAddCustomEvent?: (assetId: string, event: AssetHistoryEvent) => void;
}

export default function AssetHistoryModal({
  isOpen,
  onClose,
  asset,
  maintenances = [],
  loans = [],
  stockOpnames = [],
  initialUnitCode,
  onAddCustomEvent
}: AssetHistoryModalProps) {
  if (!isOpen || !asset) return null;

  // Filter States
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnitCode || 'ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // Form State to Add New Event
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState({
    type: 'MAINTENANCE' as AssetHistoryEventType,
    title: '',
    description: '',
    actor: '',
    actorRole: '',
    cost: 0,
    ticketNumber: '',
    unitCode: 'ALL',
    status: 'SELESAI',
    previousState: asset.condition || 'BAIK',
    newState: asset.condition || 'BAIK',
    partsReplaced: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Units list
  const units = ensureAssetUnits(asset);
  const isMulti = units.length > 1;

  // Aggregate all events
  const allEvents = useMemo(() => {
    return buildAssetHistoryTimeline(asset, maintenances, loans, stockOpnames);
  }, [asset, maintenances, loans, stockOpnames]);

  // Statistics calculation
  const stats = useMemo(() => {
    let maintenanceCount = 0;
    let maintenanceTotalCost = 0;
    let loanCount = 0;
    let statusChangeCount = 0;
    let auditCount = 0;

    allEvents.forEach(ev => {
      if (ev.type === 'MAINTENANCE') {
        maintenanceCount++;
        maintenanceTotalCost += (ev.cost || 0);
      } else if (ev.type === 'LOAN') {
        loanCount++;
      } else if (ev.type === 'CONDITION_CHANGE' || ev.type === 'MUTATION' || ev.type === 'POLICY_CHANGE') {
        statusChangeCount++;
      } else if (ev.type === 'STOCK_OPNAME') {
        auditCount++;
      }
    });

    const age = calculateAssetAge(asset.purchaseDate);

    return {
      totalEvents: allEvents.length,
      maintenanceCount,
      maintenanceTotalCost,
      loanCount,
      statusChangeCount,
      auditCount,
      ageText: age.text
    };
  }, [allEvents, asset.purchaseDate]);

  // Filtered & Sorted events
  const displayedEvents = useMemo(() => {
    let list = [...allEvents];

    // Filter by unit
    if (selectedUnit !== 'ALL') {
      list = list.filter(ev => {
        if (!ev.unitCode) return true; // general asset events remain visible
        return ev.unitCode === selectedUnit;
      });
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      if (selectedType === 'STATUS') {
        list = list.filter(ev => 
          ev.type === 'CONDITION_CHANGE' || 
          ev.type === 'MUTATION' || 
          ev.type === 'POLICY_CHANGE'
        );
      } else {
        list = list.filter(ev => ev.type === selectedType);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(ev => {
        return (
          ev.title?.toLowerCase().includes(q) ||
          ev.description?.toLowerCase().includes(q) ||
          ev.actor?.toLowerCase().includes(q) ||
          ev.actorRole?.toLowerCase().includes(q) ||
          ev.ticketNumber?.toLowerCase().includes(q) ||
          ev.partsReplaced?.toLowerCase().includes(q) ||
          ev.notes?.toLowerCase().includes(q) ||
          ev.unitCode?.toLowerCase().includes(q)
        );
      });
    }

    // Sort order
    list.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [allEvents, selectedUnit, selectedType, searchQuery, sortOrder]);

  const handleDownloadPdf = () => {
    const filterDesc = selectedType !== 'ALL' 
      ? `Filter Jenis: ${selectedType} | Unit: ${selectedUnit}` 
      : (selectedUnit !== 'ALL' ? `Unit: ${selectedUnit}` : undefined);
    downloadAssetHistoryPdf(asset, displayedEvents, filterDesc);
  };

  const handleDownloadExcel = () => {
    const filterDesc = selectedType !== 'ALL' 
      ? `Filter Jenis: ${selectedType} | Unit: ${selectedUnit}` 
      : (selectedUnit !== 'ALL' ? `Unit: ${selectedUnit}` : undefined);
    exportAssetHistoryExcel(asset, displayedEvents, filterDesc);
  };

  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const eventPayload: AssetHistoryEvent = {
      id: `custom-log-${Date.now()}`,
      assetId: String(asset.id),
      timestamp: `${newEvent.date} ${new Date().toTimeString().slice(0, 5)}`,
      type: newEvent.type,
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      actor: newEvent.actor.trim() || 'Petugas Sarpras',
      actorRole: newEvent.actorRole.trim() || 'Staf Operasional',
      cost: Number(newEvent.cost) || 0,
      ticketNumber: newEvent.ticketNumber.trim() || undefined,
      unitCode: newEvent.unitCode !== 'ALL' ? newEvent.unitCode : undefined,
      status: newEvent.status,
      previousState: newEvent.previousState,
      newState: newEvent.newState,
      partsReplaced: newEvent.partsReplaced.trim() || undefined,
      notes: newEvent.notes.trim() || undefined
    };

    if (onAddCustomEvent) {
      onAddCustomEvent(String(asset.id), eventPayload);
    }

    // Reset form
    setNewEvent({
      type: 'MAINTENANCE',
      title: '',
      description: '',
      actor: '',
      actorRole: '',
      cost: 0,
      ticketNumber: '',
      unitCode: 'ALL',
      status: 'SELESAI',
      previousState: asset.condition || 'BAIK',
      newState: asset.condition || 'BAIK',
      partsReplaced: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
  };

  const getEventBadge = (type: AssetHistoryEventType) => {
    switch (type) {
      case 'ACQUISITION':
        return {
          label: 'Pengadaan Awal',
          icon: Sparkles,
          bg: 'bg-emerald-50 dark:bg-emerald-950/60',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500'
        };
      case 'MAINTENANCE':
        return {
          label: 'Pemeliharaan / Servis',
          icon: Wrench,
          bg: 'bg-amber-50 dark:bg-amber-950/60',
          text: 'text-amber-800 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500'
        };
      case 'LOAN':
        return {
          label: 'Peminjaman',
          icon: Handshake,
          bg: 'bg-blue-50 dark:bg-blue-950/60',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500'
        };
      case 'STOCK_OPNAME':
        return {
          label: 'Sensus / Audit',
          icon: ClipboardCheck,
          bg: 'bg-teal-50 dark:bg-teal-950/60',
          text: 'text-teal-700 dark:text-teal-300',
          border: 'border-teal-200 dark:border-teal-800',
          dot: 'bg-teal-500'
        };
      case 'CONDITION_CHANGE':
        return {
          label: 'Ubah Kondisi Fisik',
          icon: ShieldCheck,
          bg: 'bg-purple-50 dark:bg-purple-950/60',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500'
        };
      case 'MUTATION':
        return {
          label: 'Mutasi Ruang',
          icon: RotateCcw,
          bg: 'bg-indigo-50 dark:bg-indigo-950/60',
          text: 'text-indigo-700 dark:text-indigo-300',
          border: 'border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500'
        };
      case 'POLICY_CHANGE':
        return {
          label: 'Izin Peminjaman',
          icon: Lock,
          bg: 'bg-cyan-50 dark:bg-cyan-950/60',
          text: 'text-cyan-700 dark:text-cyan-300',
          border: 'border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500'
        };
      case 'MANUAL_NOTE':
      default:
        return {
          label: 'Catatan Log',
          icon: FileText,
          bg: 'bg-slate-50 dark:bg-slate-900',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-800',
          dot: 'bg-slate-500'
        };
    }
  };

  const fundingBadge = getFundingSourceBadgeColor(asset.fundingSource || 'BOSP Reguler');
  const condBadge = getConditionBadgeColor(asset.condition || 'BAIK');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#032C24] via-[#02241D] to-[#011813] text-white p-5 sm:p-6 shrink-0 border-b border-[#095445]/50">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#FFB800]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
                </span>
                <span className="font-mono text-[11px] font-semibold bg-white/10 text-emerald-200 px-2.5 py-0.5 rounded-full border border-white/10">
                  {asset.assetCode}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <History className="w-6 h-6 text-[#FFB800]" />
                <span>Riwayat & Rekam Jejak Siklus Hidup Aset</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80">
                Histori kronologis perawatan servis berkala, catatan peminjaman, audit sensus, dan perubahan kondisi fisik.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                onClick={handleDownloadPdf}
                size="sm"
                variant="outline"
                className="bg-[#064237]/90 hover:bg-[#085244] text-white border-[#0F5C4E] text-xs font-semibold shadow-xs"
                title="Cetak Kartu Riwayat PDF resmi sekolah"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 text-[#FFB800]" /> Cetak PDF
              </Button>
              <Button
                onClick={handleDownloadExcel}
                size="sm"
                variant="outline"
                className="bg-[#064237]/90 hover:bg-[#085244] text-white border-[#0F5C4E] text-xs font-semibold shadow-xs"
                title="Ekspor seluruh kronologi ke Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Excel
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Asset Identity Hero & KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Box: Identity */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Nama Inventaris / Barang
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {asset.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{asset.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> {asset.location || 'Lokasi Belum Ditentukan'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                <Badge className={`${condBadge.bg} ${condBadge.text} border-none font-semibold px-2.5 py-0.5`}>
                  {formatConditionLabel(asset.condition || 'BAIK')}
                </Badge>
                <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${fundingBadge.bg} ${fundingBadge.text} ${fundingBadge.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${fundingBadge.dot}`} />
                  {asset.fundingSource || 'BOSP Reguler'}
                </span>
                <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${asset.isBorrowable === false ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {asset.isBorrowable === false ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  {asset.isBorrowable === false ? 'Terkunci' : 'Bisa Dipinjam'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Kuantitas Fisik:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.quantity || 1} Unit {isMulti && `(${units.length} Unit Fisik)`}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Harga Perolehan:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatRupiah(asset.price)}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Penanggung Jawab:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {asset.responsible || 'Petugas Sarpras'}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Tgl Pengadaan:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.purchaseDate || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Box: KPI Summary Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Total Peristiwa</span>
                  <History className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                    {stats.totalEvents}
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                    Log Rekam Jejak
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Servis & Biaya</span>
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-amber-950 dark:text-amber-100">
                    {stats.maintenanceCount}x
                  </div>
                  <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium truncate mt-0.5" title={`Total: ${formatRupiah(stats.maintenanceTotalCost)}`}>
                    {formatRupiah(stats.maintenanceTotalCost)}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Peminjaman</span>
                  <Handshake className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-blue-950 dark:text-blue-100">
                    {stats.loanCount}x
                  </div>
                  <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                    Riwayat Pinjam
                  </div>
                </div>
              </div>

              <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-700 dark:text-purple-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Usia Pakai</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-purple-950 dark:text-purple-100 leading-tight">
                    {stats.ageText}
                  </div>
                  <div className="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">
                    Masa Penggunaan
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar & Filter Controls */}
          <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari kata kunci, teknisi, peminjam, tiket, atau catatan..."
                  className="pl-10 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Unit Selection Dropdown (if multi unit) */}
              {isMulti && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" /> Unit:
                  </span>
                  <select
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={selectedUnit}
                    onChange={e => setSelectedUnit(e.target.value)}
                  >
                    <option value="ALL">Semua Unit ({units.length} Unit)</option>
                    {units.map(u => (
                      <option key={u.id} value={u.unitCode}>
                        Unit #{u.unitNumber} ({u.unitCode}) - {formatConditionLabel(u.condition)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort & Add Event Button */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
                  className="h-9 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  title="Ganti urutan kronologis"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                  {sortOrder === 'NEWEST' ? 'Terbaru Dahulu' : 'Terlama Dahulu'}
                </Button>

                <Button
                  size="sm"
                  onClick={() => setShowAddForm(prev => !prev)}
                  className="h-9 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  {showAddForm ? <X className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                  {showAddForm ? 'Batal' : 'Catat Riwayat'}
                </Button>
              </div>
            </div>

            {/* Event Type Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedType === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Semua ({allEvents.length})
              </button>
              <button
                onClick={() => setSelectedType('MAINTENANCE')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === 'MAINTENANCE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                <Wrench className="w-3 h-3" /> Pemeliharaan & Servis ({stats.maintenanceCount})
              </button>
              <button
                onClick={() => setSelectedType('LOAN')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === 'LOAN'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <Handshake className="w-3 h-3" /> Peminjaman ({stats.loanCount})
              </button>
              <button
                onClick={() => setSelectedType('STATUS')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === 'STATUS'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                }`}
              >
                <RotateCcw className="w-3 h-3" /> Perubahan Status & Mutasi ({stats.statusChangeCount})
              </button>
              <button
                onClick={() => setSelectedType('STOCK_OPNAME')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === 'STOCK_OPNAME'
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100'
                }`}
              >
                <ClipboardCheck className="w-3 h-3" /> Sensus / Audit ({stats.auditCount})
              </button>
              <button
                onClick={() => setSelectedType('ACQUISITION')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === 'ACQUISITION'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Pengadaan Awal
              </button>
            </div>
          </div>

          {/* Add New Event Accordion Form */}
          {showAddForm && (
            <form onSubmit={handleSaveNewEvent} className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-4 animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    Catat Peristiwa / Log Baru untuk Aset Ini
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  Data tersimpan permanen ke dalam rekam jejak aset
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Jenis Aktivitas *
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value as AssetHistoryEventType })}
                  >
                    <option value="MAINTENANCE">Pemeliharaan / Servis</option>
                    <option value="CONDITION_CHANGE">Perubahan Kondisi Fisik</option>
                    <option value="MUTATION">Mutasi Ruangan</option>
                    <option value="LOAN">Peminjaman Khusus</option>
                    <option value="POLICY_CHANGE">Pengaturan Izin Pinjam</option>
                    <option value="MANUAL_NOTE">Catatan Insidental Sarpras</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tanggal Peristiwa *
                  </label>
                  <Input
                    type="date"
                    className="h-9 bg-white dark:bg-slate-950"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit Terkait
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                    value={newEvent.unitCode}
                    onChange={e => setNewEvent({ ...newEvent, unitCode: e.target.value })}
                  >
                    <option value="ALL">Semua Unit (Master Aset)</option>
                    {units.map(u => (
                      <option key={u.id} value={u.unitCode}>
                        Unit #{u.unitNumber} ({u.unitCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Judul Aktivitas / Ringkasan *
                  </label>
                  <Input
                    placeholder="Contoh: Pembersihan sirkulasi kipas pendingin & ganti thermal paste"
                    className="h-9 bg-white dark:bg-slate-950"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pelaksana / Teknisi / Pihak Terlibat
                  </label>
                  <Input
                    placeholder="Contoh: Joko Widodo (CV Berkah Sejuk AC) / Ustadz Taufik"
                    className="h-9 bg-white dark:bg-slate-950"
                    value={newEvent.actor}
                    onChange={e => setNewEvent({ ...newEvent, actor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Biaya Terkait (Rp)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-9 bg-white dark:bg-slate-950"
                    value={newEvent.cost || ''}
                    onChange={e => setNewEvent({ ...newEvent, cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor Tiket / Ref SPK / BA
                  </label>
                  <Input
                    placeholder="Contoh: SPK-2026-08-010"
                    className="h-9 bg-white dark:bg-slate-950"
                    value={newEvent.ticketNumber}
                    onChange={e => setNewEvent({ ...newEvent, ticketNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Kondisi Sesudah Tindakan
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                    value={newEvent.newState}
                    onChange={e => setNewEvent({ ...newEvent, newState: e.target.value })}
                  >
                    <option value="BAIK">Baik</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan</option>
                    <option value="RUSAK_BERAT">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Deskripsi Tindakan & Catatan Hasil
                </label>
                <textarea
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                  placeholder="Jelaskan detail pemeriksaan, penggantian suku cadang, atau hasil pengujian..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Simpan Catatan Riwayat
                </Button>
              </div>
            </form>
          )}

          {/* Chronological Timeline Container */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Menampilkan {displayedEvents.length} Peristiwa Riwayat</span>
              <span>Diurutkan: {sortOrder === 'NEWEST' ? 'Terbaru ➔ Terlama' : 'Terlama ➔ Terbaru'}</span>
            </div>

            {displayedEvents.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Tidak Ada Catatan Riwayat yang Sesuai
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba ubah kata kunci pencarian, ganti filter kategori peristiwa, atau pilih opsi "Semua Unit".
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedType('ALL');
                    setSelectedUnit('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs mt-2"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {displayedEvents.map((ev, index) => {
                  const badge = getEventBadge(ev.type);
                  const Icon = badge.icon;
                  const isAcquisition = ev.type === 'ACQUISITION';
                  const isMaintenance = ev.type === 'MAINTENANCE';
                  const isLoan = ev.type === 'LOAN';

                  return (
                    <div key={ev.id || index} className="relative group animate-in fade-in duration-200">
                      {/* Stem Node Icon */}
                      <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-xs z-10 transition-transform group-hover:scale-110 ${badge.bg} ${badge.border}`}>
                        <Icon className={`w-3.5 h-3.5 ${badge.text}`} />
                      </div>

                      {/* Event Content Card */}
                      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all space-y-3">
                        
                        {/* Top Meta Line: Timestamp & Category */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              {ev.timestamp}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>

                          {/* Status Pill */}
                          {ev.status && (
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              ev.status === 'SELESAI' || ev.status === 'SESUAI' || ev.status === 'TERDAFTAR'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                                : ev.status === 'DIPINJAM'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
                                : ev.status === 'SEDANG_DIKERJAKAN'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {ev.status}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                            {ev.title}
                          </h4>
                          {ev.description && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        {/* Metadata Tag Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                          {/* Unit Tag if specific */}
                          {ev.unitCode && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                              <Layers className="w-3 h-3 text-emerald-600" />
                              {ev.unitCode} {ev.unitNumber ? `(Unit #${ev.unitNumber})` : ''}
                            </span>
                          )}

                          {/* Actor / Performer */}
                          {ev.actor && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="font-medium">{ev.actor}</span>
                              {ev.actorRole && <span className="text-slate-400">({ev.actorRole})</span>}
                            </span>
                          )}

                          {/* Cost Tag */}
                          {ev.cost !== undefined && ev.cost > 0 && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 font-semibold">
                              <DollarSign className="w-3 h-3 text-amber-600" />
                              Biaya: {formatRupiah(ev.cost)}
                            </span>
                          )}

                          {/* Ticket / Ref */}
                          {ev.ticketNumber && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-mono text-[10.5px]">
                              <Tag className="w-3 h-3 text-slate-400" />
                              Ref: {ev.ticketNumber}
                            </span>
                          )}

                          {/* Condition Transition (Previous -> New) */}
                          {ev.previousState && ev.newState && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              Kondisi: <span className="font-bold text-slate-500">{formatConditionLabel(ev.previousState)}</span>
                              <span>➔</span>
                              <span className="font-bold text-emerald-600">{formatConditionLabel(ev.newState)}</span>
                            </span>
                          )}

                          {/* Parts Replaced */}
                          {ev.partsReplaced && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px]">
                              Suku Cadang: {ev.partsReplaced}
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Rekam jejak aset tersinkronisasi otomatis dengan modul Pemeliharaan, Peminjaman, dan Sensus SAK SMK IT Ibnul Qayyim Makassar.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold rounded-xl"
            >
              Tutup
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
