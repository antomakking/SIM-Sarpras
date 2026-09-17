import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { initialSignatorySettings, SignatorySettings } from '../store/data';

export interface ReportHeaderOptions {
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  schoolYear?: string;
}

export function getSignatorySettings(): SignatorySettings {
  try {
    const saved = localStorage.getItem('iq-signatory-settings');
    if (saved) {
      return { ...initialSignatorySettings, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load signatory settings:', err);
  }
  return initialSignatorySettings;
}

export function createSchoolPdfDocument(options: ReportHeaderOptions): { doc: jsPDF; startY: number } {
  const orientation = options.orientation || 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header / Kop Surat
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('YAYASAN PENDIDIKAN IBNUL QAYYIM MAKASSAR', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(3, 44, 36); // Forest Teal #032C24
  doc.text('SMK IT IBNUL QAYYIM MAKASSAR', pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('Bidang Keahlian: Teknologi Informasi & Komunikasi | NSS: 402196001001 | NPSN: 69989098', pageWidth / 2, 23, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('Alamat: Jl. Goa Ria No. 10, Sudiang, Kec. Biringkanaya, Kota Makassar, Sulawesi Selatan 90242', pageWidth / 2, 27, { align: 'center' });

  // Double Horizontal Line (Kop line)
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;
  
  doc.setDrawColor(3, 44, 36);
  doc.setLineWidth(0.7);
  doc.line(leftMargin, 30, rightMargin, 30);
  
  doc.setLineWidth(0.25);
  doc.line(leftMargin, 31.2, rightMargin, 31.2);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(options.title.toUpperCase(), pageWidth / 2, 38, { align: 'center' });

  // Subtitle / Periode / Date
  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle, pageWidth / 2, 43, { align: 'center' });
  }

  return { doc, startY: options.subtitle ? 47 : 43 };
}

export function addSignaturesToPdf(
  doc: jsPDF, 
  finalY: number, 
  options?: { 
    signerLeftRole?: string; 
    signerLeftName?: string; 
    signerLeftNiy?: string;
    signerRightRole?: string; 
    signerRightName?: string; 
    signerRightNiy?: string;
    locationDate?: string 
  }
) {
  const settings = getSignatorySettings();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // If finalY is too close to bottom, add a new page
  let signY = finalY + 12;
  if (signY + 38 > pageHeight) {
    doc.addPage();
    signY = 20;
  }

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const locationDate = options?.locationDate || `${settings.city || 'Makassar'}, ${todayStr}`;
  const signerLeftRole = options?.signerLeftRole || `Mengetahui,\n${settings.headmaster.title || 'Kepala Sekolah'}`;
  const signerLeftName = options?.signerLeftName || settings.headmaster.name;
  const signerLeftNiy = options?.signerLeftNiy || settings.headmaster.niy;

  const signerRightRole = options?.signerRightRole || settings.sarprasOfficer.title;
  const signerRightName = options?.signerRightName || settings.sarprasOfficer.name;
  const signerRightNiy = options?.signerRightNiy || settings.sarprasOfficer.niy;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left Signature
  const leftX = 22;
  doc.text(signerLeftRole, leftX, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(signerLeftName, leftX, signY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(signerLeftNiy, leftX, signY + 28);

  // Right Signature
  const rightX = pageWidth - 70;
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(locationDate, rightX, signY - 4);
  doc.text(signerRightRole, rightX, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(signerRightName, rightX, signY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(signerRightNiy, rightX, signY + 28);
}

// 1. Export Laporan Peminjaman ke PDF Langsung
export function downloadLoansPdf(loans: any[], startDate?: string, endDate?: string) {
  const filteredLoans = loans.filter((l: any) => {
    if (startDate && l.startDate < startDate) return false;
    if (endDate && l.startDate > endDate) return false;
    return true;
  });

  const periodText = startDate || endDate 
    ? `Periode: ${startDate || 'Awal'} s.d. ${endDate || 'Sekarang'} | Total: ${filteredLoans.length} Transaksi`
    : `Semua Periode | Total Data: ${filteredLoans.length} Transaksi`;

  const { doc, startY } = createSchoolPdfDocument({
    title: 'Laporan Rekapitulasi Peminjaman Sarana & Prasarana',
    subtitle: periodText,
    orientation: 'landscape'
  });

  const head = [['No', 'ID Pinjam', 'Nama Peminjam', 'Tipe', 'Barang / Ruangan', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Keperluan']];
  const body = filteredLoans.map((l: any, idx: number) => [
    (idx + 1).toString(),
    l.id || `PJ-${idx + 1}`,
    l.borrowerName || '-',
    l.type || '-',
    l.itemName || '-',
    l.startDate || '-',
    l.endDate || '-',
    l.status || '-',
    l.purpose || l.notes || '-'
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36], // Forest Teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 38 },
      3: { halign: 'center', cellWidth: 18 },
      4: { cellWidth: 50 },
      5: { halign: 'center', cellWidth: 24 },
      6: { halign: 'center', cellWidth: 24 },
      7: { halign: 'center', cellWidth: 22 },
      8: { cellWidth: 'auto' }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  addSignaturesToPdf(doc, finalY);

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Laporan_Peminjaman_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

// 2. Export Jadwal Pemeliharaan ke PDF Langsung
export function downloadMaintenancePdf(maintenanceList: any[]) {
  const { doc, startY } = createSchoolPdfDocument({
    title: 'Jadwal Pemeliharaan & Servis Berkala Aset',
    subtitle: `Aset Bernilai Tinggi (≥ Rp 1.500.000) | Total: ${maintenanceList.length} Item`,
    orientation: 'landscape'
  });

  const head = [['No', 'Kode Aset', 'Nama Barang', 'Lokasi', 'Harga Satuan', 'Servis Terakhir', 'Jatuh Tempo', 'Sisa Waktu', 'Status']];
  const body = maintenanceList.map((m: any, idx: number) => [
    (idx + 1).toString(),
    m.assetCode || '-',
    m.name || '-',
    m.location || '-',
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(m.price || 0),
    m.lastServiceDate || '-',
    m.nextDueDate || '-',
    m.diffDays < 0 ? `Lewat ${Math.abs(m.diffDays)} hari` : `${m.diffDays} hari`,
    m.status || '-'
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 26 },
      2: { cellWidth: 55 },
      3: { cellWidth: 35 },
      4: { halign: 'right', cellWidth: 32 },
      5: { halign: 'center', cellWidth: 28 },
      6: { halign: 'center', cellWidth: 28 },
      7: { halign: 'center', cellWidth: 26 },
      8: { halign: 'center', cellWidth: 24 }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const settings = getSignatorySettings();
  addSignaturesToPdf(doc, finalY, { 
    signerRightRole: settings.maintenanceCoordinator.title,
    signerRightName: settings.maintenanceCoordinator.name,
    signerRightNiy: settings.maintenanceCoordinator.niy
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Jadwal_Pemeliharaan_Aset_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

// 3. Export Buku Inventaris ke PDF Langsung
export function downloadAssetsPdf(assets: any[]) {
  const { doc, startY } = createSchoolPdfDocument({
    title: 'Buku Induk Inventaris Sarana & Prasarana',
    subtitle: `Rekapitulasi Seluruh Aset Vokasi SMK IT Ibnul Qayyim Makassar | Total: ${assets.length} Item`,
    orientation: 'landscape'
  });

  const totalValue = assets.reduce((sum, a) => sum + ((a.price || 0) * (a.quantity || 1)), 0);

  const head = [['No', 'Kode Aset', 'Nama Barang / Aset', 'Kategori', 'Sumber Dana', 'Kondisi', 'Jumlah', 'Harga Satuan', 'Total Nilai', 'Lokasi']];
  const body = assets.map((a: any, idx: number) => [
    (idx + 1).toString(),
    a.assetCode || '-',
    a.name || '-',
    a.category || '-',
    a.fundingSource || 'BOSP Reguler',
    a.condition || '-',
    (a.quantity || 1).toString(),
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a.price || 0),
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format((a.price || 0) * (a.quantity || 1)),
    a.location || '-'
  ]);

  // Append Total Row
  body.push([
    '',
    '',
    'TOTAL KESELURUHAN NILAI ASET',
    '',
    '',
    '',
    assets.reduce((sum, a) => sum + (a.quantity || 1), 0).toString(),
    '',
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue),
    ''
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { halign: 'center', cellWidth: 24 },
      2: { cellWidth: 48 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'right', cellWidth: 28 },
      8: { halign: 'right', cellWidth: 30 },
      9: { cellWidth: 32 }
    },
    didParseCell: (data) => {
      // Style total row
      if (data.row.index === body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const settings = getSignatorySettings();
  addSignaturesToPdf(doc, finalY, {
    signerRightRole: settings.sarprasOfficer.title,
    signerRightName: settings.sarprasOfficer.name,
    signerRightNiy: settings.sarprasOfficer.niy
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Buku_Inventaris_Aset_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

// 4. Export KIR Ruangan ke PDF Langsung
export function downloadKIRPdf(assets: any[], roomName: string, rooms: any[] = []) {
  const filtered = assets.filter((a: any) => roomName === 'Semua Ruangan' || a.location === roomName);
  const matchedRoom = rooms.find(r => r.name === roomName);
  const settings = getSignatorySettings();
  const pjName = matchedRoom?.pic || settings.sarprasOfficer.name;

  const { doc, startY } = createSchoolPdfDocument({
    title: `Kartu Inventaris Ruangan (KIR) - ${roomName.toUpperCase()}`,
    subtitle: `Penanggung Jawab Ruangan: ${pjName} | Total Barang: ${filtered.length} Jenis`,
    orientation: 'portrait'
  });

  const head = [['No', 'Kode Aset', 'Nama Barang', 'Sumber Dana', 'Kondisi', 'Jumlah', 'Total Nilai (Rp)']];
  const body = filtered.map((a: any, idx: number) => [
    (idx + 1).toString(),
    a.assetCode || '-',
    a.name || '-',
    a.fundingSource || 'BOSP Reguler',
    a.condition || 'BAIK',
    (a.quantity || 1).toString(),
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format((a.price || 0) * (a.quantity || 1))
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 28 },
      2: { cellWidth: 52 },
      3: { cellWidth: 28 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'right', cellWidth: 32 }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  addSignaturesToPdf(doc, finalY, {
    signerRightRole: `Penanggung Jawab ${roomName}`,
    signerRightName: pjName,
    signerRightNiy: 'NIY / NIP Penanggung Jawab'
  });

  const cleanRoom = roomName.replace(/[^a-zA-Z0-9]/g, '_');
  const today = new Date().toISOString().split('T')[0];
  doc.save(`KIR_${cleanRoom}_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

// 5. Export Buku Perpustakaan ke PDF Langsung
export function downloadBooksPdf(books: any[], fundingFilter = 'SEMUA', categoryFilter = 'SEMUA') {
  const filtered = books.filter(b => 
    (fundingFilter === 'SEMUA' || b.fundingSource === fundingFilter) &&
    (categoryFilter === 'SEMUA' || b.category === categoryFilter)
  );

  const { doc, startY } = createSchoolPdfDocument({
    title: 'Buku Induk Inventaris Koleksi Perpustakaan',
    subtitle: `Filter Kategori: ${categoryFilter} | Sumber Anggaran: ${fundingFilter} | Total: ${filtered.length} Judul Buku`,
    orientation: 'landscape'
  });

  const head = [['No', 'Kode Buku', 'Judul Buku', 'Pengarang', 'Penerbit', 'Tahun', 'ISBN', 'Kategori', 'Rak', 'Total', 'Ada', 'Pinjam']];
  const body = filtered.map((b: any, idx: number) => [
    (idx + 1).toString(),
    b.bookCode || '-',
    b.title || '-',
    b.author || '-',
    b.publisher || '-',
    b.publishYear?.toString() || '-',
    b.isbn || '-',
    b.category || '-',
    b.rackLocation || b.location || '-',
    (b.totalCopies || 0).toString(),
    (b.availableCopies || 0).toString(),
    (b.borrowedCopies || 0).toString()
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { halign: 'center', cellWidth: 22 },
      2: { cellWidth: 55 },
      3: { cellWidth: 32 },
      4: { cellWidth: 30 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 25 },
      7: { cellWidth: 30 },
      8: { cellWidth: 20 },
      9: { halign: 'center', cellWidth: 12 },
      10: { halign: 'center', cellWidth: 10 },
      11: { halign: 'center', cellWidth: 10 }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const settings = getSignatorySettings();
  addSignaturesToPdf(doc, finalY, { 
    signerRightRole: settings.librarian.title,
    signerRightName: settings.librarian.name,
    signerRightNiy: settings.librarian.niy
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Buku_Induk_Perpustakaan_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

// 6. Export BHP ke PDF Langsung
export function downloadBhpPdf(consumables: any[], categoryFilter = 'SEMUA', statusFilter = 'SEMUA') {
  const filteredBhp = consumables.filter((item: any) => {
    if (categoryFilter !== 'SEMUA') {
      const matchCat = item.category === categoryFilter || (item.itemCode && item.itemCode.startsWith(categoryFilter));
      if (!matchCat) return false;
    }
    const isLow = item.stock <= (item.reorderPoint || 5);
    if (statusFilter === 'MENIPIS' && !isLow) return false;
    if (statusFilter === 'AMAN' && isLow) return false;
    return true;
  });

  const { doc, startY } = createSchoolPdfDocument({
    title: 'Laporan Rekapitulasi Stok Barang Habis Pakai (BHP)',
    subtitle: `Kategori: ${categoryFilter} | Status Stok: ${statusFilter} | Total: ${filteredBhp.length} Item`,
    orientation: 'portrait'
  });

  const head = [['No', 'Kode BHP', 'Nama Barang', 'Kategori', 'Stok', 'Satuan', 'Min. Stok', 'Lokasi', 'Status']];
  const body = filteredBhp.map((item: any, idx: number) => {
    const isLow = item.stock <= (item.reorderPoint || 5);
    const isCritical = item.stock === 0;
    const statusText = isCritical ? 'KRITIS' : isLow ? 'MENIPIS' : 'AMAN';

    return [
      (idx + 1).toString(),
      item.itemCode || '-',
      item.name || '-',
      item.category || '-',
      (item.stock || 0).toString(),
      item.unit || 'Unit',
      (item.reorderPoint || 5).toString(),
      item.location || 'Gudang TU',
      statusText
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { halign: 'center', cellWidth: 22 },
      2: { cellWidth: 46 },
      3: { cellWidth: 26 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 25 },
      8: { halign: 'center', cellWidth: 18 }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const settings = getSignatorySettings();
  addSignaturesToPdf(doc, finalY, { 
    signerRightRole: settings.bhpOfficer.title,
    signerRightName: settings.bhpOfficer.name,
    signerRightNiy: settings.bhpOfficer.niy
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Laporan_Stok_BHP_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

// 7. Export Berita Acara / Lembar Verifikasi Stock Opname ke PDF Langsung
export function downloadStockOpnamePdf(session: any, customItems?: any[], filterDescription?: string) {
  const items = customItems && customItems.length > 0 ? customItems : (session.items || []);
  let subtitle = `${session.title} | Kode: ${session.sessionCode} | Auditor: ${session.auditorName}`;
  if (filterDescription) {
    subtitle += ` | Filter: ${filterDescription}`;
  }

  const { doc, startY } = createSchoolPdfDocument({
    title: `BERITA ACARA HASIL VERIFIKASI FISIK & STOK OPNAME`,
    subtitle,
    orientation: 'landscape'
  });

  // Summary box text
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const statusLabel = session.status === 'COMPLETED' ? 'SELESAI & DISETUJUI' : session.status === 'ADJUSTED' ? 'SUDAH DISESUAIKAN (ADJUSTED)' : session.status === 'IN_PROGRESS' ? 'SEDANG BERJALAN' : 'DRAFT';
  const totalInList = items.length;
  const checkedInList = items.filter((i: any) => i.status !== 'BELUM_DIPERIKSA').length;
  const matchInList = items.filter((i: any) => i.status === 'SESUAI').length;
  const discInList = items.filter((i: any) => i.status === 'SELISIH').length;

  doc.text(
    `Periode: ${session.startDate} ${session.endDate ? `s.d ${session.endDate}` : ''}   |   Status: ${statusLabel}   |   Daftar: ${checkedInList}/${totalInList} Terperiksa (Cocok: ${matchInList}, Selisih: ${discInList})`,
    14,
    startY - 2
  );

  const head = [['No', 'Kode Barang', 'Nama Barang / Aset', 'Kategori', 'Lokasi', 'Stok Sistem', 'Stok Fisik', 'Selisih', 'Kondisi', 'Status Opname', 'Catatan / Tindak Lanjut']];
  
  const body = items.map((item: any, idx: number) => {
    const diff = item.difference ?? ((item.physicalQty ?? item.systemQty) - (item.systemQty ?? 0));
    const diffStr = diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
    const statusText = item.status === 'SESUAI' ? 'SESUAI' : item.status === 'SELISIH' ? 'SELISIH' : 'BELUM CEK';

    return [
      (idx + 1).toString(),
      item.itemCode || '-',
      item.itemName || '-',
      item.category || '-',
      item.location || session.targetLocation || '-',
      `${item.systemQty ?? 0} ${item.unit || 'Unit'}`,
      item.physicalQty !== undefined ? `${item.physicalQty} ${item.unit || 'Unit'}` : '-',
      diffStr,
      item.condition || 'BAIK',
      statusText,
      item.notes || '-'
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: startY + 2,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [3, 44, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 24 },
      2: { cellWidth: 44 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 20 },
      9: { halign: 'center', cellWidth: 20 },
      10: { cellWidth: 48 }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        // Difference column styling
        if (data.column.index === 7) {
          const val = String(data.cell.raw || '');
          if (val.startsWith('-')) {
            data.cell.styles.textColor = [225, 29, 72]; // rose-600
            data.cell.styles.fontStyle = 'bold';
          } else if (val.startsWith('+')) {
            data.cell.styles.textColor = [37, 99, 235]; // blue-600
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [5, 150, 105]; // emerald-600
          }
        }
        // Status column styling
        if (data.column.index === 9) {
          const status = String(data.cell.raw || '');
          if (status === 'SELISIH') {
            data.cell.styles.textColor = [180, 83, 9]; // amber-700
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'SESUAI') {
            data.cell.styles.textColor = [4, 120, 87]; // emerald-700
          }
        }
      }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const settings = getSignatorySettings();
  addSignaturesToPdf(doc, finalY, { 
    signerRightRole: 'Ketua Tim Pemeriksa / Auditor Sarpras',
    signerRightName: (session.auditorName || '').split('&')[0].trim() || settings.sarprasOfficer.name,
    signerRightNiy: settings.sarprasOfficer.niy
  });

  const cleanCode = (session.sessionCode || 'SO').replace(/[^a-zA-Z0-9]/g, '_');
  const today = new Date().toISOString().split('T')[0];
  const fileSuffix = filterDescription ? '_Filtered' : '';
  doc.save(`Lembar_Verifikasi_Stok_Opname_${cleanCode}${fileSuffix}_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

/**
 * Download formal PDF for single Asset History & Lifecycle Timeline
 */
export function downloadAssetHistoryPdf(
  asset: any,
  events: any[],
  filterDescription?: string
) {
  const { doc, startY } = createSchoolPdfDocument({
    title: 'KARTU RIWAYAT & REKAM JEJAK SIKLUS HIDUP ASET',
    subtitle: `Buku Kendali Pemeliharaan, Peminjaman, Mutasi & Histori Kondisi Fisik Barang`,
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Info Box / Asset Summary Card
  const boxX = 14;
  const boxY = startY;
  const boxW = pageWidth - 28;
  const boxH = 34;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 44, 36);
  doc.text('PROFIL IDENTITAS ASET SEKOLAH', boxX + 4, boxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  // Column 1
  doc.text(`Kode Induk Aset : ${asset.assetCode || '-'}`, boxX + 4, boxY + 12);
  doc.text(`Nama Barang       : ${asset.name || '-'}`, boxX + 4, boxY + 17);
  doc.text(`Kategori              : ${asset.category || '-'}`, boxX + 4, boxY + 22);
  doc.text(`Lokasi Saat Ini    : ${asset.location || '-'}`, boxX + 4, boxY + 27);

  // Column 2
  const col2X = boxX + 75;
  doc.text(`Total Kuantitas : ${asset.quantity || 1} Unit`, col2X, boxY + 12);
  doc.text(`Kondisi Terkini  : ${asset.condition || 'BAIK'}`, col2X, boxY + 17);
  doc.text(`Sumber Dana   : ${asset.fundingSource || 'BOSP Reguler'}`, col2X, boxY + 22);
  doc.text(`Tgl Perolehan  : ${asset.purchaseDate || '-'}`, col2X, boxY + 27);

  // Column 3
  const col3X = boxX + 130;
  const priceFormatted = 'Rp ' + Math.round(asset.price || 0).toLocaleString('id-ID');
  doc.text(`Penanggung Jawab : ${asset.responsible || '-'}`, col3X, boxY + 12);
  doc.text(`Harga Satuan         : ${priceFormatted}`, col3X, boxY + 17);
  doc.text(`Status Izin Pinjam  : ${asset.isBorrowable === false ? 'Tidak Boleh Dipinjam' : 'Bisa Dipinjam'}`, col3X, boxY + 22);
  doc.text(`Total Riwayat Log : ${events.length} Peristiwa`, col3X, boxY + 27);

  let currentY = boxY + boxH + 6;

  if (filterDescription) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`* Filter Riwayat yang Diterapkan: ${filterDescription}`, boxX, currentY);
    currentY += 4;
  }

  // Table Body construction
  const tableData = events.map((ev, idx) => {
    let typeLabel = 'Catatan';
    if (ev.type === 'ACQUISITION') typeLabel = 'Pengadaan';
    else if (ev.type === 'MAINTENANCE') typeLabel = 'Pemeliharaan / Servis';
    else if (ev.type === 'LOAN') typeLabel = 'Peminjaman';
    else if (ev.type === 'STOCK_OPNAME') typeLabel = 'Sensus / Audit';
    else if (ev.type === 'CONDITION_CHANGE') typeLabel = 'Ubah Kondisi';
    else if (ev.type === 'MUTATION') typeLabel = 'Mutasi Ruang';

    const costStr = ev.cost ? 'Rp ' + Math.round(ev.cost).toLocaleString('id-ID') : '-';
    const actorStr = ev.actor ? `${ev.actor}${ev.actorRole ? `\n(${ev.actorRole})` : ''}` : '-';
    const detailStr = `${ev.title}\n${ev.description || ''}${ev.ticketNumber ? `\n[Ref/Tiket: ${ev.ticketNumber}]` : ''}${ev.partsReplaced ? `\n[Suku Cadang: ${ev.partsReplaced}]` : ''}`;

    return [
      idx + 1,
      ev.timestamp || '-',
      typeLabel,
      detailStr,
      actorStr,
      costStr,
      ev.status || '-'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'No',
      'Tanggal & Jam',
      'Jenis Aktivitas',
      'Judul & Rincian Peristiwa / Catatan Siklus Hidup',
      'Pihak Terkait / Pelaksana',
      'Biaya (Rp)',
      'Status / Hasil'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [3, 44, 36], // Forest Teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'left', cellWidth: 62 },
      4: { halign: 'left', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 16 }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        // Highlight acquisition or maintenance rows
        const typeCell = String(data.row.raw?.[2] || '');
        if (typeCell === 'Pengadaan') {
          data.cell.styles.fillColor = [240, 253, 244]; // emerald-50
        } else if (typeCell.includes('Pemeliharaan')) {
          data.cell.styles.fillColor = [254, 252, 232]; // amber-50
        } else if (typeCell === 'Peminjaman') {
          data.cell.styles.fillColor = [239, 246, 255]; // blue-50
        }
      }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const settings = getSignatorySettings();
  addSignaturesToPdf(doc, finalY, {
    signerRightRole: 'Penanggung Jawab Sarpras / Pengelola Aset',
    signerRightName: settings.sarprasOfficer.name,
    signerRightNiy: settings.sarprasOfficer.niy
  });

  const cleanCode = (asset.assetCode || 'ASET').replace(/[^a-zA-Z0-9]/g, '_');
  const today = new Date().toISOString().split('T')[0];
  doc.save(`Kartu_Riwayat_Aset_${cleanCode}_SMKIT_Ibnul_Qayyim_${today}.pdf`);
}

