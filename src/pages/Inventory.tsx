import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialAssets, initialRooms, initialMaintenanceRecords, initialLoans, initialStockOpnames } from '../store/data';
import { 
  Plus, Search, QrCode, Scan, Printer, Upload, Circle, Pencil, Trash2, X, Save, 
  TrendingDown, ChevronDown, ChevronUp, Layers, CheckCircle2, AlertTriangle, XCircle, 
  Filter, Sparkles, SlidersHorizontal, DollarSign, Wallet, Building2, Calendar, Handshake, Info,
  CheckSquare, XOctagon, ToggleLeft, ToggleRight, Share2, Lock, Unlock, Tag, FileText,
  MapPin, User, Settings2, RotateCcw, LayoutGrid, Check, Copy, ExternalLink, History
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ensureAssetUnits, 
  getAssetConditionStats, 
  formatConditionLabel, 
  getConditionBadgeColor, 
  getFundingSourceBadgeColor, 
  FUNDING_SOURCES, 
  FundingSource, 
  AssetUnit 
} from '../lib/assetUtils';
import AssetHistoryModal from '../components/AssetHistoryModal';

export default function Inventory() {
  const navigate = useNavigate();
  const [assets, setAssets] = useLocalStorage<any[]>('iq-assets', initialAssets);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);
  const [maintenances, setMaintenances] = useLocalStorage<any[]>('iq-maintenances', initialMaintenanceRecords);
  const [loans] = useLocalStorage<any[]>('iq-loans', initialLoans);
  const [stockOpnames] = useLocalStorage<any[]>('iq-stock-opnames', initialStockOpnames);

  // Asset Lifecycle History Modal States
  const [historyAsset, setHistoryAsset] = useState<any | null>(null);
  const [historyUnitCode, setHistoryUnitCode] = useState<string | undefined>(undefined);

  const handleOpenHistory = (asset: any, unitCode?: string) => {
    setHistoryAsset(asset);
    setHistoryUnitCode(unitCode);
  };

  const handleAddCustomHistoryEvent = (assetId: string, newEvent: any) => {
    setAssets((prev: any[]) => prev.map(item => {
      if (String(item.id) === String(assetId)) {
        const existingHistory = Array.isArray(item.history) ? item.history : [];
        const updatedAsset = {
          ...item,
          history: [newEvent, ...existingHistory]
        };
        if (newEvent.type === 'CONDITION_CHANGE' && newEvent.newState) {
          updatedAsset.condition = newEvent.newState;
        }
        return updatedAsset;
      }
      return item;
    }));

    setHistoryAsset((prev: any) => {
      if (!prev || String(prev.id) !== String(assetId)) return prev;
      const existingHistory = Array.isArray(prev.history) ? prev.history : [];
      return {
        ...prev,
        history: [newEvent, ...existingHistory],
        condition: (newEvent.type === 'CONDITION_CHANGE' && newEvent.newState) ? newEvent.newState : prev.condition
      };
    });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [fundingFilter, setFundingFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [borrowableFilter, setBorrowableFilter] = useState<string>('ALL');
  
  // Modals & Expand States
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [unitFilterCondition, setUnitFilterCondition] = useState<string>('ALL');
  const [unitSearchTerm, setUnitSearchTerm] = useState<string>('');
  
  const [showQRFor, setShowQRFor] = useState<{ assetId: string; unitCode?: string } | null>(null);
  const [singleQRLayout, setSingleQRLayout] = useState<'GRID_STANDARD' | 'THERMAL_COMPACT' | 'CARD_FULL'>('GRID_STANDARD');
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Printable Label Studio States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState<'UNITS' | 'MASTER'>('UNITS');
  const [labelLayout, setLabelLayout] = useState<'GRID_STANDARD' | 'THERMAL_COMPACT' | 'CARD_FULL' | 'STICKER_TJ'>('GRID_STANDARD');
  const [printFilterAssetId, setPrintFilterAssetId] = useState<string>('ALL');
  const [printFilterCategory, setPrintFilterCategory] = useState<string>('ALL');
  const [printFilterLocation, setPrintFilterLocation] = useState<string>('ALL');
  const [printFilterFunding, setPrintFilterFunding] = useState<string>('ALL');
  const [printFilterCondition, setPrintFilterCondition] = useState<string>('ALL');
  const [printSearchTerm, setPrintSearchTerm] = useState<string>('');
  
  // Label Customization Options
  const [printShowLogo, setPrintShowLogo] = useState<boolean>(true);
  const [printShowFunding, setPrintShowFunding] = useState<boolean>(true);
  const [printShowLocation, setPrintShowLocation] = useState<boolean>(true);
  const [printShowResponsible, setPrintShowResponsible] = useState<boolean>(true);
  const [printShowDate, setPrintShowDate] = useState<boolean>(true);
  const [printQrSize, setPrintQrSize] = useState<'SM' | 'MD' | 'LG'>('MD');
  const [printCopiesPerLabel, setPrintCopiesPerLabel] = useState<number>(1);
  const [showPrintSettings, setShowPrintSettings] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [deleteTargetAsset, setDeleteTargetAsset] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultAsset = {
    assetCode: '',
    name: '', 
    category: 'Elektronik', 
    location: '', 
    condition: 'BAIK', 
    quantity: 1,
    price: 0,
    purchaseDate: '',
    responsible: '',
    isBorrowable: true,
    fundingSource: 'BOSP Reguler',
    lenderName: '',
    loanDate: '',
    loanDueDate: '',
    loanNotes: '',
    depreciationGroup: 'Kelompok 1 (4 Tahun / 25%)'
  };
  
  const [newAsset, setNewAsset] = useState(defaultAsset);

  const calculateDepreciation = (asset: any) => {
    const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
    const currentDate = new Date('2026-08-21');
    const diffTime = Math.abs(currentDate.getTime() - purchaseDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    let rate = 0.25;
    let lifeYears = 4;
    const group = asset.depreciationGroup || 'Kelompok 1 (4 Tahun / 25%)';
    
    if (group.includes('Kelompok 2') || group.includes('8 Tahun')) {
      rate = 0.125;
      lifeYears = 8;
    } else if (group.includes('Kelompok 3') || group.includes('16 Tahun')) {
      rate = 0.0625;
      lifeYears = 16;
    } else if (group.includes('Kelompok 4') || group.includes('20 Tahun')) {
      rate = 0.05;
      lifeYears = 20;
    } else if (group.includes('Bangunan Permanen')) {
      rate = 0.05;
      lifeYears = 20;
    } else if (group.includes('Bangunan Tidak Permanen')) {
      rate = 0.10;
      lifeYears = 10;
    }

    const ageYears = Math.max(0, diffYears);
    const totalCost = (asset.price || 0) * (asset.quantity || 1);
    const annualDepreciation = totalCost * rate;
    let accumulatedDepreciation = annualDepreciation * ageYears;
    if (accumulatedDepreciation > totalCost) accumulatedDepreciation = totalCost;
    
    let bookValue = totalCost - accumulatedDepreciation;
    if (bookValue < 0) bookValue = 0;

    return {
      group,
      lifeYears,
      rate: rate * 100,
      ageYears: ageYears.toFixed(1),
      totalCost,
      accumulatedDepreciation: Math.round(accumulatedDepreciation),
      bookValue: Math.round(bookValue)
    };
  };

  const filteredAssets = assets.filter((asset: any) => {
    // Check funding source filter
    if (fundingFilter !== 'ALL') {
      const assetFunding = asset.fundingSource || 'BOSP Reguler';
      if (assetFunding !== fundingFilter) return false;
    }

    // Check category filter
    if (categoryFilter !== 'ALL' && asset.category !== categoryFilter) {
      return false;
    }

    // Check borrowable filter
    if (borrowableFilter !== 'ALL') {
      const isBorrowable = asset.isBorrowable !== false;
      if (borrowableFilter === 'BORROWABLE' && !isBorrowable) return false;
      if (borrowableFilter === 'NON_BORROWABLE' && isBorrowable) return false;
    }

    const term = searchTerm.toLowerCase();
    if (!term) return true;

    const matchesMain = asset.name?.toLowerCase().includes(term) || 
                        asset.assetCode?.toLowerCase().includes(term) || 
                        asset.location?.toLowerCase().includes(term) ||
                        asset.responsible?.toLowerCase().includes(term) ||
                        (asset.lenderName && asset.lenderName.toLowerCase().includes(term)) ||
                        (asset.loanNotes && asset.loanNotes.toLowerCase().includes(term)) ||
                        (asset.fundingSource && asset.fundingSource.toLowerCase().includes(term));
    
    // Also check if any unit code matches
    const units = ensureAssetUnits(asset);
    const matchesUnits = units.some((u: any) => 
      u.unitCode?.toLowerCase().includes(term) || 
      u.notes?.toLowerCase().includes(term) ||
      u.serialNumber?.toLowerCase().includes(term)
    );

    return matchesMain || matchesUnits;
  });

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0).replace('IDR', 'Rp');
  };

  // Printable Label Studio Handlers
  const handlePrint = (immediatePrint: boolean | React.SyntheticEvent = true) => {
    setPrintFilterAssetId('ALL');
    setPrintFilterCategory('ALL');
    setPrintFilterLocation('ALL');
    setPrintFilterFunding('ALL');
    setPrintFilterCondition('ALL');
    setPrintSearchTerm('');
    setShowPrintModal(true);
    if (typeof immediatePrint === 'boolean' ? immediatePrint : true) {
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  const handlePrintSingleAssetUnits = (assetId: string, immediatePrint: boolean | React.SyntheticEvent = true) => {
    setPrintFilterAssetId(assetId);
    setPrintFilterCategory('ALL');
    setPrintFilterLocation('ALL');
    setPrintFilterFunding('ALL');
    setPrintFilterCondition('ALL');
    setPrintSearchTerm('');
    setPrintMode('UNITS');
    setShowPrintModal(true);
    if (typeof immediatePrint === 'boolean' ? immediatePrint : true) {
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  const handlePrintSingleUnitDirect = (assetId: string, unitCode: string, immediatePrint: boolean | React.SyntheticEvent = true) => {
    setPrintFilterAssetId(assetId);
    setPrintFilterCategory('ALL');
    setPrintFilterLocation('ALL');
    setPrintFilterFunding('ALL');
    setPrintFilterCondition('ALL');
    setPrintSearchTerm(unitCode);
    setPrintMode('UNITS');
    setShowPrintModal(true);
    if (typeof immediatePrint === 'boolean' ? immediatePrint : true) {
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  const handleResetPrintFilters = () => {
    setPrintFilterAssetId('ALL');
    setPrintFilterCategory('ALL');
    setPrintFilterLocation('ALL');
    setPrintFilterFunding('ALL');
    setPrintFilterCondition('ALL');
    setPrintSearchTerm('');
  };

  const executePrint = () => {
    window.print();
  };

  const handleScan = () => {
    navigate('/scanner');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTimeout(() => {
        const mockImport = [
          { 
            id: Date.now().toString() + '1', 
            assetCode: `INV-IMP-${Math.floor(Math.random()*1000)}`, 
            name: `Aset dari ${file.name} (1)`, 
            category: 'Elektronik', 
            condition: 'BAIK', 
            quantity: 5, 
            price: 1500000, 
            location: 'Gudang', 
            purchaseDate: new Date().toISOString().split('T')[0], 
            responsible: 'Admin', 
            depreciationGroup: 'Kelompok 1 (4 Tahun / 25%)',
            units: []
          },
          { 
            id: Date.now().toString() + '2', 
            assetCode: `INV-IMP-${Math.floor(Math.random()*1000)}`, 
            name: `Aset dari ${file.name} (2)`, 
            category: 'Furnitur', 
            condition: 'BAIK', 
            quantity: 10, 
            price: 250000, 
            location: 'Gudang', 
            purchaseDate: new Date().toISOString().split('T')[0], 
            responsible: 'Admin', 
            depreciationGroup: 'Kelompok 2 (8 Tahun / 12.5%)',
            units: []
          }
        ].map(item => ({ ...item, units: ensureAssetUnits(item) }));
        setAssets([...mockImport, ...assets]);
        alert(`Berhasil mengimpor data dari file ${file.name}.`);
      }, 500);
      e.target.value = '';
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, parseInt(String(newAsset.quantity)) || 1);
    
    if (editingId) {
      // Update existing while preserving or syncing units
      setAssets(assets.map((a: any) => {
        if (a.id === editingId) {
          const updatedAsset = { ...newAsset, id: editingId, quantity: qty };
          const syncedUnits = ensureAssetUnits(updatedAsset);
          return { ...updatedAsset, units: syncedUnits };
        }
        return a;
      }));
    } else {
      // Add new
      const id = Date.now().toString();
      const code = newAsset.assetCode || `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const assetToAdd: any = {
        ...newAsset,
        id,
        assetCode: code,
        quantity: qty
      };
      assetToAdd.units = ensureAssetUnits(assetToAdd);
      setAssets([assetToAdd, ...assets]);
    }
    
    setShowAddForm(false);
    setEditingId(null);
    setNewAsset(defaultAsset);
  };

  const openEditForm = (asset: any) => {
    setNewAsset(asset);
    setEditingId(asset.id);
    setShowAddForm(true);
  };

  const handleDelete = (asset: any) => {
    setDeleteTargetAsset(asset);
  };

  const confirmDeleteAsset = () => {
    if (deleteTargetAsset) {
      setAssets(assets.filter((a: any) => a.id !== deleteTargetAsset.id));
      if (expandedAssetId === deleteTargetAsset.id) setExpandedAssetId(null);
      setDeleteTargetAsset(null);
    }
  };

  const handleToggleBorrowable = (id: string) => {
    setAssets(assets.map((a: any) => {
      if (a.id === id) {
        const nextStatus = a.isBorrowable === false ? true : false;
        const units = ensureAssetUnits(a);
        const updatedUnits = units.map(u => ({ ...u, isBorrowable: nextStatus }));
        return {
          ...a,
          isBorrowable: nextStatus,
          units: updatedUnits
        };
      }
      return a;
    }));
  };

  // Unit Modification Handlers
  const handleUpdateUnitCondition = (assetId: string, unitIndex: number, newCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT') => {
    setAssets(assets.map((asset: any) => {
      if (asset.id === assetId) {
        const units = ensureAssetUnits(asset);
        const updatedUnits = [...units];
        if (updatedUnits[unitIndex]) {
          updatedUnits[unitIndex] = {
            ...updatedUnits[unitIndex],
            condition: newCondition
          };
        }
        
        // Recalculate dominant condition for parent
        const stats = getAssetConditionStats({ ...asset, units: updatedUnits });
        return {
          ...asset,
          condition: stats.dominantCondition,
          units: updatedUnits
        };
      }
      return asset;
    }));
  };

  const handleUpdateUnitBorrowable = (assetId: string, unitIndex: number, borrowable: boolean) => {
    setAssets(assets.map((asset: any) => {
      if (asset.id === assetId) {
        const units = ensureAssetUnits(asset);
        const updatedUnits = [...units];
        if (updatedUnits[unitIndex]) {
          updatedUnits[unitIndex] = {
            ...updatedUnits[unitIndex],
            isBorrowable: borrowable
          };
        }
        return {
          ...asset,
          units: updatedUnits
        };
      }
      return asset;
    }));
  };

  const handleUpdateUnitNotes = (assetId: string, unitIndex: number, notes: string) => {
    setAssets(assets.map((asset: any) => {
      if (asset.id === assetId) {
        const units = ensureAssetUnits(asset);
        const updatedUnits = [...units];
        if (updatedUnits[unitIndex]) {
          updatedUnits[unitIndex] = {
            ...updatedUnits[unitIndex],
            notes
          };
        }
        return {
          ...asset,
          units: updatedUnits
        };
      }
      return asset;
    }));
  };

  const handleBatchSetCondition = (assetId: string, newCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT') => {
    setAssets(assets.map((asset: any) => {
      if (asset.id === assetId) {
        const units = ensureAssetUnits(asset);
        const updatedUnits = units.map(u => ({ ...u, condition: newCondition }));
        return {
          ...asset,
          condition: newCondition,
          units: updatedUnits
        };
      }
      return asset;
    }));
  };

  // Prepare formatted printable units list with comprehensive filtering
  const getPrintableItems = () => {
    let targetAssets = assets;
    
    // Filter by specific asset
    if (printFilterAssetId !== 'ALL') {
      targetAssets = targetAssets.filter((a: any) => a.id === printFilterAssetId);
    }

    // Filter by category
    if (printFilterCategory !== 'ALL') {
      targetAssets = targetAssets.filter((a: any) => a.category === printFilterCategory);
    }

    // Filter by location / room
    if (printFilterLocation !== 'ALL') {
      targetAssets = targetAssets.filter((a: any) => a.location === printFilterLocation);
    }

    // Filter by funding source
    if (printFilterFunding !== 'ALL') {
      targetAssets = targetAssets.filter((a: any) => (a.fundingSource || 'BOSP Reguler') === printFilterFunding);
    }

    // Filter by search term
    if (printSearchTerm.trim()) {
      const term = printSearchTerm.toLowerCase();
      targetAssets = targetAssets.filter((a: any) => {
        const units = ensureAssetUnits(a);
        const matchesUnit = units.some(u => 
          u.unitCode.toLowerCase().includes(term) || 
          (u.notes && u.notes.toLowerCase().includes(term)) ||
          (u.serialNumber && u.serialNumber.toLowerCase().includes(term))
        );
        return (
          a.name.toLowerCase().includes(term) ||
          a.assetCode.toLowerCase().includes(term) ||
          (a.location && a.location.toLowerCase().includes(term)) ||
          (a.responsible && a.responsible.toLowerCase().includes(term)) ||
          (a.category && a.category.toLowerCase().includes(term)) ||
          matchesUnit
        );
      });
    }

    let items: any[] = [];

    if (printMode === 'MASTER') {
      targetAssets.forEach((asset: any) => {
        if (printFilterCondition !== 'ALL' && asset.condition !== printFilterCondition) {
          return;
        }
        items.push({
          id: asset.id,
          assetId: asset.id,
          assetName: asset.name,
          code: asset.assetCode,
          masterCode: asset.assetCode,
          category: asset.category,
          location: asset.location,
          condition: asset.condition,
          fundingSource: asset.fundingSource || 'BOSP Reguler',
          lenderName: asset.lenderName,
          loanDate: asset.loanDate,
          loanDueDate: asset.loanDueDate,
          unitLabel: `Master Aset (${asset.quantity || 1} Unit)`,
          unitNumber: 1,
          totalUnits: asset.quantity || 1,
          purchaseDate: asset.purchaseDate,
          responsible: asset.responsible,
          price: asset.price
        });
      });
    } else {
      // Return every single individual physical unit sticker!
      targetAssets.forEach((asset: any) => {
        const units = ensureAssetUnits(asset);
        units.forEach((unit) => {
          if (printFilterCondition !== 'ALL' && unit.condition !== printFilterCondition) {
            return;
          }

          // If search term matches a specific unit, filter down
          if (printSearchTerm.trim()) {
            const term = printSearchTerm.toLowerCase();
            const assetMatches = asset.name.toLowerCase().includes(term) || 
              asset.assetCode.toLowerCase().includes(term) || 
              (asset.location && asset.location.toLowerCase().includes(term));
            const unitMatches = unit.unitCode.toLowerCase().includes(term) || 
              (unit.notes && unit.notes.toLowerCase().includes(term)) ||
              (unit.serialNumber && unit.serialNumber.toLowerCase().includes(term));
            
            if (!assetMatches && !unitMatches) {
              return;
            }
          }

          items.push({
            id: unit.id,
            assetId: asset.id,
            assetName: asset.name,
            code: unit.unitCode,
            masterCode: asset.assetCode,
            category: asset.category,
            location: unit.location || asset.location,
            condition: unit.condition,
            fundingSource: asset.fundingSource || 'BOSP Reguler',
            lenderName: asset.lenderName,
            loanDate: asset.loanDate,
            loanDueDate: asset.loanDueDate,
            unitLabel: `Unit #${unit.unitNumber} dari ${units.length}`,
            unitNumber: unit.unitNumber,
            totalUnits: units.length,
            notes: unit.notes,
            serialNumber: unit.serialNumber,
            purchaseDate: asset.purchaseDate,
            responsible: asset.responsible,
            price: asset.price
          });
        });
      });
    }

    // Multiply if user requested multiple copies per sticker
    if (printCopiesPerLabel > 1) {
      const multiplied: any[] = [];
      items.forEach(item => {
        for (let i = 0; i < printCopiesPerLabel; i++) {
          multiplied.push({ ...item, copyIndex: i + 1, uniquePrintKey: `${item.id}-${item.code}-${i}` });
        }
      });
      return multiplied;
    }

    return items;
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Hidden File Input for Excel Import */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />

      {/* Header Area with Deep Forest Teal & Golden Amber Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032C24] via-[#02241D] to-[#011813] border border-[#095445]/50 p-6 sm:p-7 rounded-2xl text-white shadow-xl print:hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#064237]/90 text-[#FFB800] border border-[#0F5C4E] text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> SMK IT Ibnul Qayyim
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              <span className="text-[#FFB800]">Inventaris</span> & Buku Aset
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1.5 leading-relaxed max-w-3xl">
              Data aset tetap: pemantauan kondisi fisik per unit, pencetakan stiker QR label, lokasi ruangan, dan kalkulasi penyusutan.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button 
              onClick={() => setShowDepreciationModal(true)} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <TrendingDown className="w-4 h-4 mr-2 text-[#FFB800]" /> Info Penyusutan
            </Button>
            <Button 
              onClick={handleScan} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <Scan className="w-4 h-4 mr-2 text-[#FFB800]" /> Pindai QR
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <Printer className="w-4 h-4 mr-2 text-[#FFB800]" /> Cetak Label Massal
            </Button>
            <Button 
              onClick={handleImportClick} 
              variant="outline" 
              className="bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border-[#0F5C4E] font-medium transition-all shadow-xs"
            >
              <Upload className="w-4 h-4 mr-2 text-[#FFB800]" /> Impor Excel
            </Button>
            <Button 
              onClick={() => { setEditingId(null); setNewAsset(defaultAsset); setShowAddForm(true); }} 
              className="bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5 text-slate-950 font-extrabold" /> Tambah Inventaris
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter Area */}
      <div className="pt-2 print:hidden flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 min-w-[260px] w-full">
            <Search className="absolute left-3.5 top-2.5 h-[18px] w-[18px] text-slate-400" />
            <Input 
              placeholder="Cari nama, kode induk, sub-kode, sumber anggaran..." 
              className="pl-10 h-10 rounded-xl border-emerald-100 dark:border-slate-800 shadow-sm focus-visible:ring-emerald-500 bg-white dark:bg-slate-950" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter Sumber Anggaran */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-slate-700 dark:text-slate-200 font-medium"
                value={fundingFilter}
                onChange={(e) => setFundingFilter(e.target.value)}
                aria-label="Filter Sumber Anggaran"
              >
                <option value="ALL">Semua Sumber Dana</option>
                {FUNDING_SOURCES.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-slate-700 dark:text-slate-200 font-medium"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter Kategori"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Furnitur">Furnitur</option>
                <option value="Alat Olahraga">Alat Olahraga</option>
                <option value="Buku Perpustakaan">Buku Perpustakaan</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Filter Status Peminjaman */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300">
              <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-slate-700 dark:text-slate-200 font-medium"
                value={borrowableFilter}
                onChange={(e) => setBorrowableFilter(e.target.value)}
                aria-label="Filter Status Peminjaman"
              >
                <option value="ALL">Semua Status Pinjam</option>
                <option value="BORROWABLE">Bisa Dipinjam</option>
                <option value="NON_BORROWABLE">Tidak Bisa Dipinjam</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-3 py-2 rounded-xl flex items-center gap-2 self-start lg:self-auto">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Barang dengan jumlah &gt; 1 memiliki <strong>label unit mandiri</strong>.</span>
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-2xl border border-emerald-100 overflow-hidden bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm print:hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-emerald-50/50 dark:bg-emerald-900/10">
              <TableRow className="border-b border-emerald-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Kode Induk</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Nama Barang</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Izin Pinjam</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Sumber Anggaran</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status & Kondisi Fisik</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Jumlah</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Nilai Satuan</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Lokasi</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Pengadaan</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Penanggung Jawab</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-10 text-slate-500">Tidak ada aset ditemukan</TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset: any) => {
                  const isExpanded = expandedAssetId === asset.id;
                  const units = ensureAssetUnits(asset);
                  const stats = getAssetConditionStats(asset);
                  const isMulti = units.length > 1;
                  const fundingBadge = getFundingSourceBadgeColor(asset.fundingSource || 'BOSP Reguler');

                  // Filtered units for the sub-table if expanded
                  const displayedUnits = units.filter((u: any) => {
                    const matchCondition = unitFilterCondition === 'ALL' || u.condition === unitFilterCondition;
                    const term = unitSearchTerm.toLowerCase();
                    const matchSearch = !term || 
                                        u.unitCode.toLowerCase().includes(term) || 
                                        (u.notes && u.notes.toLowerCase().includes(term)) ||
                                        (u.serialNumber && u.serialNumber.toLowerCase().includes(term));
                    return matchCondition && matchSearch;
                  });

                  return (
                    <React.Fragment key={asset.id}>
                      <TableRow className={`border-b border-emerald-50 dark:border-slate-800/50 transition-colors ${isExpanded ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'}`}>
                        <TableCell className="text-center py-4">
                          {isMulti ? (
                            <button 
                              onClick={() => {
                                setExpandedAssetId(isExpanded ? null : asset.id);
                                setUnitFilterCondition('ALL');
                                setUnitSearchTerm('');
                              }}
                              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 transition-colors"
                              title={isExpanded ? "Tutup rincian unit" : "Buka rincian label per unit"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          ) : (
                            <Circle className="w-[18px] h-[18px] text-emerald-600/80 dark:text-emerald-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-[13px] tracking-wide text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                            {asset.assetCode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            {asset.name}
                            {isMulti && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                <Layers className="w-3 h-3" /> {units.length} Unit
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{asset.category}</div>
                        </TableCell>

                        {/* Status Izin Peminjaman Column */}
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleBorrowable(asset.id)}
                            className="group inline-flex items-center gap-1.5 focus:outline-none"
                            title={asset.isBorrowable === false ? "Klik untuk mengizinkan peminjaman barang ini" : "Klik untuk melarang peminjaman barang ini"}
                          >
                            {asset.isBorrowable === false ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors">
                                <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                Tidak Boleh
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
                                <Unlock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Bisa Dipinjam
                              </span>
                            )}
                          </button>
                        </TableCell>

                        {/* Funding Source Column */}
                        <TableCell>
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${fundingBadge.bg} ${fundingBadge.text} ${fundingBadge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${fundingBadge.dot}`}></span>
                              {asset.fundingSource || 'BOSP Reguler'}
                            </span>
                            {asset.fundingSource === 'Pinjam' && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 pt-0.5">
                                {asset.lenderName && (
                                  <div className="flex items-center gap-1 font-semibold text-cyan-800 dark:text-cyan-300" title={`Pemberi Pinjaman: ${asset.lenderName}`}>
                                    <Building2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                    <span className="truncate max-w-[140px]">{asset.lenderName}</span>
                                  </div>
                                )}
                                {asset.loanDate && (
                                  <div className="flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-slate-400" title={`Tanggal Pinjam: ${asset.loanDate}`}>
                                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>Tgl: {asset.loanDate}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Condition Column */}
                        <TableCell>
                          {!isMulti ? (
                            <Badge 
                              className={`font-medium px-3 py-1 rounded-full border-none shadow-none text-xs ${getConditionBadgeColor(asset.condition).bg} ${getConditionBadgeColor(asset.condition).text}`}
                            >
                              {formatConditionLabel(asset.condition)}
                            </Badge>
                          ) : (
                            <div 
                              onClick={() => {
                                setExpandedAssetId(isExpanded ? null : asset.id);
                                setUnitFilterCondition('ALL');
                              }}
                              className="cursor-pointer flex flex-wrap gap-1.5 items-center"
                              title="Klik untuk melihat dan mengelola kondisi masing-masing unit"
                            >
                              {stats.baik > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {stats.baik} Baik
                                </span>
                              )}
                              {stats.rusakRingan > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  {stats.rusakRingan} Rusak Ringan
                                </span>
                              )}
                              {stats.rusakBerat > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  {stats.rusakBerat} Rusak Berat
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Quantity Column */}
                        <TableCell className="text-center">
                          {isMulti ? (
                            <button
                              onClick={() => {
                                setExpandedAssetId(isExpanded ? null : asset.id);
                                setUnitFilterCondition('ALL');
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-emerald-900/40 transition-colors"
                            >
                              <span>{asset.quantity || 1} Unit</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300 font-medium">1 Unit</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-semibold text-slate-800 dark:text-slate-200">
                          {formatRupiah(asset.price)}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {asset.location}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {asset.purchaseDate || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {asset.responsible || '-'}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2 text-slate-400">
                            <button 
                              onClick={() => handleOpenHistory(asset)} 
                              className="p-1 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors" 
                              title="Riwayat & Rekam Jejak Siklus Hidup Aset (Servis, Pinjam, Audit, Status)"
                            >
                              <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </button>
                            <button 
                              onClick={() => handlePrintSingleAssetUnits(asset.id)} 
                              className="p-1 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors" 
                              title={`Cetak Label Stiker (${isMulti ? `${asset.quantity} Unit` : '1 Unit'})`}
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setShowQRFor({ assetId: asset.id })} 
                              className="p-1 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors" 
                              title="Pratinjau QR Code & Label Fisik"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditForm(asset)} className="p-1 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors" title="Edit Data">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(asset)} className="p-1 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors" title="Hapus Aset">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Individual Unit Manager Sub-Panel */}
                      {isExpanded && (
                        <TableRow className="bg-emerald-50/30 dark:bg-slate-900/80 border-b-2 border-emerald-200 dark:border-slate-800">
                          <TableCell colSpan={11} className="p-0">
                            <div className="p-5 sm:p-6 space-y-4">
                              {/* Subpanel Header & Stats */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-emerald-100 dark:border-slate-800 shadow-sm">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                      Manajemen Unit & Label Fisik: <span className="text-emerald-700 dark:text-emerald-400">{asset.name}</span>
                                    </h4>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Setiap barang memiliki kode unik tersendiri untuk stiker barcode/QR dan dapat diatur kondisi fisiknya secara independen.
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleOpenHistory(asset)}
                                    className="text-xs text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100"
                                  >
                                    <History className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Riwayat & Rekam Jejak
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleBatchSetCondition(asset.id, 'BAIK')}
                                    className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Set Semua Baik
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handlePrintSingleAssetUnits(asset.id)}
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                                  >
                                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak {units.length} Label Unit Ini
                                  </Button>
                                </div>
                              </div>

                              {/* Filters & Search for Units */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                  <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                                    <Filter className="w-3.5 h-3.5" /> Filter:
                                  </span>
                                  <button
                                    onClick={() => setUnitFilterCondition('ALL')}
                                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                                      unitFilterCondition === 'ALL'
                                        ? 'bg-slate-900 text-white dark:bg-emerald-600'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    Semua ({stats.total})
                                  </button>
                                  <button
                                    onClick={() => setUnitFilterCondition('BAIK')}
                                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                                      unitFilterCondition === 'BAIK'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-emerald-700 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Baik ({stats.baik})
                                  </button>
                                  <button
                                    onClick={() => setUnitFilterCondition('RUSAK_RINGAN')}
                                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                                      unitFilterCondition === 'RUSAK_RINGAN'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-amber-700 border border-amber-200 dark:border-amber-800 hover:bg-amber-50'
                                    }`}
                                  >
                                    <AlertTriangle className="w-3 h-3" /> Rusak Ringan ({stats.rusakRingan})
                                  </button>
                                  <button
                                    onClick={() => setUnitFilterCondition('RUSAK_BERAT')}
                                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                                      unitFilterCondition === 'RUSAK_BERAT'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-rose-700 border border-rose-200 dark:border-rose-800 hover:bg-rose-50'
                                    }`}
                                  >
                                    <XCircle className="w-3 h-3" /> Rusak Berat ({stats.rusakBerat})
                                  </button>
                                </div>

                                <div className="relative w-full sm:w-64">
                                  <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                                  <Input 
                                    placeholder="Cari label unit / catatan..."
                                    className="pl-8 h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"
                                    value={unitSearchTerm}
                                    onChange={e => setUnitSearchTerm(e.target.value)}
                                  />
                                </div>
                              </div>

                              {/* Units Grid List */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                                {displayedUnits.length === 0 ? (
                                  <div className="col-span-full py-8 text-center bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                                    Tidak ada unit yang sesuai dengan filter.
                                  </div>
                                ) : (
                                  displayedUnits.map((unit) => {
                                    const actualIndex = unit.unitNumber - 1;
                                    return (
                                      <div 
                                        key={unit.id}
                                        className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-mono font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                {unit.unitCode}
                                              </span>
                                              <span className="text-[11px] font-semibold text-slate-500">
                                                Unit #{unit.unitNumber}
                                              </span>
                                            </div>
                                            {unit.serialNumber && (
                                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">SN: {unit.serialNumber}</p>
                                            )}
                                          </div>
                                          
                                          {/* Print / QR preview for this unit */}
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleOpenHistory(asset, unit.unitCode)}
                                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                              title={`Lihat Riwayat Khusus Unit ${unit.unitCode}`}
                                            >
                                              <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                            </button>
                                            <button
                                              onClick={() => handlePrintSingleUnitDirect(asset.id, unit.unitCode)}
                                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                              title={`Cetak Label Stiker Unit ${unit.unitCode}`}
                                            >
                                              <Printer className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => setShowQRFor({ assetId: asset.id, unitCode: unit.unitCode })}
                                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                              title={`Lihat Label QR Unit ${unit.unitCode}`}
                                            >
                                              <QrCode className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Condition Radio/Dropdown Selector */}
                                        <div className="space-y-1.5">
                                          <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-medium text-slate-500">Kondisi Unit:</label>
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateUnitBorrowable(asset.id, actualIndex, unit.isBorrowable === false ? true : false)}
                                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                                                unit.isBorrowable === false
                                                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                              }`}
                                              title="Klik untuk mengubah status izin pinjam khusus unit ini"
                                            >
                                              {unit.isBorrowable === false ? (
                                                <>
                                                  <Lock className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                                                  Tidak Boleh Pinjam
                                                </>
                                              ) : (
                                                <>
                                                  <Unlock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                                  Bisa Dipinjam
                                                </>
                                              )}
                                            </button>
                                          </div>
                                          <div className="grid grid-cols-3 gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateUnitCondition(asset.id, actualIndex, 'BAIK')}
                                              className={`text-[11px] font-semibold py-1 px-1.5 rounded-md border text-center transition-all ${
                                                unit.condition === 'BAIK'
                                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900 dark:border-slate-800'
                                              }`}
                                            >
                                              Baik
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateUnitCondition(asset.id, actualIndex, 'RUSAK_RINGAN')}
                                              className={`text-[11px] font-semibold py-1 px-1.5 rounded-md border text-center transition-all ${
                                                unit.condition === 'RUSAK_RINGAN'
                                                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-900 dark:border-slate-800'
                                              }`}
                                            >
                                              R. Ringan
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateUnitCondition(asset.id, actualIndex, 'RUSAK_BERAT')}
                                              className={`text-[11px] font-semibold py-1 px-1.5 rounded-md border text-center transition-all ${
                                                unit.condition === 'RUSAK_BERAT'
                                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-900 dark:border-slate-800'
                                              }`}
                                            >
                                              R. Berat
                                            </button>
                                          </div>
                                        </div>

                                        {/* Notes input for damaged details */}
                                        <div>
                                          <input
                                            type="text"
                                            placeholder="Catatan fisik (opsional, misal: kaki goyang)"
                                            value={unit.notes || ''}
                                            onChange={e => handleUpdateUnitNotes(asset.id, actualIndex, e.target.value)}
                                            className="w-full text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Printable Label Studio Modal (Supports Multiple Formats, Customization, & Filterable QR Stickers) */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 z-50 overflow-y-auto print:bg-white print:p-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
            {/* Top Toolbar (Hidden in Print Mode) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm print:hidden">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Studio Cetak Label Fisik & QR Barcode
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                        SMK IT Ibnul Qayyim Makassar • Siap cetak ke kertas stiker A4, label Tom & Jerry, atau Thermal Barcode Roll.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                  {/* Print Mode Selector: Units vs Master */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                    <button
                      onClick={() => setPrintMode('UNITS')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        printMode === 'UNITS' 
                          ? 'bg-white dark:bg-slate-950 text-emerald-800 dark:text-emerald-300 shadow-xs' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Setiap Unit Fisik ({assets.reduce((acc, a) => acc + (a.quantity || 1), 0)} Pcs)
                    </button>
                    <button
                      onClick={() => setPrintMode('MASTER')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        printMode === 'MASTER' 
                          ? 'bg-white dark:bg-slate-950 text-emerald-800 dark:text-emerald-300 shadow-xs' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Master Aset Saja ({assets.length} Item)
                    </button>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setShowPrintSettings(!showPrintSettings)}
                    className={`text-xs gap-1.5 border-slate-200 dark:border-slate-700 ${showPrintSettings ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : ''}`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Kustomisasi Label
                  </Button>

                  <Button variant="outline" onClick={() => setShowPrintModal(false)} className="text-xs">
                    <X className="w-3.5 h-3.5 mr-1" /> Tutup
                  </Button>
                  
                  <Button onClick={executePrint} className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md text-xs font-semibold px-4">
                    <Printer className="w-4 h-4 mr-1.5" /> Cetak ({getPrintableItems().length} Label)
                  </Button>
                </div>
              </div>

              {/* Template Format Selector */}
              <div className="pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                    Pilih Format Template Stiker:
                  </span>
                  <span className="text-xs text-slate-500">
                    Format aktif: <strong className="text-slate-800 dark:text-slate-200">
                      {labelLayout === 'GRID_STANDARD' && 'Grid Stiker Standar A4 (12 Stiker per Halaman)'}
                      {labelLayout === 'THERMAL_COMPACT' && 'Thermal Barcode Roll 50x30mm (Label Ringkas & Tajam)'}
                      {labelLayout === 'CARD_FULL' && 'Kartu Identitas Sarpras / Hang Tag Formal'}
                      {labelLayout === 'STICKER_TJ' && 'Label Stiker Tom & Jerry 108 / 121 (Grid 2 Kolom)'}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLabelLayout('GRID_STANDARD')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      labelLayout === 'GRID_STANDARD'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Grid Standar A4</span>
                      {labelLayout === 'GRID_STANDARD' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Stiker kotak rapi untuk kertas label A4 / stiker potong.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLabelLayout('THERMAL_COMPACT')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      labelLayout === 'THERMAL_COMPACT'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Thermal Barcode (50x30)</span>
                      {labelLayout === 'THERMAL_COMPACT' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Format 2 kolom monokrom pas untuk printer thermal roll.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLabelLayout('CARD_FULL')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      labelLayout === 'CARD_FULL'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Kartu Identitas Sarpras</span>
                      {labelLayout === 'CARD_FULL' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Hang Tag / Kartu sarana resmi dengan kop & tabel spesifikasi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLabelLayout('STICKER_TJ')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      labelLayout === 'STICKER_TJ'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Stiker Tom & Jerry</span>
                      {labelLayout === 'STICKER_TJ' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Format pas lembaran stiker label Tom & Jerry No. 108/121.
                    </p>
                  </button>
                </div>
              </div>

              {/* Customization Options Drawer (Expandable) */}
              {showPrintSettings && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Tampilkan Elemen:</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={printShowLogo} onChange={e => setPrintShowLogo(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        Logo SMK IT Ibnul Qayyim
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={printShowFunding} onChange={e => setPrintShowFunding(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        Sumber Anggaran / Tag Pinjam
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={printShowLocation} onChange={e => setPrintShowLocation(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        Lokasi Ruangan
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={printShowResponsible} onChange={e => setPrintShowResponsible(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        Penanggung Jawab
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Ukuran QR Code:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPrintQrSize('SM')}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${printQrSize === 'SM' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'}`}
                      >
                        Kecil
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintQrSize('MD')}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${printQrSize === 'MD' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'}`}
                      >
                        Sedang
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintQrSize('LG')}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${printQrSize === 'LG' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'}`}
                      >
                        Besar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Jumlah Salinan per Label:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPrintCopiesPerLabel(1)}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${printCopiesPerLabel === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'}`}
                      >
                        1x Salin
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintCopiesPerLabel(2)}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${printCopiesPerLabel === 2 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'}`}
                      >
                        2x (Duplikat)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintCopiesPerLabel(3)}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${printCopiesPerLabel === 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'}`}
                      >
                        3x (Triplikat)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPrintShowLogo(true);
                        setPrintShowFunding(true);
                        setPrintShowLocation(true);
                        setPrintShowResponsible(true);
                        setPrintShowDate(true);
                        setPrintQrSize('MD');
                        setPrintCopiesPerLabel(1);
                      }}
                      className="text-xs text-slate-500 hover:text-emerald-700 underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Kustomisasi
                    </button>
                  </div>
                </div>
              )}

              {/* Multi-Filter Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Aset Spesifik:</label>
                  <select
                    value={printFilterAssetId}
                    onChange={e => setPrintFilterAssetId(e.target.value)}
                    className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2"
                  >
                    <option value="ALL">Semua Aset ({assets.length})</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.assetCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Kategori:</label>
                  <select
                    value={printFilterCategory}
                    onChange={e => setPrintFilterCategory(e.target.value)}
                    className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Peralatan Praktik">Peralatan Praktik</option>
                    <option value="Buku / Modul">Buku / Modul</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Lokasi Ruangan:</label>
                  <select
                    value={printFilterLocation}
                    onChange={e => setPrintFilterLocation(e.target.value)}
                    className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2"
                  >
                    <option value="ALL">Semua Ruangan</option>
                    {rooms.map((r: any) => (
                      <option key={r.id || r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Sumber Anggaran:</label>
                  <select
                    value={printFilterFunding}
                    onChange={e => setPrintFilterFunding(e.target.value)}
                    className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2"
                  >
                    <option value="ALL">Semua Sumber Dana</option>
                    {FUNDING_SOURCES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Kondisi Fisik:</label>
                  <select
                    value={printFilterCondition}
                    onChange={e => setPrintFilterCondition(e.target.value)}
                    className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2"
                  >
                    <option value="ALL">Semua Kondisi</option>
                    <option value="BAIK">Hanya Baik</option>
                    <option value="RUSAK_RINGAN">Hanya Rusak Ringan</option>
                    <option value="RUSAK_BERAT">Hanya Rusak Berat</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Cari Kata Kunci:</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Nama, kode..."
                      value={printSearchTerm}
                      onChange={e => setPrintSearchTerm(e.target.value)}
                      className="pl-7 h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filter Summary Bar */}
              {(printFilterAssetId !== 'ALL' || printFilterCategory !== 'ALL' || printFilterLocation !== 'ALL' || printFilterFunding !== 'ALL' || printFilterCondition !== 'ALL' || printSearchTerm) && (
                <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Filter aktif diterapkan. Ditemukan <strong>{getPrintableItems().length} label</strong> siap cetak.</span>
                  </div>
                  <button onClick={handleResetPrintFilters} className="font-bold underline hover:text-emerald-700 text-xs">
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>

            {/* Print Header Preview info */}
            <div className="hidden print:block mb-4 pb-2 border-b-2 border-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
                  <div>
                    <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">SMK IT IBNUL QAYYIM MAKASSAR</h1>
                    <p className="text-[10px] text-slate-600 font-medium">Sistem Inventarisasi & Pelacakan Sarana Prasarana Fisik</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600 font-mono">
                  Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {getPrintableItems().length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <Tag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Tidak ada label yang sesuai kriteria</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Coba ubah opsi filter atau hapus kata kunci pencarian pada toolbar di atas.
                </p>
                <Button onClick={handleResetPrintFilters} variant="outline" className="mt-4 text-xs">
                  Reset Semua Filter
                </Button>
              </div>
            ) : (
              /* Printable Items Grid Rendering by Chosen Template */
              <div>
                {/* 1. GRID STANDARD (3 Kolom A4 Stiker Standar) */}
                {labelLayout === 'GRID_STANDARD' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3.5 print:w-full">
                    {getPrintableItems().map((item: any) => {
                      const qrPixelSize = printQrSize === 'SM' ? 68 : printQrSize === 'LG' ? 104 : 84;
                      return (
                        <div 
                          key={item.uniquePrintKey || `${item.id}-${item.code}`} 
                          className="border-2 border-slate-900 rounded-xl p-3.5 flex flex-col justify-between items-center text-center page-break-inside-avoid bg-white text-slate-900 shadow-xs print:border-black print:shadow-none"
                        >
                          {/* Label Header */}
                          <div className="w-full flex items-center justify-between border-b border-slate-300 pb-1.5 mb-1.5">
                            {printShowLogo ? (
                              <div className="flex items-center gap-1">
                                <img src="/logo.svg" alt="Logo" className="w-3.5 h-3.5 object-contain" />
                                <span className="text-[9px] font-black uppercase tracking-tight text-slate-900">SMK IT Ibnul Qayyim</span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-tight text-slate-900">SMK IT Ibnul Qayyim</span>
                            )}
                            <div className="flex items-center gap-1">
                              {printShowFunding && item.fundingSource && (
                                <span className={`text-[7.5px] font-bold uppercase px-1 py-0.2 rounded border ${
                                  item.fundingSource === 'Pinjam' ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {item.fundingSource}
                                </span>
                              )}
                              <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Asset Name & Subunit Label */}
                          <h4 className="font-bold text-xs line-clamp-1 text-slate-900 leading-tight">{item.assetName}</h4>
                          <p className="text-[10px] font-semibold text-emerald-800">{item.unitLabel}</p>

                          {printShowFunding && item.fundingSource === 'Pinjam' && item.lenderName && (
                            <p className="text-[8px] font-semibold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 mt-0.5 max-w-full truncate">
                              Pinjaman: {item.lenderName}
                            </p>
                          )}

                          {/* High-Resolution Crisp QR Code */}
                          <div className="bg-white p-1.5 my-1.5 rounded border border-slate-200">
                            <QRCodeSVG value={item.code || ''} size={qrPixelSize} level="M" />
                          </div>

                          {/* Unit Code Font-Mono */}
                          <p className="font-mono font-black text-xs text-slate-900 tracking-wider">{item.code}</p>
                          
                          {/* Footer Info: Location & Condition */}
                          <div className="w-full mt-1.5 pt-1.5 border-t border-slate-200 text-[9px] flex justify-between items-center text-slate-700 font-medium">
                            {printShowLocation ? (
                              <span className="truncate max-w-[100px] flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                                {item.location || '-'}
                              </span>
                            ) : <span>-</span>}
                            
                            <span className={`font-bold px-1 rounded ${
                              item.condition === 'BAIK' ? 'text-emerald-800 bg-emerald-50' : 
                              item.condition === 'RUSAK_RINGAN' ? 'text-amber-800 bg-amber-50' : 
                              'text-rose-800 bg-rose-50'
                            }`}>
                              {formatConditionLabel(item.condition)}
                            </span>
                          </div>

                          {/* Responsible & Purchase Date info if enabled */}
                          {(printShowResponsible || printShowDate) && (
                            <div className="w-full flex justify-between text-[8px] text-slate-500 pt-0.5">
                              {printShowResponsible && <span>PJ: {item.responsible || '-'}</span>}
                              {printShowDate && <span>Thn: {item.purchaseDate?.split('-')[0] || '-'}</span>}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[8px] text-slate-400 italic line-clamp-1 mt-0.5">Catatan: {item.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. THERMAL COMPACT (Barcode Roll 50x30mm) */}
                {labelLayout === 'THERMAL_COMPACT' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 print:grid-cols-3 print:gap-3 print:w-full">
                    {getPrintableItems().map((item: any) => {
                      const qrPixelSize = printQrSize === 'SM' ? 56 : printQrSize === 'LG' ? 78 : 66;
                      return (
                        <div 
                          key={item.uniquePrintKey || `${item.id}-${item.code}`} 
                          className="border-2 border-black rounded-lg p-2.5 bg-white text-black page-break-inside-avoid shadow-xs flex items-center justify-between gap-2 print:border-black print:shadow-none"
                        >
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="text-[8px] font-black uppercase tracking-wider border-b border-black pb-0.5 mb-1 truncate">
                                SMK IT IBNUL QAYYIM
                              </div>
                              <h4 className="font-bold text-[10px] line-clamp-1 leading-tight text-black">{item.assetName}</h4>
                              <p className="font-mono font-black text-xs tracking-wider text-black mt-0.5">{item.code}</p>
                              <p className="text-[8px] font-semibold text-slate-700">{item.unitLabel}</p>
                            </div>

                            <div className="mt-1 pt-1 border-t border-dashed border-slate-400 text-[8px] flex items-center justify-between text-slate-800">
                              <span className="truncate max-w-[70px]">{item.location || '-'}</span>
                              <span className="font-bold">{formatConditionLabel(item.condition)}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-center">
                            <div className="p-0.5 bg-white border border-black rounded">
                              <QRCodeSVG value={item.code || ''} size={qrPixelSize} level="M" />
                            </div>
                            <span className="text-[7px] font-mono font-bold mt-0.5">INV-IQ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. CARD FULL (Kartu Identitas Sarpras Formal / Hang Tag) */}
                {labelLayout === 'CARD_FULL' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 print:w-full">
                    {getPrintableItems().map((item: any) => {
                      const qrPixelSize = printQrSize === 'SM' ? 100 : printQrSize === 'LG' ? 140 : 120;
                      return (
                        <div 
                          key={item.uniquePrintKey || `${item.id}-${item.code}`} 
                          className="border-2 border-slate-900 rounded-2xl p-4 bg-white text-slate-900 shadow-sm page-break-inside-avoid print:border-black print:shadow-none flex flex-col justify-between"
                        >
                          {/* Kop Formal */}
                          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5 mb-3">
                            <div className="flex items-center gap-2">
                              <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
                              <div>
                                <h3 className="font-black text-xs uppercase tracking-tight text-slate-900">SMK IT IBNUL QAYYIM MAKASSAR</h3>
                                <p className="text-[9px] font-bold text-emerald-800 uppercase">KARTU IDENTITAS INVENTARIS SARPRAS</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Card Content Grid */}
                          <div className="grid grid-cols-12 gap-3 items-center">
                            {/* Left Meta Table */}
                            <div className="col-span-7 space-y-1 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Nama Barang:</span>
                                <p className="font-bold text-slate-900 text-sm leading-snug">{item.assetName}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                                <div>
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Kode Master:</span>
                                  <span className="font-mono font-bold text-slate-800">{item.masterCode || item.code}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Label Unit:</span>
                                  <span className="font-bold text-emerald-800">{item.unitLabel}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                                <div>
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Ruangan / Lokasi:</span>
                                  <span className="font-semibold text-slate-800">{item.location || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Kondisi Fisik:</span>
                                  <span className={`font-bold ${
                                    item.condition === 'BAIK' ? 'text-emerald-700' : 
                                    item.condition === 'RUSAK_RINGAN' ? 'text-amber-700' : 'text-rose-700'
                                  }`}>
                                    {formatConditionLabel(item.condition)}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                                <div>
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Sumber Dana:</span>
                                  <span className="font-semibold text-slate-800">{item.fundingSource || 'BOSP Reguler'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Pengadaan:</span>
                                  <span className="font-semibold text-slate-800">{item.purchaseDate || '-'}</span>
                                </div>
                              </div>

                              {item.responsible && (
                                <div className="pt-1 text-[11px]">
                                  <span className="text-[9px] text-slate-500 font-semibold uppercase block">Penanggung Jawab:</span>
                                  <span className="font-semibold text-slate-800">{item.responsible}</span>
                                </div>
                              )}
                            </div>

                            {/* Right QR Box */}
                            <div className="col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                              <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                                <QRCodeSVG value={item.code || ''} size={qrPixelSize} level="M" />
                              </div>
                              <p className="font-mono font-black text-xs text-slate-900 tracking-wider mt-1.5">{item.code}</p>
                              <span className="text-[8px] text-slate-500 mt-0.5">Pindai untuk audit & pelacakan</span>
                            </div>
                          </div>

                          {/* Footer Sign Area */}
                          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                            <span>Sistem SIM Sarpras SMK IT Ibnul Qayyim</span>
                            <span className="italic">Paraf Petugas Inventaris: _____________</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. STICKER TOM & JERRY (Format 2 Kolom Presisi Siap Tempel) */}
                {labelLayout === 'STICKER_TJ' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 print:gap-3 print:w-full">
                    {getPrintableItems().map((item: any) => {
                      const qrPixelSize = printQrSize === 'SM' ? 62 : printQrSize === 'LG' ? 90 : 74;
                      return (
                        <div 
                          key={item.uniquePrintKey || `${item.id}-${item.code}`} 
                          className="border-2 border-slate-800 rounded-xl p-3 bg-white text-slate-900 page-break-inside-avoid shadow-xs flex items-center justify-between gap-3 print:border-black print:shadow-none"
                        >
                          <div className="shrink-0 flex flex-col items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <QRCodeSVG value={item.code || ''} size={qrPixelSize} level="M" />
                            <p className="font-mono font-black text-[10px] text-slate-900 tracking-wider mt-1">{item.code}</p>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                            <div>
                              <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1">
                                <span>SMK IT IBNUL QAYYIM</span>
                                <span className="text-emerald-800">{item.category}</span>
                              </div>
                              <h4 className="font-bold text-xs line-clamp-1 text-slate-900 leading-tight">{item.assetName}</h4>
                              <p className="text-[10px] font-semibold text-emerald-800">{item.unitLabel}</p>
                            </div>

                            <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[9px] text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[7.5px] uppercase">Lokasi:</span>
                                <span className="font-semibold text-slate-800 truncate block">{item.location || '-'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[7.5px] uppercase">Kondisi:</span>
                                <span className="font-bold text-slate-800 block">{formatConditionLabel(item.condition)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative my-8">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" onClick={() => { setShowAddForm(false); setEditingId(null); setNewAsset(defaultAsset); }}>
              <X className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white border-b pb-4">
              {editingId ? 'Edit Data Inventaris' : 'Tambah Inventaris Baru'}
            </h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kode Induk Aset (Opsional)</label>
                  <Input 
                    placeholder="Contoh: INV-MJ-001"
                    value={newAsset.assetCode} 
                    onChange={e => setNewAsset({...newAsset, assetCode: e.target.value})} 
                  />
                  <p className="text-[11px] text-slate-400">Jika jumlah &gt; 1, sub-kode otomatis: INV-MJ-001-01, -02, dst.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Barang *</label>
                  <Input required placeholder="Contoh: Meja Belajar Siswa" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kondisi Awal / Umum</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newAsset.condition}
                    onChange={e => setNewAsset({...newAsset, condition: e.target.value as any})}
                  >
                    <option value="BAIK">Baik</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan</option>
                    <option value="RUSAK_BERAT">Rusak Berat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah Unit *</label>
                  <Input 
                    type="number" 
                    required 
                    min="1" 
                    value={newAsset.quantity} 
                    onChange={e => setNewAsset({...newAsset, quantity: parseInt(e.target.value) || 1})} 
                  />
                  <p className="text-[11px] text-slate-400">Setiap unit barang akan otomatis dibuatkan nomor label mandiri.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nilai Satuan (Rp)</label>
                  <Input type="number" value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newAsset.category}
                    onChange={e => setNewAsset({...newAsset, category: e.target.value})}
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Alat Olahraga">Alat Olahraga</option>
                    <option value="Buku Perpustakaan">Buku Perpustakaan</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Izin Peminjaman *</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    value={newAsset.isBorrowable === false ? 'false' : 'true'}
                    onChange={e => setNewAsset({...newAsset, isBorrowable: e.target.value === 'true'})}
                  >
                    <option value="true">Bisa Dipinjam (Tersedia untuk Peminjaman Guru/Siswa)</option>
                    <option value="false">Tidak Bisa Dipinjam (Barang Tetap / Hanya di Tempat)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Menentukan apakah barang ini dapat dipilih pada menu Peminjaman & Barcode Scanner.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sumber Anggaran / Pengadaan *</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                    value={newAsset.fundingSource || 'BOSP Reguler'}
                    onChange={e => setNewAsset({...newAsset, fundingSource: e.target.value})}
                  >
                    {FUNDING_SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">Pilihan: BOSP Reguler, BOSP Kinerja, Operasional Sekolah, Hibah, Pinjam, Lainnya</p>
                </div>

                {/* Conditional Fields: Jika Sumber Dana = Pinjam */}
                {newAsset.fundingSource === 'Pinjam' && (
                  <div className="md:col-span-2 p-4 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/70 space-y-3.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-200 font-bold text-sm">
                      <Handshake className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                      <span>Rincian & Informasi Peminjaman Inventaris</span>
                    </div>
                    <p className="text-xs text-cyan-800 dark:text-cyan-300">
                      Inventaris ini berstatus pinjaman/fasilitas dari instansi rekanan, industri (DUDI), atau mitra kerja sama sekolah.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-cyan-950 dark:text-cyan-100 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          Pemberi Pinjaman (Instansi / DUDI / Perorangan) *
                        </label>
                        <Input 
                          required={newAsset.fundingSource === 'Pinjam'}
                          placeholder="Contoh: PT Telkom Witel Makassar / Balai Vokasi"
                          value={newAsset.lenderName || ''} 
                          onChange={e => setNewAsset({...newAsset, lenderName: e.target.value})}
                          className="bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-800 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-cyan-950 dark:text-cyan-100 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          Tanggal Mulai Pinjam *
                        </label>
                        <Input 
                          type="date"
                          required={newAsset.fundingSource === 'Pinjam'}
                          value={newAsset.loanDate || ''} 
                          onChange={e => setNewAsset({...newAsset, loanDate: e.target.value})}
                          className="bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-800 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-cyan-950 dark:text-cyan-100">
                          Batas Waktu / Rencana Pengembalian (Opsional)
                        </label>
                        <Input 
                          type="date"
                          value={newAsset.loanDueDate || ''} 
                          onChange={e => setNewAsset({...newAsset, loanDueDate: e.target.value})}
                          className="bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-800 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-cyan-950 dark:text-cyan-100">
                          No. Berita Acara / Keterangan Pinjaman (Opsional)
                        </label>
                        <Input 
                          placeholder="Contoh: BA.042/TELKOM-MKS/2024"
                          value={newAsset.loanNotes || ''} 
                          onChange={e => setNewAsset({...newAsset, loanNotes: e.target.value})}
                          className="bg-white dark:bg-slate-900 border-cyan-200 dark:border-cyan-800 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lokasi Ruangan *</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-emerald-500"
                    required 
                    value={newAsset.location} 
                    onChange={e => setNewAsset({...newAsset, location: e.target.value})}
                  >
                    <option value="" disabled>-- Pilih Lokasi Ruangan --</option>
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.name}>{room.name}</option>
                    ))}
                    <option value="Gudang">Gudang</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Pengadaan</label>
                  <Input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Penanggung Jawab</label>
                  <Input value={newAsset.responsible} onChange={e => setNewAsset({...newAsset, responsible: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Kelompok Penyusutan (UU PPh)</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newAsset.depreciationGroup || 'Kelompok 1 (4 Tahun / 25%)'}
                    onChange={e => setNewAsset({...newAsset, depreciationGroup: e.target.value})}
                  >
                    <option value="Kelompok 1 (4 Tahun / 25%)">Kelompok 1 - 4 Tahun (25% / thn) [Komputer, Printer, Alat Kantor]</option>
                    <option value="Kelompok 2 (8 Tahun / 12.5%)">Kelompok 2 - 8 Tahun (12.5% / thn) [Mebel, AC, Kendaraan Ringan]</option>
                    <option value="Kelompok 3 (16 Tahun / 6.25%)">Kelompok 3 - 16 Tahun (6.25% / thn) [Mesin Berat]</option>
                    <option value="Kelompok 4 (20 Tahun / 5%)">Kelompok 4 - 20 Tahun (5% / thn) [Konstruksi Berat]</option>
                    <option value="Bangunan Permanen (20 Tahun / 5%)">Bangunan Permanen - 20 Tahun (5% / thn)</option>
                    <option value="Bangunan Tidak Permanen (10 Tahun / 10%)">Bangunan Tidak Permanen - 10 Tahun (10% / thn)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); setNewAsset(defaultAsset); }}>Batal</Button>
                <Button type="submit" className="bg-[#047857] hover:bg-[#065f46] text-white">
                  <Save className="w-4 h-4 mr-2" /> Simpan Data Inventaris
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Depreciation & Amortization Modal */}
      {showDepreciationModal && (() => {
        const depreciationData = assets.map((asset: any) => ({
          ...asset,
          depDetails: calculateDepreciation(asset)
        }));

        const totalAcquisition = depreciationData.reduce((acc, item) => acc + item.depDetails.totalCost, 0);
        const totalAccumulated = depreciationData.reduce((acc, item) => acc + item.depDetails.accumulatedDepreciation, 0);
        const totalBookValue = depreciationData.reduce((acc, item) => acc + item.depDetails.bookValue, 0);

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-5xl w-full relative my-8 max-h-[90vh] overflow-y-auto">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden" onClick={() => setShowDepreciationModal(false)}>
                <X className="h-5 w-5" />
              </Button>
              
              <div className="flex justify-between items-start mb-6 print:hidden">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Informasi Penyusutan & Amortisasi Aset</h3>
                  <p className="text-sm text-slate-500 mt-1">Metode Garis Lurus (Straight-Line Method) sesuai UU PPh No. 36 Tahun 2008 & Standar Akuntansi Keuangan (SAK) di Indonesia.</p>
                </div>
                <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Printer className="w-4 h-4 mr-2" /> Cetak Laporan
                </Button>
              </div>

              {/* Printable Header */}
              <div className="hidden print:flex items-center gap-4 mb-6 text-left border-b-2 border-slate-900 pb-4">
                <img 
                  src="/logo.svg" 
                  alt="Logo SMK IT Ibnul Qayyim" 
                  className="w-16 h-16 object-contain shrink-0" 
                />
                <div className="flex-1">
                  <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">SMK IT IBNUL QAYYIM</h1>
                  <h2 className="text-sm font-semibold uppercase text-slate-800">Laporan Penyusutan & Amortisasi Aset Tetap</h2>
                  <p className="text-xs text-slate-600">Sesuai Peraturan Menteri Keuangan & UU Perpajakan Republik Indonesia</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Dicetak pada:</p>
                  <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total Harga Perolehan</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiah(totalAcquisition)}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Akumulasi Penyusutan</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiah(totalAccumulated)}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Nilai Buku (Book Value)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiah(totalBookValue)}</p>
                </div>
              </div>

              {/* Depreciation Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHead className="font-semibold">Kode / Nama Aset</TableHead>
                      <TableHead className="font-semibold">Kelompok & Tarif</TableHead>
                      <TableHead className="font-semibold text-center">Umur (Thn)</TableHead>
                      <TableHead className="font-semibold text-right">Harga Perolehan</TableHead>
                      <TableHead className="font-semibold text-right">Akumulasi Susut</TableHead>
                      <TableHead className="font-semibold text-right">Nilai Buku</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depreciationData.map((item: any) => (
                      <TableRow key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                        <TableCell>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                          <div className="font-mono text-xs text-slate-500">{item.assetCode} &bull; {item.purchaseDate || 'Tanpa Tgl'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.depDetails.group}</div>
                          <div className="text-[11px] text-emerald-600 font-bold">{item.depDetails.rate}% / tahun</div>
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">
                          {item.depDetails.ageYears} thn
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-800 dark:text-slate-200">
                          {formatRupiah(item.depDetails.totalCost)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-amber-700 dark:text-amber-400">
                          {formatRupiah(item.depDetails.accumulatedDepreciation)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-700 dark:text-emerald-400">
                          {formatRupiah(item.depDetails.bookValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">Ketentuan Tarif Penyusutan Fiskal (UU PPh):</p>
                <p>&bull; <strong>Kelompok 1:</strong> Masa manfaat 4 tahun, Tarif Garis Lurus 25%.</p>
                <p>&bull; <strong>Kelompok 2:</strong> Masa manfaat 8 tahun, Tarif Garis Lurus 12.5%.</p>
                <p>&bull; <strong>Kelompok 3:</strong> Masa manfaat 16 tahun, Tarif Garis Lurus 6.25%.</p>
                <p>&bull; <strong>Kelompok 4 / Bangunan Permanen:</strong> Masa manfaat 20 tahun, Tarif Garis Lurus 5%.</p>
              </div>

              <div className="flex justify-end mt-6 print:hidden">
                <Button onClick={() => setShowDepreciationModal(false)} variant="outline">Tutup</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Individual QR Modal & Physical Tracking Label Export */}
      {showQRFor && (() => {
        const currentAsset = assets.find((a: any) => a.id === showQRFor.assetId);
        if (!currentAsset) return null;

        const units = ensureAssetUnits(currentAsset);
        // If specific unitCode requested, find that unit; otherwise default to first unit or master
        const currentUnit = showQRFor.unitCode 
          ? units.find(u => u.unitCode === showQRFor.unitCode) || units[0]
          : units[0];

        const targetCode = currentUnit?.unitCode || currentAsset.assetCode;
        const targetCondition = currentUnit?.condition || currentAsset.condition;

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 print:hidden" onClick={() => setShowQRFor(null)}>
                <X className="h-5 w-5" />
              </Button>
              <h3 className="text-xl font-bold mb-1 text-slate-800 dark:text-white print:hidden">Label Pelacakan Fisik (QR Code)</h3>
              <p className="text-xs text-slate-500 mb-4 print:hidden">
                {units.length > 1 ? `Stiker fisik untuk Unit #${currentUnit?.unitNumber} dari total ${units.length} unit.` : 'Pratinjau label stiker aset untuk pelacakan inventaris.'}
              </p>

              {/* Unit Selector if multiple units */}
              {units.length > 1 && (
                <div className="mb-4 print:hidden">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Pilih Unit Barang:</label>
                  <select 
                    value={currentUnit?.unitCode}
                    onChange={(e) => setShowQRFor({ assetId: currentAsset.id, unitCode: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs px-3 font-medium text-slate-800 dark:text-slate-200"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.unitCode}>
                        {u.unitCode} - Unit #{u.unitNumber} ({formatConditionLabel(u.condition)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Printable Asset Tag Card */}
              <div className="border-2 border-slate-900 rounded-xl p-5 bg-white text-slate-900 flex flex-col items-center text-center shadow-sm">
                <div className="w-full border-b border-slate-300 pb-2 mb-3 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <img src="/logo.svg" alt="Logo" className="w-4 h-4 object-contain" />
                    <span>SMK IT Ibnul Qayyim</span>
                  </div>
                  <span>{currentAsset.category}</span>
                </div>
                
                <h4 className="font-bold text-base">{currentAsset.name}</h4>
                {units.length > 1 && (
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">Unit #{currentUnit?.unitNumber} dari {units.length} Unit</p>
                )}

                <div className="bg-white p-3 rounded-lg border border-slate-200 my-2">
                  <QRCodeSVG value={targetCode} size={140} level="M" />
                </div>
                
                <p className="font-mono font-bold text-base text-emerald-800 tracking-wider my-0.5">{targetCode}</p>
                
                <div className="w-full grid grid-cols-2 gap-2 text-xs text-left mt-3 pt-3 border-t border-slate-200">
                  <div><span className="text-slate-500 font-medium">Lokasi:</span> <span className="font-semibold">{currentAsset.location || '-'}</span></div>
                  <div>
                    <span className="text-slate-500 font-medium">Kondisi:</span>{' '}
                    <span className={`font-bold ${
                      targetCondition === 'BAIK' ? 'text-emerald-700' : 
                      targetCondition === 'RUSAK_RINGAN' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {formatConditionLabel(targetCondition)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Sumber:</span>{' '}
                    <span className={`font-semibold ${currentAsset.fundingSource === 'Pinjam' ? 'text-cyan-700 font-bold' : ''}`}>
                      {currentAsset.fundingSource || 'BOSP Reguler'}
                    </span>
                  </div>
                  <div><span className="text-slate-500 font-medium">Pengadaan:</span> <span className="font-semibold">{currentAsset.purchaseDate || '-'}</span></div>
                  <div><span className="text-slate-500 font-medium">PJ:</span> <span className="font-semibold">{currentAsset.responsible || '-'}</span></div>
                  {currentAsset.fundingSource === 'Pinjam' && currentAsset.lenderName && (
                    <div className="col-span-2 bg-cyan-50 p-2 rounded border border-cyan-200 text-[11px] text-cyan-900 mt-1">
                      <p><span className="font-semibold">Pemberi Pinjaman:</span> {currentAsset.lenderName}</p>
                      {currentAsset.loanDate && <p><span className="font-semibold">Tgl Pinjam:</span> {currentAsset.loanDate}</p>}
                    </div>
                  )}
                </div>

                {currentUnit?.notes && (
                  <div className="w-full text-left mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <span className="font-semibold">Catatan:</span> {currentUnit.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-6 print:hidden">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setShowQRFor(null); 
                    handlePrintSingleUnitDirect(currentAsset.id, currentUnit?.unitCode);
                  }} 
                  className="flex-1 text-xs border-emerald-200 text-emerald-800 dark:text-emerald-300 dark:border-emerald-800"
                >
                  <Tag className="w-3.5 h-3.5 mr-1.5" /> Buka di Studio Cetak
                </Button>
                {units.length > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => { setShowQRFor(null); handlePrintSingleAssetUnits(currentAsset.id); }} 
                    className="text-xs"
                  >
                    Semua ({units.length}) Unit
                  </Button>
                )}
                <Button onClick={() => window.print()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  <Printer className="w-4 h-4 mr-1.5" /> Cetak Sekarang
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modal Konfirmasi Hapus Aset Inventaris */}
      {deleteTargetAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Hapus Aset Inventaris?
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Apakah Anda yakin ingin menghapus data aset ini? Seluruh data unit fisik, kode barcode/QR, dan riwayat terkait akan dihapus secara permanen.
            </p>

            {/* Asset Details Preview */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-left text-xs mb-5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Aset:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deleteTargetAsset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Induk:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{deleteTargetAsset.assetCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori / Lokasi:</span>
                <span className="text-slate-700 dark:text-slate-300">{deleteTargetAsset.category} • {deleteTargetAsset.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Unit:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteTargetAsset.quantity} Unit Fisik</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTargetAsset(null)}
                className="flex-1 text-xs h-10 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteAsset}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Aset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Lifecycle History Timeline Modal */}
      {historyAsset && (
        <AssetHistoryModal
          isOpen={!!historyAsset}
          onClose={() => {
            setHistoryAsset(null);
            setHistoryUnitCode(undefined);
          }}
          asset={historyAsset}
          maintenances={maintenances}
          loans={loans}
          stockOpnames={stockOpnames}
          initialUnitCode={historyUnitCode}
          onAddCustomEvent={handleAddCustomHistoryEvent}
        />
      )}
    </div>
  );
}

