import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Pencil, Trash2, X, Save, Shield, User, Mail, Sparkles, Lock, Eye, EyeOff, KeyRound, Check, Copy } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialUsers } from '../store/data';

export default function UserManagement() {
  const [users, setUsers] = useLocalStorage('iq-users', initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<any | null>(null);

  const defaultUser = {
    name: '',
    email: '',
    password: 'password123',
    role: 'Guru & Staf (User Umum)',
    status: 'Aktif',
    description: ''
  };

  const [newUser, setNewUser] = useState(defaultUser);

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyPassword = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass || 'password123');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((user: any) => {
    const term = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(term) || 
           user.email.toLowerCase().includes(term) || 
           user.role.toLowerCase().includes(term);
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setUsers(users.map((u: any) => u.id === editingId ? { ...newUser, id: editingId } : u));
    } else {
      setUsers([{ ...newUser, id: Date.now().toString() }, ...users]);
    }
    
    setShowAddForm(false);
    setEditingId(null);
    setNewUser(defaultUser);
    setShowFormPassword(false);
  };

  const openEditForm = (user: any) => {
    setNewUser({
      name: user.name,
      email: user.email,
      password: user.password || 'password123',
      role: user.role,
      status: user.status,
      description: user.description || ''
    });
    setEditingId(user.id);
    setShowFormPassword(false);
    setShowAddForm(true);
  };

  const handleDelete = (user: any) => {
    setDeleteTargetUser(user);
  };

  const confirmDeleteUser = () => {
    if (deleteTargetUser) {
      setUsers(users.filter((u: any) => u.id !== deleteTargetUser.id));
      setDeleteTargetUser(null);
    }
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
              <span className="text-[#FFB800]">Kelola Pengguna</span> & Akun Login
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Manajemen kredensial login (email & kata sandi), penetapan hak akses (Admin, Sarpras, Guru, Siswa), dan status keaktifan akun.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button 
              onClick={() => { setEditingId(null); setNewUser(defaultUser); setShowFormPassword(false); setShowAddForm(true); }} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Tambah Pengguna
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-50/80 dark:bg-[#032C24]/40 border border-emerald-200/80 dark:border-[#095445] p-4 rounded-2xl flex items-center gap-3 text-sm text-emerald-950 dark:text-emerald-100 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-[#064237] flex items-center justify-center shrink-0 text-emerald-800 dark:text-[#FFB800]">
          <KeyRound className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm">
          <strong>Kredensial Login Aktif:</strong> Seluruh email dan kata sandi di bawah ini terhubung langsung sebagai akun otentikasi login aplikasi. Anda dapat mengubah kata sandi atau menambahkan akun baru kapan saja.
        </p>
      </div>

      {/* Roles & Permissions Matrix Summary */}
      <div className="bg-white dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Struktur Hak Akses & Peran (Roles) SMK IT Ibnul Qayyim
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">1. Super Admin / IT Admin</span>
            <p className="text-slate-600 dark:text-slate-400">Konfigurasi sistem, database, manajemen user & akun, hak akses, dan log aktivitas sistem.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">2. Kepala Sekolah / Eksekutif</span>
            <p className="text-slate-600 dark:text-slate-400">Akses baca menyeluruh (dashboard, nilai aset, depresiasi) & persetujuan pengadaan/disposal aset.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">3. Admin Sarpras</span>
            <p className="text-slate-600 dark:text-slate-400">Siklus penuh aset: katalogisasi QR/barcode, penempatan, mutasi, jadwal maintenance & audit berkala.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">4. Kepala Lab & Unit</span>
            <p className="text-slate-600 dark:text-slate-400">Kelola & validasi aset lab (PC, server, switch), check-in/out inventaris lab, & ajukan perbaikan/mutasi.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">5. Guru & Staf (User Umum)</span>
            <p className="text-slate-600 dark:text-slate-400">Pengajuan pinjaman aset harian (proyektor, mic, dll), riwayat pinjaman pribadi, & pelaporan kerusakan (ticketing).</p>
          </div>
        </div>
      </div>

      {/* Search Area */}
      <div className="pt-1">
        <div className="relative max-w-[400px] w-full">
          <Search className="absolute left-3.5 top-2.5 h-[18px] w-[18px] text-slate-400" />
          <Input 
            placeholder="Cari nama, email, atau peran..." 
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
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Pengguna</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Email</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Password Login</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Peran / Hak Akses</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">Tidak ada pengguna ditemukan</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => {
                  const password = user.password || 'password123';
                  const isVisible = !!showPasswordMap[user.id];
                  const isCopied = copiedId === user.id;

                  return (
                    <TableRow key={user.id} className="border-b border-emerald-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isVisible ? password : '••••••••'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title={isVisible ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(user.id, password)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Salin Kata Sandi"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Shield className="w-4 h-4 text-emerald-600" />
                          {user.role}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`font-medium px-2.5 py-0.5 rounded-full border-none shadow-none text-xs
                            ${user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}
                          `}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-3 text-slate-400">
                          <button onClick={() => openEditForm(user)} className="hover:text-blue-600 transition-colors" title="Edit Pengguna & Password">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="hover:text-red-600 transition-colors" title="Hapus Akun Pengguna">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-lg w-full relative my-8 border border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" onClick={() => { setShowAddForm(false); setEditingId(null); setNewUser(defaultUser); }}>
              <X className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#FFB800]" />
              {editingId ? 'Edit Akun Pengguna & Password' : 'Tambah Akun Pengguna Baru'}
            </h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input required className="pl-9" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Masukkan nama lengkap" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat Email Login *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input required type="email" className="pl-9" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="email@smkit.sch.id" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kata Sandi (Password Login) *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    required 
                    type={showFormPassword ? 'text' : 'password'} 
                    className="pl-9 pr-10" 
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                    placeholder="Masukkan kata sandi login" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Kata sandi ini digunakan untuk masuk saat login ke sistem.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Peran / Hak Akses *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="Super Admin / IT Admin">Super Admin / IT Admin (Konfigurasi & Database)</option>
                  <option value="Kepala Sekolah / Manajemen Eksekutif">Kepala Sekolah / Manajemen Eksekutif (Read-Only & Approval)</option>
                  <option value="Admin Sarpras / Pengelola Aset Sekolah">Admin Sarpras / Pengelola Aset Sekolah (Siklus Penuh Aset)</option>
                  <option value="Kepala Lab / Penanggung Jawab Ruangan & Unit">Kepala Lab / Penanggung Jawab Ruangan & Unit (Validasi Unit Lab)</option>
                  <option value="Guru & Staf (User Umum)">Guru & Staf (User Umum) (Peminjaman & Pelaporan)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Menentukan hak akses dan otorisasi menu operasional SMK IT Ibnul Qayyim.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status Akun</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newUser.status}
                  onChange={e => setNewUser({...newUser, status: e.target.value})}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); setNewUser(defaultUser); }}>Batal</Button>
                <Button type="submit" className="bg-[#047857] hover:bg-[#065f46] text-white">
                  <Save className="w-4 h-4 mr-2" /> Simpan Data Pengguna
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Hapus Pengguna */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Hapus Akun Pengguna?
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Apakah Anda yakin ingin menghapus akun pengguna ini? Pengguna tidak akan dapat login lagi ke sistem SIM Sarpras & Perpustakaan.
            </p>

            {/* User Details Preview */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-left text-xs mb-5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pengguna:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deleteTargetUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Login:</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{deleteTargetUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hak Akses (Role):</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{deleteTargetUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Akun:</span>
                <span className="text-slate-700 dark:text-slate-300">{deleteTargetUser.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTargetUser(null)}
                className="flex-1 text-xs h-10 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteUser}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Pengguna
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

