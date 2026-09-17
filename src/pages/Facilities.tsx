import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialRooms, initialBookings, initialAssets, initialBooks } from '../store/data';
import { 
  Calendar, Plus, DoorOpen, X, Pencil, Sparkles, Package, Boxes, 
  Printer, QrCode, Search, Filter, ArrowRight, ArrowRightLeft,
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  FileText, Layers, Building2, User, Phone, MapPin, Eye, Wrench,
  BookOpen, ShieldCheck, Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ensureAssetUnits, 
  getAssetConditionStats, 
  formatConditionLabel, 
  getConditionBadgeColor, 
  getFundingSourceBadgeColor, 
  FUNDING_SOURCES,
  Asset,
  AssetUnit 
} from '../lib/assetUtils';

/**
 * Smart matcher for associating assets to rooms based on name or aliases.
 */
function isAssetInRoom(assetLocation: string, roomName: string): boolean {
  if (!assetLocation || !roomName) return false;
  const loc = assetLocation.toLowerCase().trim();
  const target = roomName.toLowerCase().trim();

  if (loc === target) return true;

  // Smart aliases
  if (target.includes('10a') && (loc.includes('10a') || loc.includes('x-a') || loc.includes('10-a') || loc.includes('x a'))) return true;
  if (target.includes('10b') && (loc.includes('10b') || loc.includes('x-b') || loc.includes('10-b') || loc.includes('x b'))) return true;
  if (target.includes('11b') && (loc.includes('11b') || loc.includes('xi-b') || loc.includes('11-b') || loc.includes('xi b'))) return true;
  if (target.includes('11a') && (loc.includes('11a') || loc.includes('xi-a') || loc.includes('11-a') || loc.includes('xi a'))) return true;
  if (target.includes('kepala sekolah') && (loc.includes('kepsek') || loc.includes('kepala sekolah') || loc.includes('pimpinan'))) return true;
  if (target.includes('lab rpl') && (loc.includes('lab rpl') || loc.includes('lab komputer 1') || loc.includes('lab komputer') || loc.includes('laboratorium rpl'))) return true;
  if (target.includes('server') && (loc.includes('server') || loc.includes('sarpras'))) return true;
  if (target.includes('studio') && (loc.includes('studio') || loc.includes('bisnis digital') || loc.includes('marketing'))) return true;
  if (target.includes('perpustakaan') && (loc.includes('perpustakaan') || loc.includes('perpus') || loc.includes('literasi'))) return true;
  if (target.includes('aula') && loc.includes('aula')) return true;

  return loc.includes(target) || target.includes(loc);
}

function SortableRoomCard({ 
  room, 
  onEdit, 
  onViewInventory,
  roomAssets 
}: { 
  room: any; 
  onEdit: (room: any) => void;
  onViewInventory: (room: any) => void;
  roomAssets: any[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  // Calculate room asset metrics
  const totalItems = roomAssets.length;
  let totalUnits = 0;
  let totalValue = 0;
  let goodUnits = 0;
  let damagedUnits = 0;

  roomAssets.forEach(ast => {
    const qty = parseInt(ast.quantity) || 1;
    totalUnits += qty;
    totalValue += (parseInt(ast.price) || 0) * qty;

    const stats = getAssetConditionStats(ast);
    goodUnits += stats.baik;
    damagedUnits += (stats.rusakRingan + stats.rusakBerat);
  });

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full touch-none outline-none">
      <Card 
        onClick={() => onViewInventory(room)}
        className={`group relative overflow-hidden transition-all duration-200 h-full cursor-pointer border-slate-200 dark:border-slate-800 hover:border-emerald-500/80 hover:shadow-lg dark:hover:border-emerald-500/50 hover:-translate-y-0.5 ${
          isDragging ? 'shadow-2xl scale-105 border-emerald-400 bg-emerald-50/20' : 'bg-white dark:bg-slate-900'
        }`}
      >
        {/* Accent top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-[#FFB800]" />

        <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                {room.name}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {room.description || 'Ruang pembelajaran & fasilitas'}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                type="button"
                title="Edit Informasi Ruangan"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onEdit(room); 
                }}
                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <div className="bg-emerald-100 dark:bg-emerald-950/80 p-2 rounded-xl text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <DoorOpen className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-5 pb-4 pt-1 space-y-3">
          {/* Capacity pill */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Kapasitas: <strong className="text-slate-900 dark:text-slate-100">{room.capacity}</strong> orang
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              KIR Terdata
            </span>
          </div>

          {/* Room Inventory Stats Highlight Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 transition-colors group-hover:bg-emerald-50/40 dark:group-hover:bg-emerald-950/20">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{totalItems} Jenis Barang</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                {totalUnits} Unit
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {goodUnits} Baik
              </span>
              {damagedUnits > 0 ? (
                <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {damagedUnits} Perlu Servis
                </span>
              ) : (
                <span className="text-slate-400">0 Kerusakan</span>
              )}
            </div>
          </div>

          {/* Action Footer Call-to-action */}
          <div className="pt-0.5 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
            <span className="flex items-center gap-1">
              <Boxes className="h-3.5 w-3.5" />
              Lihat Inventaris Ruangan
            </span>
            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Facilities() {
  const [rooms, setRooms] = useLocalStorage('iq-rooms', initialRooms);
  const [bookings, setBookings] = useLocalStorage('iq-bookings', initialBookings);
  const [assets, setAssets] = useLocalStorage<any[]>('iq-assets', initialAssets);
  const [books] = useLocalStorage<any[]>('iq-books', initialBooks);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRooms((items: any[]) => {
        const oldIndex = items.findIndex((i: any) => i.id === active.id);
        const newIndex = items.findIndex((i: any) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const activeRoom = activeId ? rooms.find((r: any) => r.id === activeId) : null;

  // Modals
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Room Inventory (KIR) Viewer Modal State
  const [selectedRoomForInventory, setSelectedRoomForInventory] = useState<any | null>(null);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [fundingFilter, setFundingFilter] = useState('ALL');
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  
  // QR Modal State
  const [showQRFor, setShowQRFor] = useState<{ code: string; name: string; title: string; room: string } | null>(null);
  
  // Reallocation / Add to Room Modal
  const [showReallocateModal, setShowReallocateModal] = useState(false);
  const [selectedAssetToReallocate, setSelectedAssetToReallocate] = useState<string>('');
  const [targetRoomName, setTargetRoomName] = useState<string>('');

  // Print KIR Modal
  const [showPrintKIR, setShowPrintKIR] = useState(false);

  // Form states
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', description: '' });
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newBooking, setNewBooking] = useState({ roomId: '', userName: '', date: '', timeSlot: '', purpose: '' });

  // Quick Add Asset directly to Room
  const [isQuickAddAssetOpen, setIsQuickAddAssetOpen] = useState(false);
  const [newRoomAsset, setNewRoomAsset] = useState({
    assetCode: '',
    name: '',
    category: 'Elektronik',
    quantity: 1,
    price: 500000,
    fundingSource: 'BOSP Reguler',
    condition: 'BAIK',
    responsible: 'Wali Kelas / PJ Ruangan'
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name || !newRoom.capacity) return;

    const roomData = {
      id: 'r' + Date.now().toString(),
      name: newRoom.name,
      capacity: parseInt(newRoom.capacity),
      description: newRoom.description
    };

    setRooms([...rooms, roomData]);
    setNewRoom({ name: '', capacity: '', description: '' });
    setIsAddRoomOpen(false);
  };

  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name || !editingRoom.capacity) return;

    const updatedRooms = rooms.map((r: any) => 
      r.id === editingRoom.id ? { ...r, ...editingRoom, capacity: parseInt(editingRoom.capacity) } : r
    );
    setRooms(updatedRooms);

    // If currently viewing inventory of this room, keep it synced
    if (selectedRoomForInventory && selectedRoomForInventory.id === editingRoom.id) {
      setSelectedRoomForInventory({ ...editingRoom, capacity: parseInt(editingRoom.capacity) });
    }

    setIsEditRoomOpen(false);
    setEditingRoom(null);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.roomId || !newBooking.userName || !newBooking.date || !newBooking.timeSlot || !newBooking.purpose) return;

    const bookingData = {
      id: 'b' + Date.now().toString(),
      roomId: newBooking.roomId,
      userName: newBooking.userName,
      date: newBooking.date,
      timeSlot: newBooking.timeSlot,
      purpose: newBooking.purpose,
      status: 'PENDING'
    };

    setBookings([bookingData, ...bookings]);
    setNewBooking({ roomId: '', userName: '', date: '', timeSlot: '', purpose: '' });
    setIsBookingOpen(false);
  };

  // Reallocate asset to room
  const handleReallocateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetToReallocate || !targetRoomName) return;

    setAssets((prev: any[]) => prev.map((ast: any) => {
      if (ast.id === selectedAssetToReallocate) {
        return {
          ...ast,
          location: targetRoomName,
          units: ensureAssetUnits(ast).map(u => ({ ...u, location: targetRoomName }))
        };
      }
      return ast;
    }));

    setShowReallocateModal(false);
    setSelectedAssetToReallocate('');
  };

  // Quick Add Asset directly into current room
  const handleQuickAddAssetToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForInventory || !newRoomAsset.name || !newRoomAsset.assetCode) return;

    const qty = Math.max(1, parseInt(String(newRoomAsset.quantity)) || 1);
    const newId = 'ast-' + Date.now().toString();

    const units: AssetUnit[] = Array.from({ length: qty }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-${newId}-${pad}`,
        unitCode: `${newRoomAsset.assetCode}-${pad}`,
        unitNumber: num,
        condition: newRoomAsset.condition as any,
        location: selectedRoomForInventory.name,
        notes: `Teralokasi di ${selectedRoomForInventory.name}`
      };
    });

    const newAssetObj: Asset = {
      id: newId,
      assetCode: newRoomAsset.assetCode,
      name: newRoomAsset.name,
      category: newRoomAsset.category,
      location: selectedRoomForInventory.name,
      condition: newRoomAsset.condition as any,
      quantity: qty,
      price: parseInt(String(newRoomAsset.price)) || 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      responsible: newRoomAsset.responsible || selectedRoomForInventory.name,
      fundingSource: newRoomAsset.fundingSource as any,
      depreciationGroup: 'Kelompok 1 (4 Tahun / 25%)',
      units
    };

    setAssets([...assets, newAssetObj]);
    setIsQuickAddAssetOpen(false);
    setNewRoomAsset({
      assetCode: '',
      name: '',
      category: 'Elektronik',
      quantity: 1,
      price: 500000,
      fundingSource: 'BOSP Reguler',
      condition: 'BAIK',
      responsible: 'Wali Kelas / PJ Ruangan'
    });
  };

  // Filtered assets in currently selected room
  const activeRoomAssets = useMemo(() => {
    if (!selectedRoomForInventory) return [];
    return assets.filter(ast => isAssetInRoom(ast.location, selectedRoomForInventory.name));
  }, [assets, selectedRoomForInventory]);

  const displayedRoomAssets = useMemo(() => {
    return activeRoomAssets.filter(ast => {
      // Search
      const searchMatch = !inventorySearchTerm || 
        ast.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
        ast.assetCode.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
        (ast.category && ast.category.toLowerCase().includes(inventorySearchTerm.toLowerCase())) ||
        (ast.units && ast.units.some((u: any) => u.unitCode.toLowerCase().includes(inventorySearchTerm.toLowerCase()) || (u.serialNumber && u.serialNumber.toLowerCase().includes(inventorySearchTerm.toLowerCase()))));

      // Category
      const catMatch = categoryFilter === 'ALL' || ast.category === categoryFilter;

      // Condition
      const condMatch = conditionFilter === 'ALL' || ast.condition === conditionFilter;

      // Funding
      const fundMatch = fundingFilter === 'ALL' || ast.fundingSource === fundingFilter;

      return searchMatch && catMatch && condMatch && fundMatch;
    });
  }, [activeRoomAssets, inventorySearchTerm, categoryFilter, conditionFilter, fundingFilter]);

  // Statistics for selected room
  const roomStats = useMemo(() => {
    let totalUnits = 0;
    let totalValue = 0;
    let baik = 0;
    let rusakRingan = 0;
    let rusakBerat = 0;

    activeRoomAssets.forEach(ast => {
      const qty = parseInt(ast.quantity) || 1;
      totalUnits += qty;
      totalValue += (parseInt(ast.price) || 0) * qty;

      const st = getAssetConditionStats(ast);
      baik += st.baik;
      rusakRingan += st.rusakRingan;
      rusakBerat += st.rusakBerat;
    });

    return {
      totalItems: activeRoomAssets.length,
      totalUnits,
      totalValue,
      baik,
      rusakRingan,
      rusakBerat
    };
  }, [activeRoomAssets]);

  // Categories present in this room
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    activeRoomAssets.forEach(a => { if (a.category) set.add(a.category); });
    return Array.from(set);
  }, [activeRoomAssets]);

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
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim Makassar
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Sistem Kartu Inventaris Ruangan (KIR)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              <span className="text-[#FFB800]">Fasilitas</span> & Inventaris Ruangan
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Klik pada kartu ruangan di bawah ini untuk menampilkan <strong>seluruh daftar inventaris barang</strong>, rincian unit fisik, status kondisi, QR Code, dan mencetak lembar KIR resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setIsAddRoomOpen(true)}
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <Plus className="h-4 w-4 mr-2 text-[#FFB800]" /> Tambah Ruangan
            </Button>
            <Button 
              onClick={() => setIsBookingOpen(true)}
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="h-4 w-4 mr-1.5 text-slate-950 font-extrabold" /> Booking Ruangan
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Helper Banner */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg shrink-0">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Petunjuk Eksplorasi Inventaris Ruangan:
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Klik pada kartu ruangan (contoh: <em>Ruang Kepala Sekolah, Kelas 10A, Kelas 10B, Lab RPL, dll.</em>) untuk membuka panel <strong>Kartu Inventaris Ruangan (KIR)</strong> lengkap dengan rincian unit fisik, nilai aset, dan tombol cetak.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="bg-white dark:bg-slate-900 border-emerald-300 text-emerald-800 dark:text-emerald-300">
            {rooms.length} Ruangan Terdaftar
          </Badge>
          <Badge variant="outline" className="bg-white dark:bg-slate-900 border-emerald-300 text-emerald-800 dark:text-emerald-300">
            {assets.length} Total Aset Sarpras
          </Badge>
        </div>
      </div>

      {/* Draggable Room Cards Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={rooms.map((r: any) => r.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room: any) => {
              const matchedAssets = assets.filter(ast => isAssetInRoom(ast.location, room.name));
              return (
                <SortableRoomCard 
                  key={room.id} 
                  room={room} 
                  roomAssets={matchedAssets}
                  onEdit={(r) => {
                    setEditingRoom(r);
                    setIsEditRoomOpen(true);
                  }}
                  onViewInventory={(r) => {
                    setSelectedRoomForInventory(r);
                    setInventorySearchTerm('');
                    setCategoryFilter('ALL');
                    setConditionFilter('ALL');
                    setFundingFilter('ALL');
                    setExpandedAssetId(null);
                  }}
                />
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
          {activeRoom ? (
            <div className="h-full">
              <Card className="shadow-2xl scale-105 border-emerald-400 h-full cursor-grabbing bg-white dark:bg-slate-900">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold">{activeRoom.name}</CardTitle>
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                      <DoorOpen className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xs text-slate-500 mb-2">{activeRoom.description}</p>
                  <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded">
                    Kapasitas: {activeRoom.capacity} orang
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Jadwal Penggunaan Ruangan Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Jadwal Penggunaan & Reservasi Ruangan
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring status peminjaman laboratorium, studio, dan ruang kelas SMK IT Ibnul Qayyim
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={() => setIsBookingOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Ajukan Reservasi
            </Button>
          </div>
        </CardHeader>
        <div className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/80">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Ruangan</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Peminjam / Guru</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Waktu</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Keperluan</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-sm">
                    Belum ada jadwal penggunaan ruangan yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking: any) => {
                  const room = rooms.find((r: any) => r.id === booking.roomId);
                  return (
                    <TableRow key={booking.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                        {room?.name || 'Ruangan Belum Terdata'}
                      </TableCell>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-xs">{booking.timeSlot}</TableCell>
                      <TableCell className="max-w-xs truncate">{booking.purpose}</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'APPROVED' ? 'success' : 
                          booking.status === 'PENDING' ? 'warning' : 'destructive'
                        }>
                          {booking.status === 'APPROVED' ? 'Disetujui' : booking.status === 'PENDING' ? 'Menunggu' : 'Ditolak'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: DAFTAR INVENTARIS RUANGAN & KARTU INVENTARIS RUANGAN (KIR)         */}
      {/* ========================================================================= */}
      {selectedRoomForInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header Bar */}
            <div className="bg-gradient-to-r from-[#032C24] via-[#043d32] to-[#02241D] text-white p-5 sm:p-6 border-b border-emerald-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div className="flex items-start gap-3.5">
                <div className="bg-[#FFB800] text-slate-950 p-2.5 sm:p-3 rounded-xl font-bold shadow-md shrink-0">
                  <DoorOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      KARTU INVENTARIS RUANGAN (KIR)
                    </span>
                    <span className="text-xs text-emerald-200/80 bg-black/20 px-2 py-0.5 rounded">
                      Kapasitas: {selectedRoomForInventory.capacity} Orang
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
                    {selectedRoomForInventory.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                    {selectedRoomForInventory.description || 'Lokasi pembelajaran dan kegiatan operasional sekolah'}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                <Button 
                  size="sm"
                  onClick={() => {
                    setShowPrintKIR(true);
                    setTimeout(() => window.print(), 200);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5 text-[#FFB800]" /> Cetak KIR
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsQuickAddAssetOpen(true)}
                  className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 text-xs font-bold shadow-md"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Aset ke Ruangan
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReallocateModal(true)}
                  className="bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border-emerald-700/50 text-xs font-medium"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Pindahkan Barang Masuk
                </Button>
                <button 
                  onClick={() => setSelectedRoomForInventory(null)}
                  className="p-2 text-emerald-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Stats, Filters, and Table */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
              
              {/* 4 Stat Summary Cards for Room */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <span>Jenis Barang</span>
                    <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                    {roomStats.totalItems} <span className="text-xs font-normal text-slate-500">Item</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">Katalog barang unik di ruangan</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <span>Total Unit Fisik</span>
                    <Boxes className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400">
                    {roomStats.totalUnits} <span className="text-xs font-normal text-slate-500">Unit</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">Total kuantitas barang fisik</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <span>Kondisi Fisik</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">{roomStats.baik} Baik</span>
                    {(roomStats.rusakRingan + roomStats.rusakBerat) > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        • {roomStats.rusakRingan + roomStats.rusakBerat} Rusak
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {roomStats.baik === roomStats.totalUnits && roomStats.totalUnits > 0 ? '100% Kondisi Prima' : `${roomStats.rusakRingan} Rusak Ringan, ${roomStats.rusakBerat} Rusak Berat`}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <span>Total Nilai Aset</span>
                    <Sparkles className="h-4 w-4 text-[#FFB800]" />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 truncate">
                    Rp {roomStats.totalValue.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">Valuasi perolehan inventaris</p>
                </div>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama barang, kode aset, serial number, atau merk..."
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100"
                  />
                  {inventorySearchTerm && (
                    <button 
                      onClick={() => setInventorySearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {availableCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Elektronik">Elektronik</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Perlengkapan">Perlengkapan</option>
                  </select>

                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value="ALL">Semua Kondisi</option>
                    <option value="BAIK">Kondisi Baik</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan</option>
                    <option value="RUSAK_BERAT">Rusak Berat</option>
                  </select>

                  <select
                    value={fundingFilter}
                    onChange={(e) => setFundingFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value="ALL">Semua Sumber Dana</option>
                    {FUNDING_SOURCES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table of Assets in Room */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Daftar Barang Inventaris Terdata di {selectedRoomForInventory.name}
                    </span>
                    <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                      {displayedRoomAssets.length} Item
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    Standar Inventarisasi Sarpras SMK IT Ibnul Qayyim
                  </span>
                </div>

                {displayedRoomAssets.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                      <Package className="h-7 w-7" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        Belum Ada Inventaris Terdata di Ruangan Ini
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Ruangan ini belum memiliki alokasi meja, kursi, komputer, atau peralatan lainnya. Anda dapat mendaftarkan barang baru atau memindahkan barang yang sudah ada.
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button 
                          size="sm"
                          onClick={() => setIsQuickAddAssetOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Barang Baru
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setShowReallocateModal(true)}
                          className="text-xs font-semibold"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Pindahkan dari Ruang Lain
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900">
                          <TableHead className="w-12 text-center">No</TableHead>
                          <TableHead>Kode & Nama Barang</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Sumber Anggaran</TableHead>
                          <TableHead className="text-center">Jumlah</TableHead>
                          <TableHead>Kondisi Unit</TableHead>
                          <TableHead className="text-right">Harga Satuan</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-center w-36">Aksi Cepat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedRoomAssets.map((asset, index) => {
                          const stats = getAssetConditionStats(asset);
                          const units = ensureAssetUnits(asset);
                          const isExpanded = expandedAssetId === asset.id;
                          const fundColor = getFundingSourceBadgeColor(asset.fundingSource || 'BOSP Reguler');
                          const unitPrice = parseInt(asset.price) || 0;
                          const subtotal = unitPrice * (parseInt(asset.quantity) || 1);

                          return (
                            <React.Fragment key={asset.id}>
                              <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                <TableCell className="text-center font-mono text-xs text-slate-500">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                                      {asset.name}
                                    </span>
                                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                      {asset.assetCode}
                                    </span>
                                    {asset.purchaseDate && (
                                      <span className="text-[10px] text-slate-400">
                                        Perolehan: {asset.purchaseDate}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                                    {asset.category || 'Umum'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${fundColor.bg} ${fundColor.text} ${fundColor.border}`}>
                                    {asset.fundingSource || 'BOSP Reguler'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-900 dark:text-slate-100">
                                  {asset.quantity} {asset.unitName || 'Unit'}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-1">
                                      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                        {stats.baik} Baik
                                      </span>
                                      {stats.rusakRingan > 0 && (
                                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                          {stats.rusakRingan} Rusak Ringan
                                        </span>
                                      )}
                                      {stats.rusakBerat > 0 && (
                                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                          {stats.rusakBerat} Rusak Berat
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                                      className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                                    >
                                      {isExpanded ? (
                                        <>Tutup Rincian Unit <ChevronUp className="h-3 w-3" /></>
                                      ) : (
                                        <>Lihat {units.length} Unit Fisik <ChevronDown className="h-3 w-3" /></>
                                      )}
                                    </button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-slate-600 dark:text-slate-300">
                                  Rp {unitPrice.toLocaleString('id-ID')}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                                  Rp {subtotal.toLocaleString('id-ID')}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      title="Tampilkan QR Code Aset"
                                      onClick={() => setShowQRFor({
                                        code: asset.assetCode,
                                        name: asset.name,
                                        title: `Aset: ${asset.name}`,
                                        room: selectedRoomForInventory.name
                                      })}
                                      className="p-1.5 h-8 w-8 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/80"
                                    >
                                      <QrCode className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      title="Rincian Unit & Barcode"
                                      onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                                      className="p-1.5 h-8 w-8 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* EXPANDED ACCORDION: Individual Physical Units Table */}
                              {isExpanded && (
                                <TableRow className="bg-slate-50/80 dark:bg-slate-950/60 border-y-2 border-emerald-500/30">
                                  <TableCell colSpan={9} className="p-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-inner space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Boxes className="h-4 w-4 text-emerald-600" />
                                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                            Daftar Unit Fisik & Serial Number: {asset.name}
                                          </h4>
                                        </div>
                                        <span className="text-xs text-slate-500">
                                          Total: {units.length} Unit Tersebar di {selectedRoomForInventory.name}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                                        {units.map((u, uIdx) => {
                                          const condColor = getConditionBadgeColor(u.condition);
                                          return (
                                            <div 
                                              key={u.id || uIdx}
                                              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-lg text-xs space-y-1.5 flex flex-col justify-between hover:border-emerald-400 transition-colors"
                                            >
                                              <div className="flex items-start justify-between gap-1">
                                                <div>
                                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                                                    {u.unitCode}
                                                  </span>
                                                  <span className="text-[11px] text-slate-500">
                                                    Unit #{u.unitNumber} {u.serialNumber ? `• SN: ${u.serialNumber}` : ''}
                                                  </span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => setShowQRFor({
                                                    code: u.unitCode,
                                                    name: `${asset.name} (Unit #${u.unitNumber})`,
                                                    title: `Unit Fisik: ${u.unitCode}`,
                                                    room: selectedRoomForInventory.name
                                                  })}
                                                  title="Lihat QR Code Unit"
                                                  className="p-1 text-slate-400 hover:text-emerald-600 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"
                                                >
                                                  <QrCode className="h-3.5 w-3.5" />
                                                </button>
                                              </div>

                                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                                                <span className={`px-1.5 py-0.5 rounded font-semibold border ${condColor.bg} ${condColor.text} ${condColor.border}`}>
                                                  {formatConditionLabel(u.condition)}
                                                </span>
                                                <span className="text-slate-500 truncate max-w-[130px]" title={u.notes || 'Normal'}>
                                                  {u.notes || 'Normal'}
                                                </span>
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
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span>
                  Penanggung Jawab Ruangan: <strong className="text-slate-800 dark:text-slate-200">{selectedRoomForInventory.name.includes('Kepala') ? 'Anto, S.E.I., M.E., Gr., MCF. (Kepsek)' : selectedRoomForInventory.name.includes('Lab') ? 'Ustadz Anton, S.Kom (Kepala Lab)' : 'Wali Kelas & Staf Sarpras'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrintKIR(true)}
                  className="font-semibold text-xs"
                >
                  <Printer className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Format Cetak KIR
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setSelectedRoomForInventory(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
                >
                  Tutup Panel
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CETAK KARTU INVENTARIS RUANGAN (KIR)                                 */}
      {/* ========================================================================= */}
      {showPrintKIR && selectedRoomForInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Printer className="h-4 w-4 text-[#FFB800]" />
                Pratinjau Cetak: Kartu Inventaris Ruangan (KIR)
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-[#FFB800] hover:bg-[#FFA500] text-slate-950 font-bold text-xs shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Cetak Lembar KIR Sekarang
                </Button>
                <button 
                  onClick={() => setShowPrintKIR(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto flex-1 bg-white space-y-6 text-slate-900 font-sans print:p-0">
              
              {/* KOP RESMI SEKOLAH */}
              <div className="border-b-2 border-slate-900 pb-4 text-center relative">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  YAYASAN PENDIDIKAN IBNUL QAYYIM MAKASSAR
                </h3>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-wide mt-0.5">
                  SMK IT IBNUL QAYYIM MAKASSAR
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  NPSN: 69987654 • NSS: 321046001234 • Status: Terakreditasi Baik Sekali<br />
                  Jl. Berua Raya No. 12, Daya, Kec. Biringkanaya, Kota Makassar, Sulawesi Selatan 90243<br />
                  Email: info@smkit.sch.id • Website: https://smkit-ibnulqayyim.sch.id
                </p>
              </div>

              {/* JUDUL DOKUMEN KIR */}
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black uppercase tracking-wider underline decoration-2 underline-offset-4">
                  KARTU INVENTARIS RUANGAN (KIR)
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  Tahun Anggaran / Pembelajaran: 2026 / 2027
                </p>
              </div>

              {/* IDENTITAS RUANGAN */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="font-semibold w-36 py-0.5">Nama Ruangan</td>
                        <td className="font-bold">: {selectedRoomForInventory.name}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Lokasi / Gedung</td>
                        <td>: {selectedRoomForInventory.description || 'Gedung Utama SMK IT'}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Kapasitas Ruang</td>
                        <td>: {selectedRoomForInventory.capacity} Orang</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="font-semibold w-36 py-0.5">Penanggung Jawab</td>
                        <td className="font-bold">: {selectedRoomForInventory.name.includes('Kepala') ? 'Anto, S.E.I., M.E., Gr., MCF.' : selectedRoomForInventory.name.includes('Lab') ? 'Ustadz Anton, S.Kom' : 'Wali Kelas / Guru Pembina'}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Unit Kerja / Jurusan</td>
                        <td>: Sarana & Prasarana Vokasi</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Tanggal Cetak</td>
                        <td>: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL INVENTARIS RESMI */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-2 text-center border-r border-slate-300 w-10">No</th>
                      <th className="p-2 border-r border-slate-300">Kode Barang</th>
                      <th className="p-2 border-r border-slate-300">Nama Barang & Merk / Spesifikasi</th>
                      <th className="p-2 border-r border-slate-300">Kategori</th>
                      <th className="p-2 border-r border-slate-300">Sumber Dana</th>
                      <th className="p-2 text-center border-r border-slate-300 w-12">Qty</th>
                      <th className="p-2 text-center border-r border-slate-300 w-24">Kondisi (B/RR/RB)</th>
                      <th className="p-2 text-right">Nilai Perolehan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRoomAssets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                          Tidak ada catatan barang inventaris pada ruangan ini.
                        </td>
                      </tr>
                    ) : (
                      activeRoomAssets.map((ast, idx) => {
                        const stats = getAssetConditionStats(ast);
                        const qty = parseInt(ast.quantity) || 1;
                        const price = parseInt(ast.price) || 0;
                        return (
                          <tr key={ast.id} className="border-b border-slate-200">
                            <td className="p-2 text-center border-r border-slate-200">{idx + 1}</td>
                            <td className="p-2 font-mono font-semibold border-r border-slate-200">{ast.assetCode}</td>
                            <td className="p-2 font-medium border-r border-slate-200">{ast.name}</td>
                            <td className="p-2 border-r border-slate-200">{ast.category}</td>
                            <td className="p-2 border-r border-slate-200">{ast.fundingSource || 'BOSP Reguler'}</td>
                            <td className="p-2 text-center font-bold border-r border-slate-200">{qty}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-semibold">
                              {stats.baik > 0 && <span className="text-emerald-700">{stats.baik} Baik </span>}
                              {stats.rusakRingan > 0 && <span className="text-amber-700">| {stats.rusakRingan} RR </span>}
                              {stats.rusakBerat > 0 && <span className="text-rose-700">| {stats.rusakBerat} RB</span>}
                            </td>
                            <td className="p-2 text-right font-mono">Rp {(price * qty).toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td colSpan={5} className="p-2 text-right border-r border-slate-300">TOTAL JUMLAH INVENTARIS:</td>
                      <td className="p-2 text-center border-r border-slate-300">{roomStats.totalUnits} Unit</td>
                      <td className="p-2 text-center border-r border-slate-300">{roomStats.baik} B • {roomStats.rusakRingan + roomStats.rusakBerat} R</td>
                      <td className="p-2 text-right font-mono">Rp {roomStats.totalValue.toLocaleString('id-ID')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* TANDA TANGAN RESMI */}
              <div className="pt-8 grid grid-cols-2 text-xs text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala SMK IT Ibnul Qayyim</p>
                  <div className="h-16" />
                  <p className="font-bold underline uppercase">Anto, S.E.I., M.E., Gr., MCF.</p>
                  <p className="text-[11px] text-slate-500">NIP: 19780412 200501 1 004</p>
                </div>
                <div>
                  <p>Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">Penanggung Jawab Ruangan</p>
                  <div className="h-16" />
                  <p className="font-bold underline uppercase">
                    {selectedRoomForInventory.name.includes('Kepala') ? 'Anto, S.E.I., M.E., Gr., MCF.' : selectedRoomForInventory.name.includes('Lab') ? 'Ustadz Anton, S.Kom' : 'Wali Kelas / Guru Pembina'}
                  </p>
                  <p className="text-[11px] text-slate-500">NIP / NUPTK: 19850920 201101 1 012</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL QR CODE VIEWER                                                      */}
      {/* ========================================================================= */}
      {showQRFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl text-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {showQRFor.title}
              </span>
              <button onClick={() => setShowQRFor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG 
                value={`https://smkit.sch.id/inv/${showQRFor.code}`} 
                size={180} 
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{showQRFor.name}</h4>
              <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{showQRFor.code}</p>
              <p className="text-xs text-slate-500 mt-1">Lokasi: {showQRFor.room}</p>
            </div>

            <div className="pt-2 flex justify-center gap-2">
              <Button size="sm" onClick={() => window.print()} className="text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" /> Cetak Stiker QR
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowQRFor(null)} className="text-xs">
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL QUICK ADD ASSET DIRECTLY TO ROOM                                    */}
      {/* ========================================================================= */}
      {isQuickAddAssetOpen && selectedRoomForInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base sm:text-lg">Tambah Inventaris ke {selectedRoomForInventory.name}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Daftarkan aset baru langsung dialokasikan ke ruangan ini</p>
                </div>
                <button onClick={() => setIsQuickAddAssetOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleQuickAddAssetToRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kode Aset</label>
                    <input
                      type="text"
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-mono"
                      placeholder="INV-MJ-002"
                      value={newRoomAsset.assetCode}
                      onChange={(e) => setNewRoomAsset({...newRoomAsset, assetCode: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
                    <select
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newRoomAsset.category}
                      onChange={(e) => setNewRoomAsset({...newRoomAsset, category: e.target.value})}
                    >
                      <option value="Elektronik">Elektronik</option>
                      <option value="Furnitur">Furnitur</option>
                      <option value="Perlengkapan">Perlengkapan</option>
                      <option value="Media Belajar">Media Belajar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Barang & Merk / Spesifikasi</label>
                  <input
                    type="text"
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Contoh: Meja Belajar Siswa Kayu Jati"
                    value={newRoomAsset.name}
                    onChange={(e) => setNewRoomAsset({...newRoomAsset, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jumlah Unit</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newRoomAsset.quantity}
                      onChange={(e) => setNewRoomAsset({...newRoomAsset, quantity: parseInt(e.target.value) || 1})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newRoomAsset.price}
                      onChange={(e) => setNewRoomAsset({...newRoomAsset, price: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sumber Anggaran</label>
                    <select
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newRoomAsset.fundingSource}
                      onChange={(e) => setNewRoomAsset({...newRoomAsset, fundingSource: e.target.value})}
                    >
                      {FUNDING_SOURCES.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kondisi Awal</label>
                    <select
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newRoomAsset.condition}
                      onChange={(e) => setNewRoomAsset({...newRoomAsset, condition: e.target.value})}
                    >
                      <option value="BAIK">Baik (Siap Pakai)</option>
                      <option value="RUSAK_RINGAN">Rusak Ringan</option>
                      <option value="RUSAK_BERAT">Rusak Berat</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsQuickAddAssetOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    Simpan & Alokasikan ke Ruangan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL REALLOCATE ASSET TO THIS ROOM                                       */}
      {/* ========================================================================= */}
      {showReallocateModal && selectedRoomForInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
                  Pindahkan Barang ke {selectedRoomForInventory.name}
                </CardTitle>
                <button onClick={() => setShowReallocateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleReallocateAsset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Barang yang Akan Dipindahkan</label>
                  <select
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={selectedAssetToReallocate}
                    onChange={(e) => {
                      setSelectedAssetToReallocate(e.target.value);
                      setTargetRoomName(selectedRoomForInventory.name);
                    }}
                    required
                  >
                    <option value="" disabled>-- Pilih dari Daftar Semua Aset Sarpras --</option>
                    {assets.map((ast: any) => (
                      <option key={ast.id} value={ast.id}>
                        [{ast.assetCode}] {ast.name} (Saat ini di: {ast.location || 'Gudang/Belum Terdata'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  Barang yang dipilih beserta seluruh unit fisiknya akan dipindahkan lokasinya ke: <strong>{selectedRoomForInventory.name}</strong>.
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowReallocateModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    Konfirmasi Pemindahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH RUANGAN                                                      */}
      {/* ========================================================================= */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Tambah Ruangan Baru</CardTitle>
              <button onClick={() => setIsAddRoomOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Ruangan</label>
                  <input
                    type="text"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Contoh: Lab Komputer 2"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Contoh: 36"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi / Lokasi Gedung</label>
                  <textarea
                    className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-[80px]"
                    placeholder="Contoh: Lantai 2 Gedung B Bagian Utara"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddRoomOpen(false)}>Batal</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Simpan Ruangan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT RUANGAN                                                        */}
      {/* ========================================================================= */}
      {isEditRoomOpen && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Edit Informasi Ruangan</CardTitle>
              <button onClick={() => { setIsEditRoomOpen(false); setEditingRoom(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleEditRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Ruangan</label>
                  <input
                    type="text"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={editingRoom.name}
                    onChange={(e) => setEditingRoom({...editingRoom, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={editingRoom.capacity}
                    onChange={(e) => setEditingRoom({...editingRoom, capacity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi / Lokasi Gedung</label>
                  <textarea
                    className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-[80px]"
                    value={editingRoom.description}
                    onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setIsEditRoomOpen(false); setEditingRoom(null); }}>Batal</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Simpan Perubahan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL BOOKING RUANGAN                                                     */}
      {/* ========================================================================= */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Formulir Booking Ruangan</CardTitle>
              <button onClick={() => setIsBookingOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Ruangan</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={newBooking.roomId}
                    onChange={(e) => setNewBooking({...newBooking, roomId: e.target.value})}
                    required
                  >
                    <option value="" disabled>-- Pilih Ruangan --</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name} (Kapasitas: {r.capacity})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Peminjam / Guru</label>
                  <input
                    type="text"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Nama Lengkap"
                    value={newBooking.userName}
                    onChange={(e) => setNewBooking({...newBooking, userName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
                    <input
                      type="date"
                      className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Waktu / Jam</label>
                    <input
                      type="text"
                      className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="08:00 - 10:00"
                      value={newBooking.timeSlot}
                      onChange={(e) => setNewBooking({...newBooking, timeSlot: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Keperluan</label>
                  <textarea
                    className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-[80px]"
                    placeholder="Contoh: Praktikum Pemrograman Web Kelas X-A"
                    value={newBooking.purpose}
                    onChange={(e) => setNewBooking({...newBooking, purpose: e.target.value})}
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>Batal</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Ajukan Booking</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
