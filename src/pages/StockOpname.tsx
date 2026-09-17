import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  QrCode, 
  FileText, 
  Check, 
  X, 
  RefreshCw, 
  BarChart3, 
  Filter, 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  Edit3, 
  Layers, 
  Building, 
  Package, 
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  initialStockOpnames, 
  StockOpnameSession, 
  StockOpnameItem, 
  initialAssets, 
  initialConsumables, 
  initialRooms, 
  defaultCurrentUser, 
  initialSignatorySettings 
} from '../store/data';
import { downloadStockOpnamePdf } from '../utils/pdfExport';
import { exportStockOpnameExcel } from '../utils/excelExport';

export default function StockOpname() {
  const [sessions, setSessions] = useLocalStorage<StockOpnameSession[]>('iq-stock-opnames', initialStockOpnames);
  const [assets, setAssets] = useLocalStorage('iq-assets', initialAssets);
  const [consumables, setConsumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);
  const [currentUser] = useLocalStorage('iq-current-user', defaultCurrentUser);
  const [signatorySettings] = useLocalStorage('iq-signatory-settings', initialSignatorySettings);

  // Active navigation / tab
  const [activeTab, setActiveTab] = useState<'sessions' | 'audit-sheet' | 'history'>('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  
  // Sheet filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SESUAI' | 'SELISIH' | 'BELUM_DIPERIKSA'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [quickScanCode, setQuickScanCode] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showItemNotesModal, setShowItemNotesModal] = useState<{ item: StockOpnameItem; index: number } | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // New Session Form State
  const [newSession, setNewSession] = useState({
    title: '',
    type: 'ROOM' as 'ALL' | 'ASSET' | 'BHP' | 'ROOM',
    targetLocation: 'Lab Komputer 1',
    startDate: new Date().toISOString().split('T')[0],
    auditorName: currentUser?.name || 'Admin Sarpras & IT',
    notes: 'Pemeriksaan dan pencocokan fisik berkala sarpras & BHP.'
  });

  // Current active session
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  // Summary Metrics across all sessions
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const inProgressSessions = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'DRAFT').length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'ADJUSTED').length;
    
    let totalItemsAudited = 0;
    let totalItemsWithDiscrepancy = 0;
    let totalEstimatedDiscrepancyValue = 0;

    sessions.forEach(s => {
      totalItemsAudited += (s.items || []).filter(i => i.status !== 'BELUM_DIPERIKSA').length;
      totalItemsWithDiscrepancy += (s.items || []).filter(i => i.status === 'SELISIH').length;
      
      (s.items || []).forEach(i => {
        if (i.status === 'SELISIH' && i.difference < 0) {
          totalEstimatedDiscrepancyValue += Math.abs(i.difference) * (i.unitPrice || 0);
        }
      });
    });

    return {
      totalSessions,
      inProgressSessions,
      completedSessions,
      totalItemsAudited,
      totalItemsWithDiscrepancy,
      totalEstimatedDiscrepancyValue
    };
  }, [sessions]);

  // Filtered items in active audit sheet
  const filteredItems = useMemo(() => {
    if (!currentSession || !currentSession.items) return [];
    return currentSession.items.filter(item => {
      const matchSearch = (item.itemName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (item.itemCode?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (item.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [currentSession, searchQuery, statusFilter, categoryFilter]);

  // List of unique categories in current session
  const currentCategories = useMemo(() => {
    if (!currentSession || !currentSession.items) return [];
    const cats = new Set<string>();
    currentSession.items.forEach(i => {
      if (i.category) cats.add(i.category);
    });
    return Array.from(cats);
  }, [currentSession]);

  // Quick Barcode / SKU Scanner Handler
  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScanCode.trim() || !currentSession) return;

    const code = quickScanCode.trim().toLowerCase();
    const itemIndex = currentSession.items.findIndex(
      i => i.itemCode.toLowerCase() === code || i.id.toLowerCase() === code
    );

    if (itemIndex !== -1) {
      const item = currentSession.items[itemIndex];
      // Mark as checked & physical count matches system qty (or add +1)
      handleUpdateItem(item.id, {
        physicalQty: item.systemQty,
        status: 'SESUAI',
        checkedAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
        checkedBy: currentUser?.name || 'Auditor'
      });

      setScanMessage({
        text: `✓ Berhasil memverifikasi: ${item.itemName} (${item.itemCode})`,
        type: 'success'
      });
      setQuickScanCode('');
    } else {
      setScanMessage({
        text: `Item dengan kode/QR "${quickScanCode}" tidak ditemukan pada sesi ini.`,
        type: 'error'
      });
    }

    setTimeout(() => {
      setScanMessage(null);
    }, 4000);
  };

  // Update item in current session
  const handleUpdateItem = (itemId: string, updates: Partial<StockOpnameItem>) => {
    if (!currentSession) return;

    const updatedItems = currentSession.items.map(item => {
      if (item.id === itemId) {
        const nextPhysQty = updates.physicalQty !== undefined ? updates.physicalQty : item.physicalQty;
        const diff = nextPhysQty - item.systemQty;
        let status: 'SESUAI' | 'SELISIH' | 'BELUM_DIPERIKSA' = 'SESUAI';
        
        if (updates.status) {
          status = updates.status;
        } else if (diff !== 0) {
          status = 'SELISIH';
        } else {
          status = 'SESUAI';
        }

        return {
          ...item,
          ...updates,
          physicalQty: nextPhysQty,
          difference: diff,
          status,
          checkedAt: updates.checkedAt || new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
          checkedBy: updates.checkedBy || currentUser?.name || 'Auditor'
        };
      }
      return item;
    });

    // Recompute session stats
    const totalChecked = updatedItems.filter(i => i.status !== 'BELUM_DIPERIKSA').length;
    const totalMatch = updatedItems.filter(i => i.status === 'SESUAI').length;
    const totalDisc = updatedItems.filter(i => i.status === 'SELISIH').length;

    const updatedSession: StockOpnameSession = {
      ...currentSession,
      items: updatedItems,
      totalCheckedItems: totalChecked,
      totalMatchItems: totalMatch,
      totalDiscrepancyItems: totalDisc,
      status: currentSession.status === 'DRAFT' ? 'IN_PROGRESS' : currentSession.status
    };

    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  // Mark all filtered items as Verified / Sesuai
  const handleMarkAllFilteredAsMatch = () => {
    if (!currentSession) return;
    const updatedItems = currentSession.items.map(item => {
      const isFiltered = filteredItems.some(f => f.id === item.id);
      if (isFiltered) {
        return {
          ...item,
          physicalQty: item.systemQty,
          difference: 0,
          status: 'SESUAI' as const,
          checkedAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
          checkedBy: currentUser?.name || 'Auditor'
        };
      }
      return item;
    });

    const totalChecked = updatedItems.filter(i => i.status !== 'BELUM_DIPERIKSA').length;
    const totalMatch = updatedItems.filter(i => i.status === 'SESUAI').length;
    const totalDisc = updatedItems.filter(i => i.status === 'SELISIH').length;

    const updatedSession: StockOpnameSession = {
      ...currentSession,
      items: updatedItems,
      totalCheckedItems: totalChecked,
      totalMatchItems: totalMatch,
      totalDiscrepancyItems: totalDisc,
      status: currentSession.status === 'DRAFT' ? 'IN_PROGRESS' : currentSession.status
    };

    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  // Export current inventory verification list (PDF)
  const handleExportVerificationPdf = (onlyFiltered = false) => {
    if (!currentSession) return;
    const isFiltered = onlyFiltered && (filteredItems.length !== currentSession.items.length);
    const itemsToExport = onlyFiltered ? filteredItems : currentSession.items;

    let filterDesc: string | undefined = undefined;
    if (isFiltered) {
      const parts: string[] = [];
      if (statusFilter !== 'ALL') parts.push(`Status: ${statusFilter}`);
      if (categoryFilter !== 'ALL') parts.push(`Kategori: ${categoryFilter}`);
      if (searchQuery.trim()) parts.push(`Pencarian: "${searchQuery}"`);
      filterDesc = parts.join(', ') || 'Hasil Filter Tampil';
    }

    downloadStockOpnamePdf(currentSession, itemsToExport, filterDesc);
  };

  // Export current inventory verification list (Excel .xlsx)
  const handleExportVerificationExcel = (onlyFiltered = false) => {
    if (!currentSession) return;
    const isFiltered = onlyFiltered && (filteredItems.length !== currentSession.items.length);
    const itemsToExport = onlyFiltered ? filteredItems : currentSession.items;

    let filterDesc: string | undefined = undefined;
    if (isFiltered) {
      const parts: string[] = [];
      if (statusFilter !== 'ALL') parts.push(`Status: ${statusFilter}`);
      if (categoryFilter !== 'ALL') parts.push(`Kategori: ${categoryFilter}`);
      if (searchQuery.trim()) parts.push(`Pencarian: "${searchQuery}"`);
      filterDesc = parts.join(', ') || 'Hasil Filter Tampil';
    }

    exportStockOpnameExcel(currentSession, itemsToExport, filterDesc);
  };

  // Create new session with items extracted from assets or consumables
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title.trim()) return;

    const generatedItems: StockOpnameItem[] = [];
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const sessionCode = `SO-${dateStr}-${randomNum}`;

    // Collect matching items
    if (newSession.type === 'ALL' || newSession.type === 'ASSET' || newSession.type === 'ROOM') {
      assets.forEach((a: any) => {
        if (newSession.type === 'ROOM' && a.location !== newSession.targetLocation) {
          return;
        }
        generatedItems.push({
          id: `so-itm-ast-${a.id}-${Date.now()}`,
          itemId: a.id,
          itemCode: a.assetCode || `AST-${a.id}`,
          itemName: a.name,
          category: a.category || 'Inventaris Sarpras',
          location: a.location || 'Kampus SMK IT',
          systemQty: a.quantity || 1,
          physicalQty: a.quantity || 1,
          difference: 0,
          unit: 'Unit',
          unitPrice: a.price || 0,
          condition: a.condition || 'BAIK',
          systemCondition: a.condition || 'BAIK',
          status: 'BELUM_DIPERIKSA',
          notes: ''
        });
      });
    }

    if (newSession.type === 'ALL' || newSession.type === 'BHP' || newSession.type === 'ROOM') {
      consumables.forEach((c: any) => {
        if (newSession.type === 'ROOM' && c.location !== newSession.targetLocation) {
          return;
        }
        generatedItems.push({
          id: `so-itm-bhp-${c.id}-${Date.now()}`,
          itemId: c.id,
          itemCode: c.itemCode || `BHP-${c.id}`,
          itemName: c.name,
          category: c.category || 'Bahan Habis Pakai',
          location: c.location || 'Gudang Sarpras',
          systemQty: c.stock || 0,
          physicalQty: c.stock || 0,
          difference: 0,
          unit: c.unit || 'Pcs',
          unitPrice: c.price || 0,
          condition: 'BAIK',
          status: 'BELUM_DIPERIKSA',
          notes: ''
        });
      });
    }

    const created: StockOpnameSession = {
      id: `so-${Date.now()}`,
      sessionCode,
      title: newSession.title,
      type: newSession.type,
      targetLocation: newSession.type === 'ROOM' ? newSession.targetLocation : undefined,
      startDate: newSession.startDate,
      status: 'DRAFT',
      auditorName: newSession.auditorName || 'Tim Sarpras & IT',
      notes: newSession.notes,
      totalSystemItems: generatedItems.length,
      totalCheckedItems: 0,
      totalMatchItems: 0,
      totalDiscrepancyItems: 0,
      totalMissingItems: 0,
      items: generatedItems
    };

    setSessions(prev => [created, ...prev]);
    setSelectedSessionId(created.id);
    setShowNewModal(false);
    setActiveTab('audit-sheet');
  };

  // Finalize & Approve Opname
  const handleFinalizeSession = () => {
    if (!currentSession) return;
    const updated: StockOpnameSession = {
      ...currentSession,
      status: 'COMPLETED',
      completedAt: new Date().toISOString().split('T')[0],
      approvedBy: signatorySettings.headmaster.name || 'Kepala Sekolah',
      approvedAt: new Date().toISOString().split('T')[0]
    };
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updated : s));
  };

  // Apply Adjustments to real inventory/BHP
  const handleApplyAdjustments = () => {
    if (!currentSession) return;

    let adjustedCount = 0;

    // Apply to assets & consumables
    const assetUpdates = [...assets];
    const bhpUpdates = [...consumables];

    currentSession.items.forEach(item => {
      if (item.status === 'SELISIH' || item.status === 'SESUAI') {
        // If it was an asset
        const assetIdx = assetUpdates.findIndex(a => a.id === item.itemId || a.assetCode === item.itemCode);
        if (assetIdx !== -1) {
          assetUpdates[assetIdx] = {
            ...assetUpdates[assetIdx],
            quantity: item.physicalQty,
            condition: item.condition || assetUpdates[assetIdx].condition
          };
          adjustedCount++;
        }

        // If it was a consumable
        const bhpIdx = bhpUpdates.findIndex(c => c.id === item.itemId || c.itemCode === item.itemCode);
        if (bhpIdx !== -1) {
          bhpUpdates[bhpIdx] = {
            ...bhpUpdates[bhpIdx],
            stock: item.physicalQty
          };
          adjustedCount++;
        }
      }
    });

    setAssets(assetUpdates);
    setConsumables(bhpUpdates);

    // Update session status to ADJUSTED
    const updatedSession: StockOpnameSession = {
      ...currentSession,
      status: 'ADJUSTED'
    };

    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
    setShowAdjustModal(false);
  };

  // Delete session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus arsip sesi Stock Opname ini?')) {
      const remaining = sessions.filter(s => s.id !== id);
      setSessions(remaining);
      if (selectedSessionId === id && remaining.length > 0) {
        setSelectedSessionId(remaining[0].id);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* HEADER SECTION: FOREST TEAL & GOLDEN AMBER ARCHETYPE                      */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl print:hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
              </span>
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Sensus & Audit Fisik
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              <span className="text-[#FFB800]">Stok</span> Opname
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-3xl">
              Verifikasi dan pencocokan fisik berkala antara kondisi riil barang di lapangan dengan data buku induk SIM Sarpras & Logistik SMK IT Ibnul Qayyim Makassar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            {currentSession && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleExportVerificationPdf(false)}
                  variant="outline"
                  className="bg-[#064237]/90 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-semibold text-xs sm:text-sm h-10 px-3.5 transition-all shadow-xs"
                  title="Unduh Lembar Verifikasi Fisik & Berita Acara dalam format PDF"
                >
                  <Download className="w-4 h-4 mr-1.5 text-[#FFB800]" /> Ekspor PDF
                </Button>
                <Button
                  onClick={() => handleExportVerificationExcel(false)}
                  variant="outline"
                  className="bg-[#064237]/90 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-semibold text-xs sm:text-sm h-10 px-3.5 transition-all shadow-xs"
                  title="Unduh Lembar Verifikasi Stok Opname dalam format Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" /> Ekspor Excel (.xlsx)
                </Button>
              </div>
            )}
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Buat Sesi Opname Baru
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STANDARDIZED TAB NAVIGATION BAR                                           */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'sessions'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 font-bold shadow-md shadow-amber-950/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'sessions' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} />
          <span>Daftar Sesi Audit</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'sessions' 
              ? 'bg-slate-950/15 text-slate-950' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {sessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit-sheet')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'audit-sheet'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 font-bold shadow-md shadow-amber-950/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardCheck className={`w-4 h-4 ${activeTab === 'audit-sheet' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} />
          <span>Lembar Pemeriksaan Fisik</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'audit-sheet' 
              ? 'bg-slate-950/15 text-slate-950' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {currentSession?.items?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 font-bold shadow-md shadow-amber-950/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'history' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} />
          <span>Berita Acara & Riwayat Pengesahan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUMMARY STATS TILES (4 TILES)                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
        {/* Total Sesi */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Sesi Opname</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {stats.totalSessions} <span className="text-xs font-semibold text-slate-500">Periode</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {stats.completedSessions} Selesai • {stats.inProgressSessions} Berjalan
            </p>
          </div>
        </div>

        {/* Item Terverifikasi */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Item Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 leading-none">
              {stats.totalItemsAudited} <span className="text-xs font-semibold text-slate-500">Item</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Telah dihitung fisik di lapangan
            </p>
          </div>
        </div>

        {/* Temuan Selisih */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Temuan Selisih</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none">
              {stats.totalItemsWithDiscrepancy} <span className="text-xs font-semibold text-slate-500">Barang</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-medium">
              Memerlukan tindak lanjut/koreksi
            </p>
          </div>
        </div>

        {/* Estimasi Deviasi */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimasi Nilai Selisih</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
              Rp {stats.totalEstimatedDiscrepancyValue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Deviasi nilai aset/barang
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR SESI AUDIT (SESSIONS LIST) */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">Arsip Sesi Stock Opname</span>
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                {sessions.length} Sesi Terdaftar
              </Badge>
            </div>
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 text-[#FFB800]" />
              Tambah Sesi Sensus Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((session) => {
              const total = session.totalSystemItems || session.items.length;
              const checked = session.totalCheckedItems || 0;
              const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
              const isSelected = session.id === selectedSessionId;

              let statusBadge = (
                <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  DRAFT
                </Badge>
              );
              if (session.status === 'IN_PROGRESS') {
                statusBadge = (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 animate-pulse">
                    BERJALAN ({percentage}%)
                  </Badge>
                );
              } else if (session.status === 'COMPLETED') {
                statusBadge = (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300">
                    ✓ SELESAI
                  </Badge>
                );
              } else if (session.status === 'ADJUSTED') {
                statusBadge = (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300">
                    ✓ SUDAH DISESUAIKAN
                  </Badge>
                );
              }

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setActiveTab('audit-sheet');
                  }}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-lg flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800 font-mono">
                        {session.sessionCode}
                      </span>
                      {statusBadge}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                        {session.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {session.notes || 'Tidak ada catatan tambahan.'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" /> Tanggal Mulai:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{session.startDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <UserCheck className="w-3.5 h-3.5" /> Tim Auditor:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{session.auditorName}</span>
                      </div>
                      {session.targetLocation && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Building className="w-3.5 h-3.5" /> Lokasi Ruangan:
                          </span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{session.targetLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        <span>Progres Pemeriksaan:</span>
                        <span>{checked}/{total} Item ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            percentage === 100
                              ? 'bg-emerald-500'
                              : percentage > 0
                              ? 'bg-[#FFB800]'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadStockOpnamePdf(session);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 px-2 h-8 font-medium"
                        title="Unduh Lembar Verifikasi / Berita Acara PDF"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 text-rose-600" /> PDF
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportStockOpnameExcel(session);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 px-2 h-8 font-medium"
                        title="Unduh Lembar Verifikasi format Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Excel
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2 h-8"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-8 px-3 rounded-lg"
                      >
                        Buka Lembar Cek <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#FFB800]" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LEMBAR KERJA PEMERIKSAAN FISIK (ACTIVE AUDIT SHEET) */}
      {/* ========================================================================= */}
      {activeTab === 'audit-sheet' && currentSession && (
        <div className="space-y-5">
          {/* Active Session Top Panel */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800 font-mono">
                  {currentSession.sessionCode}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Mulai: {currentSession.startDate}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  • Auditor: <strong className="text-slate-800 dark:text-slate-200">{currentSession.auditorName}</strong>
                </span>
                {currentSession.status === 'COMPLETED' && (
                  <Badge className="bg-emerald-500 text-white font-bold text-[10px]">
                    ✓ SELESAI
                  </Badge>
                )}
                {currentSession.status === 'ADJUSTED' && (
                  <Badge className="bg-blue-600 text-white font-bold text-[10px]">
                    ✓ ADJUSTED
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentSession.title}
              </h2>
            </div>

            {/* Session Selector & Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Ganti Sesi:</span>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.sessionCode} - {s.title.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

              {currentSession.status !== 'COMPLETED' && currentSession.status !== 'ADJUSTED' ? (
                <Button
                  onClick={handleFinalizeSession}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
                  title="Finalisasi & Tandatangani Sesi Opname ini"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Finalisasi Selesai
                </Button>
              ) : currentSession.status === 'COMPLETED' ? (
                <Button
                  onClick={() => setShowAdjustModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
                  title="Terapkan penyesuaian otomatis ke stok sistem"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sesuaikan Stok Sistem (Adjust)
                </Button>
              ) : null}

              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => handleExportVerificationPdf(false)}
                  variant="outline"
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 text-xs font-semibold h-9 px-3 rounded-xl shadow-xs"
                  title="Unduh seluruh lembar verifikasi sesi ini sebagai PDF"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-rose-600" /> Unduh PDF
                </Button>
                <Button
                  onClick={() => handleExportVerificationExcel(false)}
                  variant="outline"
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 text-xs font-semibold h-9 px-3 rounded-xl shadow-xs"
                  title="Unduh seluruh lembar verifikasi sesi ini sebagai Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Unduh Excel (.xlsx)
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Barcode Scanner & Search Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Quick Barcode Scan Box */}
            <div className="lg:col-span-5 bg-gradient-to-r from-[#032C24] to-[#064237] p-4 rounded-2xl text-white shadow-xs border border-[#0F5C4E] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#FFB800] flex items-center gap-1.5 uppercase tracking-wider">
                    <QrCode className="w-4 h-4" /> Pindai Cepat / Fast Check
                  </span>
                  <span className="text-[11px] text-emerald-200/70">Tekan Enter setelah scan</span>
                </div>
                <form onSubmit={handleQuickScan} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Scan / Ketik Kode Barang (cth: INV-PC-001)..."
                    value={quickScanCode}
                    onChange={(e) => setQuickScanCode(e.target.value)}
                    className="bg-white/10 text-white placeholder:text-emerald-200/60 border-emerald-500/40 text-xs h-9 rounded-xl focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-slate-950 font-extrabold text-xs h-9 px-3.5 rounded-xl shrink-0"
                  >
                    Cek
                  </Button>
                </form>
              </div>

              {scanMessage && (
                <div className={`mt-2.5 p-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                }`}>
                  {scanMessage.type === 'success' ? <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
                  <span>{scanMessage.text}</span>
                </div>
              )}
            </div>

            {/* Filters and Batch Actions */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari nama/kode barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-9 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">Semua Status Opname</option>
                  <option value="SESUAI">Hanya Sesuai (Match)</option>
                  <option value="SELISIH">Hanya Ada Selisih (+/-)</option>
                  <option value="BELUM_DIPERIKSA">Belum Diperiksa</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-9 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">Semua Kategori ({currentCategories.length})</option>
                  {currentCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Menampilkan <strong className="text-slate-900 dark:text-white font-bold">{filteredItems.length}</strong> dari {currentSession.items.length} item</span>
                  {filteredItems.length !== currentSession.items.length && (
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                      Filter Aktif
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5">
                      {filteredItems.length !== currentSession.items.length ? 'Ekspor Hasil Filter:' : 'Ekspor Daftar:'}
                    </span>
                    <Button
                      onClick={() => handleExportVerificationPdf(true)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-xs transition-all"
                      title={filteredItems.length !== currentSession.items.length ? `Unduh ${filteredItems.length} item hasil filter sebagai PDF` : 'Unduh daftar verifikasi sebagai PDF'}
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-rose-600" /> PDF {filteredItems.length !== currentSession.items.length && `(${filteredItems.length})`}
                    </Button>
                    <Button
                      onClick={() => handleExportVerificationExcel(true)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-xs transition-all"
                      title={filteredItems.length !== currentSession.items.length ? `Unduh ${filteredItems.length} item hasil filter sebagai Excel` : 'Unduh daftar verifikasi sebagai Excel'}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Excel {filteredItems.length !== currentSession.items.length && `(${filteredItems.length})`}
                    </Button>
                  </div>

                  <Button
                    onClick={handleMarkAllFilteredAsMatch}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 h-8 rounded-xl shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Tandai Semua Sesuai
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Sheet Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#032C24] text-white font-bold border-b border-[#0A473B]">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 w-28">Kode Barang</th>
                    <th className="py-3 px-4 min-w-[200px]">Nama Barang & Kategori</th>
                    <th className="py-3 px-3 w-28">Lokasi</th>
                    <th className="py-3 px-3 w-20 text-center">Stok Sistem</th>
                    <th className="py-3 px-3 w-36 text-center">Stok Fisik Riil</th>
                    <th className="py-3 px-3 w-20 text-center">Selisih</th>
                    <th className="py-3 px-3 w-28 text-center">Kondisi Fisik</th>
                    <th className="py-3 px-3 w-28 text-center">Status</th>
                    <th className="py-3 px-4 min-w-[160px]">Catatan / Temuan</th>
                    <th className="py-3 px-3 w-24 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Tidak ada item yang sesuai filter</p>
                        <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter status.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const diff = item.difference ?? (item.physicalQty - item.systemQty);
                      const isUnchecked = item.status === 'BELUM_DIPERIKSA';
                      const isMatch = item.status === 'SESUAI';
                      const isDiscrepancy = item.status === 'SELISIH';

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            isDiscrepancy ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center text-slate-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {item.itemCode}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{item.itemName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.category}</p>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {item.location || currentSession.targetLocation || '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                            {item.systemQty} <span className="text-[10px] text-slate-400">{item.unit}</span>
                          </td>
                          
                          {/* Physical Counter Input */}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleUpdateItem(item.id, { physicalQty: Math.max(0, item.physicalQty - 1) })}
                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                                title="Kurangi 1"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={item.physicalQty}
                                onChange={(e) => handleUpdateItem(item.id, { physicalQty: parseInt(e.target.value) || 0 })}
                                className="w-14 h-7 text-center font-bold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                              <button
                                onClick={() => handleUpdateItem(item.id, { physicalQty: item.physicalQty + 1 })}
                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                                title="Tambah 1"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Difference Indicator */}
                          <td className="py-3 px-3 text-center font-bold">
                            {diff === 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400">0</span>
                            ) : diff > 0 ? (
                              <span className="text-blue-600 dark:text-blue-400 font-extrabold">+{diff}</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-extrabold">{diff}</span>
                            )}
                          </td>

                          {/* Condition Select */}
                          <td className="py-3 px-3 text-center">
                            <select
                              value={item.condition || 'BAIK'}
                              onChange={(e) => handleUpdateItem(item.id, { condition: e.target.value as any })}
                              className="text-[11px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-800 dark:text-slate-200"
                            >
                              <option value="BAIK">Baik</option>
                              <option value="RUSAK_RINGAN">Rusak Ringan</option>
                              <option value="RUSAK_BERAT">Rusak Berat</option>
                              <option value="HILANG">Hilang</option>
                            </select>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 text-center">
                            {isUnchecked ? (
                              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                                Belum Dicek
                              </Badge>
                            ) : isMatch ? (
                              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px]">
                                ✓ Sesuai
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 text-[10px]">
                                ⚠ Selisih
                              </Badge>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="py-3 px-4">
                            <div 
                              onClick={() => {
                                setTempNotes(item.notes || '');
                                setShowItemNotesModal({ item, index: idx });
                              }}
                              className="cursor-pointer group flex items-center justify-between gap-1 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400"
                              title="Klik untuk ubah catatan temuan"
                            >
                              <span className="truncate max-w-[140px] italic">
                                {item.notes || 'Tambah catatan...'}
                              </span>
                              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            </div>
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3 px-3 text-center">
                            <Button
                              onClick={() => handleUpdateItem(item.id, { physicalQty: item.systemQty, status: 'SESUAI' })}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                              title="Set fisik sama dengan sistem (Match)"
                            >
                              <Check className="w-3 h-3 mr-1" /> Cocok
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BERITA ACARA & RIWAYAT PENGESAHAN (AUDIT TRAIL & HISTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Berita Acara & Pengesahan Hasil Pemeriksaan Fisik
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Dokumen Berita Acara Stock Opname sah dilengkapi lembar pengesahan resmi dari Kepala Sekolah dan Tim Penanggung Jawab Sarana & Prasarana.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map((session) => (
                <div key={session.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
                        {session.sessionCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Periode: {session.startDate} {session.endDate ? `s.d ${session.endDate}` : ''}
                      </span>
                      {session.status === 'COMPLETED' || session.status === 'ADJUSTED' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px]">
                          ✓ SAH / DISETUJUI
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px]">
                          DRAFT / PROSES
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {session.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Disahkan oleh: <strong className="text-slate-800 dark:text-slate-200">{session.approvedBy || signatorySettings.headmaster.name}</strong> ({signatorySettings.headmaster.title}) • Tim Auditor: {session.auditorName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => downloadStockOpnamePdf(session)}
                      className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-extrabold text-xs h-9 px-3.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
                      title="Unduh Berita Acara & Lembar Verifikasi dalam format PDF"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 text-slate-950 font-extrabold" />
                      Unduh PDF
                    </Button>
                    <Button
                      onClick={() => exportStockOpnameExcel(session)}
                      variant="outline"
                      className="text-xs font-bold h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs"
                      title="Unduh Rekapitulasi Verifikasi dalam format Microsoft Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Ekspor Excel (.xlsx)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUAT SESI STOCK OPNAME BARU */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#032C24] via-[#054035] to-[#011813] text-white p-6 relative border-b border-[#0F5C4E]">
              <button
                onClick={() => setShowNewModal(false)}
                className="absolute top-5 right-5 text-emerald-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#FFB800]" /> Wizard Stock Opname
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Buat Sesi Sensus & Audit Baru
              </h3>
              <p className="text-xs text-emerald-100/80 mt-1">
                Tarik data aset & BHP secara otomatis untuk diverifikasi fisiknya di lapangan.
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama / Judul Sesi Sensus *
                  </label>
                  <Input
                    required
                    placeholder="Contoh: Sensus Inventaris & BHP Lab Komputer Semester Ganjil"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    className="text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cakupan / Ruang Lingkup *
                    </label>
                    <select
                      value={newSession.type}
                      onChange={(e) => setNewSession({ ...newSession, type: e.target.value as any })}
                      className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="ROOM">Khusus Ruangan Tertentu</option>
                      <option value="ALL">Semua Aset & BHP Sekolah</option>
                      <option value="ASSET">Hanya Aset Sarpras (Inventaris)</option>
                      <option value="BHP">Hanya Bahan Habis Pakai (BHP)</option>
                    </select>
                  </div>

                  {newSession.type === 'ROOM' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pilih Target Ruangan *
                      </label>
                      <select
                        value={newSession.targetLocation}
                        onChange={(e) => setNewSession({ ...newSession, targetLocation: e.target.value })}
                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 text-slate-800 dark:text-slate-200 outline-none"
                      >
                        {rooms.map((r: any) => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal Pelaksanaan *
                    </label>
                    <Input
                      type="date"
                      required
                      value={newSession.startDate}
                      onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Petugas / Tim Auditor *
                    </label>
                    <Input
                      required
                      placeholder="Nama pemeriksa/auditor"
                      value={newSession.auditorName}
                      onChange={(e) => setNewSession({ ...newSession, auditorName: e.target.value })}
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan / Instruksi Khusus
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Catatan tujuan audit, fokus pemeriksaan, dsb."
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewModal(false)}
                    className="text-xs h-10 px-4 rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
                  >
                    Mulai Sesi Opname <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-slate-950 font-extrabold" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINKRONISASI & ADJUSTMENT STOK SISTEM */}
      {/* ========================================================================= */}
      {showAdjustModal && currentSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
              <RefreshCw className="w-7 h-7 animate-spin-slow" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Konfirmasi Sinkronisasi Stok (Adjustment)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin memperbarui kuantitas stok di <strong>Buku Induk Inventaris</strong> dan <strong>Bahan Habis Pakai (BHP)</strong> agar sesuai dengan hasil hitungan fisik riil sesi <strong>{currentSession.sessionCode}</strong>?
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAdjustModal(false)}
                className="text-xs h-10 px-4 rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleApplyAdjustments}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
              >
                Ya, Terapkan Penyesuaian
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UBAH CATATAN TEMUAN ITEM */}
      {/* ========================================================================= */}
      {showItemNotesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowItemNotesModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Catatan Hasil Sensus: {showItemNotesModal.item.itemName}
            </h4>
            <p className="text-[11px] text-slate-500 mb-4 font-mono">
              {showItemNotesModal.item.itemCode}
            </p>

            <textarea
              rows={4}
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              placeholder="Tuliskan temuan fisik, penyebab selisih kuantitas, atau rencana tindak lanjut servis..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            ></textarea>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowItemNotesModal(null)}
                className="text-xs h-9 rounded-xl"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleUpdateItem(showItemNotesModal.item.id, { notes: tempNotes });
                  setShowItemNotesModal(null);
                }}
                className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
              >
                Simpan Catatan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
