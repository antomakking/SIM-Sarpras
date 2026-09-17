import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Package, ArrowLeftRight, Boxes, DoorOpen, FileSpreadsheet, FileText, Calendar, CalendarClock, Wrench, Sparkles, BookOpen, ClipboardList, ClipboardCheck, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialLoans, initialAssets, initialRooms, initialBooks, initialBookLoans, initialConsumables, initialSignatorySettings, initialStockOpnames, StockOpnameSession, BHP_CATEGORIES, Book, BookLoan } from '../store/data';
import { 
  downloadLoansPdf, 
  downloadMaintenancePdf, 
  downloadAssetsPdf, 
  downloadKIRPdf, 
  downloadBooksPdf, 
  downloadBhpPdf,
  downloadStockOpnamePdf
} from '../utils/pdfExport';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('peminjaman');
  const [loans] = useLocalStorage('iq-loans', initialLoans);
  const [assets] = useLocalStorage('iq-assets', initialAssets);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);
  const [books] = useLocalStorage<Book[]>('iq-books', initialBooks);
  const [bookLoans] = useLocalStorage<BookLoan[]>('iq-book-loans', initialBookLoans);
  const [consumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [stockOpnames] = useLocalStorage<StockOpnameSession[]>('iq-stock-opnames', initialStockOpnames);
  const [signatorySettings] = useLocalStorage('iq-signatory-settings', initialSignatorySettings);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('Semua Ruangan');
  const [selectedBookFunding, setSelectedBookFunding] = useState('SEMUA');
  const [selectedBookCategory, setSelectedBookCategory] = useState('SEMUA');
  const [selectedBhpCategory, setSelectedBhpCategory] = useState('SEMUA');
  const [selectedBhpStatus, setSelectedBhpStatus] = useState('SEMUA');
  const [selectedStockOpnameId, setSelectedStockOpnameId] = useState<string>(stockOpnames[0]?.id || '');

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
    if (diffDays < 0) status = 'Terlambat';
    else if (diffDays <= 30) status = 'Segera';

    return {
      ...asset,
      lastServiceDate: lastDate,
      nextDueDate: nextDueDateObj.toISOString().split('T')[0],
      diffDays,
      status
    };
  }).sort((a, b) => a.diffDays - b.diffDays);

  const handlePrint = () => {
    window.print();
  };

  // =========================================================================
  // DIRECT PDF DOWNLOAD HANDLERS (jsPDF + autoTable)
  // =========================================================================
  const handleExportLoansPdf = () => {
    downloadLoansPdf(loans, startDate, endDate);
  };

  const handleExportMaintenancePdf = () => {
    downloadMaintenancePdf(maintenanceList);
  };

  const handleExportAssetsPdf = () => {
    downloadAssetsPdf(assets);
  };

  const handleExportKIRPdf = () => {
    downloadKIRPdf(assets, selectedRoom, rooms);
  };

  const handleExportBooksPdf = () => {
    downloadBooksPdf(books, selectedBookFunding, selectedBookCategory);
  };

  const handleExportBhpPdf = () => {
    downloadBhpPdf(consumables, selectedBhpCategory, selectedBhpStatus);
  };

  const handleExportStockOpnamePdf = () => {
    const session = stockOpnames.find(s => s.id === selectedStockOpnameId) || stockOpnames[0];
    if (session) {
      downloadStockOpnamePdf(session);
    }
  };

  const handleExportCurrentTabPdf = () => {
    switch (activeTab) {
      case 'peminjaman':
        handleExportLoansPdf();
        break;
      case 'pemeliharaan':
        handleExportMaintenancePdf();
        break;
      case 'inventaris':
        handleExportAssetsPdf();
        break;
      case 'kir':
        handleExportKIRPdf();
        break;
      case 'perpustakaan':
        handleExportBooksPdf();
        break;
      case 'bhp':
        handleExportBhpPdf();
        break;
      case 'stock-opname':
        handleExportStockOpnamePdf();
        break;
      default:
        handleExportLoansPdf();
    }
  };

  // =========================================================================
  // EXCEL EXPORT HANDLERS (XLSX)
  // =========================================================================
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // 1. Export Laporan Peminjaman ke Excel
  const handleExportLoansExcel = () => {
    const filteredLoans = loans.filter((l: any) => {
      if (startDate && l.startDate < startDate) return false;
      if (endDate && l.startDate > endDate) return false;
      return true;
    });

    const data = filteredLoans.map((l: any, index: number) => ({
      'No': index + 1,
      'ID Peminjaman': l.id || `PJ-${index + 1}`,
      'Nama Peminjam': l.borrowerName,
      'Tipe / Jenis': l.type,
      'Nama Barang / Ruangan': l.itemName,
      'Tanggal Mulai': l.startDate,
      'Tanggal Selesai': l.endDate,
      'Status': l.status,
      'Keperluan': l.purpose || '-',
      'Kondisi Kembali': l.condition || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 15 }, // ID
      { wch: 25 }, // Nama
      { wch: 12 }, // Tipe
      { wch: 30 }, // Barang/Ruangan
      { wch: 15 }, // Mulai
      { wch: 15 }, // Selesai
      { wch: 15 }, // Status
      { wch: 25 }, // Keperluan
      { wch: 18 }  // Kondisi
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Peminjaman');
    XLSX.writeFile(wb, `Laporan_Peminjaman_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // 2. Export Jadwal Pemeliharaan ke Excel
  const handleExportMaintenanceExcel = () => {
    const data = maintenanceList.map((m: any, index: number) => ({
      'No': index + 1,
      'Kode Aset': m.assetCode,
      'Nama Barang': m.name,
      'Lokasi Ruangan': m.location,
      'Nilai Aset (Rp)': m.price || 0,
      'Servis Terakhir': m.lastServiceDate,
      'Jatuh Tempo Servis': m.nextDueDate,
      'Sisa Hari': m.diffDays,
      'Status': m.status,
      'Interval Servis (Hari)': m.maintenanceIntervalDays || 180
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 30 },
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Pemeliharaan');
    XLSX.writeFile(wb, `Jadwal_Pemeliharaan_Aset_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // 3. Export Buku Inventaris Aset ke Excel
  const handleExportAssetsExcel = () => {
    const data = assets.map((a: any, index: number) => ({
      'No': index + 1,
      'Kode Aset': a.assetCode,
      'Nama Barang / Aset': a.name,
      'Kategori': a.category,
      'Sumber Anggaran': a.fundingSource || 'BOSP Reguler',
      'Kondisi': a.condition,
      'Jumlah (Qty)': a.quantity,
      'Harga Satuan (Rp)': a.price || 0,
      'Total Nilai (Rp)': (a.price || 0) * (a.quantity || 1),
      'Lokasi Ruangan': a.location,
      'Tahun Pengadaan': a.purchaseYear || a.purchaseDate || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 32 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Inventaris');
    XLSX.writeFile(wb, `Buku_Inventaris_Aset_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // 4. Export KIR Ruangan ke Excel
  const handleExportKIRExcel = () => {
    const filtered = assets.filter((a: any) => selectedRoom === 'Semua Ruangan' || a.location === selectedRoom);
    const data = filtered.map((a: any, index: number) => ({
      'No': index + 1,
      'Ruangan': a.location,
      'Kode Aset': a.assetCode,
      'Nama Barang': a.name,
      'Sumber Anggaran': a.fundingSource || 'BOSP Reguler',
      'Kondisi': a.condition,
      'Jumlah': a.quantity,
      'Harga Satuan (Rp)': a.price || 0,
      'Total Nilai (Rp)': (a.price || 0) * (a.quantity || 1)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 30 },
      { wch: 18 },
      { wch: 14 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `KIR - ${selectedRoom.slice(0, 20)}`);
    const cleanRoomName = selectedRoom.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `KIR_${cleanRoomName}_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // 5. Export Buku Perpustakaan ke Excel
  const handleExportBooksExcel = () => {
    const filtered = books.filter(b => 
      (selectedBookFunding === 'SEMUA' || b.fundingSource === selectedBookFunding) &&
      (selectedBookCategory === 'SEMUA' || b.category === selectedBookCategory)
    );

    const data = filtered.map((b: any, index: number) => {
      const goodCount = (b.copies || []).filter((c: any) => c.condition === 'BAIK').length;
      const rrCount = (b.copies || []).filter((c: any) => c.condition === 'RUSAK_RINGAN').length;
      const rbCount = (b.copies || []).filter((c: any) => c.condition === 'RUSAK_BERAT').length;

      return {
        'No': index + 1,
        'Kode Buku': b.bookCode,
        'Judul Buku': b.title,
        'Pengarang': b.author,
        'Penerbit': b.publisher,
        'Tahun Terbit': b.publishYear,
        'ISBN': b.isbn || '-',
        'Kategori': b.category,
        'Sumber Anggaran': b.fundingSource || 'BOSP Reguler',
        'Lokasi Rak': b.rackLocation || b.location,
        'Total Eksemplar': b.totalCopies,
        'Tersedia': b.availableCopies,
        'Dipinjam': b.borrowedCopies,
        'Baik': goodCount,
        'Rusak Ringan': rrCount,
        'Rusak Berat': rbCount
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 35 },
      { wch: 22 },
      { wch: 20 },
      { wch: 12 },
      { wch: 16 },
      { wch: 24 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Perpustakaan');
    XLSX.writeFile(wb, `Buku_Induk_Perpustakaan_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // 6. Export BHP ke Excel
  const handleExportBhpExcel = () => {
    const filteredBhp = consumables.filter((item: any) => {
      if (selectedBhpCategory !== 'SEMUA') {
        const matchCat = item.category === selectedBhpCategory || (item.itemCode && item.itemCode.startsWith(selectedBhpCategory));
        if (!matchCat) return false;
      }
      const isLow = item.stock <= (item.reorderPoint || 5);
      if (selectedBhpStatus === 'MENIPIS' && !isLow) return false;
      if (selectedBhpStatus === 'AMAN' && isLow) return false;
      return true;
    });

    const data = filteredBhp.map((item: any, index: number) => {
      const isLow = item.stock <= (item.reorderPoint || 5);
      const isCritical = item.stock === 0;
      const statusText = isCritical ? 'KRITIS (0)' : isLow ? 'MENIPIS (Perlu Reorder)' : 'AMAN';

      return {
        'No': index + 1,
        'Kode BHP': item.itemCode,
        'Nama Barang Habis Pakai': item.name,
        'Kategori': item.category,
        'Subkategori': item.subcategory || '-',
        'Stok Saat Ini': item.stock,
        'Satuan': item.unit,
        'Min. Reorder Point': item.reorderPoint || 5,
        'Lokasi Simpan': item.location || 'Gudang TU',
        'Status Kondisi': statusText,
        'Harga Satuan (Rp)': item.unitPrice || 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 32 },
      { wch: 20 },
      { wch: 20 },
      { wch: 14 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stok BHP');
    XLSX.writeFile(wb, `Laporan_Stok_BHP_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // 7. Export Stock Opname ke Excel
  const handleExportStockOpnameExcel = () => {
    const session = stockOpnames.find(s => s.id === selectedStockOpnameId) || stockOpnames[0];
    if (!session) return;

    const data = session.items.map((item, index) => ({
      'No': index + 1,
      'Kode Barang': item.itemCode,
      'Nama Barang / Aset': item.itemName,
      'Kategori': item.category,
      'Lokasi': item.location,
      'Satuan': item.unit,
      'Stok Sistem': item.systemQty,
      'Fisik Riil': item.physicalQty !== null ? item.physicalQty : '-',
      'Selisih (Discrepancy)': item.difference,
      'Status Audit': item.status,
      'Catatan': item.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 25 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Opname');
    const cleanSessionCode = session.sessionCode.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Berita_Acara_Stock_Opname_${cleanSessionCode}_SMKIT_Ibnul_Qayyim_${getTodayStr()}.xlsx`);
  };

  // Dispatch current active tab to Excel export
  const handleExportCurrentTabExcel = () => {
    switch (activeTab) {
      case 'peminjaman':
        handleExportLoansExcel();
        break;
      case 'pemeliharaan':
        handleExportMaintenanceExcel();
        break;
      case 'inventaris':
        handleExportAssetsExcel();
        break;
      case 'kir':
        handleExportKIRExcel();
        break;
      case 'perpustakaan':
        handleExportBooksExcel();
        break;
      case 'bhp':
        handleExportBhpExcel();
        break;
      case 'stock-opname':
        handleExportStockOpnameExcel();
        break;
      default:
        handleExportLoansExcel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area with Deep Forest Teal & Golden Amber Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl print:hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              <span className="text-[#FFB800]">Pusat Laporan</span> & Rekapitulasi Dokumen
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Rekapitulasi sirkulasi peminjaman, agenda pemeliharaan rutin, buku inventaris induk, dan Kartu Inventaris Ruangan (KIR).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button 
              onClick={handleExportCurrentTabExcel} 
              variant="outline"
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
              title="Download lembar kerja format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-300" /> Ekspor Excel (.xlsx)
            </Button>
            <Button 
              onClick={handleExportCurrentTabPdf} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-extrabold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Download langsung berkas PDF laporan resmi"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Ekspor PDF
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline"
              className="bg-[#064237]/40 hover:bg-[#085244] text-emerald-200 border-[#0F5C4E]/60 text-xs px-2.5 h-9"
              title="Buka dialog cetak browser"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-emerald-300" /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs with Theme Accents */}
      <div className="inline-flex flex-wrap items-center p-1.5 bg-[#032C24]/10 dark:bg-[#032C24]/60 border border-[#095445]/30 rounded-2xl print:hidden gap-1">
        <button 
          onClick={() => setActiveTab('peminjaman')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'peminjaman' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <CalendarClock className={`w-4 h-4 mr-2 ${activeTab === 'peminjaman' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> Laporan Peminjaman
        </button>
        <button 
          onClick={() => setActiveTab('pemeliharaan')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'pemeliharaan' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <Wrench className={`w-4 h-4 mr-2 ${activeTab === 'pemeliharaan' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> Jadwal Pemeliharaan
        </button>
        <button 
          onClick={() => setActiveTab('inventaris')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'inventaris' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <Boxes className={`w-4 h-4 mr-2 ${activeTab === 'inventaris' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> Inventaris
        </button>
        <button 
          onClick={() => setActiveTab('kir')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'kir' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <DoorOpen className={`w-4 h-4 mr-2 ${activeTab === 'kir' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> KIR Ruangan
        </button>
        <button 
          onClick={() => setActiveTab('perpustakaan')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'perpustakaan' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <BookOpen className={`w-4 h-4 mr-2 ${activeTab === 'perpustakaan' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> Perpustakaan
        </button>
        <button 
          onClick={() => setActiveTab('bhp')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'bhp' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <ClipboardList className={`w-4 h-4 mr-2 ${activeTab === 'bhp' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> Barang Habis Pakai (BHP)
        </button>
        <button 
          onClick={() => setActiveTab('stock-opname')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'stock-opname' ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md shadow-amber-950/20' : 'text-slate-700 dark:text-emerald-100/80 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'}`}
        >
          <ClipboardCheck className={`w-4 h-4 mr-2 ${activeTab === 'stock-opname' ? 'text-slate-950' : 'text-emerald-600 dark:text-[#FFB800]'}`} /> Stok Opname
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mt-8">
        {/* 1. LAPORAN PEMINJAMAN */}
        {activeTab === 'peminjaman' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">Filter Periode Peminjaman</h3>
                  <p className="text-xs text-slate-500">Pilih rentang tanggal untuk laporan dokumen PDF atau Excel.</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Dari</label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 bg-white dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Sampai</label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 bg-white dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
              <p className="text-slate-500">Total <span className="font-bold text-slate-700 dark:text-slate-300">{loans.length}</span> data peminjaman.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={handleExportLoansExcel} 
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-3.5 rounded-xl shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Ekspor Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportLoansPdf} 
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-sm h-10 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                  title="Unduh langsung berkas PDF Laporan Peminjaman"
                >
                  <Download className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor PDF Peminjaman
                </Button>
              </div>
            </div>

            {/* Printable Report Header */}
            <div className="hidden print:flex items-center gap-4 mb-6 text-left border-b-2 border-slate-900 pb-4">
              <img 
                src="/logo.svg" 
                alt="Logo SMK IT Ibnul Qayyim" 
                className="w-16 h-16 object-contain shrink-0" 
              />
              <div className="flex-1">
                <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">SMK IT IBNUL QAYYIM</h1>
                <h2 className="text-sm font-semibold uppercase text-slate-800">Laporan Rekapitulasi Peminjaman Aset & Ruangan</h2>
                <p className="text-xs text-slate-600">Sistem Manajemen Sarana & Prasarana Sekolah</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Dicetak pada:</p>
                <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white dark:bg-slate-950 shadow-sm print:border-slate-900 print:rounded-none">
              <Table>
                <TableHeader className="bg-emerald-50/50 print:bg-slate-200">
                  <TableRow className="border-b border-emerald-100 print:border-slate-900">
                    <TableHead className="font-semibold text-slate-700">Peminjam</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tipe</TableHead>
                    <TableHead className="font-semibold text-slate-700">Item / Ruangan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Mulai</TableHead>
                    <TableHead className="font-semibold text-slate-700">Selesai</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan: any) => (
                    <TableRow key={loan.id} className="border-b border-emerald-50 print:border-slate-300">
                      <TableCell className="font-semibold text-slate-800">{loan.borrowerName}</TableCell>
                      <TableCell className="text-slate-600">{loan.type}</TableCell>
                      <TableCell className="text-slate-600">{loan.itemName}</TableCell>
                      <TableCell className="text-slate-600">{loan.startDate}</TableCell>
                      <TableCell className="text-slate-600">{loan.endDate}</TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 print:bg-transparent print:border print:border-slate-400">
                          {loan.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Signature Area for Print */}
            <div className="hidden print:flex justify-between mt-12 pt-8 text-center text-sm">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">{signatorySettings.headmaster.title}</p>
                <div className="h-20"></div>
                <p className="font-bold underline">{signatorySettings.headmaster.name}</p>
                <p className="text-xs">{signatorySettings.headmaster.niy}</p>
              </div>
              <div>
                <p>{signatorySettings.sarprasOfficer.title}</p>
                <p className="font-bold">&nbsp;</p>
                <div className="h-20"></div>
                <p className="font-bold underline">{signatorySettings.sarprasOfficer.name}</p>
                <p className="text-xs">{signatorySettings.sarprasOfficer.niy}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. JADWAL PEMELIHARAAN */}
        {activeTab === 'pemeliharaan' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Jadwal Pemeliharaan & Servis Berkala Aset</h3>
                <p className="text-xs text-slate-500">Daftar aset bernilai tinggi dengan perhitungan jadwal servis berkala otomatis.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={handleExportMaintenanceExcel} 
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-3.5 rounded-xl shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Ekspor Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportMaintenancePdf} 
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-sm h-10 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                  title="Unduh langsung berkas PDF Jadwal Servis & Pemeliharaan"
                >
                  <Download className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor PDF Jadwal Servis
                </Button>
              </div>
            </div>

            {/* Printable Report Header */}
            <div className="hidden print:flex items-center gap-4 mb-6 text-left border-b-2 border-slate-900 pb-4">
              <img 
                src="/logo.svg" 
                alt="Logo SMK IT Ibnul Qayyim" 
                className="w-16 h-16 object-contain shrink-0" 
              />
              <div className="flex-1">
                <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">SMK IT IBNUL QAYYIM</h1>
                <h2 className="text-sm font-semibold uppercase text-slate-800">Jadwal Pemeliharaan & Servis Berkala Aset Inventaris</h2>
                <p className="text-xs text-slate-600">Sistem Manajemen Sarana & Prasarana Sekolah</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Dicetak pada:</p>
                <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white dark:bg-slate-950 shadow-sm print:border-slate-900 print:rounded-none">
              <Table>
                <TableHeader className="bg-emerald-50/50 print:bg-slate-200">
                  <TableRow className="border-b border-emerald-100 print:border-slate-900">
                    <TableHead className="font-semibold text-slate-700">Kode Aset</TableHead>
                    <TableHead className="font-semibold text-slate-700">Nama Barang</TableHead>
                    <TableHead className="font-semibold text-slate-700">Lokasi</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Nilai (Rp)</TableHead>
                    <TableHead className="font-semibold text-slate-700">Servis Terakhir</TableHead>
                    <TableHead className="font-semibold text-slate-700">Jatuh Tempo Servis</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceList.map((item: any) => (
                    <TableRow key={item.id} className="border-b border-emerald-50 print:border-slate-300">
                      <TableCell className="font-mono text-sm text-slate-600">{item.assetCode}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{item.name}</TableCell>
                      <TableCell className="text-slate-600">{item.location}</TableCell>
                      <TableCell className="text-right font-medium text-slate-800">Rp {item.price?.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-slate-600">{item.lastServiceDate}</TableCell>
                      <TableCell className="font-semibold text-emerald-700 print:text-black">{item.nextDueDate}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded ${item.status === 'Terlambat' ? 'bg-rose-100 text-rose-800' : item.status === 'Segera' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} print:bg-transparent print:border print:border-slate-400`}>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Signature Area for Print */}
            <div className="hidden print:flex justify-between mt-12 pt-8 text-center text-sm">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">{signatorySettings.headmaster.title}</p>
                <div className="h-20"></div>
                <p className="font-bold underline">{signatorySettings.headmaster.name}</p>
                <p className="text-xs">{signatorySettings.headmaster.niy}</p>
              </div>
              <div>
                <p>{signatorySettings.maintenanceCoordinator.title}</p>
                <p className="font-bold">&nbsp;</p>
                <div className="h-20"></div>
                <p className="font-bold underline">{signatorySettings.maintenanceCoordinator.name}</p>
                <p className="text-xs">{signatorySettings.maintenanceCoordinator.niy}</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. INVENTARIS */}
        {activeTab === 'inventaris' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
              <p className="text-slate-500">Total <span className="font-bold text-slate-700 dark:text-slate-300">{assets.length}</span> aset inventaris.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={handleExportAssetsExcel} 
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-3.5 rounded-xl shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Ekspor Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportAssetsPdf} 
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-sm h-10 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                  title="Unduh langsung berkas PDF Buku Induk Inventaris"
                >
                  <Download className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor PDF Inventaris
                </Button>
              </div>
            </div>

            <div className="hidden print:flex items-center gap-4 mb-6 text-left border-b-2 border-slate-900 pb-4">
              <img 
                src="/logo.svg" 
                alt="Logo SMK IT Ibnul Qayyim" 
                className="w-16 h-16 object-contain shrink-0" 
              />
              <div className="flex-1">
                <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">SMK IT IBNUL QAYYIM</h1>
                <h2 className="text-sm font-semibold uppercase text-slate-800">Laporan Data Inventaris Aset Tetap</h2>
                <p className="text-xs text-slate-600">Sistem Manajemen Sarana & Prasarana Sekolah</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Dicetak pada:</p>
                <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white dark:bg-slate-950 shadow-sm print:border-slate-900">
              <Table>
                <TableHeader className="bg-emerald-50/50 print:bg-slate-200">
                  <TableRow className="border-b border-emerald-100">
                    <TableHead className="font-semibold text-slate-600">Kode</TableHead>
                    <TableHead className="font-semibold text-slate-600">Nama</TableHead>
                    <TableHead className="font-semibold text-slate-600">Sumber Anggaran</TableHead>
                    <TableHead className="font-semibold text-slate-600">Kondisi</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-center">Jml</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-right">Nilai Satuan</TableHead>
                    <TableHead className="font-semibold text-slate-600">Lokasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset: any) => (
                    <TableRow key={asset.id} className="border-b border-emerald-50">
                      <TableCell className="font-mono text-sm text-slate-600">{asset.assetCode}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{asset.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {asset.fundingSource || 'BOSP Reguler'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{asset.condition}</TableCell>
                      <TableCell className="text-center text-slate-600">{asset.quantity}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-800">Rp {asset.price?.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-slate-600">{asset.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 4. KIR */}
        {activeTab === 'kir' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-emerald-100 bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm max-w-xl print:border-none print:shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <DoorOpen className="w-5 h-5 text-[#047857]" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Kartu Inventaris Ruangan (KIR)</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6 print:hidden">Pilih ruangan lalu ekspor ke Excel atau cetak lembar KIR resmi.</p>
              
              <div className="space-y-2 mb-6 print:hidden">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Ruangan</label>
                <select 
                  value={selectedRoom} 
                  onChange={e => setSelectedRoom(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Semua Ruangan">Semua Ruangan</option>
                  {rooms.map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 print:hidden">
                <Button 
                  onClick={handleExportKIRExcel} 
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-4 rounded-lg shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Ekspor Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportKIRPdf} 
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm h-10 px-4 rounded-lg transition-all hover:scale-[1.01]"
                  title="Unduh langsung berkas PDF Kartu Inventaris Ruangan (KIR)"
                >
                  <Download className="w-4 h-4 mr-2" /> Ekspor PDF KIR
                </Button>
              </div>

              {/* Printable KIR Document */}
              <div className="hidden print:block space-y-4">
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-3 text-left">
                  <img 
                    src="/logo.svg" 
                    alt="Logo SMK IT Ibnul Qayyim" 
                    className="w-14 h-14 object-contain shrink-0" 
                  />
                  <div className="flex-1">
                    <h2 className="text-base font-bold uppercase text-slate-900">SMK IT IBNUL QAYYIM</h2>
                    <h3 className="text-sm font-semibold uppercase text-slate-800">KARTU INVENTARIS RUANGAN (KIR)</h3>
                    <p className="text-xs">Ruangan: <span className="font-bold underline">{selectedRoom}</span></p>
                  </div>
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-900 p-1.5">No</th>
                      <th className="border border-slate-900 p-1.5">Kode Barang</th>
                      <th className="border border-slate-900 p-1.5">Nama Barang</th>
                      <th className="border border-slate-900 p-1.5">Sumber Dana</th>
                      <th className="border border-slate-900 p-1.5">Jumlah</th>
                      <th className="border border-slate-900 p-1.5">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets
                      .filter((a: any) => selectedRoom === 'Semua Ruangan' || a.location === selectedRoom)
                      .map((asset: any, idx: number) => (
                        <tr key={asset.id}>
                          <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-1.5 font-mono">{asset.assetCode}</td>
                          <td className="border border-slate-900 p-1.5">{asset.name}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{asset.fundingSource || 'BOSP Reguler'}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{asset.quantity}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{asset.condition}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex justify-between mt-12 pt-4 text-center text-xs">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">{signatorySettings.headmaster.title}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{signatorySettings.headmaster.name}</p>
                    <p className="text-[11px] text-slate-600">{signatorySettings.headmaster.niy}</p>
                  </div>
                  <div>
                    <p>Penanggung Jawab Ruangan</p>
                    <p className="font-bold">&nbsp;</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">Petugas / Penanggung Jawab</p>
                    <p className="text-[11px] text-slate-600">NIY / NIP Petugas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. LAPORAN PERPUSTAKAAN & BUKU */}
        {activeTab === 'perpustakaan' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">Filter Buku & Sumber Anggaran</h3>
                  <p className="text-xs text-slate-500">Sesuaikan filter untuk mengekspor Buku Induk Perpustakaan & Status Sirkulasi.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Sumber Anggaran</label>
                    <select
                      value={selectedBookFunding}
                      onChange={(e) => setSelectedBookFunding(e.target.value)}
                      className="h-9 text-xs rounded-md border border-input bg-white dark:bg-slate-900 px-3 py-1 text-slate-800 dark:text-slate-100"
                    >
                      <option value="SEMUA">Semua Sumber Dana</option>
                      <option value="BOSP Reguler">BOSP Reguler</option>
                      <option value="BOSP Kinerja">BOSP Kinerja</option>
                      <option value="Operasional Sekolah">Operasional Sekolah</option>
                      <option value="Hibah">Hibah</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Kategori Kejuruan</label>
                    <select
                      value={selectedBookCategory}
                      onChange={(e) => setSelectedBookCategory(e.target.value)}
                      className="h-9 text-xs rounded-md border border-input bg-white dark:bg-slate-900 px-3 py-1 text-slate-800 dark:text-slate-100"
                    >
                      <option value="SEMUA">Semua Kategori</option>
                      <option value="Rekayasa Perangkat Lunak (RPL)">RPL</option>
                      <option value="Bisnis Digital & Manajemen">Bisnis Digital</option>
                      <option value="Pendidikan Agama Islam">Agama Islam</option>
                      <option value="Umum & Normatif Adaptif">Umum</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
              <p className="text-slate-500 text-sm">
                Menampilkan{' '}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {books.filter(b => 
                    (selectedBookFunding === 'SEMUA' || b.fundingSource === selectedBookFunding) &&
                    (selectedBookCategory === 'SEMUA' || b.category === selectedBookCategory)
                  ).length}
                </span>{' '}
                judul buku perpustakaan.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={handleExportBooksExcel} 
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-3.5 rounded-xl shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Ekspor Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportBooksPdf} 
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-sm h-10 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                  title="Unduh langsung berkas PDF Buku Induk Perpustakaan"
                >
                  <Download className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor PDF Perpustakaan
                </Button>
              </div>
            </div>

            {/* Printable Book Report Document */}
            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h2 className="text-xl font-bold uppercase tracking-wide">SMK IT IBNUL QAYYIM MAKASSAR</h2>
                <h3 className="text-lg font-bold uppercase text-emerald-800">BUKU INDUK PERPUSTAKAAN & REKAPITULASI BUKU PELAJARAN</h3>
                <p className="text-xs text-slate-600 mt-1">Sumber Anggaran: {selectedBookFunding} &bull; Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-2">No</th>
                      <th className="border border-slate-900 p-2">Kode Buku</th>
                      <th className="border border-slate-900 p-2 text-left">Judul Buku & Pengarang</th>
                      <th className="border border-slate-900 p-2">Penerbit / Thn</th>
                      <th className="border border-slate-900 p-2">Sumber Anggaran</th>
                      <th className="border border-slate-900 p-2">Lokasi Rak</th>
                      <th className="border border-slate-900 p-2">Total Eks</th>
                      <th className="border border-slate-900 p-2">Ready</th>
                      <th className="border border-slate-900 p-2">Dipinjam</th>
                      <th className="border border-slate-900 p-2">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books
                      .filter(b => 
                        (selectedBookFunding === 'SEMUA' || b.fundingSource === selectedBookFunding) &&
                        (selectedBookCategory === 'SEMUA' || b.category === selectedBookCategory)
                      )
                      .map((book: any, idx: number) => {
                        const goodCount = (book.copies || []).filter((c: any) => c.condition === 'BAIK').length;
                        const rrCount = (book.copies || []).filter((c: any) => c.condition === 'RUSAK_RINGAN').length;
                        const rbCount = (book.copies || []).filter((c: any) => c.condition === 'RUSAK_BERAT').length;

                        return (
                          <tr key={book.id}>
                            <td className="border border-slate-900 p-2 text-center font-medium">{idx + 1}</td>
                            <td className="border border-slate-900 p-2 font-mono font-bold text-center">{book.bookCode}</td>
                            <td className="border border-slate-900 p-2">
                              <div className="font-bold text-slate-900">{book.title}</div>
                              <div className="text-[11px] text-slate-600">{book.author} (ISBN: {book.isbn || '-'})</div>
                            </td>
                            <td className="border border-slate-900 p-2 text-center">{book.publisher}, {book.publishYear}</td>
                            <td className="border border-slate-900 p-2 text-center font-semibold">{book.fundingSource || 'BOSP Reguler'}</td>
                            <td className="border border-slate-900 p-2 text-center font-mono">{book.rackLocation || book.location}</td>
                            <td className="border border-slate-900 p-2 text-center font-bold">{book.totalCopies}</td>
                            <td className="border border-slate-900 p-2 text-center font-bold text-emerald-800">{book.availableCopies}</td>
                            <td className="border border-slate-900 p-2 text-center font-bold text-amber-800">{book.borrowedCopies}</td>
                            <td className="border border-slate-900 p-2 text-center text-[10px]">
                              {goodCount > 0 && <span className="text-emerald-700 font-bold">{goodCount} Baik</span>}
                              {rrCount > 0 && <span className="text-amber-700 block">{rrCount} R.Ringan</span>}
                              {rbCount > 0 && <span className="text-rose-700 block">{rbCount} R.Berat</span>}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {/* Document Signatures */}
                <div className="flex justify-between mt-12 pt-4 text-center text-xs">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">{signatorySettings.headmaster.title}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{signatorySettings.headmaster.name}</p>
                    <p className="text-[11px] text-slate-600">{signatorySettings.headmaster.niy}</p>
                  </div>
                  <div>
                    <p>{signatorySettings.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold">{signatorySettings.librarian.title}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{signatorySettings.librarian.name}</p>
                    <p className="text-[11px] text-slate-600">{signatorySettings.librarian.niy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. LAPORAN BARANG HABIS PAKAI (BHP) */}
        {activeTab === 'bhp' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">Filter Data Barang Habis Pakai</h3>
                  <p className="text-xs text-slate-500">Filter berdasarkan kategori atau status kondisi stok.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Kategori BHP</label>
                    <select
                      value={selectedBhpCategory}
                      onChange={(e) => setSelectedBhpCategory(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="SEMUA">Semua Kategori (5 Klasifikasi)</option>
                      {BHP_CATEGORIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.shortName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Status Stok</label>
                    <select
                      value={selectedBhpStatus}
                      onChange={(e) => setSelectedBhpStatus(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="SEMUA">Semua Status Stok</option>
                      <option value="MENIPIS">⚠️ Stok Menipis / Reorder Saja</option>
                      <option value="AMAN">✅ Stok Aman Saja</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
              <p className="text-slate-500 text-sm">
                Menampilkan rekapitulasi data stok Barang Habis Pakai (BHP).
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={handleExportBhpExcel} 
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-3.5 rounded-xl shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Ekspor Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportBhpPdf} 
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-sm h-10 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                  title="Unduh langsung berkas PDF Rekapitulasi Stok BHP"
                >
                  <Download className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor PDF Rekap BHP
                </Button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
              {/* Official School Letterhead (KOP SURAT) */}
              <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-900">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  <img 
                    src="/logo.svg" 
                    alt="Logo Sekolah" 
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>
                <div className="flex-1 text-center">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-slate-800">YAYASAN DA'WAH ISLAM IBNUL QAYYIM MAKASSAR</h3>
                  <h1 className="font-extrabold text-xl sm:text-2xl text-slate-950 tracking-tight uppercase">SMK IT IBNUL QAYYIM MAKASSAR</h1>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    KOMPETENSI KEAHLIAN: REKAYASA PERANGKAT LUNAK & TEKNIK KOMPUTER JARINGAN
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    NPSN: 69989528 | Alamat: Jl. Perintis Kemerdekaan KM. 10 Tamalanrea, Makassar - Sulawesi Selatan 90245
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Website: www.smkit-ibnulqayyim.sch.id | Email: smkit@ibnulqayyim.sch.id | SIM-SARPRAS Terpadu
                  </p>
                </div>
              </div>
              <div className="border-b border-slate-900 mt-0.5 mb-6" />

              {/* Document Title */}
              <div className="text-center mb-6">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-950 underline uppercase tracking-wide">
                  LAPORAN REKAPITULASI KONDISI STOK BARANG HABIS PAKAI (BHP)
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-mono">
                  Nomor Dokumen: {`042/SMKIT-IQ/SARPRAS/BHP/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
                </p>
              </div>

              {/* Summary Metadata Box */}
              {(() => {
                const filteredBhp = consumables.filter((item: any) => {
                  if (selectedBhpCategory !== 'SEMUA') {
                    const matchCat = item.category === selectedBhpCategory || (item.itemCode && item.itemCode.startsWith(selectedBhpCategory));
                    if (!matchCat) return false;
                  }
                  const isLow = item.stock <= (item.reorderPoint || 5);
                  if (selectedBhpStatus === 'MENIPIS' && !isLow) return false;
                  if (selectedBhpStatus === 'AMAN' && isLow) return false;
                  return true;
                });

                const safeCount = filteredBhp.filter((i: any) => i.stock > (i.reorderPoint || 5)).length;
                const lowCount = filteredBhp.filter((i: any) => i.stock <= (i.reorderPoint || 5)).length;

                return (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Tanggal Cetak:</span>
                        <strong className="text-slate-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Filter Kategori:</span>
                        <strong className="text-slate-900">{selectedBhpCategory === 'SEMUA' ? 'Semua Kategori' : selectedBhpCategory}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Total Item Dilaporkan:</span>
                        <strong className="text-slate-900">{filteredBhp.length} Jenis Barang</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Kondisi Stok:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-700 font-bold">{safeCount} Aman</span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">{lowCount} Menipis</span>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-xs text-left border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-center">
                            <th className="border border-slate-300 p-2 w-10">No</th>
                            <th className="border border-slate-300 p-2 w-28">Kode BHP</th>
                            <th className="border border-slate-300 p-2 text-left">Nama Barang Habis Pakai</th>
                            <th className="border border-slate-300 p-2 text-left">Kategori / Sub</th>
                            <th className="border border-slate-300 p-2 w-20 text-center">Stok</th>
                            <th className="border border-slate-300 p-2 w-16 text-center">Satuan</th>
                            <th className="border border-slate-300 p-2 w-20 text-center">Min. Reorder</th>
                            <th className="border border-slate-300 p-2 text-left">Lokasi Simpan</th>
                            <th className="border border-slate-300 p-2 w-28 text-center">Status Kondisi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBhp.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="border border-slate-300 p-6 text-center text-slate-500 italic">
                                Tidak ada data barang habis pakai yang memenuhi kriteria filter.
                              </td>
                            </tr>
                          ) : (
                            filteredBhp.map((item: any, index: number) => {
                              const isLow = item.stock <= (item.reorderPoint || 5);
                              const isCritical = item.stock === 0;

                              return (
                                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  <td className="border border-slate-300 p-2 text-center">{index + 1}</td>
                                  <td className="border border-slate-300 p-2 font-mono font-bold text-slate-800 text-center">
                                    {item.itemCode}
                                  </td>
                                  <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                                    {item.name}
                                  </td>
                                  <td className="border border-slate-300 p-2">
                                    <span className="font-bold text-slate-800">{item.category}</span>
                                    {item.subcategory && (
                                      <span className="text-slate-600 block text-[10px]">{item.subcategory}</span>
                                    )}
                                  </td>
                                  <td className={`border border-slate-300 p-2 text-center font-bold text-sm ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                                    {item.stock}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-center text-slate-700">
                                    {item.unit}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-center text-slate-600">
                                    {item.reorderPoint || 5} {item.unit}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-slate-700">
                                    {item.location || 'Gudang TU'}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-center">
                                    {isCritical ? (
                                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                                        KRITIS (0)
                                      </span>
                                    ) : isLow ? (
                                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        MENIPIS
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        AMAN
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Notes */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 mb-8">
                      <p className="font-bold text-slate-800">Catatan Pengelolaan Logistik Sarpras:</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                        <li>Barang dengan status <strong>MENIPIS / KRITIS</strong> wajib segera diajukan pengadaan ulang (Reorder) ke Bendahara & Kepala Sekolah.</li>
                        <li>Pengeluaran barang harus selalu dicatat melalui formulir logistik resmi dengan menyertakan nama penanggung jawab pemakai.</li>
                        <li>Pemeriksaan fisik (Stock Opname) berkala dilaksanakan setiap akhir bulan oleh Penanggung Jawab Sarpras.</li>
                      </ul>
                    </div>

                    {/* Official Signatures */}
                    <div className="grid grid-cols-2 gap-8 text-xs text-slate-900 pt-4">
                      <div className="text-center">
                        <p>Mengetahui,</p>
                        <p className="font-bold">{signatorySettings.headmaster.title}</p>
                        <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                          (Tanda Tangan & Cap Sekolah)
                        </div>
                        <p className="font-bold underline text-sm">{signatorySettings.headmaster.name}</p>
                        <p className="text-[11px] text-slate-600">{signatorySettings.headmaster.niy}</p>
                      </div>

                      <div className="text-center">
                        <p>{signatorySettings.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold">{signatorySettings.bhpOfficer.title}</p>
                        <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                          (Tanda Tangan Petugas)
                        </div>
                        <p className="font-bold underline text-sm">{signatorySettings.bhpOfficer.name}</p>
                        <p className="text-[11px] text-slate-600">{signatorySettings.bhpOfficer.niy}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 7. LAPORAN & BERITA ACARA STOCK OPNAME */}
        {activeTab === 'stock-opname' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 print:hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-[#FFB800]" />
                    Pilih Sesi Audit Stok Opname
                  </h3>
                  <p className="text-xs text-slate-500">Pilih sesi opname fisik untuk melihat berita acara, rincian temuan selisih, dan mengunduh berkas PDF/Excel.</p>
                </div>
                <div className="w-full md:w-80">
                  <select 
                    value={selectedStockOpnameId} 
                    onChange={e => setSelectedStockOpnameId(e.target.value)}
                    className="w-full h-10 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#032C24]"
                  >
                    {stockOpnames.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sessionCode} - {s.title} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(() => {
              const currentSession = stockOpnames.find(s => s.id === selectedStockOpnameId) || stockOpnames[0];
              if (!currentSession) {
                return (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <ClipboardCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Belum Ada Sesi Stok Opname</p>
                    <p className="text-xs text-slate-500 mt-1">Buat sesi stok opname baru di menu Stok Opname.</p>
                  </div>
                );
              }

              const matchingItems = currentSession.items.filter(i => i.status === 'SESUAI').length;
              const discrepancyItems = currentSession.items.filter(i => i.status === 'SELISIH').length;
              const uncountedItems = currentSession.items.filter(i => i.status === 'BELUM_DIPERIKSA').length;

              return (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>{currentSession.title}</span>
                        <Badge className={`text-[10px] ${
                          currentSession.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {currentSession.status === 'COMPLETED' ? '✓ SELESAI' : '⏳ BERLANGSUNG'}
                        </Badge>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kode: <strong className="text-slate-700 dark:text-slate-300">{currentSession.sessionCode}</strong> • Auditor: {currentSession.auditorName} • Tanggal: {currentSession.startDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        onClick={handleExportStockOpnameExcel} 
                        variant="outline"
                        className="border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-sm h-10 px-3.5 rounded-xl shadow-xs"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> Ekspor Excel (.xlsx)
                      </Button>
                      <Button 
                        onClick={handleExportStockOpnamePdf} 
                        className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-sm h-10 px-4 rounded-xl shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-1.5 text-[#FFB800]" /> Unduh Berita Acara PDF
                      </Button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Item</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{currentSession.items.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                      <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Sesuai (Cocok)</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{matchingItems}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                      <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Selisih Fisik</p>
                      <p className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1">{discrepancyItems}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Belum Diperiksa</p>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">{uncountedItems}</p>
                    </div>
                  </div>

                  {/* Formal Printable Document Layout */}
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-900 space-y-6">
                    {/* Document Header */}
                    <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                      <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">YAYASAN IBNUL QAYYIM MAKASSAR</p>
                      <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900">
                        BERITA ACARA HASIL STOCK OPNAME SARANA & PRASARANA
                      </h2>
                      <p className="text-xs text-slate-600">SMK IT IBNUL QAYYIM MAKASSAR — TAHUN AJARAN 2026/2027</p>
                      <p className="text-[11px] text-slate-500">Jl. Berua Raya No. 12, Daya, Kec. Biringkanaya, Kota Makassar, Sulawesi Selatan</p>
                    </div>

                    {/* Metadata Subheader */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Kode Berita Acara</span>
                        <strong className="text-slate-900 font-mono">{currentSession.sessionCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Judul Kegiatan</span>
                        <strong className="text-slate-900">{currentSession.title}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Tanggal Pemeriksaan</span>
                        <strong className="text-slate-900">{currentSession.startDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Petugas / Tim Audit</span>
                        <strong className="text-slate-900">{currentSession.auditorName}</strong>
                      </div>
                    </div>

                    {/* Audit Results Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 font-bold">
                            <th className="border border-slate-300 p-2 text-center w-10">No</th>
                            <th className="border border-slate-300 p-2">Kode Barang</th>
                            <th className="border border-slate-300 p-2">Nama Barang / Aset</th>
                            <th className="border border-slate-300 p-2">Lokasi / Ruang</th>
                            <th className="border border-slate-300 p-2 text-center">Sistem</th>
                            <th className="border border-slate-300 p-2 text-center">Fisik Riil</th>
                            <th className="border border-slate-300 p-2 text-center">Selisih</th>
                            <th className="border border-slate-300 p-2 text-center">Status</th>
                            <th className="border border-slate-300 p-2">Catatan Fisik</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSession.items.map((item, idx) => {
                            return (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="border border-slate-300 p-2 text-center font-medium">{idx + 1}</td>
                                <td className="border border-slate-300 p-2 font-mono font-semibold text-slate-800">{item.itemCode}</td>
                                <td className="border border-slate-300 p-2 font-medium">
                                  {item.itemName}
                                  <span className="text-slate-500 block text-[10px]">{item.category}</span>
                                </td>
                                <td className="border border-slate-300 p-2 text-slate-700">{item.location}</td>
                                <td className="border border-slate-300 p-2 text-center font-semibold">{item.systemQty} {item.unit}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                                  {item.physicalQty !== null ? `${item.physicalQty} ${item.unit}` : '-'}
                                </td>
                                <td className="border border-slate-300 p-2 text-center">
                                  <span className={`font-bold ${
                                    item.difference === 0 ? 'text-emerald-700' :
                                    item.difference > 0 ? 'text-amber-700' : 'text-rose-700'
                                  }`}>
                                    {item.difference > 0 ? `+${item.difference}` : item.difference}
                                  </span>
                                </td>
                                <td className="border border-slate-300 p-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.status === 'SESUAI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    item.status === 'SELISIH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                    'bg-slate-100 text-slate-700 border border-slate-300'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="border border-slate-300 p-2 text-slate-600">{item.notes || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Official Signatures */}
                    <div className="grid grid-cols-2 gap-8 text-xs text-slate-900 pt-4">
                      <div className="text-center">
                        <p>Mengetahui,</p>
                        <p className="font-bold">{signatorySettings.headmaster.title}</p>
                        <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                          (Tanda Tangan & Cap Sekolah)
                        </div>
                        <p className="font-bold underline text-sm">{signatorySettings.headmaster.name}</p>
                        <p className="text-[11px] text-slate-600">{signatorySettings.headmaster.niy}</p>
                      </div>

                      <div className="text-center">
                        <p>{signatorySettings.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold">Penanggung Jawab Sarpras / Tim Audit</p>
                        <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                          (Tanda Tangan Petugas)
                        </div>
                        <p className="font-bold underline text-sm">{currentSession.auditorName}</p>
                        <p className="text-[11px] text-slate-600">Tim Inventarisasi Sekolah</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
