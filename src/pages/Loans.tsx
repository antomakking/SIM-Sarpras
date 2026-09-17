import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialLoans, initialAssets, initialRooms } from '../store/data';
import { Plus, Search, CalendarClock, Pencil, Trash2, X, Save, CheckCircle, RotateCcw, FileText, Sparkles, FileSpreadsheet, Download } from 'lucide-react';
import { downloadLoansPdf } from '../utils/pdfExport';

export default function Loans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useLocalStorage('iq-loans', initialLoans);
  const [assets] = useLocalStorage('iq-assets', initialAssets);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetLoan, setDeleteTargetLoan] = useState<any | null>(null);

  const defaultLoan = {
    borrowerName: '',
    type: 'Inventaris',
    itemId: '',
    itemName: '',
    startDate: '',
    endDate: '',
    status: 'MENUNGGU',
    notes: ''
  };

  const [newLoan, setNewLoan] = useState(defaultLoan);

  const filteredLoans = loans.filter((loan: any) => {
    const term = searchTerm.toLowerCase();
    return loan.borrowerName?.toLowerCase().includes(term) || 
           loan.itemName?.toLowerCase().includes(term);
  });

  const handleExportLoansExcel = () => {
    const data = filteredLoans.map((l: any, index: number) => ({
      'No': index + 1,
      'ID Peminjaman': l.id || `PJ-${index + 1}`,
      'Nama Peminjam': l.borrowerName,
      'Tipe / Jenis': l.type,
      'Nama Barang / Ruangan': l.itemName,
      'Tanggal Mulai': l.startDate,
      'Tanggal Selesai': l.endDate,
      'Status': l.status,
      'Catatan / Keperluan': l.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Peminjaman');
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Data_Peminjaman_SMKIT_Ibnul_Qayyim_${today}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENUNGGU':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 border-none shadow-none font-medium">Menunggu</Badge>;
      case 'DISETUJUI':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 border-none shadow-none font-medium">Disetujui</Badge>;
      case 'DIPINJAM':
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400 border-none shadow-none font-medium">Sedang Dipinjam</Badge>;
      case 'SELESAI':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 border-none shadow-none font-medium">Selesai</Badge>;
      case 'TERLAMBAT':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-400 border-none shadow-none font-medium">Terlambat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find item name based on ID
    let itemName = '';
    if (newLoan.type === 'Inventaris') {
      itemName = assets.find((a: any) => a.id === newLoan.itemId)?.name || '';
    } else {
      itemName = rooms.find((r: any) => r.id === newLoan.itemId)?.name || '';
    }

    const loanToSave = {
      ...newLoan,
      itemName
    };
    
    if (editingId) {
      setLoans(loans.map((l: any) => l.id === editingId ? { ...loanToSave, id: editingId } : l));
    } else {
      setLoans([{ ...loanToSave, id: Date.now().toString() }, ...loans]);
    }
    
    setShowAddForm(false);
    setEditingId(null);
    setNewLoan(defaultLoan);
  };

  const handleDelete = (loan: any) => {
    setDeleteTargetLoan(loan);
  };

  const confirmDeleteLoan = () => {
    if (deleteTargetLoan) {
      setLoans(loans.filter((l: any) => l.id !== deleteTargetLoan.id));
      setDeleteTargetLoan(null);
    }
  };

  const openEditForm = (loan: any) => {
    setNewLoan(loan);
    setEditingId(loan.id);
    setShowAddForm(true);
  };

  const updateStatus = (id: string, newStatus: string) => {
    setLoans(loans.map((l: any) => l.id === id ? { ...l, status: newStatus } : l));
  };

  return (
    <div className="space-y-6">
      {/* Header Area with Deep Forest Teal & Golden Amber Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl">
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
              <span className="text-[#FFB800]">Peminjaman</span> & Pengembalian Aset
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Pencatatan sirkulasi peminjaman sarana pembelajaran dan reservasi ruangan secara tertib.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button 
              onClick={handleExportLoansExcel} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor Excel
            </Button>
            <Button 
              onClick={() => downloadLoansPdf(filteredLoans)} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
              title="Unduh langsung berkas PDF data peminjaman"
            >
              <Download className="w-4 h-4 mr-2 text-[#FFB800]" /> Ekspor PDF
            </Button>
            <Button 
              onClick={() => { setEditingId(null); setNewLoan(defaultLoan); setShowAddForm(true); }} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Buat Peminjaman
            </Button>
          </div>
        </div>
      </div>

      {/* Search Area */}
      <div className="pt-2">
        <div className="relative max-w-[400px] w-full">
          <Search className="absolute left-3.5 top-2.5 h-[18px] w-[18px] text-slate-400" />
          <Input 
            placeholder="Cari nama peminjam atau barang/ruangan..." 
            className="pl-10 h-10 rounded-xl border-emerald-100 dark:border-slate-800 shadow-sm focus-visible:ring-emerald-500 bg-white dark:bg-slate-950" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-emerald-50/50 dark:bg-emerald-900/10">
              <TableRow className="border-b border-emerald-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Peminjam</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Tipe</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Item / Ruangan</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Tanggal Mulai</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Tanggal Selesai</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">Tidak ada data peminjaman</TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan: any) => (
                  <TableRow key={loan.id} className="border-b border-emerald-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {loan.borrowerName}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {loan.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {loan.itemName}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {loan.startDate}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {loan.endDate}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(loan.status)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        {loan.status === 'MENUNGGU' && (
                          <button onClick={() => updateStatus(loan.id, 'DISETUJUI')} className="hover:text-emerald-600 transition-colors" title="Setujui">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(loan.status === 'DISETUJUI' || loan.status === 'MENUNGGU') && (
                          <button onClick={() => updateStatus(loan.id, 'DIPINJAM')} className="hover:text-blue-600 transition-colors" title="Mulai Dipinjam">
                            <CalendarClock className="w-4 h-4" />
                          </button>
                        )}
                        {loan.status === 'DIPINJAM' && (
                          <button onClick={() => updateStatus(loan.id, 'SELESAI')} className="hover:text-emerald-600 transition-colors" title="Tandai Selesai">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openEditForm(loan)} className="hover:text-blue-600 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(loan)} className="hover:text-red-600 transition-colors" title="Hapus Peminjaman">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative my-8">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" onClick={() => { setShowAddForm(false); setEditingId(null); setNewLoan(defaultLoan); }}>
              <X className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white border-b pb-4">
              {editingId ? 'Edit Peminjaman' : 'Buat Peminjaman Baru'}
            </h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Peminjam *</label>
                  <Input required value={newLoan.borrowerName} onChange={e => setNewLoan({...newLoan, borrowerName: e.target.value})} placeholder="Nama Guru / Siswa" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipe Peminjaman</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newLoan.type}
                    onChange={e => setNewLoan({...newLoan, type: e.target.value, itemId: ''})}
                  >
                    <option value="Inventaris">Barang / Inventaris</option>
                    <option value="Ruangan">Ruangan</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Pilih {newLoan.type} *</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newLoan.itemId}
                    onChange={e => setNewLoan({...newLoan, itemId: e.target.value})}
                  >
                    <option value="">-- Pilih --</option>
                    {newLoan.type === 'Inventaris' ? (
                      assets
                        .filter((a: any) => a.isBorrowable !== false)
                        .map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.assetCode}) - {a.location || 'Tersedia'}
                          </option>
                        ))
                    ) : (
                      rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)
                    )}
                  </select>
                  {newLoan.type === 'Inventaris' && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      * Hanya menampilkan barang inventaris yang berstatus <strong>Bisa Dipinjam</strong>.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Mulai *</label>
                  <Input required type="date" value={newLoan.startDate} onChange={e => setNewLoan({...newLoan, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Selesai *</label>
                  <Input required type="date" value={newLoan.endDate} onChange={e => setNewLoan({...newLoan, endDate: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newLoan.status}
                    onChange={e => setNewLoan({...newLoan, status: e.target.value})}
                  >
                    <option value="MENUNGGU">Menunggu Persetujuan</option>
                    <option value="DISETUJUI">Disetujui</option>
                    <option value="DIPINJAM">Sedang Dipinjam</option>
                    <option value="SELESAI">Selesai / Dikembalikan</option>
                    <option value="TERLAMBAT">Terlambat</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Catatan / Keperluan</label>
                  <Input value={newLoan.notes} onChange={e => setNewLoan({...newLoan, notes: e.target.value})} placeholder="Contoh: Untuk kegiatan lomba IT" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); setNewLoan(defaultLoan); }}>Batal</Button>
                <Button type="submit" className="bg-[#047857] hover:bg-[#065f46] text-white">
                  <Save className="w-4 h-4 mr-2" /> Simpan Peminjaman
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Hapus Peminjaman */}
      {deleteTargetLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Hapus Data Peminjaman?
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Apakah Anda yakin ingin menghapus data peminjaman ini? Catatan sirkulasi barang/ruangan ini akan dihapus dari sistem.
            </p>

            {/* Loan Details Preview */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-left text-xs mb-5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Peminjam:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deleteTargetLoan.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Barang / Ruangan:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{deleteTargetLoan.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe / Status:</span>
                <span className="text-slate-700 dark:text-slate-300">{deleteTargetLoan.type} • {deleteTargetLoan.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode:</span>
                <span className="text-slate-800 dark:text-slate-200">{deleteTargetLoan.startDate} s/d {deleteTargetLoan.endDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTargetLoan(null)}
                className="flex-1 text-xs h-10 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteLoan}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
