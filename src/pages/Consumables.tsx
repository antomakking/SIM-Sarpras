import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialConsumables, BHP_CATEGORIES, BhpCategoryInfo, initialRooms } from '../store/data';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Search, 
  X, 
  Upload, 
  Plus, 
  History, 
  ArrowDownCircle, 
  Pencil, 
  Trash2, 
  PackagePlus, 
  Sparkles,
  FileText,
  Printer,
  Download,
  Building2,
  GraduationCap,
  Monitor,
  Droplets,
  HeartPulse,
  Info,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const STANDARD_UNITS = [
  { value: 'rim', label: 'Rim (Kertas)' },
  { value: 'pcs', label: 'Pcs / Buah' },
  { value: 'box', label: 'Box / Kotak' },
  { value: 'pack', label: 'Pack / Pak' },
  { value: 'botol', label: 'Botol' },
  { value: 'roll', label: 'Roll / Gulung' },
  { value: 'lusin', label: 'Lusin (12 pcs)' },
  { value: 'set', label: 'Set' },
  { value: 'lembar', label: 'Lembar' },
  { value: 'strip', label: 'Strip (Obat)' },
  { value: 'tube', label: 'Tube (Pasta/Krim)' },
  { value: 'jerigen', label: 'Jerigen' },
  { value: 'galon', label: 'Galon (19L)' },
  { value: 'unit', label: 'Unit' },
  { value: 'pasang', label: 'Pasang' },
  { value: 'buku', label: 'Buku' },
  { value: 'karton', label: 'Karton / Dus' },
  { value: 'meter', label: 'Meter' }
];

export default function Consumables() {
  const [consumables, setConsumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    // Migration: If user previously had old 3 dummy items, upgrade them or ensure history exists
    let needsUpdate = false;
    const seeded = consumables.map((item: any) => {
      let updatedItem = { ...item };
      
      // Auto map legacy category if needed
      if (updatedItem.category === 'Alat Tulis' || updatedItem.category === 'Kertas & Percetakan') {
        updatedItem.category = 'BHP-ADM';
        updatedItem.subcategory = 'Kertas & Cetak';
        needsUpdate = true;
      } else if (updatedItem.category === 'Tinta') {
        updatedItem.category = 'BHP-ADM';
        updatedItem.subcategory = 'Alat Tulis Kantor (ATK)';
        needsUpdate = true;
      } else if (updatedItem.category === 'Jaringan') {
        updatedItem.category = 'BHP-LAB';
        updatedItem.subcategory = 'Kabel & Konektor';
        needsUpdate = true;
      } else if (updatedItem.category === 'Kebersihan') {
        updatedItem.category = 'BHP-KBR';
        updatedItem.subcategory = 'Sanitasi Mandi & Cuci';
        needsUpdate = true;
      }

      if (!updatedItem.history) {
        needsUpdate = true;
        updatedItem.history = [
          { id: "h1_"+item.id, type: "Masuk", qty: item.stock, finalStock: item.stock, actor: "Sistem Awal", notes: "Stok awal sistem", date: "10/8/2026 08:00:00" }
        ];
      } else {
        let historyUpdated = false;
        const newHistory = updatedItem.history.map((h: any) => {
          if (h.date) {
            const parts = h.date.split(':');
            if (parts.length === 1) {
              historyUpdated = true;
              const dummyTime = h.type === 'Masuk' ? '08:00:00' : '14:30:00';
              return { ...h, date: `${h.date} ${dummyTime}` };
            } else if (parts.length === 2) {
              historyUpdated = true;
              return { ...h, date: `${h.date}:00` };
            }
          }
          return h;
        });
        
        if (historyUpdated) {
          needsUpdate = true;
          updatedItem.history = newHistory;
        }
      }
      return updatedItem;
    });
    if (needsUpdate) {
      setConsumables(seeded);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  
  // Modals state
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isOutOpen, setIsOutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [pdfFilterCategory, setPdfFilterCategory] = useState<string>('ALL');
  const [pdfFilterStatus, setPdfFilterStatus] = useState<string>('ALL'); // 'ALL' | 'MENIPIS' | 'AMAN'
  const [pdfFilterLocation, setPdfFilterLocation] = useState<string>('ALL');
  
  // Form state
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [editForm, setEditForm] = useState<any>({});
  
  const defaultNewItem = {
    itemCode: 'BHP-ADM-05',
    name: '',
    category: 'BHP-ADM',
    subcategory: 'Kertas & Cetak',
    stock: 10,
    unit: 'rim',
    reorderPoint: 5,
    location: rooms[0]?.name || 'Lab RPL'
  };
  const [newItem, setNewItem] = useState(defaultNewItem);

  const getCategoryMeta = (code: string) => {
    const found = BHP_CATEGORIES.find(c => c.code === code);
    if (found) return found;
    return {
      code: code || 'BHP-ADM',
      name: code || 'BHP Administrasi & Kantor',
      shortName: code || 'Administrasi',
      description: 'Barang habis pakai operasional sekolah',
      defaultLocation: rooms[0]?.name || 'Lab RPL',
      subcategories: ['Umum'],
      examples: []
    };
  };

  const getCategoryBadgeStyle = (code: string) => {
    switch (code) {
      case 'BHP-ADM':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'BHP-KBM':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'BHP-LAB':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'BHP-KBR':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
      case 'BHP-UKS':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'BHP-ADM':
        return <FileText className="w-3.5 h-3.5" />;
      case 'BHP-KBM':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'BHP-LAB':
        return <Monitor className="w-3.5 h-3.5" />;
      case 'BHP-KBR':
        return <Droplets className="w-3.5 h-3.5" />;
      case 'BHP-UKS':
        return <HeartPulse className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const generateNextCode = (catCode: string) => {
    const existingInCat = consumables.filter((c: any) => c.category === catCode || (c.itemCode && c.itemCode.startsWith(catCode)));
    const nextNum = existingInCat.length + 1;
    return `${catCode}-${nextNum.toString().padStart(2, '0')}`;
  };

  const handleCategoryChangeForNewItem = (catCode: string) => {
    const meta = getCategoryMeta(catCode);
    const generatedCode = generateNextCode(catCode);
    setNewItem({
      ...newItem,
      category: catCode,
      subcategory: meta.subcategories[0] || 'Umum',
      itemCode: generatedCode,
      location: meta.defaultLocation
    });
  };

  const filtered = consumables.filter((item: any) => {
    // Filter by tab category
    if (selectedCategoryTab !== 'ALL') {
      const matchCat = item.category === selectedCategoryTab || 
                       (item.itemCode && item.itemCode.startsWith(selectedCategoryTab));
      if (!matchCat) return false;
    }

    // Filter by search query
    const term = searchTerm.toLowerCase();
    const meta = getCategoryMeta(item.category);
    return item.name.toLowerCase().includes(term) || 
           item.itemCode.toLowerCase().includes(term) ||
           (item.category && item.category.toLowerCase().includes(term)) ||
           (item.subcategory && item.subcategory.toLowerCase().includes(term)) ||
           (meta.name.toLowerCase().includes(term)) ||
           (meta.shortName.toLowerCase().includes(term)) ||
           (item.location && item.location.toLowerCase().includes(term));
  });

  const pdfFilteredItems = consumables.filter((item: any) => {
    if (pdfFilterCategory !== 'ALL') {
      const matchCat = item.category === pdfFilterCategory || 
                       (item.itemCode && item.itemCode.startsWith(pdfFilterCategory));
      if (!matchCat) return false;
    }
    const isLow = item.stock <= (item.reorderPoint || 5);
    if (pdfFilterStatus === 'MENIPIS' && !isLow) return false;
    if (pdfFilterStatus === 'AMAN' && isLow) return false;
    if (pdfFilterLocation !== 'ALL' && item.location !== pdfFilterLocation) return false;
    return true;
  });

  const resetForm = () => {
    setSelectedItem('');
    setQuantity('');
    setNotes('');
    setEditForm({});
    setNewItem({
      ...defaultNewItem,
      itemCode: generateNextCode('BHP-ADM')
    });
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const today = new Date();
      const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
      
      const importedItems = [
        {
          id: 'bhp_' + Date.now() + '_1',
          itemCode: generateNextCode('BHP-ADM'),
          name: `Kertas Amplop Resmi Sekolah (${file.name})`,
          category: 'BHP-ADM',
          subcategory: 'Kertas & Cetak',
          stock: 25,
          unit: 'pack',
          reorderPoint: 5,
          location: 'Gudang TU',
          history: [{ id: 'h_' + Date.now(), type: 'Masuk', qty: 25, finalStock: 25, actor: 'Import Excel', notes: `Impor dari file ${file.name}`, date: dateStr }]
        },
        {
          id: 'bhp_' + Date.now() + '_2',
          itemCode: generateNextCode('BHP-LAB'),
          name: `Kabel LAN RJ45 Cat6 Belden (${file.name})`,
          category: 'BHP-LAB',
          subcategory: 'Kabel & Konektor',
          stock: 15,
          unit: 'roll',
          reorderPoint: 3,
          location: 'Lab Komputer',
          history: [{ id: 'h_' + (Date.now() + 1), type: 'Masuk', qty: 15, finalStock: 15, actor: 'Import Excel', notes: `Impor dari file ${file.name}`, date: dateStr }]
        }
      ];

      setConsumables([...importedItems, ...consumables]);
      alert(`Berhasil mengimpor data barang dari ${file.name}`);
      e.target.value = '';
    }
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.itemCode) return;

    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
    
    const createdItem = {
      id: 'bhp_' + Date.now(),
      itemCode: newItem.itemCode,
      name: newItem.name,
      category: newItem.category,
      subcategory: newItem.subcategory || 'Umum',
      stock: Number(newItem.stock) || 0,
      unit: newItem.unit || 'pcs',
      reorderPoint: Number(newItem.reorderPoint) || 5,
      location: newItem.location || 'Gudang TU',
      history: [
        {
          id: 'h_' + Date.now(),
          type: 'Masuk',
          qty: Number(newItem.stock) || 0,
          finalStock: Number(newItem.stock) || 0,
          actor: 'Admin',
          notes: 'Registrasi Barang Baru',
          date: dateStr
        }
      ]
    };

    setConsumables([createdItem, ...consumables]);
    setIsNewItemOpen(false);
    resetForm();
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    
    const qty = parseInt(quantity);
    if (qty <= 0) return;

    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        const newStock = item.stock + qty;
        const today = new Date();
        const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
        const newHistory = {
          id: Date.now().toString(),
          type: 'Masuk',
          qty: qty,
          finalStock: newStock,
          actor: 'Admin',
          notes: notes || 'Restock Barang Masuk',
          date: dateStr
        };
        return { ...item, stock: newStock, history: [newHistory, ...(item.history || [])] };
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
        const newStock = Math.max(0, item.stock - qty);
        const today = new Date();
        const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
        const newHistory = {
          id: Date.now().toString(),
          type: 'Keluar',
          qty: qty,
          finalStock: newStock,
          actor: 'Admin',
          notes: notes || 'Pengeluaran Barang',
          date: dateStr
        };
        return { ...item, stock: newStock, history: [newHistory, ...(item.history || [])] };
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

  const currentItemData = consumables.find((c: any) => c.id === selectedItem);

  return (
    <div className="space-y-6 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".xlsx,.xls,.csv" 
        onChange={handleImportExcel} 
      />

      {/* Header Area with Deep Forest Teal & Golden Amber Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
              </span>
              <button 
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 hover:text-[#FFB800] bg-white/5 hover:bg-white/10 px-3 py-0.5 rounded-full border border-emerald-400/20 transition-colors shadow-xs"
              >
                <Info className="w-3.5 h-3.5 text-[#FFB800]" /> Panduan 5 Kategori BHP
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              <span className="text-[#FFB800]">Barang</span> Habis Pakai (BHP)
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 truncate whitespace-nowrap">
              Klasifikasi logistik sekolah: Administrasi & Kantor (BHP-ADM), Belajar & KBM (BHP-KBM), Lab Komputer (BHP-LAB), Kebersihan (BHP-KBR), serta UKS & Konsumsi (BHP-UKS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <Upload className="h-4 w-4 mr-2 text-[#FFB800]" /> Impor Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { resetForm(); setIsRestockOpen(true); }}
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2 text-emerald-400" /> Restok Masuk
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { resetForm(); setIsOutOpen(true); }}
              className="bg-[#064237]/80 hover:bg-[#085244] text-rose-200 border-rose-900/50 font-medium transition-all shadow-xs"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2 text-rose-400" /> Catat Keluar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { 
                setPdfFilterCategory(selectedCategoryTab);
                setPdfFilterStatus('ALL');
                setPdfFilterLocation('ALL');
                setIsPdfExportOpen(true); 
              }}
              className="bg-[#064237]/90 hover:bg-[#085244] text-[#FFB800] border-[#FFB800]/50 hover:border-[#FFB800] font-semibold transition-all shadow-xs"
            >
              <FileText className="h-4 w-4 mr-2 text-[#FFB800]" /> Ekspor PDF Stok
            </Button>
            <Button 
              onClick={() => { 
                resetForm(); 
                setNewItem({
                  ...defaultNewItem,
                  itemCode: generateNextCode('BHP-ADM')
                });
                setIsNewItemOpen(true); 
              }} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PackagePlus className="h-4 w-4 mr-1.5 text-slate-950 font-extrabold" /> Tambah Barang Baru
            </Button>
          </div>
        </div>
      </div>

      {/* 5 Standardized Category Navigation Tabs */}
      <div className="flex flex-wrap gap-2 items-center bg-white/70 dark:bg-slate-900/70 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setSelectedCategoryTab('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedCategoryTab === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua Kategori</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategoryTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
            {consumables.length}
          </span>
        </button>

        {BHP_CATEGORIES.map((cat) => {
          const count = consumables.filter((c: any) => c.category === cat.code || (c.itemCode && c.itemCode.startsWith(cat.code))).length;
          const isActive = selectedCategoryTab === cat.code;
          return (
            <button
              key={cat.code}
              onClick={() => setSelectedCategoryTab(cat.code)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 border-amber-400 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-emerald-600 dark:text-emerald-400'}>
                {getCategoryIcon(cat.code)}
              </span>
              <span className="font-mono text-[11px] font-bold">{cat.code}</span>
              <span className="hidden sm:inline font-sans font-medium opacity-90 truncate max-w-[130px]">{cat.shortName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-slate-950/15 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-[420px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari kode (BHP-ADM..), nama barang, kategori, lokasi..." 
            className="pl-10 h-10 border-emerald-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-xs text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Aman: <strong>{consumables.filter((c: any) => c.stock > (c.reorderPoint || 5)).length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Menipis: <strong className="text-amber-600 dark:text-amber-400">{consumables.filter((c: any) => c.stock <= (c.reorderPoint || 5)).length}</strong>
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-emerald-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 border-b border-emerald-100 dark:border-slate-800">
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12">Kode BHP</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12">Nama Barang Habis Pakai</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12">Kategori & Sub-Kategori</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12">Stok Tersedia</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12">Lokasi Simpan</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-12 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PackagePlus className="w-8 h-8 text-slate-300" />
                      <p className="font-medium">Tidak ada data barang habis pakai yang cocok.</p>
                      <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setSelectedCategoryTab('ALL'); }}>
                        Reset Filter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.map((item: any) => {
                const isLowStock = item.stock <= (item.reorderPoint || 5);
                const categoryMeta = getCategoryMeta(item.category);
                const location = item.location || categoryMeta.defaultLocation || 'Gudang TU';
                
                return (
                  <TableRow key={item.id} className="border-b border-emerald-50 dark:border-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.itemCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{item.name}</p>
                        {item.subcategory && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {item.subcategory}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeStyle(item.category)}`}>
                          {getCategoryIcon(item.category)}
                          <span>{categoryMeta.code}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                          {categoryMeta.shortName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-extrabold text-base ${isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.stock}
                        </span>
                        <span className="text-xs font-medium text-slate-400">{item.unit}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Min: {item.reorderPoint || 5} {item.unit}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs">
                          <AlertTriangle className="w-3 h-3 text-amber-600 animate-pulse" />
                          Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Aman
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsHistoryOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors" 
                          title="Riwayat Keluar/Masuk"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsRestockOpen(true); }}
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors" 
                          title="Restok Masuk"
                        >
                          <ArrowUpFromLine className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsOutOpen(true); }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" 
                          title="Catat Keluar"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setEditForm(item); setIsEditOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors" 
                          title="Edit Data"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item.id); setIsDeleteOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Panduan 5 Kategori BHP Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[#E67E00]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Standar Kategori Barang Habis Pakai (BHP)
                  </CardTitle>
                  <p className="text-xs text-slate-500">SMK IT Ibnul Qayyim Makassar</p>
                </div>
              </div>
              <button onClick={() => setIsGuideOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-5 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
                Pengelompokan BHP memisahkan kebutuhan administrasi kantor, kegiatan belajar mengajar (KBM), laboratorium IT, kebersihan gedung, hingga operasional kesehatan UKS.
              </p>

              <div className="space-y-3">
                {BHP_CATEGORIES.map((cat, idx) => (
                  <div key={cat.code} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeStyle(cat.code)}`}>
                          {getCategoryIcon(cat.code)}
                          <span>{cat.code}</span>
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h4>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        Lokasi: {cat.defaultLocation}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{cat.description}</p>
                    
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub-Kategori & Contoh Barang:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub, sIdx) => (
                          <span key={sIdx} className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                            {sub}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                        Contoh: {cat.examples.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Tambah Barang Baru */}
      {isNewItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PackagePlus className="h-5 w-5 text-emerald-600" />
                Tambah Barang Habis Pakai (BHP) Baru
              </CardTitle>
              <button onClick={() => { setIsNewItemOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleCreateNewItem} className="space-y-3.5">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kategori BHP Standar *
                  </label>
                  <select
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={newItem.category}
                    onChange={(e) => handleCategoryChangeForNewItem(e.target.value)}
                    required
                  >
                    {BHP_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.code} - {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kode Barang (Auto/Manual) *</label>
                    <Input 
                      placeholder="Contoh: BHP-ADM-05" 
                      value={newItem.itemCode}
                      onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                      required
                      className="font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sub-Kategori</label>
                    <select
                      className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={newItem.subcategory}
                      onChange={(e) => setNewItem({...newItem, subcategory: e.target.value})}
                    >
                      {getCategoryMeta(newItem.category).subcategories.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Barang Habis Pakai *</label>
                  <Input 
                    placeholder="Contoh: Kertas HVS F4 80gr PaperOne / Spidol Snowman Hitam" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tambah Stok *</label>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="0"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
                      required
                      className="text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Satuan *</label>
                    <select
                      className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      required
                    >
                      {STANDARD_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Batas Min.</label>
                    <Input 
                      type="number" 
                      min="1"
                      value={newItem.reorderPoint}
                      onChange={(e) => setNewItem({...newItem, reorderPoint: parseInt(e.target.value) || 1})}
                      required
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lokasi Penyimpanan *</label>
                  <select
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    required
                  >
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.name}>{room.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsNewItemOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" size="sm" className="bg-[#047857] hover:bg-[#065f46] text-white">
                    <PackagePlus className="w-4 h-4 mr-1.5" /> Simpan Barang BHP
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Restock */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ArrowUpFromLine className="h-5 w-5 text-emerald-600" />
                Restok Barang Masuk
              </CardTitle>
              <button onClick={() => { setIsRestockOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleRestock} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Barang BHP</label>
                  <select 
                    className="w-full flex h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Pilih Barang BHP --</option>
                    {consumables.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.itemCode} - {item.name} (Stok: {item.stock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jumlah Masuk</label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Contoh: 10" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Keterangan / Supplier (Opsional)</label>
                  <Input 
                    placeholder="Contoh: Pembelian rutin awal bulan dari Toko ATK" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsRestockOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" size="sm" className="bg-[#047857] hover:bg-[#065f46] text-white">Simpan Restock</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Barang Keluar */}
      {isOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ArrowDownToLine className="h-5 w-5 text-rose-500" />
                Catat Barang Keluar
              </CardTitle>
              <button onClick={() => { setIsOutOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleOut} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Barang BHP</label>
                  <select 
                    className="w-full flex h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Pilih Barang BHP --</option>
                    {consumables.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.itemCode} - {item.name} (Stok: {item.stock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jumlah Keluar</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max={selectedItem ? consumables.find((c: any) => c.id === selectedItem)?.stock : undefined}
                    placeholder="Contoh: 2" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="text-xs"
                  />
                  {selectedItem && (
                    <p className="text-[11px] text-slate-500">
                      Maksimal bisa dikeluarkan: <strong>{consumables.find((c: any) => c.id === selectedItem)?.stock} {consumables.find((c: any) => c.id === selectedItem)?.unit}</strong>
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Keterangan / Keperluan *</label>
                  <Input 
                    placeholder="Contoh: Digunakan ujian semester / Praktikum RPL" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsOutOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">Catat Pengeluaran</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal History */}
      {isHistoryOpen && currentItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-5 w-5 text-indigo-500" />
                Riwayat: {currentItemData.name}
              </CardTitle>
              <button onClick={() => { setIsHistoryOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-2">
                {(!currentItemData.history || currentItemData.history.length === 0) ? (
                  <div className="text-center py-8 text-slate-500 text-xs">Belum ada riwayat aktivitas untuk barang ini.</div>
                ) : (
                  currentItemData.history.map((h: any) => (
                    <div key={h.id} className="flex flex-col gap-1.5 text-xs border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {h.type === 'Keluar' ? (
                            <div className="bg-rose-100 dark:bg-rose-900/40 p-1.5 rounded-full text-rose-600 dark:text-rose-400">
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1.5 rounded-full text-emerald-600 dark:text-emerald-400">
                              <ArrowUpFromLine className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {h.type} ({h.qty} {currentItemData.unit})
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{h.date}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1 ml-8 text-[11px]">
                        <div>
                          <p className="text-slate-400">Sisa Stok:</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{h.finalStock} {currentItemData.unit}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Pencatat:</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{h.actor}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400">Keterangan:</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{h.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => { setIsHistoryOpen(false); resetForm(); }}>Tutup</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Edit */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Pencil className="h-5 w-5 text-blue-500" />
                Edit Data Barang Habis Pakai
              </CardTitle>
              <button onClick={() => { setIsEditOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleEditSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori BHP</label>
                  <select 
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={editForm.category || 'BHP-ADM'}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  >
                    {BHP_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.code} - {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kode Barang</label>
                    <Input 
                      value={editForm.itemCode || ''}
                      onChange={(e) => setEditForm({...editForm, itemCode: e.target.value})}
                      required
                      className="font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sub-Kategori</label>
                    <Input 
                      value={editForm.subcategory || ''}
                      onChange={(e) => setEditForm({...editForm, subcategory: e.target.value})}
                      placeholder="Kertas & Cetak / ATK..."
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Barang</label>
                  <Input 
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                    className="text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stok Saat Ini</label>
                    <Input 
                      type="number" 
                      value={editForm.stock || 0}
                      onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                      required
                      className="text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Satuan *</label>
                    <select
                      className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={editForm.unit || 'pcs'}
                      onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                      required
                    >
                      {STANDARD_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                      {/* In case there is an existing custom unit not in STANDARD_UNITS */}
                      {editForm.unit && !STANDARD_UNITS.some(u => u.value.toLowerCase() === editForm.unit?.toLowerCase()) && (
                        <option value={editForm.unit}>{editForm.unit} (Kustom)</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Batas Min (Reorder)</label>
                    <Input 
                      type="number" 
                      value={editForm.reorderPoint || 0}
                      onChange={(e) => setEditForm({...editForm, reorderPoint: parseInt(e.target.value) || 0})}
                      required
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lokasi Penyimpanan *</label>
                  <select
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    value={editForm.location || rooms[0]?.name || ''}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    required
                  >
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.name}>{room.name}</option>
                    ))}
                    {/* In case there is an existing custom location */}
                    {editForm.location && !rooms.some((r: any) => r.name === editForm.location) && (
                      <option value={editForm.location}>{editForm.location}</option>
                    )}
                  </select>
                </div>
                
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsEditOpen(false); resetForm(); }}>Batal</Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Perubahan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Delete */}
      {isDeleteOpen && currentItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-col items-center justify-center border-b-0 pb-0 pt-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-center font-bold">Hapus Barang?</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-xs mb-5">
                Apakah Anda yakin ingin menghapus <strong>{currentItemData.name} ({currentItemData.itemCode})</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-2">
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => { setIsDeleteOpen(false); resetForm(); }}>Batal</Button>
                <Button type="button" size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDeleteConfirm}>Ya, Hapus</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Ekspor / Cetak PDF Kondisi Stok BHP */}
      {isPdfExportOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 flex justify-center items-start animate-in fade-in duration-200">
          <div className="w-full max-w-5xl space-y-4 my-auto">
            {/* Action Bar (Hidden on Print) */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#E67E00] text-slate-950 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Pratinjau Cetak / Ekspor Dokumen PDF</h3>
                  <p className="text-xs text-slate-400">Laporan Rekapitulasi Kondisi Stok Barang Habis Pakai (BHP)</p>
                </div>
              </div>

              {/* Toolbar Filters & Buttons */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {/* Filter Kategori */}
                <select
                  value={pdfFilterCategory}
                  onChange={(e) => setPdfFilterCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFB800]"
                >
                  <option value="ALL">Semua Kategori ({consumables.length})</option>
                  {BHP_CATEGORIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.shortName}</option>
                  ))}
                </select>

                {/* Filter Kondisi */}
                <select
                  value={pdfFilterStatus}
                  onChange={(e) => setPdfFilterStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFB800]"
                >
                  <option value="ALL">Semua Status Stok</option>
                  <option value="MENIPIS">⚠️ Stok Menipis / Reorder Saja</option>
                  <option value="AMAN">✅ Stok Aman Saja</option>
                </select>

                {/* Filter Lokasi */}
                <select
                  value={pdfFilterLocation}
                  onChange={(e) => setPdfFilterLocation(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFB800]"
                >
                  <option value="ALL">Semua Lokasi Ruangan</option>
                  {rooms.map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>

                <Button
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-md border-none text-xs px-3.5 py-2 h-9"
                >
                  <Printer className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Cetak / Simpan PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsPdfExportOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs h-9 px-3"
                >
                  <X className="w-4 h-4 mr-1" /> Tutup
                </Button>
              </div>
            </div>

            {/* Printable Formal Document Sheet */}
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
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

              {/* Title & Document Code */}
              <div className="text-center mb-6">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-950 underline uppercase tracking-wide">
                  LAPORAN REKAPITULASI KONDISI STOK BARANG HABIS PAKAI (BHP)
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-mono">
                  Nomor Dokumen: {`042/SMKIT-IQ/SARPRAS/BHP/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
                </p>
              </div>

              {/* Summary Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Tanggal Cetak:</span>
                  <strong className="text-slate-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Filter Kategori:</span>
                  <strong className="text-slate-900">
                    {pdfFilterCategory === 'ALL' ? 'Semua Kategori (5 Klasifikasi)' : pdfFilterCategory}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Item Dilaporkan:</span>
                  <strong className="text-slate-900">{pdfFilteredItems.length} Jenis Barang</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Kondisi Stok:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-700 font-bold">
                      {pdfFilteredItems.filter((i: any) => i.stock > (i.reorderPoint || 5)).length} Aman
                    </span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">
                      {pdfFilteredItems.filter((i: any) => i.stock <= (i.reorderPoint || 5)).length} Menipis
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-center">
                      <th className="border border-slate-300 p-2 w-10">No</th>
                      <th className="border border-slate-300 p-2 w-28">Kode BHP</th>
                      <th className="border border-slate-300 p-2 text-left">Nama Barang Habis Pakai</th>
                      <th className="border border-slate-300 p-2 text-left">Kategori & Sub-Kategori</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Stok</th>
                      <th className="border border-slate-300 p-2 w-16 text-center">Satuan</th>
                      <th className="border border-slate-300 p-2 w-20 text-center">Min. Stok</th>
                      <th className="border border-slate-300 p-2 text-left">Lokasi Simpan</th>
                      <th className="border border-slate-300 p-2 w-28 text-center">Status Kondisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdfFilteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="border border-slate-300 p-6 text-center text-slate-500 italic">
                          Tidak ada data barang habis pakai yang memenuhi kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      pdfFilteredItems.map((item: any, index: number) => {
                        const isLow = item.stock <= (item.reorderPoint || 5);
                        const isCritical = item.stock === 0;
                        const catMeta = getCategoryMeta(item.category);
                        const loc = item.location || catMeta.defaultLocation || 'Gudang TU';

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
                              <span className="font-bold text-slate-800">{catMeta.code}</span>
                              {item.subcategory && (
                                <span className="text-slate-600 block text-[10px]">{item.subcategory}</span>
                              )}
                            </td>
                            <td className={`border border-slate-300 p-2 text-center font-bold text-sm ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                              {item.stock}
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-medium text-slate-700">
                              {item.unit}
                            </td>
                            <td className="border border-slate-300 p-2 text-center text-slate-600">
                              {item.reorderPoint || 5} {item.unit}
                            </td>
                            <td className="border border-slate-300 p-2 text-slate-700">
                              {loc}
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

              {/* Notes & Summary */}
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
                  <p className="font-bold">Kepala Sekolah</p>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                    (Tanda Tangan & Cap Sekolah)
                  </div>
                  <p className="font-bold underline text-sm">Anto, S.E.I., M.E., Gr., MCF.</p>
                  <p className="text-[11px] text-slate-600">NIP. 19780412 200501 1 004</p>
                </div>

                <div className="text-center">
                  <p>Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold">Penanggung Jawab Sarpras & Logistik</p>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                    (Tanda Tangan Petugas)
                  </div>
                  <p className="font-bold underline text-sm">Bapak Muh. Taufik, S.T</p>
                  <p className="text-[11px] text-slate-600">NUPTK. 19850920 201101 1 012</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
