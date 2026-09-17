import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Printer, 
  DollarSign, 
  ArrowRight, 
  CheckCircle, 
  History, 
  Layers, 
  Wind, 
  Monitor, 
  Zap, 
  Maximize2, 
  ChevronRight, 
  Phone, 
  Building2, 
  Info, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialAssets, initialMaintenanceRecords, MaintenanceRecord, initialRooms } from '../store/data';

export default function Maintenance() {
  const [assets, setAssets] = useLocalStorage('iq-assets', initialAssets);
  const [maintenances, setMaintenances] = useLocalStorage('iq-maintenances', initialMaintenanceRecords);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);

  const [activeTab, setActiveTab] = useState<'jadwal' | 'perbaikan' | 'riwayat' | 'spk'>('jadwal');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('SEMUA');
  const [filterStatus, setFilterStatus] = useState('SEMUA');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteRepairModal, setShowCompleteRepairModal] = useState(false);
  const [showQuickWashModal, setShowQuickWashModal] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<MaintenanceRecord | null>(null);

  // Selected targets for modals
  const [targetAssetForAction, setTargetAssetForAction] = useState<any>(null);
  const [targetUnitForAction, setTargetUnitForAction] = useState<any>(null);
  const [targetMaintenanceForAction, setTargetMaintenanceForAction] = useState<MaintenanceRecord | null>(null);

  // Form State for new/edit maintenance
  const [formState, setFormState] = useState({
    ticketNumber: '',
    assetId: '',
    unitCode: '',
    type: 'RUTIN' as 'RUTIN' | 'PERBAIKAN' | 'DARURAT',
    title: '',
    serviceDate: new Date().toISOString().split('T')[0],
    intervalDays: 90,
    status: 'SELESAI' as 'SELESAI' | 'SEDANG_DIKERJAKAN' | 'TERJADWAL',
    resultCondition: 'BAIK' as 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT',
    cost: 0,
    technician: '',
    technicianPhone: '',
    vendorCompany: '',
    partsReplaced: '',
    notes: '',
    autoUpdateConditionToGood: true
  });

  // Calculate Routine Maintenance Schedule (Cuci AC, Servis PC, Cek Genset, dll)
  const scheduledAssets = useMemo(() => {
    return assets.map((asset: any) => {
      const lastDateStr = asset.lastServiceDate || asset.purchaseDate || '2026-01-01';
      const interval = asset.maintenanceIntervalDays || 90;
      
      const lastDate = new Date(lastDateStr);
      const nextDate = new Date(lastDate.getTime() + interval * 24 * 60 * 60 * 1000);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      const today = new Date();
      // Set to midnight for accurate day difference
      today.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let scheduleStatus: 'AMAN' | 'SEGERA' | 'TERLAMBAT' = 'AMAN';
      if (diffDays < 0) {
        scheduleStatus = 'TERLAMBAT';
      } else if (diffDays <= 30) {
        scheduleStatus = 'SEGERA';
      }

      // Check if it's an AC or similar appliance
      const isAC = asset.name?.toLowerCase().includes('ac') || asset.name?.toLowerCase().includes('air conditioner');
      const isComputer = asset.name?.toLowerCase().includes('komputer') || asset.name?.toLowerCase().includes('pc');
      const isGenset = asset.name?.toLowerCase().includes('genset');

      let defaultServiceTitle = `Servis Rutin Berkala (${interval} Hari)`;
      if (isAC) defaultServiceTitle = `Cuci Steam AC & Pembersihan Filter (Siklus ${interval} Hari)`;
      if (isComputer) defaultServiceTitle = `Pembersihan Hardware Lab & Cek Thermal Pasta (${interval} Hari)`;
      if (isGenset) defaultServiceTitle = `Pengecekan Aki, Oli Mesin & Filter Genset (${interval} Hari)`;

      return {
        ...asset,
        lastServiceDateStr: lastDateStr,
        nextServiceDateStr: nextDateStr,
        diffDays,
        scheduleStatus,
        isAC,
        isComputer,
        isGenset,
        defaultServiceTitle
      };
    }).sort((a, b) => a.diffDays - b.diffDays);
  }, [assets]);

  // List of all currently damaged units / assets needing repair
  const damagedItemsList = useMemo(() => {
    const list: any[] = [];
    assets.forEach((asset: any) => {
      const units = asset.units || [
        {
          id: `u-${asset.id}-01`,
          unitCode: `${asset.assetCode}-01`,
          unitNumber: 1,
          condition: asset.condition,
          notes: asset.notes || ''
        }
      ];

      units.forEach((u: any) => {
        if (u.condition === 'RUSAK_RINGAN' || u.condition === 'RUSAK_BERAT' || asset.condition === 'RUSAK_RINGAN' || asset.condition === 'RUSAK_BERAT') {
          // Find if there is an active in-progress ticket
          const activeTicket = maintenances.find(
            (m: MaintenanceRecord) => (m.assetId === asset.id || m.unitCode === u.unitCode) && (m.status === 'SEDANG_DIKERJAKAN' || m.status === 'TERJADWAL')
          );

          list.push({
            assetId: asset.id,
            assetCode: asset.assetCode,
            assetName: asset.name,
            category: asset.category,
            location: asset.location,
            unitId: u.id,
            unitCode: u.unitCode,
            unitNumber: u.unitNumber,
            condition: u.condition || asset.condition,
            notes: u.notes || 'Butuh penanganan perbaikan',
            activeTicket
          });
        }
      });
    });
    return list;
  }, [assets, maintenances]);

  // Statistics
  const overdueCount = scheduledAssets.filter(a => a.scheduleStatus === 'TERLAMBAT').length;
  const urgentCount = scheduledAssets.filter(a => a.scheduleStatus === 'SEGERA').length;
  const damagedCount = damagedItemsList.length;
  const inProgressCount = maintenances.filter(m => m.status === 'SEDANG_DIKERJAKAN').length;
  const completedCount = maintenances.filter(m => m.status === 'SELESAI').length;
  const totalCost = maintenances.reduce((acc, m) => acc + (m.cost || 0), 0);

  // Filtered Routine Schedules
  const filteredScheduledAssets = useMemo(() => {
    return scheduledAssets.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(query) || 
                          item.assetCode.toLowerCase().includes(query) || 
                          item.location?.toLowerCase().includes(query);
      
      const matchCategory = filterCategory === 'SEMUA' || 
                            (filterCategory === 'AC' && item.isAC) ||
                            (filterCategory === 'KOMPUTER' && item.isComputer) ||
                            (filterCategory === 'GENSET' && item.isGenset) ||
                            (filterCategory === item.category);

      const matchStatus = filterStatus === 'SEMUA' || item.scheduleStatus === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [scheduledAssets, searchQuery, filterCategory, filterStatus]);

  // Filtered History
  const filteredMaintenances = useMemo(() => {
    return maintenances.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchSearch = item.title.toLowerCase().includes(query) || 
                          item.assetName.toLowerCase().includes(query) || 
                          item.assetCode.toLowerCase().includes(query) || 
                          item.ticketNumber.toLowerCase().includes(query) || 
                          item.technician?.toLowerCase().includes(query) || 
                          item.location?.toLowerCase().includes(query);

      const matchCategory = filterCategory === 'SEMUA' || item.category?.toLowerCase().includes(filterCategory.toLowerCase());
      const matchStatus = filterStatus === 'SEMUA' || item.status === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    }).sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  }, [maintenances, searchQuery, filterCategory, filterStatus]);

  // Handler: Open Add Modal
  const handleOpenAddModal = (presetAsset?: any, presetType: 'RUTIN' | 'PERBAIKAN' = 'RUTIN') => {
    const randomTicket = `SPK-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    
    if (presetAsset) {
      const isAC = presetAsset.name?.toLowerCase().includes('ac');
      const title = presetType === 'RUTIN' 
        ? (isAC ? 'Cuci Steam AC & Pembersihan Filter Rutin' : `Servis Berkala ${presetAsset.name}`)
        : `Perbaikan Kerusakan ${presetAsset.name}`;

      setFormState({
        ticketNumber: randomTicket,
        assetId: presetAsset.id || presetAsset.assetId,
        unitCode: presetAsset.unitCode || '',
        type: presetType,
        title,
        serviceDate: new Date().toISOString().split('T')[0],
        intervalDays: presetAsset.maintenanceIntervalDays || 90,
        status: 'SELESAI',
        resultCondition: 'BAIK',
        cost: presetType === 'RUTIN' ? (isAC ? 150000 : 200000) : 350000,
        technician: 'Pak Joko (Teknisi)',
        technicianPhone: '0812-3456-7890',
        vendorCompany: isAC ? 'CV Berkah Sejuk AC' : 'Teknisi Sarpras IT',
        partsReplaced: presetType === 'RUTIN' ? 'Pembersihan filter & cek freon' : 'Penggantian suku cadang',
        notes: presetType === 'RUTIN' 
          ? 'Pembersihan unit secara menyeluruh, talang air, kondensor outdoor, dan uji fungsi normal.'
          : 'Pengerjaan perbaikan telah tuntas, kondisi fisik dan operasional barang kembali prima (BAIK).',
        autoUpdateConditionToGood: true
      });
    } else {
      setFormState({
        ticketNumber: randomTicket,
        assetId: assets[0]?.id || '',
        unitCode: '',
        type: presetType,
        title: presetType === 'RUTIN' ? 'Servis Rutin Berkala' : 'Perbaikan Kerusakan Aset',
        serviceDate: new Date().toISOString().split('T')[0],
        intervalDays: 90,
        status: 'SELESAI',
        resultCondition: 'BAIK',
        cost: 150000,
        technician: '',
        technicianPhone: '',
        vendorCompany: '',
        partsReplaced: '',
        notes: '',
        autoUpdateConditionToGood: true
      });
    }
    setShowAddModal(true);
  };

  // Handler: Submit Maintenance Form
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAsset = assets.find(a => a.id === formState.assetId);
    if (!selectedAsset) return;

    const newRecordId = `m-${Date.now()}`;
    const nextDueDateObj = new Date(new Date(formState.serviceDate).getTime() + (formState.intervalDays || 90) * 24 * 60 * 60 * 1000);
    const nextDueDate = nextDueDateObj.toISOString().split('T')[0];

    const newRecord: MaintenanceRecord = {
      id: newRecordId,
      ticketNumber: formState.ticketNumber || `SPK-${Date.now().toString().slice(-6)}`,
      assetId: selectedAsset.id,
      assetCode: selectedAsset.assetCode,
      assetName: selectedAsset.name,
      unitCode: formState.unitCode || undefined,
      location: selectedAsset.location,
      category: selectedAsset.category,
      type: formState.type,
      title: formState.title,
      serviceDate: formState.serviceDate,
      nextDueDate: formState.type === 'RUTIN' ? nextDueDate : undefined,
      intervalDays: formState.intervalDays,
      status: formState.status,
      previousCondition: (selectedAsset.condition as 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT') || 'BAIK',
      resultCondition: formState.resultCondition,
      cost: Number(formState.cost) || 0,
      technician: formState.technician,
      technicianPhone: formState.technicianPhone,
      vendorCompany: formState.vendorCompany,
      partsReplaced: formState.partsReplaced,
      notes: formState.notes,
      documentedBy: 'Admin Sarpras',
      createdAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    };

    // 1. Add to maintenance records
    setMaintenances([newRecord, ...maintenances]);

    // 2. Update asset master record
    setAssets(assets.map((a: any) => {
      if (a.id === selectedAsset.id) {
        const updatedAsset = { ...a };
        
        // Update last service date & interval
        if (formState.status === 'SELESAI') {
          updatedAsset.lastServiceDate = formState.serviceDate;
          updatedAsset.maintenanceIntervalDays = formState.intervalDays;
        }

        // If repair finished & auto update condition is enabled
        if (formState.status === 'SELESAI' && formState.autoUpdateConditionToGood) {
          updatedAsset.condition = formState.resultCondition;

          // Also update specific unit condition if unitCode was targeted
          if (formState.unitCode && updatedAsset.units) {
            updatedAsset.units = updatedAsset.units.map((u: any) => {
              if (u.unitCode === formState.unitCode) {
                return {
                  ...u,
                  condition: formState.resultCondition,
                  notes: `Diperbaiki pada ${formState.serviceDate}: ${formState.notes || 'Selesai diservis'}`
                };
              }
              return u;
            });
          } else if (updatedAsset.units) {
            // Update all units
            updatedAsset.units = updatedAsset.units.map((u: any) => ({
              ...u,
              condition: formState.resultCondition
            }));
          }
        }

        return updatedAsset;
      }
      return a;
    }));

    setShowAddModal(false);
  };

  // Quick Action: Selesaikan Cuci AC / Servis Rutin
  const handleQuickWashSubmit = (asset: any) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const interval = asset.maintenanceIntervalDays || 90;
    const nextDateObj = new Date(new Date().getTime() + interval * 24 * 60 * 60 * 1000);
    const nextDueDate = nextDateObj.toISOString().split('T')[0];

    const isAC = asset.name?.toLowerCase().includes('ac');
    const title = isAC 
      ? `Cuci Steam AC & Pembersihan Filter (Selesai Tepat Waktu)` 
      : `Servis Rutin Berkala Selesai`;

    const newRecord: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      ticketNumber: `SPK-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      location: asset.location,
      category: asset.category,
      type: 'RUTIN',
      title,
      serviceDate: todayStr,
      nextDueDate,
      intervalDays: interval,
      status: 'SELESAI',
      previousCondition: asset.condition || 'BAIK',
      resultCondition: 'BAIK',
      cost: isAC ? 150000 : 200000,
      technician: 'Pak Joko (Teknisi AC)',
      technicianPhone: '0812-3456-7890',
      vendorCompany: 'CV Berkah Sejuk AC',
      partsReplaced: 'Pembersihan evaporator, filter udara, dan cek tekanan freon',
      notes: `Pencucian berkala telah dilaksanakan pada ${todayStr}. Tekanan freon stabil, pendinginan optimal, dan talang pembuangan air bersih lancar. Jadwal cuci berikutnya: ${nextDueDate}.`,
      documentedBy: 'Sarpras Sekolah',
      createdAt: `${todayStr} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    };

    setMaintenances([newRecord, ...maintenances]);

    // Update asset lastServiceDate
    setAssets(assets.map((a: any) => {
      if (a.id === asset.id) {
        return {
          ...a,
          lastServiceDate: todayStr,
          condition: 'BAIK',
          units: a.units ? a.units.map((u: any) => ({ ...u, condition: 'BAIK' })) : a.units
        };
      }
      return a;
    }));

    setShowQuickWashModal(false);
    setTargetAssetForAction(null);
  };

  // Quick Action: Selesaikan Perbaikan Barang Rusak -> Pulihkan ke BAIK
  const handleQuickCompleteRepair = (damagedItem: any) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isAC = damagedItem.assetName?.toLowerCase().includes('ac');

    const newRecord: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      ticketNumber: damagedItem.activeTicket?.ticketNumber || `SPK-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId: damagedItem.assetId,
      assetCode: damagedItem.assetCode,
      assetName: damagedItem.assetName,
      unitCode: damagedItem.unitCode,
      unitNumber: damagedItem.unitNumber,
      location: damagedItem.location,
      category: damagedItem.category,
      type: 'PERBAIKAN',
      title: `Perbaikan Tuntas & Pemulihan Kondisi ${damagedItem.assetName}`,
      serviceDate: todayStr,
      status: 'SELESAI',
      previousCondition: (damagedItem.condition as 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT') || 'RUSAK_RINGAN',
      resultCondition: 'BAIK',
      cost: 250000,
      technician: 'Teknisi Mitra Sarpras',
      technicianPhone: '0857-1122-3344',
      vendorCompany: isAC ? 'Sejuk Abadi Service' : 'Mitra Teknisi Sarpras',
      partsReplaced: 'Suku cadang diganti & disetel ulang',
      notes: `Perbaikan kerusakan pada unit ${damagedItem.unitCode || damagedItem.assetCode} berhasil diselesaikan. Seluruh fungsi telah diuji coba dan kembali beroperasi normal (Status: BAIK).`,
      documentedBy: 'Admin Sarpras',
      createdAt: `${todayStr} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    };

    setMaintenances([newRecord, ...maintenances]);

    // Update asset condition to BAIK
    setAssets(assets.map((a: any) => {
      if (a.id === damagedItem.assetId) {
        const updatedUnits = a.units ? a.units.map((u: any) => {
          if (u.unitCode === damagedItem.unitCode || u.id === damagedItem.unitId) {
            return {
              ...u,
              condition: 'BAIK',
              notes: `Selesai diperbaiki pada ${todayStr}. Berfungsi normal.`
            };
          }
          return u;
        }) : a.units;

        // Check if any unit is still broken
        const hasBrokenUnit = updatedUnits?.some((u: any) => u.condition === 'RUSAK_BERAT' || u.condition === 'RUSAK_RINGAN');

        return {
          ...a,
          condition: hasBrokenUnit ? 'RUSAK_RINGAN' : 'BAIK',
          lastServiceDate: todayStr,
          units: updatedUnits
        };
      }
      return a;
    }));

    setShowCompleteRepairModal(false);
    setTargetAssetForAction(null);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
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
              <span className="text-[#FFB800]">Pemeliharaan</span> & Perbaikan Aset
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Jadwal servis berkala, pencatatan perbaikan barang rusak, riwayat pengerjaan teknisi, dan pembaruan otomatis status kelayakan aset.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Button 
              onClick={() => handleOpenAddModal()} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Catat Servis / Perbaikan
            </Button>
            <Button 
              onClick={() => {
                setActiveTab('spk');
                setTimeout(() => window.print(), 200);
              }} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Cetak SPK / Rekap
            </Button>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics / Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Card 1: Cuci AC & Servis Berkala */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jadwal Servis & Cuci AC</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{scheduledAssets.length}</span>
              <span className="text-xs font-medium text-slate-400">unit terjadwal</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {overdueCount > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" /> {overdueCount} Jatuh Tempo
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Semua Tepat Waktu
                </span>
              )}
              {urgentCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  &bull; {urgentCount} Segera
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Wind className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Antrean Barang Rusak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Barang Butuh Perbaikan</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${damagedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {damagedCount}
              </span>
              <span className="text-xs font-medium text-slate-400">unit rusak</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {inProgressCount > 0 ? `${inProgressCount} sedang dikerjakan teknisi` : 'Belum ada tiket aktif'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Servis & Perbaikan Selesai */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Riwayat Selesai</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</span>
              <span className="text-xs font-medium text-slate-400">pekerjaan tuntas</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Status Aset Terpulihkan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Biaya Pemeliharaan */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Biaya Servis / Jasa</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(totalCost)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Akumulasi anggaran perawatan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs print:hidden">
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'jadwal'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wind className="w-4 h-4 mr-2" /> Jadwal Servis Rutin & Cuci AC
          {overdueCount > 0 && (
            <span className="ml-2 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full">
              {overdueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('perbaikan')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'perbaikan'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 mr-2" /> Antrean Perbaikan Kerusakan
          {damagedCount > 0 && (
            <span className="ml-2 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
              {damagedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'riwayat'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4 mr-2" /> Riwayat Lengkap & Log Servis ({maintenances.length})
        </button>

        <button
          onClick={() => setActiveTab('spk')}
          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'spk'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#E67E00] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" /> Surat Perintah Kerja (SPK) & Cetak
        </button>
      </div>

      {/* Filters & Search Toolbar (for Tabs 1, 2, 3) */}
      {activeTab !== 'spk' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari aset, AC, nomor tiket SPK, teknisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {activeTab === 'jadwal' && (
              <>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-10 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-medium"
                >
                  <option value="SEMUA">Semua Kategori</option>
                  <option value="AC">Khusus AC & Pendingin</option>
                  <option value="KOMPUTER">Komputer & Lab IT</option>
                  <option value="GENSET">Genset & Daya</option>
                  <option value="Elektronik">Elektronik & Multimedia</option>
                  <option value="Furnitur">Furnitur</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-medium"
                >
                  <option value="SEMUA">Semua Waktu Servis</option>
                  <option value="TERLAMBAT">🔴 Jatuh Tempo / Terlambat</option>
                  <option value="SEGERA">🟡 Segera (&lt; 30 Hari)</option>
                  <option value="AMAN">🟢 Aman</option>
                </select>
              </>
            )}

            {activeTab === 'riwayat' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-medium"
              >
                <option value="SEMUA">Semua Status Tiket</option>
                <option value="SELESAI">Selesai</option>
                <option value="SEDANG_DIKERJAKAN">Sedang Dikerjakan</option>
                <option value="TERJADWAL">Terjadwal</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: JADWAL SERVIS RUTIN & CUCI AC */}
      {activeTab === 'jadwal' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl flex items-start gap-3 print:hidden">
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Panduan Siklus Cuci AC & Pemeliharaan Rutin:</p>
              <p>
                Siklus standar cuci AC sekolah adalah <strong>tiap 3 Bulan (90 Hari)</strong>. Klik tombol <strong>"Catat Cuci Selesai"</strong> ketika teknisi selesai mencuci steam AC — sistem otomatis menghitung tanggal cuci berikutnya, memulihkan status ke BAIK, dan mencatatnya ke buku riwayat pemeliharaan.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Aset & Ruangan</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Siklus Servis</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Terakhir Dicuci / Diservis</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Jadwal Cuci Berikutnya</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Hitung Mundur & Status</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200 text-right">Aksi Cepat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScheduledAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada aset yang sesuai dengan kriteria filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScheduledAssets.map((asset) => {
                    return (
                      <TableRow key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              asset.isAC ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200' :
                              asset.isComputer ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200' :
                              'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200'
                            }`}>
                              {asset.isAC ? <Wind className="w-5 h-5" /> : asset.isComputer ? <Monitor className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                {asset.name}
                                {asset.quantity > 1 && (
                                  <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                    {asset.quantity} Unit
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {asset.assetCode} &bull; <span className="text-emerald-700 dark:text-emerald-400 font-medium">{asset.location || 'Semua Ruangan'}</span>
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Tiap {asset.maintenanceIntervalDays || 90} Hari
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {asset.maintenanceIntervalDays === 90 ? '(Triwulan / 3 Bulan)' : 
                             asset.maintenanceIntervalDays === 180 ? '(Semester / 6 Bulan)' : 
                             asset.maintenanceIntervalDays === 30 ? '(Bulanan)' : 'Rutin'}
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {formatDateIndo(asset.lastServiceDateStr)}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Oleh: {asset.responsible || 'Petugas Sarpras'}
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                            {formatDateIndo(asset.nextServiceDateStr)}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Target: {asset.nextServiceDateStr}
                          </p>
                        </TableCell>

                        <TableCell>
                          {asset.scheduleStatus === 'TERLAMBAT' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <AlertTriangle className="w-3 h-3" /> Terlambat {Math.abs(asset.diffDays)} hari!
                            </span>
                          ) : asset.scheduleStatus === 'SEGERA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" /> {asset.diffDays} hari lagi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3" /> {asset.diffDays} hari lagi (Aman)
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => {
                                setTargetAssetForAction(asset);
                                setShowQuickWashModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Catat Selesai
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenAddModal(asset, 'RUTIN')}
                              className="text-xs rounded-xl"
                            >
                              Detail SPK
                            </Button>
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
      )}

      {/* TAB 2: ANTREAN PERBAIKAN KERUSAKAN */}
      {activeTab === 'perbaikan' && (
        <div className="space-y-4">
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl flex items-start gap-3 print:hidden">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Alur Pemulihan Status Barang Rusak:</p>
              <p>
                Daftar barang rusak yang terdeteksi pada inventaris. Ketika perbaikan selesai dilakukan teknisi, klik <strong>"Selesaikan & Pulihkan ke BAIK"</strong>. Sistem akan mencatat riwayat perbaikan, nama teknisi, biaya, dan langsung memulihkan status kondisi aset menjadi <strong>BAIK</strong> di seluruh sistem inventaris.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {damagedItemsList.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Alhamdulillah, Seluruh Aset dalam Kondisi Baik</h3>
                <p className="text-xs text-slate-400 mt-1">Tidak ada aset atau unit yang saat ini berstatus Rusak Ringan / Rusak Berat.</p>
              </div>
            ) : (
              damagedItemsList.map((item, idx) => (
                <div 
                  key={`${item.assetId}-${item.unitCode || idx}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.condition === 'RUSAK_BERAT' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {item.condition === 'RUSAK_BERAT' ? 'RUSAK BERAT' : 'RUSAK RINGAN'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{item.unitCode || item.assetCode}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{item.assetName}</h4>
                      {item.unitNumber && (
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Unit #{item.unitNumber}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">Lokasi: <span className="font-medium text-slate-700 dark:text-slate-300">{item.location}</span></p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs space-y-1">
                      <p className="text-slate-500 font-semibold">Kendala / Kerusakan:</p>
                      <p className="text-slate-700 dark:text-slate-200 italic">"{item.notes}"</p>
                    </div>

                    {item.activeTicket && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-2.5 rounded-xl text-xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-amber-900 dark:text-amber-200">{item.activeTicket.ticketNumber}</p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">Teknisi: {item.activeTicket.technician || 'Dalam pengerjaan'}</p>
                        </div>
                        <Badge className="bg-amber-600 text-white text-[10px]">Sedang Dikerjakan</Badge>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setTargetAssetForAction(item);
                        setShowCompleteRepairModal(true);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Selesaikan & Pulihkan ke BAIK
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddModal(item, 'PERBAIKAN')}
                      className="text-xs rounded-xl"
                      title="Buat SPK / Catat Progres"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT LENGKAP PEMELIHARAAN */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">No. Tiket / SPK</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Aset & Lokasi</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Jenis & Uraian Servis</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Tanggal Servis</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">Perubahan Kondisi</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200 text-right">Biaya (Rp)</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      Belum ada riwayat pemeliharaan yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaintenances.map((rec) => (
                    <TableRow key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell>
                        <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">{rec.ticketNumber}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          rec.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          rec.status === 'SEDANG_DIKERJAKAN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {rec.status === 'SELESAI' ? 'SELESAI' : rec.status === 'SEDANG_DIKERJAKAN' ? 'DIKERJAKAN' : 'TERJADWAL'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{rec.assetName}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {rec.unitCode || rec.assetCode} &bull; {rec.location}
                        </p>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            rec.type === 'RUTIN' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {rec.type === 'RUTIN' ? 'Rutin / Cuci AC' : 'Perbaikan'}
                          </span>
                        </div>
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{rec.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">Teknisi: {rec.technician || '-'}</p>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatDateIndo(rec.serviceDate)}</p>
                        {rec.nextDueDate && (
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Next: {formatDateIndo(rec.nextDueDate)}</p>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500">{rec.previousCondition || 'BAIK'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">{rec.resultCondition || 'BAIK'}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {rec.cost ? formatRupiah(rec.cost) : 'Rp 0'}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedRecordForDetail(rec)}
                          className="h-8 px-2.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          Lihat SPK <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 4: CETAK REKAP SPK & DOKUMEN CETAK */}
      {activeTab === 'spk' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Pratinjau Dokumen Rekapitulasi Pemeliharaan</h3>
              <p className="text-xs text-slate-500">Siap dicetak atau diekspor ke PDF untuk arsip resmi sekolah dan verifikasi teknisi.</p>
            </div>
            <Button onClick={() => window.print()} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              <Printer className="w-4 h-4 mr-2" /> Cetak / Print Dokumen
            </Button>
          </div>

          {/* Printable Official Header */}
          <div className="bg-white text-slate-950 p-8 rounded-2xl border border-slate-300 print:border-none print:p-0">
            <div className="flex items-center gap-4 mb-6 border-b-2 border-slate-900 pb-4 text-left">
              <img src="/logo.svg" alt="Logo SMK IT Ibnul Qayyim" className="w-16 h-16 object-contain shrink-0" />
              <div className="flex-1">
                <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">SMK IT IBNUL QAYYIM</h1>
                <h2 className="text-sm font-semibold uppercase text-slate-800">Laporan Rekapitulasi Pemeliharaan & Jadwal Servis Aset</h2>
                <p className="text-xs text-slate-600">Sistem Manajemen Sarana & Prasarana Sekolah Terpadu</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Dicetak Pada:</p>
                <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
              </div>
            </div>

            <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-slate-800">1. Rekapitulasi Jadwal Servis Rutin & Cuci AC</h3>
            <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Kode Aset</th>
                  <th className="border border-slate-300 p-2 text-left">Nama Peralatan</th>
                  <th className="border border-slate-300 p-2 text-left">Lokasi</th>
                  <th className="border border-slate-300 p-2 text-left">Siklus</th>
                  <th className="border border-slate-300 p-2 text-left">Servis Terakhir</th>
                  <th className="border border-slate-300 p-2 text-left">Jatuh Tempo</th>
                  <th className="border border-slate-300 p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledAssets.map((a) => (
                  <tr key={a.id}>
                    <td className="border border-slate-300 p-2 font-mono">{a.assetCode}</td>
                    <td className="border border-slate-300 p-2 font-semibold">{a.name}</td>
                    <td className="border border-slate-300 p-2">{a.location}</td>
                    <td className="border border-slate-300 p-2">Tiap {a.maintenanceIntervalDays || 90} Hari</td>
                    <td className="border border-slate-300 p-2">{formatDateIndo(a.lastServiceDateStr)}</td>
                    <td className="border border-slate-300 p-2 font-bold">{formatDateIndo(a.nextServiceDateStr)}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {a.scheduleStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-slate-800">2. Riwayat Pengerjaan Servis & Perbaikan Terakhir</h3>
            <table className="w-full text-xs border-collapse border border-slate-300 mb-8">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">No. SPK</th>
                  <th className="border border-slate-300 p-2 text-left">Aset & Unit</th>
                  <th className="border border-slate-300 p-2 text-left">Uraian Pengerjaan</th>
                  <th className="border border-slate-300 p-2 text-left">Teknisi / Vendor</th>
                  <th className="border border-slate-300 p-2 text-left">Tanggal</th>
                  <th className="border border-slate-300 p-2 text-right">Biaya</th>
                  <th className="border border-slate-300 p-2 text-center">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.slice(0, 8).map((m) => (
                  <tr key={m.id}>
                    <td className="border border-slate-300 p-2 font-mono">{m.ticketNumber}</td>
                    <td className="border border-slate-300 p-2 font-medium">{m.assetName}</td>
                    <td className="border border-slate-300 p-2">{m.title}</td>
                    <td className="border border-slate-300 p-2">{m.technician || '-'}</td>
                    <td className="border border-slate-300 p-2">{formatDateIndo(m.serviceDate)}</td>
                    <td className="border border-slate-300 p-2 text-right">{formatRupiah(m.cost || 0)}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800">{m.resultCondition}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Official Signature Blocks */}
            <div className="flex justify-between items-end mt-12 pt-8 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-20"></div>
                <p className="font-bold underline">Anto, S.E.I., M.E., Gr., MCF.</p>
                <p className="text-[10px] text-slate-500">NIP. 196805121992031005</p>
              </div>

              <div>
                <p>Penanggung Jawab Sarana & Prasarana</p>
                <p className="font-bold">&nbsp;</p>
                <div className="h-20"></div>
                <p className="font-bold underline">Budi Santoso, S.Kom</p>
                <p className="text-[10px] text-slate-500">NIP. 198004152005011002</p>
              </div>

              <div>
                <p>Koordinator Teknisi / Pemeliharaan</p>
                <p className="font-bold">&nbsp;</p>
                <div className="h-20"></div>
                <p className="font-bold underline">Pak Joko Widodo</p>
                <p className="text-[10px] text-slate-500">CV Berkah Sejuk AC</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / RECORD MAINTENANCE (Servis Rutin / Cuci AC / Perbaikan Kerusakan) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-7 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" /> Catat Pemeliharaan / Perbaikan Aset
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan riwayat servis berkala, cuci AC, perbaikan kerusakan, dan pembaruan kondisi inventaris.
              </p>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormState({ ...formState, type: 'RUTIN', title: 'Cuci AC & Pembersihan Filter Rutin' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    formState.type === 'RUTIN' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 inline mr-1" /> Servis Rutin / Cuci AC
                </button>
                <button
                  type="button"
                  onClick={() => setFormState({ ...formState, type: 'PERBAIKAN', title: 'Perbaikan Kerusakan Aset' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    formState.type === 'PERBAIKAN' ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 inline mr-1" /> Perbaikan Kerusakan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Aset Terkait *</label>
                  <select
                    value={formState.assetId}
                    onChange={(e) => {
                      const selected = assets.find(a => a.id === e.target.value);
                      const isAC = selected?.name?.toLowerCase().includes('ac');
                      setFormState({
                        ...formState,
                        assetId: e.target.value,
                        unitCode: '',
                        title: formState.type === 'RUTIN' 
                          ? (isAC ? 'Cuci AC & Pembersihan Filter Rutin' : `Servis Rutin ${selected?.name}`)
                          : `Perbaikan Kerusakan ${selected?.name}`
                      });
                    }}
                    required
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-3 font-medium"
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.assetCode} - {a.name} ({a.location || 'Semua Ruangan'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Judul / Uraian Pemeliharaan *</label>
                  <Input
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="Contoh: Cuci Steam AC & Pembersihan Filter Indoor/Outdoor"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Servis *</label>
                  <Input
                    type="date"
                    required
                    value={formState.serviceDate}
                    onChange={(e) => setFormState({ ...formState, serviceDate: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Siklus Servis Berkala (Hari)</label>
                  <select
                    value={formState.intervalDays}
                    onChange={(e) => setFormState({ ...formState, intervalDays: Number(e.target.value) })}
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-3 font-medium"
                  >
                    <option value={30}>Tiap 30 Hari (1 Bulan - Sangat Intensif)</option>
                    <option value={60}>Tiap 60 Hari (2 Bulan)</option>
                    <option value={90}>Tiap 90 Hari (3 Bulan - Standar Cuci AC)</option>
                    <option value={180}>Tiap 180 Hari (6 Bulan / 1 Semester)</option>
                    <option value={365}>Tiap 365 Hari (1 Tahun)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Pekerjaan</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-3 font-medium"
                  >
                    <option value="SELESAI">Selesai (Tuntas)</option>
                    <option value="SEDANG_DIKERJAKAN">Sedang Dikerjakan Teknisi</option>
                    <option value="TERJADWAL">Terjadwal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kondisi Hasil Servis</label>
                  <select
                    value={formState.resultCondition}
                    onChange={(e) => setFormState({ ...formState, resultCondition: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-3 font-medium"
                  >
                    <option value="BAIK">BAIK (Normal & Prima)</option>
                    <option value="RUSAK_RINGAN">RUSAK RINGAN</option>
                    <option value="RUSAK_BERAT">RUSAK BERAT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Teknisi / Vendor</label>
                  <Input
                    value={formState.technician}
                    onChange={(e) => setFormState({ ...formState, technician: e.target.value })}
                    placeholder="Contoh: Pak Joko (CV Berkah Sejuk AC)"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Biaya Servis / Jasa (Rp)</label>
                  <Input
                    type="number"
                    value={formState.cost}
                    onChange={(e) => setFormState({ ...formState, cost: Number(e.target.value) })}
                    placeholder="Contoh: 150000"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suku Cadang / Tindakan yang Dilakukan</label>
                  <Input
                    value={formState.partsReplaced}
                    onChange={(e) => setFormState({ ...formState, partsReplaced: e.target.value })}
                    placeholder="Contoh: Cuci steam indoor/outdoor, penambahan freon R32 20psi"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan Teknisi / Hasil Evaluasi</label>
                  <textarea
                    rows={2}
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    placeholder="Catatan detail hasil pengerjaan..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoUpdateCheck"
                    checked={formState.autoUpdateConditionToGood}
                    onChange={(e) => setFormState({ ...formState, autoUpdateConditionToGood: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="autoUpdateCheck" className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer">
                    Otomatis perbarui kondisi inventaris menjadi {formState.resultCondition} dan segarkan jadwal servis berikutnya
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl text-xs">
                  Batal
                </Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold">
                  <Save className="w-4 h-4 mr-1.5" /> Simpan Data Pemeliharaan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK WASH AC MODAL */}
      {showQuickWashModal && targetAssetForAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              onClick={() => setShowQuickWashModal(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="text-center space-y-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center border border-cyan-200">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Konfirmasi Cuci & Servis Rutin</h3>
              <p className="text-xs text-slate-500">
                Catat bahwa <span className="font-bold text-slate-800 dark:text-slate-200">{targetAssetForAction.name}</span> ({targetAssetForAction.location}) telah selesai dicuci dan diservis hari ini.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Servis:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatDateIndo(new Date().toISOString().split('T')[0])}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Siklus Servis:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Tiap {targetAssetForAction.maintenanceIntervalDays || 90} Hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jadwal Cuci Berikutnya:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatDateIndo(new Date(Date.now() + (targetAssetForAction.maintenanceIntervalDays || 90) * 86400000).toISOString().split('T')[0])}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kondisi Hasil:</span>
                <span className="font-bold text-emerald-600">BAIK (Dingin & Bersih)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowQuickWashModal(false)} className="flex-1 rounded-xl text-xs">
                Batal
              </Button>
              <Button
                onClick={() => handleQuickWashSubmit(targetAssetForAction)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" /> Ya, Catat Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK COMPLETE REPAIR MODAL */}
      {showCompleteRepairModal && targetAssetForAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              onClick={() => setShowCompleteRepairModal(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="text-center space-y-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Selesaikan Perbaikan Barang</h3>
              <p className="text-xs text-slate-500">
                Memulihkan status unit <span className="font-bold text-slate-800 dark:text-slate-200">{targetAssetForAction.assetName}</span> ({targetAssetForAction.unitCode || targetAssetForAction.assetCode}) dari kondisi <span className="text-rose-600 font-bold">{targetAssetForAction.condition}</span> menjadi <span className="text-emerald-600 font-bold">BAIK</span>.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Barang:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{targetAssetForAction.assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{targetAssetForAction.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kendala Sebelumnya:</span>
                <span className="text-slate-700 dark:text-slate-300 italic">{targetAssetForAction.notes || 'Rusak'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Status Baru:</span>
                <span className="font-extrabold text-emerald-600">BAIK (Siap Pakai)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCompleteRepairModal(false)} className="flex-1 rounded-xl text-xs">
                Batal
              </Button>
              <Button
                onClick={() => handleQuickCompleteRepair(targetAssetForAction)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" /> Konfirmasi Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL SPK / WORK ORDER MODAL */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-xl w-full relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
              onClick={() => setSelectedRecordForDetail(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300">
                    {selectedRecordForDetail.ticketNumber}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedRecordForDetail.title}
                  </h3>
                </div>
                <Badge className={selectedRecordForDetail.status === 'SELESAI' ? 'bg-emerald-600' : 'bg-amber-600'}>
                  {selectedRecordForDetail.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div>
                <p className="text-slate-500 font-medium">Aset / Barang:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecordForDetail.assetName}</p>
                <p className="text-slate-400 font-mono">{selectedRecordForDetail.unitCode || selectedRecordForDetail.assetCode}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Lokasi Ruangan:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecordForDetail.location}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Tanggal Pelaksanaan:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatDateIndo(selectedRecordForDetail.serviceDate)}</p>
              </div>
              {selectedRecordForDetail.nextDueDate && (
                <div>
                  <p className="text-slate-500 font-medium">Jadwal Cuci/Servis Berikutnya:</p>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatDateIndo(selectedRecordForDetail.nextDueDate)}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 font-medium">Teknisi / Vendor:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecordForDetail.technician || '-'}</p>
                {selectedRecordForDetail.vendorCompany && (
                  <p className="text-slate-400">{selectedRecordForDetail.vendorCompany}</p>
                )}
              </div>
              <div>
                <p className="text-slate-500 font-medium">Biaya Servis / Jasa:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(selectedRecordForDetail.cost || 0)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 font-medium">Suku Cadang / Tindakan:</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedRecordForDetail.partsReplaced || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 font-medium">Catatan Teknisi:</p>
                <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 italic">
                  "{selectedRecordForDetail.notes || 'Tidak ada catatan khusus.'}"
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 print:hidden">
              <Button variant="outline" onClick={() => setSelectedRecordForDetail(null)} className="rounded-xl text-xs">
                Tutup
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs">
                <Printer className="w-4 h-4 mr-1.5" /> Cetak Lembar SPK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
