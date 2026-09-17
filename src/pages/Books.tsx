import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  CalendarClock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Bookmark, 
  RotateCcw, 
  Pencil, 
  Trash2, 
  Sparkles, 
  Printer, 
  ArrowRight, 
  Users, 
  Library, 
  BadgeCheck, 
  HelpCircle, 
  X,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  Send
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialBooks, initialBookLoans, Book, BookCopy, BookLoan, initialAssets } from '../store/data';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FUNDING_SOURCES } from '../lib/assetUtils';
import { Barcode } from '../components/Barcode';
import { QRCodeSVG } from 'qrcode.react';

export default function Books() {
  const [books, setBooks] = useLocalStorage<Book[]>('iq-books', initialBooks);
  const [bookLoans, setBookLoans] = useLocalStorage<BookLoan[]>('iq-book-loans', initialBookLoans);
  const [assets] = useLocalStorage('iq-assets', initialAssets);

  // Active Tab: 'CATALOG' (Koleksi & Ketersediaan) | 'LOANS' (Sirkulasi Peminjaman) | 'CONDITIONS' (Audit Kondisi) | 'PRINT_LABELS' (Cetak Barcode Buku)
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'LOANS' | 'CONDITIONS' | 'PRINT_LABELS'>('CATALOG');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [fundingFilter, setFundingFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // 'ALL', 'AVAILABLE', 'BORROWED_ALL'
  
  // Label Printing Filter State
  const [labelBookFilter, setLabelBookFilter] = useState('ALL');
  const [showBatchPrintModal, setShowBatchPrintModal] = useState(false);
  const [selectedLabelForModal, setSelectedLabelForModal] = useState<{ book: Book; copy: BookCopy } | null>(null);

  // Expand individual copies sub-panel
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  // Modal States
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedBookForLoan, setSelectedBookForLoan] = useState<Book | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<BookLoan | null>(null);

  // New Book Form State
  const defaultBookForm: Partial<Book> = {
    bookCode: `BK-RPL-00${books.length + 1}`,
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publishYear: new Date().getFullYear(),
    category: 'Kejuruan RPL',
    rackLocation: 'Rak A1 - RPL & Software',
    totalCopies: 10,
    fundingSource: 'BOSP Reguler',
    price: 85000,
    description: ''
  };
  const [bookFormData, setBookFormData] = useState<Partial<Book>>(defaultBookForm);

  // New Loan Form State
  const [loanFormData, setLoanFormData] = useState({
    bookId: '',
    copyBarcode: '',
    borrowerName: '',
    borrowerType: 'SISWA' as 'SISWA' | 'GURU' | 'TENDIK',
    borrowerClass: 'XII RPL 1',
    borrowerContact: '',
    durationDays: 7,
    notes: ''
  });

  // Return Book Form State
  const [returnFormData, setReturnFormData] = useState({
    returnCondition: 'BAIK' as 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'HILANG',
    penaltyPaid: 0,
    notes: ''
  });

  const [deleteTargetBook, setDeleteTargetBook] = useState<Book | null>(null);

  // Category list
  const CATEGORIES = [
    'Kejuruan RPL',
    'Kejuruan Bisnis Digital',
    'Pendidikan Islam & Bahasa Arab',
    'Mata Pelajaran Umum',
    'Literasi & Referensi'
  ];

  // Helper Stats Calculation
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const totalAvailable = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const totalBorrowed = books.reduce((acc, b) => acc + (b.borrowedCopies || 0), 0);
  const totalLost = books.reduce((acc, b) => acc + (b.lostCopies || 0), 0);
  const totalValuation = books.reduce((acc, b) => acc + ((b.price || 0) * (b.totalCopies || 0)), 0);

  // Active Loans stats
  const activeLoans = bookLoans.filter(l => l.status === 'DIPINJAM' || l.status === 'TERLAMBAT');
  const overdueLoans = bookLoans.filter(l => l.status === 'TERLAMBAT');

  // Condition count across all copies
  let totalGoodCopies = 0;
  let totalLightDamageCopies = 0;
  let totalHeavyDamageCopies = 0;
  books.forEach(b => {
    b.copies?.forEach(c => {
      if (c.condition === 'BAIK') totalGoodCopies++;
      else if (c.condition === 'RUSAK_RINGAN') totalLightDamageCopies++;
      else if (c.condition === 'RUSAK_BERAT') totalHeavyDamageCopies++;
    });
  });

  // Filtered Books List
  const filteredBooks = books.filter(book => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      book.title.toLowerCase().includes(term) ||
      book.bookCode.toLowerCase().includes(term) ||
      book.isbn.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.publisher.toLowerCase().includes(term);

    const matchCategory = categoryFilter === 'ALL' || book.category === categoryFilter;
    const matchFunding = fundingFilter === 'ALL' || (book.fundingSource || 'BOSP Reguler') === fundingFilter;

    let matchAvailability = true;
    if (availabilityFilter === 'AVAILABLE') {
      matchAvailability = book.availableCopies > 0;
    } else if (availabilityFilter === 'BORROWED_ALL') {
      matchAvailability = book.borrowedCopies > 0;
    }

    return matchSearch && matchCategory && matchFunding && matchAvailability;
  });

  // Filtered Loans List
  const filteredLoans = bookLoans.filter(loan => {
    const term = searchTerm.toLowerCase();
    return loan.borrowerName.toLowerCase().includes(term) ||
           loan.bookTitle.toLowerCase().includes(term) ||
           loan.loanCode.toLowerCase().includes(term) ||
           loan.copyBarcode.toLowerCase().includes(term);
  });

  // ==========================================
  // HANDLERS: ADD & EDIT BOOK
  // ==========================================
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(bookFormData.totalCopies) || 1;

    if (editingBook) {
      // Update existing book
      const existingCopies = editingBook.copies || [];
      let updatedCopies = [...existingCopies];

      // If total copies adjusted upwards, generate new copy objects
      if (total > existingCopies.length) {
        const addedCount = total - existingCopies.length;
        const newCopies: BookCopy[] = Array.from({ length: addedCount }, (_, idx) => {
          const num = existingCopies.length + idx + 1;
          return {
            id: `${editingBook.id}-c${num}`,
            barcode: `${bookFormData.bookCode || editingBook.bookCode}-${String(num).padStart(2, '0')}`,
            copyNumber: num,
            status: 'TERSEDIA',
            condition: 'BAIK',
            notes: 'Penambahan eksemplar baru'
          };
        });
        updatedCopies = [...updatedCopies, ...newCopies];
      }

      // Recalculate available and borrowed
      const borrowed = updatedCopies.filter(c => c.status === 'DIPINJAM').length;
      const lost = updatedCopies.filter(c => c.status === 'HILANG').length;
      const available = total - borrowed - lost;

      const updated: Book = {
        ...editingBook,
        ...bookFormData as Book,
        totalCopies: total,
        availableCopies: Math.max(0, available),
        borrowedCopies: borrowed,
        lostCopies: lost,
        copies: updatedCopies
      };

      setBooks(books.map(b => b.id === editingBook.id ? updated : b));
    } else {
      // Create new book
      const newBookId = `bk-${Date.now()}`;
      const code = bookFormData.bookCode || `BK-LIB-${Date.now().toString().slice(-4)}`;
      
      const copies: BookCopy[] = Array.from({ length: total }, (_, i) => ({
        id: `${newBookId}-c${i + 1}`,
        barcode: `${code}-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA',
        condition: 'BAIK',
        notes: 'Eksemplar baru siap sirkulasi'
      }));

      const newBook: Book = {
        id: newBookId,
        bookCode: code,
        isbn: bookFormData.isbn || '-',
        title: bookFormData.title || 'Judul Buku Baru',
        author: bookFormData.author || 'Pengarang',
        publisher: bookFormData.publisher || 'Penerbit',
        publishYear: Number(bookFormData.publishYear) || 2024,
        category: (bookFormData.category as any) || 'Kejuruan RPL',
        rackLocation: bookFormData.rackLocation || 'Rak A1',
        totalCopies: total,
        availableCopies: total,
        borrowedCopies: 0,
        lostCopies: 0,
        fundingSource: (bookFormData.fundingSource as any) || 'BOSP Reguler',
        price: Number(bookFormData.price) || 85000,
        description: bookFormData.description || '',
        copies
      };

      setBooks([newBook, ...books]);
    }

    setShowAddBookModal(false);
    setEditingBook(null);
    setBookFormData(defaultBookForm);
  };

  const handleDeleteBook = (book: Book) => {
    setDeleteTargetBook(book);
  };

  const confirmDeleteBook = () => {
    if (deleteTargetBook) {
      setBooks(books.filter(b => b.id !== deleteTargetBook.id));
      if (expandedBookId === deleteTargetBook.id) setExpandedBookId(null);
      setDeleteTargetBook(null);
    }
  };

  const openEditBook = (book: Book) => {
    setEditingBook(book);
    setBookFormData(book);
    setShowAddBookModal(true);
  };

  // ==========================================
  // HANDLERS: LOAN CIRCULATION
  // ==========================================
  const openNewLoanForBook = (book: Book, preselectedBarcode?: string) => {
    setSelectedBookForLoan(book);
    const availableCopy = book.copies.find(c => c.status === 'TERSEDIA');
    setLoanFormData({
      bookId: book.id,
      copyBarcode: preselectedBarcode || (availableCopy ? availableCopy.barcode : ''),
      borrowerName: '',
      borrowerType: 'SISWA',
      borrowerClass: 'XII RPL 1',
      borrowerContact: '',
      durationDays: 7,
      notes: ''
    });
    setShowLoanModal(true);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForLoan) return;

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + (Number(loanFormData.durationDays) || 7));

    const todayStr = today.toISOString().split('T')[0];
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const copyBarcode = loanFormData.copyBarcode || selectedBookForLoan.copies.find(c => c.status === 'TERSEDIA')?.barcode || `${selectedBookForLoan.bookCode}-01`;
    const copyObj = selectedBookForLoan.copies.find(c => c.barcode === copyBarcode);

    const newLoan: BookLoan = {
      id: `bl-${Date.now()}`,
      loanCode: `PJM-BK-${todayStr.replace(/-/g, '').slice(0, 6)}-${String(bookLoans.length + 1).padStart(3, '0')}`,
      bookId: selectedBookForLoan.id,
      bookTitle: selectedBookForLoan.title,
      bookCode: selectedBookForLoan.bookCode,
      copyBarcode: copyBarcode,
      copyNumber: copyObj ? copyObj.copyNumber : 1,
      borrowerName: loanFormData.borrowerName,
      borrowerType: loanFormData.borrowerType,
      borrowerClass: loanFormData.borrowerClass,
      borrowerContact: loanFormData.borrowerContact,
      borrowDate: todayStr,
      dueDate: dueDateStr,
      status: 'DIPINJAM',
      borrowCondition: copyObj?.condition || 'BAIK',
      notes: loanFormData.notes
    };

    // Update Book state (mark copy as DIPINJAM, adjust available & borrowed counts)
    const updatedBooks = books.map(b => {
      if (b.id === selectedBookForLoan.id) {
        const updatedCopies = b.copies.map(c => {
          if (c.barcode === copyBarcode) {
            return {
              ...c,
              status: 'DIPINJAM' as const,
              borrowerName: `${loanFormData.borrowerName} (${loanFormData.borrowerClass})`,
              borrowerRole: loanFormData.borrowerType,
              borrowDate: todayStr,
              dueDate: dueDateStr
            };
          }
          return c;
        });

        const borrowed = updatedCopies.filter(c => c.status === 'DIPINJAM').length;
        const lost = updatedCopies.filter(c => c.status === 'HILANG').length;
        const available = Math.max(0, b.totalCopies - borrowed - lost);

        return {
          ...b,
          availableCopies: available,
          borrowedCopies: borrowed,
          copies: updatedCopies
        };
      }
      return b;
    });

    setBooks(updatedBooks);
    setBookLoans([newLoan, ...bookLoans]);
    setShowLoanModal(false);
    setSelectedBookForLoan(null);
  };

  // Open Return Modal
  const openReturnModal = (loan: BookLoan) => {
    setSelectedLoanForReturn(loan);
    setReturnFormData({
      returnCondition: (loan.borrowCondition as any) || 'BAIK',
      penaltyPaid: loan.penaltyAmount || 0,
      notes: ''
    });
    setShowReturnModal(true);
  };

  // Submit Return
  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForReturn) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Update loan status to DIKEMBALIKAN
    const updatedLoans = bookLoans.map(l => {
      if (l.id === selectedLoanForReturn.id) {
        return {
          ...l,
          status: 'DIKEMBALIKAN' as const,
          returnDate: todayStr,
          returnCondition: returnFormData.returnCondition,
          penaltyAmount: Number(returnFormData.penaltyPaid) || 0,
          notes: (l.notes ? l.notes + ' | ' : '') + `Kembali: ${returnFormData.notes || 'Selesai'}`
        };
      }
      return l;
    });

    // 2. Update Book copy status to TERSEDIA (or HILANG) and update condition
    const updatedBooks = books.map(b => {
      if (b.id === selectedLoanForReturn.bookId) {
        const isLost = returnFormData.returnCondition === 'HILANG';
        const updatedCopies = b.copies.map(c => {
          if (c.barcode === selectedLoanForReturn.copyBarcode) {
            return {
              ...c,
              status: isLost ? ('HILANG' as const) : ('TERSEDIA' as const),
              condition: isLost ? ('RUSAK_BERAT' as const) : (returnFormData.returnCondition as any),
              notes: isLost ? 'Dilaporkan hilang saat peminjaman' : `Dikembalikan tgl ${todayStr}. ${returnFormData.notes}`,
              borrowerName: undefined,
              borrowerRole: undefined,
              borrowDate: undefined,
              dueDate: undefined
            };
          }
          return c;
        });

        const borrowed = updatedCopies.filter(c => c.status === 'DIPINJAM').length;
        const lost = updatedCopies.filter(c => c.status === 'HILANG').length;
        const available = Math.max(0, b.totalCopies - borrowed - lost);

        return {
          ...b,
          availableCopies: available,
          borrowedCopies: borrowed,
          lostCopies: lost,
          copies: updatedCopies
        };
      }
      return b;
    });

    setBookLoans(updatedLoans);
    setBooks(updatedBooks);
    setShowReturnModal(false);
    setSelectedLoanForReturn(null);
  };

  // Update Individual Copy Condition directly (e.g. while auditing)
  const handleUpdateCopyCondition = (bookId: string, copyId: string, newCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT', newStatus?: 'TERSEDIA' | 'RUSAK' | 'HILANG') => {
    const updatedBooks = books.map(b => {
      if (b.id === bookId) {
        const updatedCopies = b.copies.map(c => {
          if (c.id === copyId) {
            return {
              ...c,
              condition: newCondition,
              status: newStatus || (newCondition === 'RUSAK_BERAT' ? 'RUSAK' : c.status)
            };
          }
          return c;
        });
        const borrowed = updatedCopies.filter(c => c.status === 'DIPINJAM').length;
        const lost = updatedCopies.filter(c => c.status === 'HILANG').length;
        const available = Math.max(0, b.totalCopies - borrowed - lost);
        return {
          ...b,
          availableCopies: available,
          borrowedCopies: borrowed,
          lostCopies: lost,
          copies: updatedCopies
        };
      }
      return b;
    });
    setBooks(updatedBooks);
  };

  return (
    <div className="space-y-6">
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
                <Library className="w-3.5 h-3.5 text-[#FFB800]" /> Perpustakaan & Sumber Belajar
              </span>
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                SMK IT Ibnul Qayyim
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manajemen <span className="text-[#FFB800]">Koleksi Buku</span> & Sirkulasi
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-3xl">
              Informasi lengkap judul, ketersediaan stok fisik per eksemplar, sirkulasi peminjaman siswa/guru, serta monitoring kondisi buku pembelajaran vokasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button
              onClick={() => {
                setShowBatchPrintModal(true);
                setTimeout(() => window.print(), 200);
              }}
              variant="outline"
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs cursor-pointer active:scale-95"
              title="Buka dialog pratinjau & cetak label QR Code koleksi buku"
            >
              <QrCode className="w-4 h-4 mr-2 text-[#FFB800]" /> Cetak QR Code & Label
            </Button>
            <Button
              onClick={() => {
                setEditingBook(null);
                setBookFormData(defaultBookForm);
                setShowAddBookModal(true);
              }}
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Tambah Judul Buku
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUMMARY STATS TILES (4 TILES)                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
        {/* Total Koleksi & Eksemplar */}
        <Card className="p-4 sm:p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Koleksi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {totalTitles} <span className="text-xs font-semibold text-slate-500">Judul</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Total <strong>{totalCopies}</strong> Eksemplar Fisik
            </p>
          </div>
        </Card>

        {/* Ketersediaan Ready di Rak */}
        <Card className="p-4 sm:p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tersedia di Rak</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 leading-none">
              {totalAvailable} <span className="text-xs font-semibold text-slate-500">Buku</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Ready dipinjam ({totalCopies > 0 ? Math.round((totalAvailable / totalCopies) * 100) : 100}%)
            </p>
          </div>
        </Card>

        {/* Sedang Dipinjam & Sirkulasi */}
        <Card className="p-4 sm:p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sedang Dipinjam</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none">
              {totalBorrowed} <span className="text-xs font-semibold text-slate-500">Eksemplar</span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
              {overdueLoans.length > 0 ? `${overdueLoans.length} Peminjaman Terlambat` : 'Semua tertib waktu'}
            </p>
          </div>
        </Card>

        {/* Kondisi Buku & Total Nilai */}
        <Card className="p-4 sm:p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kondisi Baik</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400 leading-none">
              {totalCopies > 0 ? Math.round((totalGoodCopies / totalCopies) * 100) : 100}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
              {totalLightDamageCopies} Rusak Ringan &bull; Rp {totalValuation.toLocaleString('id-ID')}
            </p>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS                                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 print:hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          <Button
            onClick={() => setActiveTab('CATALOG')}
            variant={activeTab === 'CATALOG' ? 'default' : 'ghost'}
            className={activeTab === 'CATALOG' 
              ? 'bg-[#032C24] dark:bg-emerald-950 text-white font-bold text-xs h-9 rounded-xl shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 text-xs h-9'}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Katalog Judul & Ketersediaan ({books.length})
          </Button>

          <Button
            onClick={() => setActiveTab('LOANS')}
            variant={activeTab === 'LOANS' ? 'default' : 'ghost'}
            className={activeTab === 'LOANS' 
              ? 'bg-[#032C24] dark:bg-emerald-950 text-white font-bold text-xs h-9 rounded-xl shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 text-xs h-9'}
          >
            <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
            Sirkulasi Peminjaman ({activeLoans.length})
          </Button>

          <Button
            onClick={() => setActiveTab('CONDITIONS')}
            variant={activeTab === 'CONDITIONS' ? 'default' : 'ghost'}
            className={activeTab === 'CONDITIONS' 
              ? 'bg-[#032C24] dark:bg-emerald-950 text-white font-bold text-xs h-9 rounded-xl shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 text-xs h-9'}
          >
            <BadgeCheck className="w-3.5 h-3.5 mr-1.5" />
            Audit Kondisi Fisik ({totalLightDamageCopies + totalHeavyDamageCopies} Perhatian)
          </Button>

          <Button
            onClick={() => setActiveTab('PRINT_LABELS')}
            variant={activeTab === 'PRINT_LABELS' ? 'default' : 'ghost'}
            className={activeTab === 'PRINT_LABELS' 
              ? 'bg-[#032C24] dark:bg-emerald-950 text-white font-bold text-xs h-9 rounded-xl shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 text-xs h-9'}
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5" />
            Label QR Code Eksemplar
          </Button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Cari judul, ISBN, pengarang..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KATALOG BUKU, KETERSEDIAAN & UNIT EKSEMPLAR                       */}
      {/* ========================================================================= */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4 print:hidden">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2">Filter:</span>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">Semua Kategori ({books.length})</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="text-xs h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">Semua Status Ketersediaan</option>
              <option value="AVAILABLE">Ready di Rak (Ada Stok)</option>
              <option value="BORROWED_ALL">Sedang Ada yang Dipinjam</option>
            </select>

            {/* Funding Filter */}
            <select
              value={fundingFilter}
              onChange={e => setFundingFilter(e.target.value)}
              className="text-xs h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">Semua Sumber Dana</option>
              {FUNDING_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            {(searchTerm || categoryFilter !== 'ALL' || fundingFilter !== 'ALL' || availabilityFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('ALL');
                  setFundingFilter('ALL');
                  setAvailabilityFilter('ALL');
                }}
                className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 ml-auto"
              >
                <X className="w-3 h-3 mr-1" /> Reset Filter
              </Button>
            )}
          </div>

          {/* Book Catalog Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                <TableRow>
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead>Kode & ISBN</TableHead>
                  <TableHead>Informasi Judul & Pengarang</TableHead>
                  <TableHead>Kategori & Lokasi Rak</TableHead>
                  <TableHead className="text-center">Ketersediaan Stok</TableHead>
                  <TableHead>Sumber Anggaran</TableHead>
                  <TableHead className="text-right">Aksi & Peminjaman</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book, idx) => {
                    const isExpanded = expandedBookId === book.id;
                    const availPct = book.totalCopies > 0 ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;

                    return (
                      <React.Fragment key={book.id}>
                        <TableRow className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${isExpanded ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
                          {/* No & Expand toggle */}
                          <TableCell className="text-center font-medium">
                            <button
                              onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors inline-flex items-center justify-center"
                              title={isExpanded ? "Tutup rincian eksemplar" : "Buka rincian eksemplar fisik"}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-600" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </TableCell>

                          {/* Code & ISBN */}
                          <TableCell>
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              {book.bookCode}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              ISBN: {book.isbn || '-'}
                            </span>
                          </TableCell>

                          {/* Title & Author */}
                          <TableCell className="max-w-xs sm:max-w-md">
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                                {book.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {book.author} &bull; <span className="italic">{book.publisher} ({book.publishYear})</span>
                              </p>
                              {book.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {book.description}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          {/* Category & Location */}
                          <TableCell>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 block w-fit mb-1">
                              {book.category}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                              <Bookmark className="w-3 h-3 text-[#FFB800]" /> {book.rackLocation}
                            </span>
                          </TableCell>

                          {/* Ketersediaan Stok (Jumlah Ready, Dipinjam, Total) */}
                          <TableCell className="text-center min-w-[140px]">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold px-1">
                                <span className="text-emerald-600 dark:text-emerald-400">{book.availableCopies} Ready</span>
                                <span className="text-amber-600 dark:text-amber-400">{book.borrowedCopies} Dipinjam</span>
                                <span className="text-slate-400">/ {book.totalCopies} Total</span>
                              </div>
                              {/* Stock Bar */}
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                                <div 
                                  className="bg-emerald-500 h-full transition-all duration-300" 
                                  style={{ width: `${availPct}%` }}
                                  title={`${book.availableCopies} Eksemplar Tersedia`}
                                />
                                <div 
                                  className="bg-amber-500 h-full transition-all duration-300" 
                                  style={{ width: `${(book.borrowedCopies / (book.totalCopies || 1)) * 100}%` }}
                                  title={`${book.borrowedCopies} Eksemplar Sedang Dipinjam`}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* Funding Source */}
                          <TableCell>
                            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {book.fundingSource || 'BOSP Reguler'}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Rp {(book.price || 0).toLocaleString('id-ID')}/eks
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                disabled={book.availableCopies <= 0}
                                onClick={() => openNewLoanForBook(book)}
                                className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-8 px-3 rounded-lg shadow-xs gap-1"
                                title={book.availableCopies <= 0 ? "Semua eksemplar sedang dipinjam" : "Catat peminjaman buku ini"}
                              >
                                <CalendarClock className="w-3.5 h-3.5 text-[#FFB800]" /> Pinjam
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditBook(book)}
                                className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-700"
                                title="Edit data buku"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBook(book)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                                title="Hapus judul buku"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* ========================================================= */}
                        {/* EXPANDED SUBPANEL: DAFTAR EKSEMPLAR FISIK & STATUS        */}
                        {/* ========================================================= */}
                        {isExpanded && (
                          <TableRow className="bg-slate-50/60 dark:bg-slate-900/90 border-b-2 border-emerald-200 dark:border-slate-800">
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4 sm:p-5 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <div>
                                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <QrCode className="w-4 h-4 text-emerald-600" />
                                      Daftar {book.copies?.length || 0} Eksemplar Fisik & Barcode: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{book.title}</span>
                                    </h5>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      Setiap buku fisik memiliki barcode unik untuk sirkulasi cepat, identifikasi penanggung jawab, dan catatan kondisi fisik.
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                      {book.copies?.filter(c => c.status === 'TERSEDIA').length} Tersedia &bull; {book.copies?.filter(c => c.status === 'DIPINJAM').length} Dipinjam
                                    </span>
                                  </div>
                                </div>

                                {/* Copies Grid Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                  {book.copies?.map((copy) => {
                                    const isBorrow = copy.status === 'DIPINJAM';
                                    const isLost = copy.status === 'HILANG';
                                    const isDamaged = copy.condition === 'RUSAK_BERAT' || copy.status === 'RUSAK';

                                    return (
                                      <div
                                        key={copy.id}
                                        className={`p-3 rounded-xl border transition-all text-xs space-y-2 bg-white dark:bg-slate-950 ${
                                          isBorrow 
                                            ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20' 
                                            : isLost
                                            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20'
                                            : 'border-slate-200 dark:border-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                            <Bookmark className="w-3 h-3 text-[#FFB800]" /> Eksemplar #{copy.copyNumber}
                                          </span>
                                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                                            copy.status === 'TERSEDIA' 
                                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                              : copy.status === 'DIPINJAM'
                                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                          }`}>
                                            {copy.status}
                                          </span>
                                        </div>

                                        <div className="font-mono text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                          <span>{copy.barcode}</span>
                                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                            copy.condition === 'BAIK' 
                                              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300' 
                                              : copy.condition === 'RUSAK_RINGAN'
                                              ? 'text-amber-700 bg-amber-50 dark:text-amber-300'
                                              : 'text-rose-700 bg-rose-50 dark:text-rose-300'
                                          }`}>
                                            Kondisi: {copy.condition}
                                          </span>
                                        </div>

                                        {isBorrow && (
                                          <div className="text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/60 space-y-0.5">
                                            <p className="font-bold text-amber-900 dark:text-amber-200">
                                              Peminjam: {copy.borrowerName}
                                            </p>
                                            <p className="text-amber-700 dark:text-amber-300 text-[10px]">
                                              Jatuh Tempo: {copy.dueDate || '-'}
                                            </p>
                                          </div>
                                        )}

                                        {copy.notes && (
                                          <p className="text-[10px] text-slate-400 italic line-clamp-1">
                                            Catatan: {copy.notes}
                                          </p>
                                        )}

                                        {/* Action buttons per copy */}
                                        <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-100 dark:border-slate-800">
                                          <select
                                            value={copy.condition}
                                            onChange={(e) => handleUpdateCopyCondition(book.id, copy.id, e.target.value as any)}
                                            className="text-[10px] bg-slate-100 dark:bg-slate-800 border-none rounded py-0.5 px-1 font-medium"
                                          >
                                            <option value="BAIK">Kondisi Baik</option>
                                            <option value="RUSAK_RINGAN">Rusak Ringan</option>
                                            <option value="RUSAK_BERAT">Rusak Berat</option>
                                          </select>

                                          <div className="flex items-center gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setSelectedLabelForModal({ book, copy })}
                                              className="text-[10px] h-6 px-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 gap-1"
                                              title="Pratinjau & Cetak QR Code Eksemplar Ini"
                                            >
                                              <QrCode className="w-3 h-3 text-[#FFB800]" /> QR Label
                                            </Button>

                                            {copy.status === 'TERSEDIA' && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openNewLoanForBook(book, copy.barcode)}
                                                className="text-[11px] h-6 px-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold"
                                              >
                                                Pinjamkan
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-sm">Tidak ada judul buku yang cocok dengan filter</p>
                      <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SIRKULASI PEMINJAMAN & PENGEMBALIAN BUKU                            */}
      {/* ========================================================================= */}
      {activeTab === 'LOANS' && (
        <div className="space-y-4 print:hidden">
          {/* Quick Notice Header */}
          <div className="p-4 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sirkulasi Peminjaman Buku Perpustakaan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total {activeLoans.length} buku sedang dipinjam siswa & guru. {overdueLoans.length > 0 && <strong className="text-rose-600">({overdueLoans.length} melewati jatuh tempo)</strong>}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                if (books.length > 0) {
                  openNewLoanForBook(books[0]);
                }
              }}
              className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#FFB800]" /> Catat Peminjaman Baru
            </Button>
          </div>

          {/* Loans Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                <TableRow>
                  <TableHead>Kode Pinjam</TableHead>
                  <TableHead>Peminjam (Siswa / Guru)</TableHead>
                  <TableHead>Judul Buku & Barcode</TableHead>
                  <TableHead>Tgl Pinjam & Jatuh Tempo</TableHead>
                  <TableHead>Status Sirkulasi</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead className="text-right">Aksi Pengembalian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan) => {
                    const isOverdue = loan.status === 'TERLAMBAT';
                    const isReturned = loan.status === 'DIKEMBALIKAN';

                    return (
                      <TableRow key={loan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        {/* Loan Code */}
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {loan.loanCode}
                          </span>
                        </TableCell>

                        {/* Borrower */}
                        <TableCell>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">
                            {loan.borrowerName}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            {loan.borrowerClass} &bull; <Badge variant="outline" className="text-[10px] py-0">{loan.borrowerType}</Badge>
                          </span>
                          {loan.borrowerContact && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              WA: {loan.borrowerContact}
                            </span>
                          )}
                        </TableCell>

                        {/* Book Title & Barcode */}
                        <TableCell className="max-w-xs">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block line-clamp-1">
                            {loan.bookTitle}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-emerald-200/60 dark:border-emerald-800/60">
                            {loan.copyBarcode} (Eks #{loan.copyNumber})
                          </span>
                        </TableCell>

                        {/* Dates */}
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <span className="text-slate-500 block">Pinjam: {loan.borrowDate}</span>
                            <span className={`font-semibold block ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                              Tenggat: {loan.dueDate}
                            </span>
                            {isReturned && (
                              <span className="text-emerald-600 text-[10px] block">
                                Kembali: {loan.returnDate}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {loan.status === 'DIPINJAM' && (
                            <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 font-medium">
                              Sedang Dipinjam
                            </Badge>
                          )}
                          {loan.status === 'TERLAMBAT' && (
                            <div className="space-y-1">
                              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 font-bold">
                                Terlambat
                              </Badge>
                              {loan.penaltyAmount && (
                                <span className="text-[10px] text-rose-600 block font-bold">
                                  Denda: Rp {loan.penaltyAmount.toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                          )}
                          {loan.status === 'DIKEMBALIKAN' && (
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 font-medium">
                              Selesai Dikembalikan
                            </Badge>
                          )}
                        </TableCell>

                        {/* Condition */}
                        <TableCell>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {loan.returnCondition || loan.borrowCondition}
                          </span>
                        </TableCell>

                        {/* Action Return */}
                        <TableCell className="text-right">
                          {!isReturned ? (
                            <Button
                              size="sm"
                              onClick={() => openReturnModal(loan)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-xs gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Proses Kembali
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tuntas
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      <CalendarClock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-sm">Tidak ada catatan sirkulasi peminjaman buku</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT KONDISI BUKU                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'CONDITIONS' && (
        <div className="space-y-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-emerald-50/50 dark:bg-slate-900 border-emerald-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  {totalGoodCopies}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kondisi Baik</h4>
                  <p className="text-xs text-slate-500">Mulus, bersih, jilid kuat dan layak edar.</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-amber-50/50 dark:bg-slate-900 border-amber-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                  {totalLightDamageCopies}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Rusak Ringan</h4>
                  <p className="text-xs text-slate-500">Lipatan kecil, sampul lecek, coretan pensil.</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-rose-50/50 dark:bg-slate-900 border-rose-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                  {totalHeavyDamageCopies + totalLost}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Rusak Berat / Hilang</h4>
                  <p className="text-xs text-slate-500">Halaman sobek/lepas atau dalam proses ganti.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              Daftar Eksemplar Buku Yang Membutuhkan Perhatian & Perbaikan
            </h3>

            <div className="space-y-3">
              {books.map(book => {
                const damagedCopies = book.copies.filter(c => c.condition !== 'BAIK' || c.status === 'HILANG');
                if (damagedCopies.length === 0) return null;

                return (
                  <div key={book.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {book.title} <span className="text-xs font-normal text-slate-400 font-mono">({book.bookCode})</span>
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Lokasi: {book.rackLocation}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {damagedCopies.map(copy => (
                        <div key={copy.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {copy.barcode}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              copy.condition === 'RUSAK_RINGAN' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {copy.condition}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic">
                            Catatan: {copy.notes || 'Butuh perbaikan sampul/lem'}
                          </p>
                          <div className="pt-1 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateCopyCondition(book.id, copy.id, 'BAIK', 'TERSEDIA')}
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline"
                            >
                              Tandai Telah Diperbaiki
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CETAK QR CODE & LABEL BUKU PERPUSTAKAAN                            */}
      {/* ========================================================================= */}
      {activeTab === 'PRINT_LABELS' && (() => {
        const filteredLabelItems = books
          .filter(b => labelBookFilter === 'ALL' || b.id === labelBookFilter)
          .filter(b => categoryFilter === 'ALL' || b.category === categoryFilter)
          .filter(b => !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()) || b.copies.some(c => c.barcode.toLowerCase().includes(searchTerm.toLowerCase())))
          .flatMap(b => b.copies.map(c => ({ book: b, copy: c })));

        return (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  Format Stiker & QR Code Buku Perpustakaan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Stiker label standar perpustakaan vokasi lengkap dengan QR Code presisi, logo sekolah, Call Number rak, dan nomor eksemplar fisik.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={() => window.print()}
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-4 rounded-xl gap-2 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FFB800]" /> Cetak Semua ({filteredLabelItems.length} Label QR)
                </Button>
              </div>
            </div>

            {/* Filter Tools specifically for printing */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Filter Label:</span>

              {/* Specific Book Title filter */}
              <select
                value={labelBookFilter}
                onChange={e => setLabelBookFilter(e.target.value)}
                className="text-xs h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 max-w-[260px] truncate"
              >
                <option value="ALL">Semua Judul Buku ({books.length} Judul)</option>
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.copies.length} Eks)</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">Semua Kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <span className="text-xs text-slate-400 ml-auto font-medium">
                Total Siap Cetak: <strong className="text-slate-800 dark:text-slate-200">{filteredLabelItems.length}</strong> stiker QR Code
              </span>
            </div>

            {/* Printable Labels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 print:grid-cols-3 print:gap-2">
              {filteredLabelItems.map(({ book, copy }) => (
                <div
                  key={copy.id}
                  onClick={() => setSelectedLabelForModal({ book, copy })}
                  className="bg-white border-2 border-slate-800 rounded-xl p-3 text-slate-900 shadow-sm space-y-2 relative overflow-hidden cursor-pointer hover:border-emerald-600 hover:shadow-md transition-all group"
                  title="Klik untuk pratinjau besar & cetak satuan"
                >
                  {/* Header Sticker */}
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <img src="/logo.svg" alt="Logo" className="w-4 h-4 object-contain" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-slate-900">SMK IT Ibnul Qayyim</span>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded uppercase">
                      {book.category.split(' ')[0]}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h4 className="font-bold text-xs line-clamp-2 leading-tight text-slate-900 group-hover:text-emerald-800">
                      {book.title}
                    </h4>
                    <p className="text-[9px] text-slate-600 mt-0.5 line-clamp-1">
                      {book.author}
                    </p>
                  </div>

                  {/* QR Code Visual Box */}
                  <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-center flex flex-col items-center justify-center space-y-1.5">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs inline-flex items-center justify-center">
                      <QRCodeSVG value={copy.barcode} size={76} level="M" />
                    </div>

                    <div className="font-mono text-xs font-black tracking-widest text-slate-950">
                      {copy.barcode}
                    </div>

                    <div className="w-full text-[9px] font-bold text-emerald-800 flex justify-between px-1 border-t border-slate-200/80 pt-1">
                      <span>{book.rackLocation}</span>
                      <span>Eks #{copy.copyNumber}</span>
                    </div>
                  </div>

                  {/* Footer Tag */}
                  <div className="flex justify-between items-center text-[8px] text-slate-500 pt-0.5 border-t border-slate-100">
                    <span>Dana: {book.fundingSource || 'BOSP'}</span>
                    <span>Perpustakaan Digital</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT JUDUL BUKU                                           */}
      {/* ========================================================================= */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingBook ? 'Edit Data Judul Buku' : 'Tambah Judul Buku Perpustakaan'}
                  </h3>
                  <p className="text-xs text-slate-400">SMK IT Ibnul Qayyim Makassar</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kode Buku *</label>
                  <Input
                    required
                    value={bookFormData.bookCode}
                    onChange={e => setBookFormData({ ...bookFormData, bookCode: e.target.value })}
                    placeholder="Contoh: BK-RPL-007"
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nomor ISBN</label>
                  <Input
                    value={bookFormData.isbn}
                    onChange={e => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    placeholder="Contoh: 978-623-01-0842-1"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Judul Lengkap Buku *</label>
                <Input
                  required
                  value={bookFormData.title}
                  onChange={e => setBookFormData({ ...bookFormData, title: e.target.value })}
                  placeholder="Masukkan judul buku dan tingkatan kelas..."
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pengarang / Penulis *</label>
                  <Input
                    required
                    value={bookFormData.author}
                    onChange={e => setBookFormData({ ...bookFormData, author: e.target.value })}
                    placeholder="Nama pengarang..."
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Penerbit & Tahun *</label>
                  <div className="flex gap-2">
                    <Input
                      required
                      value={bookFormData.publisher}
                      onChange={e => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                      placeholder="Penerbit"
                      className="text-xs h-9 flex-1"
                    />
                    <Input
                      type="number"
                      value={bookFormData.publishYear}
                      onChange={e => setBookFormData({ ...bookFormData, publishYear: Number(e.target.value) })}
                      placeholder="2024"
                      className="text-xs h-9 w-20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori Buku *</label>
                  <select
                    value={bookFormData.category}
                    onChange={e => setBookFormData({ ...bookFormData, category: e.target.value as any })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lokasi Rak Perpustakaan *</label>
                  <Input
                    required
                    value={bookFormData.rackLocation}
                    onChange={e => setBookFormData({ ...bookFormData, rackLocation: e.target.value })}
                    placeholder="Contoh: Rak A1 - RPL & IT"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jumlah Eksemplar *</label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={bookFormData.totalCopies}
                    onChange={e => setBookFormData({ ...bookFormData, totalCopies: Number(e.target.value) })}
                    className="text-xs h-9 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sumber Anggaran *</label>
                  <select
                    value={bookFormData.fundingSource}
                    onChange={e => setBookFormData({ ...bookFormData, fundingSource: e.target.value as any })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium"
                  >
                    {FUNDING_SOURCES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Harga Satuan (Rp)</label>
                  <Input
                    type="number"
                    value={bookFormData.price}
                    onChange={e => setBookFormData({ ...bookFormData, price: Number(e.target.value) })}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi / Catatan Buku</label>
                <textarea
                  rows={2}
                  value={bookFormData.description}
                  onChange={e => setBookFormData({ ...bookFormData, description: e.target.value })}
                  placeholder="Ringkasan isi, peruntukan kurikulum..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddBookModal(false)}
                  className="text-xs h-9 px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
                >
                  {editingBook ? 'Perbarui Data Buku' : 'Simpan Judul & Buat Eksemplar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FORM PEMINJAMAN BUKU                                               */}
      {/* ========================================================================= */}
      {showLoanModal && selectedBookForLoan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Peminjaman Buku Perpustakaan
                  </h3>
                  <p className="text-xs text-slate-400">SMK IT Ibnul Qayyim Makassar</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoanModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Book Info Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600">{selectedBookForLoan.category}</span>
              <h4 className="font-bold text-slate-900 dark:text-white">{selectedBookForLoan.title}</h4>
              <p className="text-slate-500">{selectedBookForLoan.author} &bull; {selectedBookForLoan.rackLocation}</p>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Eksemplar Barcode Tersedia *</label>
                <select
                  required
                  value={loanFormData.copyBarcode}
                  onChange={e => setLoanFormData({ ...loanFormData, copyBarcode: e.target.value })}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono font-semibold"
                >
                  {selectedBookForLoan.copies.filter(c => c.status === 'TERSEDIA').map(c => (
                    <option key={c.id} value={c.barcode}>
                      {c.barcode} (Eksemplar #{c.copyNumber} - Kondisi {c.condition})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipe Peminjam *</label>
                  <select
                    value={loanFormData.borrowerType}
                    onChange={e => setLoanFormData({ ...loanFormData, borrowerType: e.target.value as any })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium"
                  >
                    <option value="SISWA">Siswa / Santri</option>
                    <option value="GURU">Ustadz / Guru Pengajar</option>
                    <option value="TENDIK">Tenaga Kependidikan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kelas / Unit Kerja *</label>
                  <Input
                    required
                    value={loanFormData.borrowerClass}
                    onChange={e => setLoanFormData({ ...loanFormData, borrowerClass: e.target.value })}
                    placeholder="Contoh: XII RPL 1 / Guru Kejuruan"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Peminjam *</label>
                  <Input
                    required
                    value={loanFormData.borrowerName}
                    onChange={e => setLoanFormData({ ...loanFormData, borrowerName: e.target.value })}
                    placeholder="Nama lengkap..."
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. WhatsApp / HP</label>
                  <Input
                    value={loanFormData.borrowerContact}
                    onChange={e => setLoanFormData({ ...loanFormData, borrowerContact: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Durasi Peminjaman (Hari) *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 7, 14].map(days => (
                    <Button
                      key={days}
                      type="button"
                      variant={loanFormData.durationDays === days ? 'default' : 'outline'}
                      onClick={() => setLoanFormData({ ...loanFormData, durationDays: days })}
                      className={`text-xs h-8 ${loanFormData.durationDays === days ? 'bg-emerald-700 text-white' : ''}`}
                    >
                      {days} Hari
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan Tambahan</label>
                <Input
                  value={loanFormData.notes}
                  onChange={e => setLoanFormData({ ...loanFormData, notes: e.target.value })}
                  placeholder="Keperluan tugas, praktikum..."
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLoanModal(false)}
                  className="text-xs h-9 px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
                >
                  Konfirmasi Peminjaman
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROSES PENGEMBALIAN BUKU                                            */}
      {/* ========================================================================= */}
      {showReturnModal && selectedLoanForReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Pengembalian Buku
                  </h3>
                  <p className="text-xs text-slate-400">{selectedLoanForReturn.loanCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loan info preview */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{selectedLoanForReturn.bookTitle}</p>
              <p className="text-slate-500 font-mono">{selectedLoanForReturn.copyBarcode} &bull; Peminjam: <strong>{selectedLoanForReturn.borrowerName}</strong></p>
              <p className="text-slate-400">Jatuh Tempo: {selectedLoanForReturn.dueDate}</p>
            </div>

            <form onSubmit={handleSaveReturn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kondisi Buku Saat Dikembalikan *</label>
                <select
                  value={returnFormData.returnCondition}
                  onChange={e => setReturnFormData({ ...returnFormData, returnCondition: e.target.value as any })}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold"
                >
                  <option value="BAIK">Kondisi Baik (Sempurna)</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan (Lipatan/Coretan)</option>
                  <option value="RUSAK_BERAT">Rusak Berat (Halaman Sobek/Lepas)</option>
                  <option value="HILANG">Buku Hilang (Klaim Ganti Rugi)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Denda Keterlambatan / Kerusakan (Rp)</label>
                <Input
                  type="number"
                  value={returnFormData.penaltyPaid}
                  onChange={e => setReturnFormData({ ...returnFormData, penaltyPaid: Number(e.target.value) })}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan Pengembalian</label>
                <Input
                  value={returnFormData.notes}
                  onChange={e => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                  placeholder="Catatan saat buku diterima kembali..."
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReturnModal(false)}
                  className="text-xs h-9 px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
                >
                  Selesaikan Pengembalian
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUSAT CETAK BATCH QR CODE & LABEL PERPUSTAKAAN                      */}
      {/* ========================================================================= */}
      {showBatchPrintModal && (() => {
        const modalFilteredItems = books
          .filter(b => labelBookFilter === 'ALL' || b.id === labelBookFilter)
          .filter(b => categoryFilter === 'ALL' || b.category === categoryFilter)
          .flatMap(b => b.copies.map(c => ({ book: b, copy: c })));

        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#032C24] text-[#FFB800] flex items-center justify-center shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Pusat Cetak QR Code & Label Buku Perpustakaan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cetak stiker barcode/QR code resmi perpustakaan vokasi SMK IT Ibnul Qayyim Makassar
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBatchPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Controls Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-3 text-xs shrink-0 print:hidden">
                <div className="flex-1 min-w-[220px]">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Pilih Judul Buku:
                  </label>
                  <select
                    value={labelBookFilter}
                    onChange={e => setLabelBookFilter(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs px-3 font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">Semua Koleksi Judul Buku ({books.length} Judul)</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.copies.length} Eksemplar)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-44">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Kategori:
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs px-3 font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-2 pt-4 sm:pt-0">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Siap Cetak: <strong>{modalFilteredItems.length}</strong> Stiker QR
                  </span>
                </div>
              </div>

              {/* Scrollable Preview Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/50 print:bg-white print:p-0">
                {modalFilteredItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <QrCode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm">Tidak ada eksemplar buku yang sesuai filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
                    {modalFilteredItems.map(({ book, copy }) => (
                      <div
                        key={copy.id}
                        className="bg-white border-2 border-slate-900 rounded-xl p-3.5 text-slate-900 shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow relative group break-inside-avoid"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <img src="/logo.svg" alt="Logo" className="w-4 h-4 object-contain" />
                            <div className="leading-none">
                              <span className="text-[8.5px] font-black uppercase tracking-tight text-slate-900 block">SMK IT Ibnul Qayyim</span>
                              <span className="text-[7px] text-slate-500 font-semibold">Perpustakaan Vokasi</span>
                            </div>
                          </div>
                          <span className="text-[7.5px] font-bold px-1 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                            {book.category.split(' ')[0]}
                          </span>
                        </div>

                        {/* Title & Info */}
                        <div>
                          <h4 className="font-bold text-xs line-clamp-1 leading-snug text-slate-900" title={book.title}>
                            {book.title}
                          </h4>
                          <p className="text-[9.5px] text-slate-600 truncate mt-0.5">
                            {book.author} &bull; ISBN: {book.isbn || '-'}
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-center flex flex-col items-center justify-center space-y-1.5">
                          <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs inline-flex items-center justify-center">
                            <QRCodeSVG value={copy.barcode} size={76} level="M" />
                          </div>

                          <div className="font-mono text-[11px] font-black tracking-widest text-slate-950">
                            {copy.barcode}
                          </div>

                          <div className="w-full text-[9px] font-bold text-emerald-800 flex justify-between px-1 border-t border-slate-200/80 pt-1">
                            <span className="truncate max-w-[120px]">{book.rackLocation}</span>
                            <span>Eks #{copy.copyNumber}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center text-[7.5px] text-slate-500 pt-0.5 border-t border-slate-100">
                          <span>Sumber: {book.fundingSource || 'BOSP Reguler'}</span>
                          <span>Kondisi: {copy.condition}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowBatchPrintModal(false);
                    setActiveTab('PRINT_LABELS');
                  }}
                  className="text-xs h-9 rounded-xl border-slate-300 dark:border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Buka Tampilan Halaman Penuh
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBatchPrintModal(false)}
                    className="text-xs h-9 rounded-xl"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-4 rounded-xl gap-2 shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-[#FFB800]" /> Cetak Semua ({modalFilteredItems.length} Stiker QR)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: PRATINJAU & CETAK 1 LABEL QR CODE EKSEMPLAR                         */}
      {/* ========================================================================= */}
      {selectedLabelForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 print:border-none print:shadow-none print:p-0 print:w-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-[#FFB800]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Label QR Code Eksemplar
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Format Stiker Perpustakaan Standar QR Code (ISO/IEC 18004)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLabelForModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Actual Sticker Layout */}
            <div className="bg-white border-2 border-slate-900 rounded-xl p-4 text-slate-900 shadow-md space-y-3 mx-auto max-w-xs">
              {/* Header Sticker */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="flex items-center gap-1.5">
                  <img src="/logo.svg" alt="Logo" className="w-5 h-5 object-contain" />
                  <div className="leading-tight">
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-900 block">SMK IT Ibnul Qayyim</span>
                    <span className="text-[7.5px] text-slate-500 font-semibold">Perpustakaan Vokasi</span>
                  </div>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                  {selectedLabelForModal.book.category.split(' ')[0]}
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <h4 className="font-bold text-xs line-clamp-2 leading-tight text-slate-900">
                  {selectedLabelForModal.book.title}
                </h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {selectedLabelForModal.book.author} &bull; ISBN: {selectedLabelForModal.book.isbn || '-'}
                </p>
              </div>

              {/* QR Code Visual Box */}
              <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg text-center flex flex-col items-center justify-center space-y-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs inline-flex items-center justify-center">
                  <QRCodeSVG
                    value={selectedLabelForModal.copy.barcode}
                    size={110}
                    level="M"
                  />
                </div>

                <div className="font-mono text-xs font-black tracking-widest text-slate-950">
                  {selectedLabelForModal.copy.barcode}
                </div>

                <div className="w-full text-[10px] font-bold text-emerald-800 flex justify-between px-1 border-t border-slate-200/80 pt-1.5">
                  <span>{selectedLabelForModal.book.rackLocation}</span>
                  <span>Eksemplar #{selectedLabelForModal.copy.copyNumber}</span>
                </div>
              </div>

              {/* Footer Tag */}
              <div className="flex justify-between items-center text-[8px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Sumber: {selectedLabelForModal.book.fundingSource || 'BOSP Reguler'}</span>
                <span>Kondisi: {selectedLabelForModal.copy.condition}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedLabelForModal.copy.barcode);
                  alert(`Kode QR ${selectedLabelForModal.copy.barcode} disalin ke clipboard!`);
                }}
                className="text-xs h-9 px-3 gap-1.5"
              >
                Salin Kode QR
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLabelForModal(null)}
                  className="text-xs h-9 px-3"
                >
                  Tutup
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-[#032C24] hover:bg-[#064237] text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FFB800]" /> Cetak Stiker QR Ini
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Hapus Judul Buku */}
      {deleteTargetBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Hapus Judul Buku Perpustakaan?
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Apakah Anda yakin ingin menghapus judul buku ini beserta seluruh <strong>{deleteTargetBook.totalCopies || deleteTargetBook.copies?.length || 0} eksemplar fisik</strong> dan data sirkulasi terkait? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Book Details Preview */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-left text-xs mb-5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Judul Buku:</span>
                <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{deleteTargetBook.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Buku / ISBN:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{deleteTargetBook.bookCode} • {deleteTargetBook.isbn || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penulis / Penerbit:</span>
                <span className="text-slate-700 dark:text-slate-300">{deleteTargetBook.author} ({deleteTargetBook.publisher || '-'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori / Rak:</span>
                <span className="text-slate-700 dark:text-slate-300">{deleteTargetBook.category} • {deleteTargetBook.rackLocation || '-'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTargetBook(null)}
                className="flex-1 text-xs h-10 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteBook}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Judul
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
