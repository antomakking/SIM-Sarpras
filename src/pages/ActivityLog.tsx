import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Search, History, Clock, Filter, RotateCcw, Sparkles } from 'lucide-react';

const mockLogs = [
  { id: '1', time: '2026-08-21 10:30', user: 'Admin', role: 'Admin', menu: 'Inventaris dan Buku', action: 'Tambah Aset', target: 'INV-PC-002', details: 'Menambahkan Komputer Asus' },
  { id: '2', time: '2026-08-21 09:15', user: 'Kepala Sekolah', role: 'Kepsek', menu: 'Laporan', action: 'Cetak', target: 'Laporan Mutasi', details: 'Mencetak laporan PDF' },
  { id: '3', time: '2026-08-20 15:45', user: 'Sarpras', role: 'Staff', menu: 'Inventaris dan Buku', action: 'Edit Kondisi', target: 'INV-PR-001', details: 'Rusak Ringan -> Rusak Berat' },
  { id: '4', time: '2026-08-20 13:10', user: 'Wali Kelas', role: 'Guru', menu: 'Peminjaman', action: 'Buat Baru', target: 'Ruang Kelas X-A', details: 'Membuat permintaan peminjaman ruangan' },
  { id: '5', time: '2026-08-20 08:00', user: 'Admin', role: 'Admin', menu: 'Sistem Autentikasi', action: 'Login', target: 'Sistem', details: 'Berhasil login ke dalam sistem' },
];

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const uniqueMenus = Array.from(new Set(mockLogs.map(l => l.menu)));
  const uniqueActions = Array.from(new Set(mockLogs.map(l => l.action)));

  const filteredLogs = mockLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = log.user.toLowerCase().includes(term) || 
                          log.menu.toLowerCase().includes(term) ||
                          log.action.toLowerCase().includes(term) || 
                          log.target.toLowerCase().includes(term) ||
                          log.details.toLowerCase().includes(term);
    const matchesMenu = selectedMenu === 'ALL' || log.menu === selectedMenu;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesMenu && matchesAction;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMenu('ALL');
    setSelectedAction('ALL');
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
              <span className="text-[#FFB800]">Log Aktivitas</span> & Rekam Jejak Sistem
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Riwayat kronologis seluruh aktivitas pengguna, perubahan status aset, mutasi barang, dan operasi sistem.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:max-w-[320px]">
          <Search className="absolute left-3.5 top-2.5 h-[18px] w-[18px] text-slate-400" />
          <Input 
            placeholder="Cari user, target, atau detail..." 
            className="pl-10 h-10 rounded-xl border-emerald-100 dark:border-slate-800 shadow-sm focus-visible:ring-emerald-500 bg-white dark:bg-slate-950" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu:</span>
            <select
              className="h-10 px-3 rounded-xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
            >
              <option value="ALL">Semua Menu</option>
              {uniqueMenus.map(menu => (
                <option key={menu} value={menu}>{menu}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi:</span>
            <select
              className="h-10 px-3 rounded-xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="ALL">Semua Aksi</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedMenu !== 'ALL' || selectedAction !== 'ALL') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="h-10 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-emerald-50/50 dark:bg-emerald-900/10">
              <TableRow className="border-b border-emerald-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 w-48">Waktu</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Pengguna</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Menu</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Aksi</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Target</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Tidak ada log aktivitas yang sesuai dengan filter
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-b border-emerald-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                    <TableCell className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {log.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{log.user}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{log.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
                        {log.menu}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none font-medium rounded-md shadow-none dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                      {log.target}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
