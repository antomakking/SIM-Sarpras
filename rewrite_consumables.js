import fs from 'fs';

const code = `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialConsumables } from '../store/data';
import { ArrowDownToLine, ArrowUpFromLine, Search, AlertTriangle, X, Upload, Plus, History, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react';

export default function Consumables() {
  const [consumables, setConsumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isOutOpen, setIsOutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Form state
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [editForm, setEditForm] = useState<any>({});

  const filtered = consumables.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setSelectedItem('');
    setQuantity('');
    setNotes('');
    setEditForm({});
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    
    const qty = parseInt(quantity);
    if (qty <= 0) return;

    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        return { ...item, stock: item.stock + qty };
      }
      return item;
    }));
    
    setIsRestockOpen(false);
    resetForm();
  };

  const handleOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    
    const qty = parseInt(quantity);
    if (qty <= 0) return;

    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        return { ...item, stock: Math.max(0, item.stock - qty) };
      }
      return item;
    }));
    
    setIsOutOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsumables((prev: any[]) => prev.map(item => 
      item.id === selectedItem ? { ...item, ...editForm } : item
    ));
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    setConsumables((prev: any[]) => prev.filter(item => item.id !== selectedItem));
    setIsDeleteOpen(false);
    resetForm();
  };

  // Find selected item data for modals
  const currentItemData = consumables.find((c: any) => c.id === selectedItem);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Barang Habis Pakai</h1>
          <p className="text-slate-500 mt-1">Kelola stok masuk, keluar, dan pemakaian per unit/kelas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOutOpen(true)} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
            <Upload className="h-4 w-4 mr-2" /> Impor Excel
          </Button>
          <Button onClick={() => setIsRestockOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Tambah Barang
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:w-[400px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Cari nama, kode, atau kategori..." 
          className="pl-10 border-emerald-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-emerald-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-b border-emerald-100 dark:border-slate-800">
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Kode</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Nama Barang</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Kategori</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Stok</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Lokasi</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Status</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-slate-500">Tidak ada data ditemukan.</TableCell>
                </TableRow>
              ) : filtered.map((item: any) => {
                const isLowStock = item.stock <= item.reorderPoint;
                
                let location = 'Gudang TU';
                if (item.category === 'Tinta' || item.category === 'Jaringan') location = 'Lab Komputer';
                if (item.category === 'Kebersihan') location = 'Gudang Kebersihan';
                if (item.name.toLowerCase().includes('sarung tangan')) location = 'Lab IPA';
                
                return (
                  <TableRow key={item.id} className="border-b border-emerald-50 dark:border-slate-800 hover:bg-emerald-50/30 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-mono text-[11px] text-slate-500 tracking-wider uppercase">{item.itemCode}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{item.category}</TableCell>
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                      {item.stock} <span className="text-[11px] font-normal text-slate-400 ml-1">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{location}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          Aman
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsHistoryOpen(true); }}
                          className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" title="Riwayat"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsOutOpen(true); }}
                          className="text-emerald-500 hover:text-emerald-600 transition-colors" title="Pengeluaran Barang"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setEditForm(item); setIsEditOpen(true); }}
                          className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" title="Edit Barang"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsDeleteOpen(true); }}
                          className="text-rose-400 hover:text-rose-600 transition-colors" title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Restock */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2">
                <ArrowUpFromLine className="h-5 w-5 text-emerald-600" />
                Restock Barang BHP
              </CardTitle>
              <button onClick={() => { setIsRestockOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRestock} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Barang</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Pilih Barang --</option>
                    {consumables.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.itemCode} - {item.name} (Stok: {item.stock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah Masuk</label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Contoh: 10" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Keterangan / Supplier (Opsional)</label>
                  <Input 
                    placeholder="Contoh: Pembelian dari CV. Sentosa" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsRestockOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Simpan Restock</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Barang Keluar */}
      {isOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-rose-500" />
                Catat Barang Keluar
              </CardTitle>
              <button onClick={() => { setIsOutOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleOut} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Barang</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Pilih Barang --</option>
                    {consumables.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.itemCode} - {item.name} (Stok: {item.stock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah Keluar</label>
                  <Input 
                    type="number" 
                    min="1"
                    max={selectedItem ? consumables.find((c: any) => c.id === selectedItem)?.stock : undefined}
                    placeholder="Contoh: 2" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                  {selectedItem && (
                    <p className="text-[10px] text-slate-500">
                      Maksimal bisa dikeluarkan: {consumables.find((c: any) => c.id === selectedItem)?.stock} {consumables.find((c: any) => c.id === selectedItem)?.unit}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Keterangan / Keperluan</label>
                  <Input 
                    placeholder="Contoh: Digunakan kelas XII RPL" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsOutOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Catat Pengeluaran</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal History */}
      {isHistoryOpen && currentItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                Riwayat: {currentItemData.name}
              </CardTitle>
              <button onClick={() => { setIsHistoryOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex gap-3">
                    <ArrowDownToLine className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">Keluar (2 {currentItemData.unit})</span>
                  </div>
                  <span className="text-slate-500">2 hari yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex gap-3">
                    <ArrowUpFromLine className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Restock (10 {currentItemData.unit})</span>
                  </div>
                  <span className="text-slate-500">1 minggu yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-2">
                  <div className="flex gap-3">
                    <ArrowDownToLine className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">Keluar (5 {currentItemData.unit})</span>
                  </div>
                  <span className="text-slate-500">1 bulan yang lalu</span>
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <Button variant="outline" onClick={() => { setIsHistoryOpen(false); resetForm(); }}>Tutup</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Edit */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-500" />
                Edit Data Barang
              </CardTitle>
              <button onClick={() => { setIsEditOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Kode Item</label>
                    <Input 
                      value={editForm.itemCode || ''}
                      onChange={(e) => setEditForm({...editForm, itemCode: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Kategori</label>
                    <Input 
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nama Barang</label>
                  <Input 
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Stok Saat Ini</label>
                    <Input 
                      type="number"
                      value={editForm.stock || 0}
                      onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Satuan</label>
                    <Input 
                      value={editForm.unit || ''}
                      onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Batas Min (Reorder)</label>
                    <Input 
                      type="number"
                      value={editForm.reorderPoint || 0}
                      onChange={(e) => setEditForm({...editForm, reorderPoint: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Perubahan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Delete */}
      {isDeleteOpen && currentItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-col items-center justify-center border-b-0 pb-0 pt-8">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-center">Hapus Barang?</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-center">
              <p className="text-slate-500 text-sm mb-6">
                Apakah Anda yakin ingin menghapus <strong>{currentItemData.name}</strong> dari daftar inventaris? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => { setIsDeleteOpen(false); resetForm(); }}>Batal</Button>
                <Button type="button" className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDeleteConfirm}>Ya, Hapus</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
`

fs.writeFileSync('src/pages/Consumables.tsx', code);
