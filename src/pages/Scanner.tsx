import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { QrCode, ArrowLeft, CheckCircle2, RotateCcw, Box, MapPin, Tag, AlertCircle, PlusCircle, Search, Sparkles, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialAssets, initialLoans, initialBooks, initialBookLoans, Book, BookCopy } from '../store/data';
import { Asset, AssetUnit } from '../lib/assetUtils';
import { BookOpen } from 'lucide-react';

export default function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const [assets, setAssets] = useLocalStorage<Asset[]>('iq-assets', initialAssets as any);
  const [loans, setLoans] = useLocalStorage('iq-loans', initialLoans);
  const [books, setBooks] = useLocalStorage('iq-books', initialBooks);
  const [bookLoans, setBookLoans] = useLocalStorage('iq-book-loans', initialBookLoans);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowEndDate, setBorrowEndDate] = useState('');
  const [borrowNotes, setBorrowNotes] = useState('');

  useEffect(() => {
    // Only initialize scanner if there's no result
    if (scanResult) return;

    let scanner: Html5QrcodeScanner | null = null;
    try {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText.trim());
          if (scanner) scanner.clear().catch(() => {});
        },
        () => {
          // quiet scan failure
        }
      );
    } catch {
      // ignore
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scanResult]);

  // Find asset matching scanned or manual result
  const matchedAsset = assets.find((a: any) => 
    a.assetCode?.toLowerCase() === (scanResult || '').toLowerCase() ||
    a.name?.toLowerCase() === (scanResult || '').toLowerCase() ||
    a.id === scanResult ||
    a.units?.some((u: any) => u.unitCode?.toLowerCase() === (scanResult || '').toLowerCase())
  );

  const matchedUnit = matchedAsset?.units?.find((u: any) => u.unitCode?.toLowerCase() === (scanResult || '').toLowerCase());

  // Find book matching scanned or manual result
  let matchedBook: Book | undefined;
  let matchedBookCopy: BookCopy | undefined;
  if (scanResult) {
    const sLower = scanResult.toLowerCase();
    for (const b of books) {
      const copy = b.copies.find(c => c.barcode.toLowerCase() === sLower);
      if (copy) {
        matchedBook = b;
        matchedBookCopy = copy;
        break;
      }
      if (b.bookCode.toLowerCase() === sLower || b.isbn?.toLowerCase() === sLower || b.title.toLowerCase() === sLower) {
        matchedBook = b;
        matchedBookCopy = b.copies[0];
        break;
      }
    }
  }

  // Check if there is an active loan for this asset
  const activeLoan = matchedAsset ? loans.find((l: any) => 
    (l.itemId === matchedAsset.id || l.itemName?.toLowerCase() === matchedAsset.name?.toLowerCase()) &&
    (l.status === 'DIPINJAM' || l.status === 'DISETUJUI' || l.status === 'MENUNGGU')
  ) : null;

  const activeBookLoan = matchedBookCopy ? bookLoans.find((l: any) => 
    l.copyBarcode === matchedBookCopy?.barcode && l.status === 'DIPINJAM'
  ) : null;

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setScanResult(manualCode.trim());
    }
  };

  const handleProcessReturn = () => {
    if (!matchedAsset) return;
    if (activeLoan) {
      setLoans(loans.map((l: any) => l.id === activeLoan.id ? { ...l, status: 'SELESAI' } : l));
      setNotification({ message: `Berhasil mencatat pengembalian untuk ${matchedAsset.name}!`, type: 'success' });
    } else {
      setNotification({ message: `Aset ${matchedAsset.name} saat ini tidak tercatat dalam peminjaman aktif. Status telah diset ke Tersedia.`, type: 'success' });
    }
  };

  const handleQuickBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedAsset || !borrowerName) return;

    const newLoanRecord = {
      id: Date.now().toString(),
      borrowerName,
      type: 'Inventaris',
      itemId: matchedAsset.id,
      itemName: matchedAsset.name,
      startDate: new Date().toISOString().split('T')[0],
      endDate: borrowEndDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'DIPINJAM',
      notes: borrowNotes || 'Peminjaman via QR Scanner'
    };

    setLoans([newLoanRecord, ...loans]);
    setShowBorrowModal(false);
    setBorrowerName('');
    setBorrowEndDate('');
    setBorrowNotes('');
    setNotification({ message: `Peminjaman ${matchedAsset.name} untuk ${borrowerName} berhasil dicatat!`, type: 'success' });
  };

  const handleConditionChange = (newCondition: string) => {
    if (!matchedAsset) return;
    setAssets(assets.map((a: any) => a.id === matchedAsset.id ? { ...a, condition: newCondition } : a));
    setNotification({ message: `Kondisi ${matchedAsset.name} diperbarui menjadi ${newCondition}!`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header Area with Deep Forest Teal & Golden Amber Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="rounded-xl bg-[#064237]/80 hover:bg-[#085244] text-white border-[#0F5C4E] shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                <span className="text-[#FFB800]">Pemindai QR</span> & Barcode
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed">
                Scan label fisik atau verifikasi kode unit aset secara langsung dengan kamera perangkat.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/inventory')} 
            className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium rounded-xl transition-all shadow-xs"
          >
            Lihat Daftar Inventaris
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">

      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      <Card className="rounded-2xl border-emerald-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="text-center pb-2 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-50 dark:border-slate-800">
          <div className="mx-auto bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 p-3 rounded-2xl w-fit mb-2 shadow-sm">
            <QrCode className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Pelacakan Cepat Aset</CardTitle>
          <p className="text-xs text-slate-500">Arahkan kamera ke QR Code label atau gunakan input kode di bawah.</p>
        </CardHeader>
        <CardContent className="p-6">
          {!scanResult ? (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                <div id="qr-reader" className="w-full"></div>
              </div>

              {/* Manual input fallback */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Atau masukkan Kode Aset secara manual:</p>
                <form onSubmit={handleManualSearch} className="flex gap-2">
                  <Input 
                    placeholder="Contoh: INV-PC-001" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button type="submit" className="bg-[#047857] hover:bg-[#065f46] text-white rounded-xl">
                    <Search className="w-4 h-4 mr-1.5" /> Cari
                  </Button>
                </form>

                <div className="mt-4">
                  <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Contoh Kode Aset Cepat:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {assets.slice(0, 4).map((a: any) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setScanResult(a.assetCode)}
                        className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-900/40 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md transition-colors"
                      >
                        {a.assetCode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hasil Pindai</span>
                    <h3 className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{scanResult}</h3>
                  </div>
                  {matchedAsset && (
                    <Badge className={matchedAsset.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                      {matchedUnit ? `Unit #${matchedUnit.unitNumber} (${matchedUnit.condition})` : matchedAsset.condition}
                    </Badge>
                  )}
                  {matchedBook && matchedBookCopy && (
                    <Badge className={matchedBookCopy.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                      Eks #{matchedBookCopy.copyNumber} &bull; {matchedBookCopy.condition}
                    </Badge>
                  )}
                </div>

                {matchedAsset ? (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                      <Box className="w-4 h-4 text-emerald-600" />
                      <span>{matchedAsset.name} {matchedUnit ? `(Unit #${matchedUnit.unitNumber} - ${matchedUnit.unitCode})` : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lokasi: <strong>{matchedAsset.location || '-'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kategori: <strong>{matchedAsset.category || '-'}</strong></span>
                      </div>
                    </div>

                    {/* Loan Status & Borrowable Flag */}
                    {activeLoan ? (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200">
                        <p className="font-semibold">Sedang Dipinjam oleh: {activeLoan.borrowerName}</p>
                        <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">Tenggat Kembali: {activeLoan.endDate}</p>
                      </div>
                    ) : (matchedUnit?.isBorrowable === false || (matchedUnit?.isBorrowable === undefined && matchedAsset.isBorrowable === false)) ? (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <p className="font-bold">Barang Tidak Diizinkan Dipinjam</p>
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Status inventaris diset sebagai barang tetap / hanya boleh dipakai di tempat.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Status aset tersedia dan diizinkan untuk dipinjam.</span>
                      </div>
                    )}
                  </div>
                ) : matchedBook && matchedBookCopy ? (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>{matchedBook.title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div><span>Pengarang: <strong>{matchedBook.author}</strong></span></div>
                      <div><span>ISBN: <strong>{matchedBook.isbn || '-'}</strong></span></div>
                      <div><span>Rak: <strong>{matchedBook.rackLocation}</strong></span></div>
                      <div><span>Kategori: <strong>{matchedBook.category}</strong></span></div>
                    </div>

                    {activeBookLoan ? (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                        <p className="font-semibold">Buku Sedang Dipinjam: {activeBookLoan.borrowerName} {activeBookLoan.borrowerType ? `(${activeBookLoan.borrowerType})` : ''}</p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Tenggat Pengembalian: {activeBookLoan.dueDate}</p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                        ✓ Buku Eksemplar #{matchedBookCopy.copyNumber} tersedia di rak {matchedBook.rackLocation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold">Item belum terdaftar di database</p>
                      <p className="mt-0.5">Kode barcode/QR Code ini belum tercatat dalam inventaris maupun perpustakaan sekolah.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {matchedAsset ? (
                  <>
                    {!activeLoan ? (
                      (() => {
                        const isNotBorrowable = matchedUnit?.isBorrowable === false || (matchedUnit?.isBorrowable === undefined && matchedAsset.isBorrowable === false);
                        return (
                          <Button 
                            disabled={isNotBorrowable}
                            onClick={() => setShowBorrowModal(true)} 
                            className={`w-full rounded-xl h-11 transition-all ${
                              isNotBorrowable 
                                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' 
                                : 'bg-[#047857] hover:bg-[#065f46] text-white'
                            }`}
                          >
                            {isNotBorrowable ? (
                              <>
                                <Lock className="w-4 h-4 mr-2 text-slate-400" /> Barang Tidak Dapat Dipinjam
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-4 h-4 mr-2" /> Buat Peminjaman Aset Ini
                              </>
                            )}
                          </Button>
                        );
                      })()
                    ) : (
                      <Button onClick={handleProcessReturn} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11">
                        <RotateCcw className="w-4 h-4 mr-2" /> Catat Pengembalian Aset
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConditionChange('BAIK')}
                        className="flex-1 text-xs rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        Set Baik
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConditionChange('RUSAK_RINGAN')}
                        className="flex-1 text-xs rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        Set Rusak Ringan
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConditionChange('RUSAK_BERAT')}
                        className="flex-1 text-xs rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        Set Rusak Berat
                      </Button>
                    </div>
                  </>
                ) : matchedBook ? (
                  <Button onClick={() => navigate('/books')} className="w-full bg-[#032C24] hover:bg-[#064237] text-white rounded-xl h-11">
                    <BookOpen className="w-4 h-4 mr-2 text-[#FFB800]" /> Buka di Sirkulasi Perpustakaan
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/inventory')} className="w-full bg-[#047857] hover:bg-[#065f46] text-white rounded-xl">
                    <PlusCircle className="w-4 h-4 mr-2" /> Daftarkan Sebagai Aset Baru
                  </Button>
                )}

                <Button variant="ghost" className="w-full text-slate-500 rounded-xl" onClick={() => { setScanResult(null); setManualCode(''); }}>
                  Pindai / Cari Ulang
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Quick Borrow Modal */}
      {showBorrowModal && matchedAsset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-md w-full relative">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white border-b pb-3">
              Peminjaman Cepat: {matchedAsset.name}
            </h3>
            <form onSubmit={handleQuickBorrow} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Peminjam *</label>
                <Input 
                  required 
                  placeholder="Nama Guru / Siswa / Kelas" 
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tenggat Tanggal Pengembalian</label>
                <Input 
                  type="date"
                  value={borrowEndDate}
                  onChange={(e) => setBorrowEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Keperluan / Catatan</label>
                <Input 
                  placeholder="Contoh: Praktikum Multimedia" 
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowBorrowModal(false)}>Batal</Button>
                <Button type="submit" className="bg-[#047857] hover:bg-[#065f46] text-white">Konfirmasi Pinjam</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
