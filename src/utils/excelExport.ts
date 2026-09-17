import * as XLSX from 'xlsx';
import { StockOpnameSession, StockOpnameItem } from '../store/data';

export interface ExportStockOpnameExcelOptions {
  session: StockOpnameSession;
  items?: StockOpnameItem[];
  filterDescription?: string;
}

/**
 * Export lembar verifikasi fisik / hasil stock opname ke format Microsoft Excel (.xlsx)
 */
export function exportStockOpnameExcel(
  session: StockOpnameSession,
  customItems?: StockOpnameItem[],
  filterDescription?: string
) {
  const items = customItems && customItems.length > 0 ? customItems : (session.items || []);
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  const cleanCode = (session.sessionCode || 'SO').replace(/[^a-zA-Z0-9]/g, '_');

  const statusLabel = 
    session.status === 'COMPLETED' ? 'SELESAI & DISETUJUI' :
    session.status === 'ADJUSTED' ? 'SUDAH DISESUAIKAN (ADJUSTED)' :
    session.status === 'IN_PROGRESS' ? 'SEDANG BERJALAN' : 'DRAFT';

  // Construct structured rows
  const rows: any[][] = [
    ['YAYASAN PENDIDIKAN IBNUL QAYYIM MAKASSAR'],
    ['SMK IT IBNUL QAYYIM MAKASSAR'],
    ['SISTEM INFORMASI MANAJEMEN SARANA, PRASARANA & LOGISTIK (SIM SARPRAS)'],
    ['LEMBAR VERIFIKASI FISIK & REKAPITULASI HASIL STOK OPNAME'],
    [],
    ['Judul Sesi Audit', session.title],
    ['Kode Sesi', session.sessionCode],
    ['Tanggal Pelaksanaan', `${session.startDate} ${session.endDate ? `s.d ${session.endDate}` : ''}`],
    ['Tim Auditor / Pemeriksa', session.auditorName],
    ['Ruang Lingkup / Lokasi', session.targetLocation || 'Semua Ruangan & Fasilitas'],
    ['Status Sesi', statusLabel],
    ['Kriteria / Filter Data', filterDescription || 'Semua Item dalam Sesi Ini'],
    ['Waktu Ekspor', nowTime],
    [],
    // Table Header
    [
      'No',
      'Kode Barang',
      'Nama Barang / Aset',
      'Kategori',
      'Lokasi Fisik',
      'Satuan',
      'Stok Sistem (Buku)',
      'Stok Fisik Riil',
      'Selisih (+/-)',
      'Nilai Satuan (Rp)',
      'Estimasi Deviasi Nilai (Rp)',
      'Kondisi Fisik',
      'Status Verifikasi',
      'Petugas Pemeriksa',
      'Waktu Verifikasi',
      'Catatan / Temuan / Tindak Lanjut'
    ]
  ];

  let totalSystemQty = 0;
  let totalPhysicalQty = 0;
  let totalDifference = 0;
  let totalDiscrepancyValue = 0;
  let totalMatch = 0;
  let totalDiff = 0;
  let totalUnchecked = 0;

  items.forEach((item, index) => {
    const diff = item.difference ?? ((item.physicalQty ?? item.systemQty) - item.systemQty);
    const unitPrice = item.unitPrice || 0;
    const itemDiffVal = diff * unitPrice;

    totalSystemQty += item.systemQty || 0;
    totalPhysicalQty += item.physicalQty || 0;
    totalDifference += diff;
    if (diff < 0) {
      totalDiscrepancyValue += Math.abs(diff) * unitPrice;
    }

    if (item.status === 'SESUAI') totalMatch++;
    else if (item.status === 'SELISIH') totalDiff++;
    else totalUnchecked++;

    const statusStr = 
      item.status === 'SESUAI' ? 'SESUAI (COCOK)' :
      item.status === 'SELISIH' ? 'SELISIH' : 'BELUM DIPERIKSA';

    rows.push([
      index + 1,
      item.itemCode || '-',
      item.itemName || '-',
      item.category || '-',
      item.location || session.targetLocation || '-',
      item.unit || 'Unit',
      item.systemQty ?? 0,
      item.physicalQty ?? '-',
      diff === 0 ? 0 : diff > 0 ? `+${diff}` : diff,
      unitPrice,
      itemDiffVal,
      item.condition || 'BAIK',
      statusStr,
      item.checkedBy || session.auditorName || '-',
      item.checkedAt || '-',
      item.notes || '-'
    ]);
  });

  // Empty separator
  rows.push([]);

  // Summary rows
  rows.push(['RINGKASAN HASIL VERIFIKASI:']);
  rows.push(['Total Item Barang', items.length]);
  rows.push(['Total Stok Sistem', totalSystemQty]);
  rows.push(['Total Stok Fisik Riil', totalPhysicalQty]);
  rows.push(['Total Selisih Netto', totalDifference]);
  rows.push(['Item Status Sesuai', totalMatch]);
  rows.push(['Item Status Selisih', totalDiff]);
  rows.push(['Item Belum Diperiksa', totalUnchecked]);
  rows.push(['Estimasi Nilai Selisih/Hilang (Rp)', totalDiscrepancyValue]);
  rows.push([]);
  rows.push(['Disahkan Oleh:', '']);
  rows.push(['Kepala Sekolah SMK IT Ibnul Qayyim', 'Auditor / Tim Pemeriksa']);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Kode Barang
    { wch: 36 }, // Nama Barang / Aset
    { wch: 20 }, // Kategori
    { wch: 22 }, // Lokasi Fisik
    { wch: 10 }, // Satuan
    { wch: 18 }, // Stok Sistem
    { wch: 16 }, // Stok Fisik
    { wch: 14 }, // Selisih
    { wch: 16 }, // Nilai Satuan
    { wch: 22 }, // Estimasi Deviasi
    { wch: 16 }, // Kondisi Fisik
    { wch: 20 }, // Status Verifikasi
    { wch: 22 }, // Petugas Pemeriksa
    { wch: 20 }, // Waktu Verifikasi
    { wch: 38 }  // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lembar Verifikasi');

  const fileSuffix = filterDescription ? '_Filtered' : '';
  const fileName = `Lembar_Verifikasi_Stok_Opname_${cleanCode}${fileSuffix}_SMKIT_Ibnul_Qayyim_${today}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export complete chronological Asset History & Lifecycle Timeline to Microsoft Excel (.xlsx)
 */
export function exportAssetHistoryExcel(
  asset: any,
  events: any[],
  filterDescription?: string
) {
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  const cleanCode = (asset.assetCode || 'ASET').replace(/[^a-zA-Z0-9]/g, '_');

  const rows: any[][] = [
    ['YAYASAN PENDIDIKAN IBNUL QAYYIM MAKASSAR'],
    ['SMK IT IBNUL QAYYIM MAKASSAR'],
    ['SISTEM INFORMASI MANAJEMEN SARANA, PRASARANA & LOGISTIK (SIM SARPRAS)'],
    ['KARTU KENDALI RIWAYAT & REKAM JEJAK SIKLUS HIDUP ASET (ASSET LIFECYCLE LOG)'],
    [],
    ['Kode Induk Aset', asset.assetCode || '-'],
    ['Nama Barang / Aset', asset.name || '-'],
    ['Kategori', asset.category || '-'],
    ['Lokasi Penempatan', asset.location || '-'],
    ['Total Unit Fisik', `${asset.quantity || 1} Unit`],
    ['Kondisi Terkini', asset.condition || 'BAIK'],
    ['Sumber Pendanaan', asset.fundingSource || 'BOSP Reguler'],
    ['Tanggal Perolehan', asset.purchaseDate || '-'],
    ['Harga Satuan (Rp)', asset.price || 0],
    ['Penanggung Jawab', asset.responsible || '-'],
    ['Status Izin Pinjam', asset.isBorrowable === false ? 'Tidak Boleh Dipinjam' : 'Bisa Dipinjam'],
    ['Filter Riwayat', filterDescription || 'Semua Aktivitas'],
    ['Waktu Ekspor', nowTime],
    [],
    // Headers
    [
      'No',
      'Tanggal & Waktu',
      'Kategori Aktivitas',
      'Judul Aktivitas / Peristiwa',
      'Rincian / Deskripsi Lengkap',
      'Pihak Terkait / Teknisi / Peminjam',
      'Peran Pihak',
      'Nomor Tiket / Referensi',
      'Biaya Pemeliharaan / Perolehan (Rp)',
      'Kondisi Sebelum',
      'Kondisi Sesudah',
      'Status',
      'Suku Cadang Diganti',
      'Catatan Tambahan'
    ]
  ];

  events.forEach((ev, idx) => {
    let typeLabel = 'Catatan';
    if (ev.type === 'ACQUISITION') typeLabel = 'Pengadaan / Registrasi';
    else if (ev.type === 'MAINTENANCE') typeLabel = 'Pemeliharaan / Servis';
    else if (ev.type === 'LOAN') typeLabel = 'Peminjaman Barang';
    else if (ev.type === 'STOCK_OPNAME') typeLabel = 'Audit Sensus Fisik';
    else if (ev.type === 'CONDITION_CHANGE') typeLabel = 'Perubahan Kondisi';
    else if (ev.type === 'MUTATION') typeLabel = 'Mutasi Ruangan';

    rows.push([
      idx + 1,
      ev.timestamp || '-',
      typeLabel,
      ev.title || '-',
      ev.description || '-',
      ev.actor || '-',
      ev.actorRole || '-',
      ev.ticketNumber || '-',
      ev.cost || 0,
      ev.previousState || '-',
      ev.newState || '-',
      ev.status || '-',
      ev.partsReplaced || '-',
      ev.notes || '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Tanggal & Waktu
    { wch: 22 }, // Kategori
    { wch: 32 }, // Judul
    { wch: 45 }, // Deskripsi
    { wch: 24 }, // Pihak Terkait
    { wch: 20 }, // Peran
    { wch: 18 }, // Tiket
    { wch: 22 }, // Biaya
    { wch: 16 }, // Kondisi Sebelum
    { wch: 16 }, // Kondisi Sesudah
    { wch: 16 }, // Status
    { wch: 28 }, // Suku Cadang
    { wch: 35 }  // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Aset');

  const fileName = `Kartu_Riwayat_Aset_${cleanCode}_SMKIT_Ibnul_Qayyim_${today}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
