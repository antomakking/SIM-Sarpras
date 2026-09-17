export type FundingSource = 'BOSP Reguler' | 'BOSP Kinerja' | 'Operasional Sekolah' | 'Hibah' | 'Pinjam' | 'Lainnya';

export const FUNDING_SOURCES: FundingSource[] = [
  'BOSP Reguler',
  'BOSP Kinerja',
  'Operasional Sekolah',
  'Hibah',
  'Pinjam',
  'Lainnya'
];

export interface AssetUnit {
  id: string;
  unitCode: string;
  unitNumber: number;
  condition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  location?: string;
  notes?: string;
  serialNumber?: string;
  isBorrowable?: boolean;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  location: string;
  condition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  quantity: number;
  price: number;
  purchaseDate: string;
  responsible: string;
  isBorrowable?: boolean; // Status apakah barang boleh dipinjam atau tidak
  fundingSource?: FundingSource | string;
  lenderName?: string; // Pemberi Pinjaman (jika sumber = Pinjam)
  loanDate?: string; // Tanggal Pinjam (jika sumber = Pinjam)
  loanDueDate?: string; // Batas Waktu Pinjam / Pengembalian
  loanNotes?: string; // No. BA / Perjanjian Pinjam
  lastServiceDate?: string;
  maintenanceIntervalDays?: number;
  depreciationGroup?: string;
  units?: AssetUnit[];
  history?: AssetHistoryEvent[];
}

export type AssetHistoryEventType = 
  | 'ACQUISITION'       // Pengadaan / Perolehan Awal
  | 'MAINTENANCE'       // Pemeliharaan / Servis / Perbaikan
  | 'LOAN'              // Peminjaman / Pengembalian
  | 'CONDITION_CHANGE'  // Perubahan Kondisi Fisik
  | 'MUTATION'          // Mutasi Lokasi / Pemindahan Ruangan
  | 'POLICY_CHANGE'     // Kebijakan Izin Pinjam
  | 'STOCK_OPNAME'      // Sensus Fisik / Stok Opname
  | 'MANUAL_NOTE';      // Catatan Log Insidental

export interface AssetHistoryEvent {
  id: string;
  assetId: string;
  unitCode?: string;
  unitNumber?: number;
  timestamp: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
  type: AssetHistoryEventType;
  title: string;
  description: string;
  actor?: string; // Petugas / Teknisi / Peminjam
  actorRole?: string;
  status?: string; // Selesai, Sedang Berjalan, Dipinjam, Sesuai, etc.
  cost?: number; // Biaya pemeliharaan / perolehan jika ada
  ticketNumber?: string; // No. SPK / No. Peminjaman / Kode Sesi
  previousState?: string; // e.g. "RUSAK_RINGAN"
  newState?: string; // e.g. "BAIK"
  location?: string;
  partsReplaced?: string;
  technicianPhone?: string;
  vendorCompany?: string;
  notes?: string;
}

/**
 * Ensures an asset has a fully synchronized units array matching its quantity.
 */
export function ensureAssetUnits(asset: any): AssetUnit[] {
  const qty = Math.max(1, parseInt(asset.quantity) || 1);
  const baseCode = asset.assetCode || 'INV-001';
  const defaultCondition = asset.condition || 'BAIK';
  const existingUnits: AssetUnit[] = Array.isArray(asset.units) ? asset.units : [];

  const syncedUnits: AssetUnit[] = [];
  for (let i = 1; i <= qty; i++) {
    const padNum = String(i).padStart(2, '0');
    const existing = existingUnits[i - 1];

    if (existing) {
      syncedUnits.push({
        id: existing.id || `${asset.id || 'ast'}-u-${i}`,
        unitCode: existing.unitCode || `${baseCode}-${padNum}`,
        unitNumber: existing.unitNumber || i,
        condition: existing.condition || defaultCondition,
        location: existing.location || asset.location || '',
        notes: existing.notes || '',
        serialNumber: existing.serialNumber || '',
        isBorrowable: existing.isBorrowable !== undefined ? existing.isBorrowable : (asset.isBorrowable !== undefined ? asset.isBorrowable : true)
      });
    } else {
      syncedUnits.push({
        id: `${asset.id || 'ast'}-u-${i}`,
        unitCode: `${baseCode}-${padNum}`,
        unitNumber: i,
        condition: defaultCondition,
        location: asset.location || '',
        notes: '',
        serialNumber: '',
        isBorrowable: asset.isBorrowable !== undefined ? asset.isBorrowable : true
      });
    }
  }

  return syncedUnits;
}

/**
 * Calculates condition breakdown statistics for an asset.
 */
export function getAssetConditionStats(asset: any) {
  const units = ensureAssetUnits(asset);
  let baik = 0;
  let rusakRingan = 0;
  let rusakBerat = 0;

  units.forEach(u => {
    if (u.condition === 'RUSAK_BERAT') rusakBerat++;
    else if (u.condition === 'RUSAK_RINGAN') rusakRingan++;
    else baik++;
  });

  // Calculate dominant overall condition
  let dominantCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' = 'BAIK';
  if (rusakBerat > 0 && rusakBerat >= baik && rusakBerat >= rusakRingan) {
    dominantCondition = 'RUSAK_BERAT';
  } else if (rusakRingan > 0 && (rusakRingan + rusakBerat) >= baik) {
    dominantCondition = 'RUSAK_RINGAN';
  } else if (rusakBerat > 0 || rusakRingan > 0) {
    dominantCondition = 'RUSAK_RINGAN';
  }

  return {
    total: units.length,
    baik,
    rusakRingan,
    rusakBerat,
    dominantCondition,
    isMixed: (baik > 0 && (rusakRingan > 0 || rusakBerat > 0)) || (rusakRingan > 0 && rusakBerat > 0)
  };
}

export function formatConditionLabel(condition: string): string {
  switch (condition) {
    case 'BAIK':
      return 'Baik';
    case 'RUSAK_RINGAN':
      return 'Rusak Ringan';
    case 'RUSAK_BERAT':
      return 'Rusak Berat';
    default:
      return condition || 'Baik';
  }
}

export function getConditionBadgeColor(condition: string): { bg: string; text: string; border: string } {
  switch (condition) {
    case 'BAIK':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800'
      };
    case 'RUSAK_RINGAN':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800'
      };
    case 'RUSAK_BERAT':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800'
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700'
      };
  }
}

export function getFundingSourceBadgeColor(source?: string): { bg: string; text: string; border: string; dot: string; color: string } {
  switch (source) {
    case 'BOSP Reguler':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
        color: '#2563EB'
      };
    case 'BOSP Kinerja':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/60',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
        color: '#9333EA'
      };
    case 'Operasional Sekolah':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        color: '#059669'
      };
    case 'Hibah':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        color: '#D97706'
      };
    case 'Pinjam':
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-950/60',
        text: 'text-cyan-800 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-800',
        dot: 'bg-cyan-500',
        color: '#0891B2'
      };
    case 'Lainnya':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-500',
        color: '#64748B'
      };
  }
}

/**
 * Format number to Indonesian Rupiah currency format.
 */
export function formatRupiah(amount: number | string | undefined): string {
  const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  if (isNaN(val)) return 'Rp 0';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

/**
 * Calculate human-readable age of an asset based on its acquisition/purchase date.
 */
export function calculateAssetAge(purchaseDate?: string): { years: number; months: number; text: string } {
  if (!purchaseDate) return { years: 0, months: 0, text: 'Tidak diketahui' };
  
  const start = new Date(purchaseDate);
  const now = new Date('2026-08-26'); // System reference date
  
  if (isNaN(start.getTime())) return { years: 0, months: 0, text: 'Format tanggal salah' };

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;
  months = Math.max(0, months);

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return { years, months: remainingMonths, text: `${years} Tahun ${remainingMonths} Bulan` };
  } else if (years > 0) {
    return { years, months: 0, text: `${years} Tahun` };
  } else {
    return { years: 0, months, text: `${months} Bulan` };
  }
}

/**
 * Aggregates and constructs a comprehensive chronological history timeline for a specific asset.
 * Combines initial acquisition, maintenance logs, loan history, stock opname audits, and custom status updates.
 */
export function buildAssetHistoryTimeline(
  asset: any,
  maintenances: any[] = [],
  loans: any[] = [],
  stockOpnames: any[] = []
): AssetHistoryEvent[] {
  if (!asset) return [];

  const events: AssetHistoryEvent[] = [];
  const assetIdStr = String(asset.id || '');
  const assetCodeStr = String(asset.assetCode || '').trim();
  const assetNameLower = String(asset.name || '').trim().toLowerCase();

  // 1. Initial Acquisition & Registration (Pengadaan Awal)
  if (asset.purchaseDate) {
    const totalCost = (asset.price || 0) * (asset.quantity || 1);
    const units = ensureAssetUnits(asset);
    events.push({
      id: `acq-${asset.id}`,
      assetId: assetIdStr,
      timestamp: `${asset.purchaseDate} 08:00`,
      type: 'ACQUISITION',
      title: 'Pengadaan Aset & Registrasi Pertama',
      description: `Aset terdaftar resmi ke dalam Sistem Inventaris Sekolah dengan kode induk ${asset.assetCode || '-'} sebanyak ${asset.quantity || 1} unit (${units.length} unit berlabel fisik). Sumber pendanaan: ${asset.fundingSource || 'BOSP Reguler'}.`,
      actor: asset.responsible || 'Petugas Sarpras',
      actorRole: 'Penanggung Jawab Aset',
      status: 'TERDAFTAR',
      cost: totalCost,
      location: asset.location || 'Gudang Sarpras',
      notes: `Harga satuan: ${formatRupiah(asset.price)}. Total nilai perolehan: ${formatRupiah(totalCost)}. Kondisi awal: ${formatConditionLabel(asset.condition || 'BAIK')}.`
    });
  }

  // 2. Maintenance Records for this asset
  if (Array.isArray(maintenances)) {
    maintenances.forEach((m: any) => {
      const matchId = m.assetId && String(m.assetId) === assetIdStr;
      const matchCode = m.assetCode && assetCodeStr && String(m.assetCode).toLowerCase() === assetCodeStr.toLowerCase();
      const matchName = m.assetName && assetNameLower && String(m.assetName).toLowerCase().includes(assetNameLower);

      if (matchId || matchCode || matchName) {
        const dateStr = m.serviceDate || m.createdAt || '2026-08-01';
        const isRepair = m.type === 'PERBAIKAN' || m.type === 'DARURAT';
        const typeLabel = m.type === 'RUTIN' ? 'Servis Rutin Berkala' : (m.type === 'DARURAT' ? 'Perbaikan Darurat' : 'Perbaikan Kerusakan');
        
        events.push({
          id: `maint-${m.id}`,
          assetId: assetIdStr,
          unitCode: m.unitCode,
          unitNumber: m.unitNumber,
          timestamp: dateStr.includes(':') ? dateStr : `${dateStr} 10:00`,
          type: 'MAINTENANCE',
          title: m.title || `Kegiatan ${typeLabel}`,
          description: m.notes || `Tindakan ${typeLabel} pada aset ${m.assetName}. ${m.partsReplaced ? `Suku cadang diganti: ${m.partsReplaced}.` : ''}`,
          actor: m.technician || 'Teknisi Servis',
          actorRole: m.vendorCompany ? `Teknisi (${m.vendorCompany})` : 'Teknisi Sarpras IT',
          status: m.status || 'SELESAI',
          cost: m.cost || 0,
          ticketNumber: m.ticketNumber,
          previousState: m.previousCondition,
          newState: m.resultCondition,
          location: m.location || asset.location,
          partsReplaced: m.partsReplaced,
          technicianPhone: m.technicianPhone,
          vendorCompany: m.vendorCompany,
          notes: m.notes
        });
      }
    });
  }

  // 3. Loans for this asset
  if (Array.isArray(loans)) {
    loans.forEach((l: any) => {
      const isInventaris = !l.type || l.type === 'Inventaris';
      const matchId = l.itemId && String(l.itemId) === assetIdStr;
      const matchName = l.itemName && assetNameLower && (
        String(l.itemName).toLowerCase().includes(assetNameLower) ||
        assetNameLower.includes(String(l.itemName).toLowerCase())
      );

      if (isInventaris && (matchId || matchName)) {
        const start = l.startDate || '2026-08-01';
        events.push({
          id: `loan-${l.id}`,
          assetId: assetIdStr,
          timestamp: `${start} 09:30`,
          type: 'LOAN',
          title: `Peminjaman Aset: ${l.borrowerName || 'Pengguna'}`,
          description: `Barang dipinjam untuk keperluan: ${l.notes || 'Kegiatan operasional/belajar'}. Masa pinjam: ${l.startDate || '-'} s.d ${l.endDate || '-'}.`,
          actor: l.borrowerName || 'Peminjam',
          actorRole: 'Peminjam Aset',
          status: l.status || 'DIPINJAM',
          ticketNumber: l.id ? `PJ-${l.id}` : undefined,
          notes: l.notes
        });
      }
    });
  }

  // 4. Stock Opname Audits for this asset
  if (Array.isArray(stockOpnames)) {
    stockOpnames.forEach((so: any) => {
      if (Array.isArray(so.items)) {
        const item = so.items.find((it: any) => 
          (it.itemId && String(it.itemId) === assetIdStr) || 
          (it.itemCode && assetCodeStr && String(it.itemCode).toLowerCase() === assetCodeStr.toLowerCase())
        );

        if (item) {
          const soDate = so.completedAt || so.startDate || '2026-08-20';
          const diff = item.difference || 0;
          const statusText = item.status === 'SESUAI' ? 'Cocok (Fisik Sesuai Buku)' : (diff < 0 ? `Kurang / Selisih (${diff} Unit)` : `Lebih (${diff} Unit)`);
          
          events.push({
            id: `so-${so.id}-${item.id}`,
            assetId: assetIdStr,
            timestamp: `${soDate} 14:00`,
            type: 'STOCK_OPNAME',
            title: `Audit Sensus Fisik (${so.sessionCode || 'SO'})`,
            description: `Pemeriksaan fisik langsung dalam audit "${so.title}". Hasil: ${statusText}. Fisik riil: ${item.physicalQty || 0} unit, Catatan sistem: ${item.systemQty || 0} unit. Kondisi fisik terverifikasi: ${formatConditionLabel(item.condition || asset.condition)}.`,
            actor: so.auditorName || 'Tim Auditor Sekolah',
            actorRole: 'Auditor Sarpras',
            status: item.status || 'SESUAI',
            ticketNumber: so.sessionCode,
            location: so.targetLocation || asset.location,
            previousState: item.systemCondition,
            newState: item.condition,
            notes: item.notes || `Diverifikasi oleh ${item.checkedBy || so.auditorName}`
          });
        }
      }
    });
  }

  // 5. Custom / Internal asset history logs explicitly stored on the asset
  if (Array.isArray(asset.history)) {
    asset.history.forEach((h: AssetHistoryEvent) => {
      // Prevent duplicate ids if already captured
      if (!events.some(e => e.id === h.id)) {
        events.push({
          ...h,
          assetId: assetIdStr
        });
      }
    });
  }

  // 6. Sort chronologically (newest first by default)
  events.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return events;
}
