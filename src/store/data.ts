// Initial dummy data to make the app functional on first load

export const initialAssets = [
  {
    id: "1",
    assetCode: "INV-PC-001",
    name: "Komputer Lab Dell OptiPlex",
    category: "Elektronik",
    location: "Lab Komputer 1",
    condition: "BAIK",
    quantity: 20,
    price: 7500000,
    purchaseDate: "2024-07-15",
    responsible: "Kepala Lab",
    fundingSource: "BOSP Kinerja",
    isBorrowable: false,
    lastServiceDate: "2026-05-15",
    maintenanceIntervalDays: 180,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: Array.from({ length: 20 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      if (num === 19) {
        return {
          id: `u-1-${pad}`,
          unitCode: `INV-PC-001-${pad}`,
          unitNumber: num,
          condition: "RUSAK_RINGAN",
          notes: "Kipas CPU bising",
          serialNumber: `DL-2024-${pad}`
        };
      }
      if (num === 20) {
        return {
          id: `u-1-${pad}`,
          unitCode: `INV-PC-001-${pad}`,
          unitNumber: num,
          condition: "RUSAK_RINGAN",
          notes: "Keyboard tombol Spasi agak keras",
          serialNumber: `DL-2024-${pad}`
        };
      }
      return {
        id: `u-1-${pad}`,
        unitCode: `INV-PC-001-${pad}`,
        unitNumber: num,
        condition: "BAIK",
        notes: "Berfungsi normal",
        serialNumber: `DL-2024-${pad}`
      };
    })
  },
  {
    id: "2",
    assetCode: "INV-MJ-001",
    name: "Meja Belajar Siswa",
    category: "Furnitur",
    location: "Ruang Kelas X-A",
    condition: "BAIK",
    quantity: 36,
    price: 350000,
    purchaseDate: "2022-01-10",
    responsible: "Wali Kelas",
    fundingSource: "BOSP Reguler",
    isBorrowable: false,
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 36 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      if (num === 31 || num === 32 || num === 33 || num === 34) {
        return {
          id: `u-2-${pad}`,
          unitCode: `INV-MJ-001-${pad}`,
          unitNumber: num,
          condition: "RUSAK_RINGAN",
          notes: "Permukaan meja tergores tipis"
        };
      }
      if (num === 35 || num === 36) {
        return {
          id: `u-2-${pad}`,
          unitCode: `INV-MJ-001-${pad}`,
          unitNumber: num,
          condition: "RUSAK_BERAT",
          notes: "Kaki meja kayu patah, butuh perbaikan tukang"
        };
      }
      return {
        id: `u-2-${pad}`,
        unitCode: `INV-MJ-001-${pad}`,
        unitNumber: num,
        condition: "BAIK",
        notes: "Kondisi kokoh dan baik"
      };
    })
  },
  {
    id: "3",
    assetCode: "INV-PR-001",
    name: "Proyektor Epson EB-X06",
    category: "Elektronik",
    location: "Aula",
    condition: "RUSAK_BERAT",
    quantity: 1,
    price: 5200000,
    purchaseDate: "2020-03-05",
    responsible: "Sarpras",
    fundingSource: "Operasional Sekolah",
    isBorrowable: true,
    lastServiceDate: "2026-06-01",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-3-01",
        unitCode: "INV-PR-001-01",
        unitNumber: 1,
        condition: "RUSAK_BERAT",
        notes: "Lampu proyektor mati, butuh ganti modul lampu baru",
        serialNumber: "EP-EBX06-9921"
      }
    ]
  },
  {
    id: "4",
    assetCode: "INV-AC-001",
    name: "AC Split Daikin Inverter 2 PK",
    category: "Elektronik",
    location: "Lab Komputer 1",
    condition: "BAIK",
    quantity: 2,
    price: 6800000,
    purchaseDate: "2023-08-10",
    responsible: "Kepala Lab",
    fundingSource: "BOSP Reguler",
    isBorrowable: false,
    lastServiceDate: "2026-06-15",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-4-01",
        unitCode: "INV-AC-001-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Suhu dingin normal, terakhir cuci steam 15 Jun 2026",
        serialNumber: "DK-INV2-8812"
      },
      {
        id: "u-4-02",
        unitCode: "INV-AC-001-02",
        unitNumber: 2,
        condition: "BAIK",
        notes: "Suhu dingin normal, filter bersih",
        serialNumber: "DK-INV2-8813"
      }
    ]
  },
  {
    id: "5",
    assetCode: "INV-AC-002",
    name: "AC Split Panasonic 1.5 PK",
    category: "Elektronik",
    location: "Studio Bisnis Digital",
    condition: "BAIK",
    quantity: 1,
    price: 4900000,
    purchaseDate: "2022-05-14",
    responsible: "Kepala Studio",
    fundingSource: "Hibah",
    isBorrowable: false,
    lastServiceDate: "2026-05-10",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-5-01",
        unitCode: "INV-AC-002-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Perlu dijadwalkan cuci rutin berikutnya (sudah 3 bulan lebih)",
        serialNumber: "PN-15PK-4091"
      }
    ]
  },
  {
    id: "6",
    assetCode: "INV-GEN-001",
    name: "Genset Silent Perkins 15 kVA",
    category: "Elektronik",
    location: "Ruang Server / Sarpras",
    condition: "BAIK",
    quantity: 1,
    price: 48000000,
    purchaseDate: "2021-11-20",
    responsible: "Sarpras",
    fundingSource: "Hibah",
    isBorrowable: false,
    lastServiceDate: "2026-05-20",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 3 (16 Tahun / 6.25%)",
    units: [
      {
        id: "u-6-01",
        unitCode: "INV-GEN-001-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Oli mesin & aki siap operasi, butuh cek berkala rutin",
        serialNumber: "PK-SLNT-15K-99"
      }
    ]
  },
  {
    id: "7",
    assetCode: "INV-SN-001",
    name: "Sound System Portabel Yamaha StagePas 600BT",
    category: "Elektronik",
    location: "Aula",
    condition: "BAIK",
    quantity: 1,
    price: 14500000,
    purchaseDate: "2024-02-18",
    responsible: "Sarpras",
    fundingSource: "Operasional Sekolah",
    isBorrowable: true,
    lastServiceDate: "2026-04-10",
    maintenanceIntervalDays: 120,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-7-01",
        unitCode: "INV-SN-001-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Lengkap dengan 2 speaker pasif, mixer bertenaga & mikrofon wireless",
        serialNumber: "YM-STGP600-441"
      }
    ]
  },
  {
    id: "8",
    assetCode: "INV-MK-001",
    name: "Mikroskop Binokuler Olympus CX23",
    category: "Elektronik",
    location: "Lab RPL",
    condition: "BAIK",
    quantity: 4,
    price: 8200000,
    purchaseDate: "2023-10-05",
    responsible: "Kepala Lab",
    fundingSource: "Lainnya",
    isBorrowable: true,
    lastServiceDate: "2026-03-20",
    maintenanceIntervalDays: 180,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: Array.from({ length: 4 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-8-${pad}`,
        unitCode: `INV-MK-001-${pad}`,
        unitNumber: num,
        condition: "BAIK",
        notes: "Lensa bersih dan lampu LED berfungsi optimal",
        serialNumber: `OLY-CX23-${pad}`
      };
    })
  },
  {
    id: "8b",
    assetCode: "INV-FIBER-001",
    name: "Fusion Splicer Fiber Optic & Optical Power Meter (OPM)",
    category: "Elektronik",
    location: "Lab Komputer 1",
    condition: "BAIK",
    quantity: 2,
    price: 18500000,
    purchaseDate: "2024-03-01",
    responsible: "Kepala Lab TKJ",
    fundingSource: "Pinjam",
    lenderName: "PT Telkom Indonesia (Persero) Tbk Witel Makassar",
    loanDate: "2024-03-01",
    loanDueDate: "2026-12-31",
    loanNotes: "BA Peminjaman Alat Praktik Vokasi No. 042/TELKOM-MKS/2024",
    lastServiceDate: "2026-06-10",
    maintenanceIntervalDays: 180,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-8b-01",
        unitCode: "INV-FIBER-001-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Alat praktik pinjaman industri dari PT Telkom Makassar (Kondisi presisi)",
        serialNumber: "TLK-SPLICE-0881"
      },
      {
        id: "u-8b-02",
        unitCode: "INV-FIBER-001-02",
        unitNumber: 2,
        condition: "BAIK",
        notes: "Lengkap dengan cleaver & striper fiber optic",
        serialNumber: "TLK-SPLICE-0882"
      }
    ]
  },
  // --- ASET RUANG KEPALA SEKOLAH ---
  {
    id: "9",
    assetCode: "INV-MJ-KEP-01",
    name: "Meja Eksekutif Pimpinan Kayu Jati Solid",
    category: "Furnitur",
    location: "Ruang Kepala Sekolah",
    condition: "BAIK",
    quantity: 1,
    price: 4800000,
    purchaseDate: "2023-01-15",
    responsible: "Kepala Sekolah",
    fundingSource: "BOSP Kinerja",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-9-01",
        unitCode: "INV-MJ-KEP-01-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Meja kerja pimpinan dengan laci gembok pengaman ganda",
        serialNumber: "JTI-EKS-099"
      }
    ]
  },
  {
    id: "10",
    assetCode: "INV-KS-KEP-01",
    name: "Kursi Direktur Hidrolik Ergonomis Kulit Hitam",
    category: "Furnitur",
    location: "Ruang Kepala Sekolah",
    condition: "BAIK",
    quantity: 1,
    price: 2400000,
    purchaseDate: "2023-01-15",
    responsible: "Kepala Sekolah",
    fundingSource: "BOSP Kinerja",
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-10-01",
        unitCode: "INV-KS-KEP-01-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Mekanisme hidrolik & sandaran punggung normal",
        serialNumber: "CHR-DIR-1102"
      }
    ]
  },
  {
    id: "11",
    assetCode: "INV-SF-KEP-01",
    name: "Sofa Tamu Eksekutif (Set 3+1+1 + Meja Kaca)",
    category: "Furnitur",
    location: "Ruang Kepala Sekolah",
    condition: "BAIK",
    quantity: 1,
    price: 5800000,
    purchaseDate: "2022-06-20",
    responsible: "Kepala Sekolah",
    fundingSource: "Operasional Sekolah",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-11-01",
        unitCode: "INV-SF-KEP-01-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Sofa tamu lengkap bantal & meja kaca ruang pimpinan",
        serialNumber: "SFA-VIP-031"
      }
    ]
  },
  {
    id: "12",
    assetCode: "INV-TV-KEP-01",
    name: "Smart TV Display 55 Inch 4K UHD Samsung",
    category: "Elektronik",
    location: "Ruang Kepala Sekolah",
    condition: "BAIK",
    quantity: 1,
    price: 7200000,
    purchaseDate: "2024-02-10",
    responsible: "Kepala Sekolah",
    fundingSource: "BOSP Reguler",
    lastServiceDate: "2026-06-01",
    maintenanceIntervalDays: 180,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-12-01",
        unitCode: "INV-TV-KEP-01-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Display rapat koordinasi pimpinan & monitoring CCTV",
        serialNumber: "SM-55UHD-881"
      }
    ]
  },
  {
    id: "13",
    assetCode: "INV-AC-KEP-01",
    name: "AC Split Daikin Flash Inverter 1.5 PK",
    category: "Elektronik",
    location: "Ruang Kepala Sekolah",
    condition: "BAIK",
    quantity: 1,
    price: 5400000,
    purchaseDate: "2023-03-12",
    responsible: "Kepala Sekolah",
    fundingSource: "BOSP Reguler",
    lastServiceDate: "2026-06-10",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-13-01",
        unitCode: "INV-AC-KEP-01-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Suhu dingin optimal, servis rutin per 3 bulan",
        serialNumber: "DK-15PK-991"
      }
    ]
  },

  // --- ASET KELAS 10A ---
  {
    id: "14",
    assetCode: "INV-MJ-10A",
    name: "Meja Belajar Siswa Single Kayu Jati",
    category: "Furnitur",
    location: "Kelas 10A",
    condition: "BAIK",
    quantity: 30,
    price: 360000,
    purchaseDate: "2023-07-10",
    responsible: "Wali Kelas 10A",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 30 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      const isRR = num === 28 || num === 29;
      return {
        id: `u-14-${pad}`,
        unitCode: `INV-MJ-10A-${pad}`,
        unitNumber: num,
        condition: isRR ? ("RUSAK_RINGAN" as const) : ("BAIK" as const),
        notes: isRR ? "Laci meja sedikit longgar" : "Kondisi sangat kokoh",
        serialNumber: `MJ10A-2023-${pad}`
      };
    })
  },
  {
    id: "15",
    assetCode: "INV-KS-10A",
    name: "Kursi Belajar Siswa Kayu Besi Kuat",
    category: "Furnitur",
    location: "Kelas 10A",
    condition: "BAIK",
    quantity: 30,
    price: 230000,
    purchaseDate: "2023-07-10",
    responsible: "Wali Kelas 10A",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 30 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-15-${pad}`,
        unitCode: `INV-KS-10A-${pad}`,
        unitNumber: num,
        condition: "BAIK" as const,
        notes: "Karet kaki lengkap & kokoh",
        serialNumber: `KS10A-2023-${pad}`
      };
    })
  },
  {
    id: "16",
    assetCode: "INV-WB-10A",
    name: "Whiteboard Magnetic Gantung 240 x 120 cm",
    category: "Perlengkapan",
    location: "Kelas 10A",
    condition: "BAIK",
    quantity: 1,
    price: 1100000,
    purchaseDate: "2023-07-15",
    responsible: "Wali Kelas 10A",
    fundingSource: "Operasional Sekolah",
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-16-01",
        unitCode: "INV-WB-10A-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Lapisan magnetik bersih, tatakan spidol terpasang baik",
        serialNumber: "WB-MAG-240-10A"
      }
    ]
  },
  {
    id: "17",
    assetCode: "INV-PR-10A",
    name: "Proyektor Kelas BenQ MX560 4000 Lumens",
    category: "Elektronik",
    location: "Kelas 10A",
    condition: "BAIK",
    quantity: 1,
    price: 5600000,
    purchaseDate: "2024-01-20",
    responsible: "Wali Kelas 10A",
    fundingSource: "BOSP Kinerja",
    lastServiceDate: "2026-06-12",
    maintenanceIntervalDays: 120,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-17-01",
        unitCode: "INV-PR-10A-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Gantungan plafon & kabel HDMI 15 meter terinstal rapi",
        serialNumber: "BQ-MX560-4011"
      }
    ]
  },
  {
    id: "18",
    assetCode: "INV-KP-10A",
    name: "Kipas Angin Dinding Industrial Tornado 18 Inch",
    category: "Elektronik",
    location: "Kelas 10A",
    condition: "BAIK",
    quantity: 2,
    price: 450000,
    purchaseDate: "2023-07-20",
    responsible: "Wali Kelas 10A",
    fundingSource: "BOSP Reguler",
    lastServiceDate: "2026-05-18",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-18-01",
        unitCode: "INV-KP-10A-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Kipas dinding sisi kanan depan",
        serialNumber: "TRN-18W-101"
      },
      {
        id: "u-18-02",
        unitCode: "INV-KP-10A-02",
        unitNumber: 2,
        condition: "BAIK",
        notes: "Kipas dinding sisi kiri belakang",
        serialNumber: "TRN-18W-102"
      }
    ]
  },

  // --- ASET KELAS 10B ---
  {
    id: "19",
    assetCode: "INV-MJ-10B",
    name: "Meja Belajar Siswa Single Kayu Mahoni",
    category: "Furnitur",
    location: "Kelas 10B",
    condition: "BAIK",
    quantity: 30,
    price: 360000,
    purchaseDate: "2023-07-10",
    responsible: "Wali Kelas 10B",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 30 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-19-${pad}`,
        unitCode: `INV-MJ-10B-${pad}`,
        unitNumber: num,
        condition: "BAIK" as const,
        notes: "Kondisi meja rapi dan bersih",
        serialNumber: `MJ10B-2023-${pad}`
      };
    })
  },
  {
    id: "20",
    assetCode: "INV-KS-10B",
    name: "Kursi Belajar Siswa Ergonomis",
    category: "Furnitur",
    location: "Kelas 10B",
    condition: "BAIK",
    quantity: 30,
    price: 230000,
    purchaseDate: "2023-07-10",
    responsible: "Wali Kelas 10B",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 30 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      const isRR = num === 30;
      return {
        id: `u-20-${pad}`,
        unitCode: `INV-KS-10B-${pad}`,
        unitNumber: num,
        condition: isRR ? ("RUSAK_RINGAN" as const) : ("BAIK" as const),
        notes: isRR ? "Sekrup sandaran belakang agak longgar" : "Kondisi baik",
        serialNumber: `KS10B-2023-${pad}`
      };
    })
  },
  {
    id: "21",
    assetCode: "INV-AC-10B",
    name: "AC Split Sharp Plasmacluster 1.5 PK",
    category: "Elektronik",
    location: "Kelas 10B",
    condition: "BAIK",
    quantity: 1,
    price: 4900000,
    purchaseDate: "2023-08-15",
    responsible: "Wali Kelas 10B",
    fundingSource: "BOSP Kinerja",
    lastServiceDate: "2026-06-05",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-21-01",
        unitCode: "INV-AC-10B-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Pendingin ruangan kelas optimal",
        serialNumber: "SH-15PK-10B-01"
      }
    ]
  },
  {
    id: "22",
    assetCode: "INV-WB-10B",
    name: "Whiteboard Magnetic Gantung 240 x 120 cm",
    category: "Perlengkapan",
    location: "Kelas 10B",
    condition: "BAIK",
    quantity: 1,
    price: 1100000,
    purchaseDate: "2023-07-15",
    responsible: "Wali Kelas 10B",
    fundingSource: "Operasional Sekolah",
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-22-01",
        unitCode: "INV-WB-10B-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Papan tulis magnetik kelas",
        serialNumber: "WB-MAG-240-10B"
      }
    ]
  },

  // --- ASET KELAS 11B ---
  {
    id: "23",
    assetCode: "INV-MJ-11B",
    name: "Meja Belajar Siswa Kayu Jati Belanda",
    category: "Furnitur",
    location: "Kelas 11B",
    condition: "BAIK",
    quantity: 30,
    price: 360000,
    purchaseDate: "2023-07-10",
    responsible: "Wali Kelas 11B",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 30 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-23-${pad}`,
        unitCode: `INV-MJ-11B-${pad}`,
        unitNumber: num,
        condition: "BAIK" as const,
        notes: "Kondisi meja terawat",
        serialNumber: `MJ11B-2023-${pad}`
      };
    })
  },
  {
    id: "24",
    assetCode: "INV-KS-11B",
    name: "Kursi Belajar Siswa Rangka Besi Tebal",
    category: "Furnitur",
    location: "Kelas 11B",
    condition: "BAIK",
    quantity: 30,
    price: 230000,
    purchaseDate: "2023-07-10",
    responsible: "Wali Kelas 11B",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 30 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-24-${pad}`,
        unitCode: `INV-KS-11B-${pad}`,
        unitNumber: num,
        condition: "BAIK" as const,
        notes: "Kondisi kursi kokoh",
        serialNumber: `KS11B-2023-${pad}`
      };
    })
  },
  {
    id: "25",
    assetCode: "INV-SB-11B",
    name: "Interactive Smart Board Touch 65 Inch Android/Windows",
    category: "Elektronik",
    location: "Kelas 11B",
    condition: "BAIK",
    quantity: 1,
    price: 18500000,
    purchaseDate: "2024-03-01",
    responsible: "Wali Kelas 11B",
    fundingSource: "BOSP Kinerja",
    lastServiceDate: "2026-06-01",
    maintenanceIntervalDays: 180,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-25-01",
        unitCode: "INV-SB-11B-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Layar sentuh interaktif untuk pembelajaran multimedia & coding",
        serialNumber: "IFP-65IN-11B-901"
      }
    ]
  },
  {
    id: "26",
    assetCode: "INV-AC-11B",
    name: "AC Split Daikin 1.5 PK",
    category: "Elektronik",
    location: "Kelas 11B",
    condition: "BAIK",
    quantity: 1,
    price: 5200000,
    purchaseDate: "2023-08-10",
    responsible: "Wali Kelas 11B",
    fundingSource: "BOSP Reguler",
    lastServiceDate: "2026-06-15",
    maintenanceIntervalDays: 90,
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: [
      {
        id: "u-26-01",
        unitCode: "INV-AC-11B-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "Unit AC kelas lantai 2",
        serialNumber: "DK-15PK-11B"
      }
    ]
  },

  // --- ASET PERPUSTAKAAN ---
  {
    id: "27",
    assetCode: "INV-RK-PERP-01",
    name: "Rak Buku Besi Perpustakaan 5 Tingkat Double Sided",
    category: "Furnitur",
    location: "Perpustakaan",
    condition: "BAIK",
    quantity: 6,
    price: 2400000,
    purchaseDate: "2023-02-18",
    responsible: "Kepala Perpustakaan",
    fundingSource: "BOSP Reguler",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 6 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-27-${pad}`,
        unitCode: `INV-RK-PERP-01-${pad}`,
        unitNumber: num,
        condition: "BAIK" as const,
        notes: `Rak buku baris ke-${num} koleksi literasi dan kejuruan`,
        serialNumber: `RK-DS5-${pad}`
      };
    })
  },
  {
    id: "28",
    assetCode: "INV-MB-PERP-01",
    name: "Meja Baca Kubikel Belajar Perpustakaan",
    category: "Furnitur",
    location: "Perpustakaan",
    condition: "BAIK",
    quantity: 6,
    price: 1500000,
    purchaseDate: "2023-02-20",
    responsible: "Kepala Perpustakaan",
    fundingSource: "Hibah",
    depreciationGroup: "Kelompok 2 (8 Tahun / 12.5%)",
    units: Array.from({ length: 6 }, (_, idx) => {
      const num = idx + 1;
      const pad = String(num).padStart(2, '0');
      return {
        id: `u-28-${pad}`,
        unitCode: `INV-MB-PERP-01-${pad}`,
        unitNumber: num,
        condition: "BAIK" as const,
        notes: `Meja baca sekat kubikel unit ke-${num}`,
        serialNumber: `KUB-PERP-${pad}`
      };
    })
  },
  {
    id: "29",
    assetCode: "INV-PC-OPAC",
    name: "Komputer PC Katalog OPAC Perpustakaan All-in-One",
    category: "Elektronik",
    location: "Perpustakaan",
    condition: "BAIK",
    quantity: 2,
    price: 6500000,
    purchaseDate: "2024-01-10",
    responsible: "Kepala Perpustakaan",
    fundingSource: "BOSP Reguler",
    lastServiceDate: "2026-05-10",
    maintenanceIntervalDays: 180,
    depreciationGroup: "Kelompok 1 (4 Tahun / 25%)",
    units: [
      {
        id: "u-29-01",
        unitCode: "INV-PC-OPAC-01",
        unitNumber: 1,
        condition: "BAIK",
        notes: "PC anjungan pencarian buku oleh siswa & guru",
        serialNumber: "AIO-OPAC-01"
      },
      {
        id: "u-29-02",
        unitCode: "INV-PC-OPAC-02",
        unitNumber: 2,
        condition: "BAIK",
        notes: "PC sirkulasi peminjaman & pengembalian buku",
        serialNumber: "AIO-OPAC-02"
      }
    ]
  }
];

export interface BookCopy {
  id: string;
  barcode: string;
  copyNumber: number;
  status: 'TERSEDIA' | 'DIPINJAM' | 'RUSAK' | 'HILANG';
  condition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  notes?: string;
  borrowerName?: string;
  borrowerRole?: string;
  borrowDate?: string;
  dueDate?: string;
}

export interface Book {
  id: string;
  bookCode: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  category: 'Kejuruan RPL' | 'Kejuruan Bisnis Digital' | 'Pendidikan Islam & Bahasa Arab' | 'Mata Pelajaran Umum' | 'Literasi & Referensi';
  rackLocation: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  lostCopies: number;
  fundingSource: 'BOSP Reguler' | 'BOSP Kinerja' | 'Operasional Sekolah' | 'Hibah' | 'Lainnya';
  price: number;
  description: string;
  copies: BookCopy[];
}

export interface BookLoan {
  id: string;
  loanCode: string;
  bookId: string;
  bookTitle: string;
  bookCode: string;
  copyBarcode: string;
  copyNumber: number;
  borrowerName: string;
  borrowerType: 'SISWA' | 'GURU' | 'TENDIK';
  borrowerClass: string;
  borrowerContact?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT';
  borrowCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  returnCondition?: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'HILANG';
  penaltyAmount?: number;
  notes?: string;
}

export const initialBooks: Book[] = [
  {
    id: "bk-01",
    bookCode: "BK-RPL-001",
    isbn: "978-623-01-0842-1",
    title: "Pemrograman Web & Perangkat Bergerak SMK/MAK Kelas XI",
    author: "Patwiyanto, S.Kom & Sri Wahyuni, M.Pd",
    publisher: "Andi Publisher",
    publishYear: 2023,
    category: "Kejuruan RPL",
    rackLocation: "Rak A1 - RPL & Software",
    totalCopies: 25,
    availableCopies: 19,
    borrowedCopies: 5,
    lostCopies: 1,
    fundingSource: "BOSP Reguler",
    price: 85000,
    description: "Modul pembelajaran Kurikulum Merdeka Kejuruan RPL mencakup HTML5, CSS3, Tailwind CSS, JavaScript Modern, React, dan API REST.",
    copies: [
      ...Array.from({ length: 19 }, (_, i) => ({
        id: `bk-01-c${i + 1}`,
        barcode: `BK-RPL-001-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA' as const,
        condition: (i % 6 === 0 ? 'RUSAK_RINGAN' : 'BAIK') as ('BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT'),
        notes: i % 6 === 0 ? 'Ujung sampul depan sedikit terlipat, isi lengkap' : 'Kondisi mulus & rapi'
      })),
      {
        id: "bk-01-c20",
        barcode: "BK-RPL-001-20",
        copyNumber: 20,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        notes: 'Dipinjam untuk praktikum mandiri',
        borrowerName: 'Fajar Ramadhan (XII RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-18',
        dueDate: '2026-08-25'
      },
      {
        id: "bk-01-c21",
        barcode: "BK-RPL-001-21",
        copyNumber: 21,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        notes: 'Dipinjam tugas akhir semester',
        borrowerName: 'Nurul Aulia (XI RPL 2)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-19',
        dueDate: '2026-08-26'
      },
      {
        id: "bk-01-c22",
        barcode: "BK-RPL-001-22",
        copyNumber: 22,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        notes: 'Referensi materi ajar',
        borrowerName: 'Ustadz Anton, S.Kom',
        borrowerRole: 'GURU',
        borrowDate: '2026-08-15',
        dueDate: '2026-08-29'
      },
      {
        id: "bk-01-c23",
        barcode: "BK-RPL-001-23",
        copyNumber: 23,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        notes: 'Persiapan modul ajar',
        borrowerName: 'Ahmad Fauzi (XII RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-10',
        dueDate: '2026-08-17'
      },
      {
        id: "bk-01-c24",
        barcode: "BK-RPL-001-24",
        copyNumber: 24,
        status: 'DIPINJAM' as const,
        condition: 'RUSAK_RINGAN' as const,
        notes: 'Halaman 45 bergaris pensil',
        borrowerName: 'Bagas Prasetyo (XI RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-20',
        dueDate: '2026-08-27'
      },
      {
        id: "bk-01-c25",
        barcode: "BK-RPL-001-25",
        copyNumber: 25,
        status: 'HILANG' as const,
        condition: 'RUSAK_BERAT' as const,
        notes: 'Dilaporkan hilang saat kerja kelompok di luar sekolah, dalam proses penggantian'
      }
    ]
  },
  {
    id: "bk-02",
    bookCode: "BK-RPL-002",
    isbn: "978-602-444-912-4",
    title: "Basis Data Relasional & PostgreSQL Terapan SMK Vokasi",
    author: "Budi Raharjo & I Putu Agus Eka Pratama",
    publisher: "Informatika Bandung",
    publishYear: 2024,
    category: "Kejuruan RPL",
    rackLocation: "Rak A1 - RPL & Software",
    totalCopies: 20,
    availableCopies: 16,
    borrowedCopies: 4,
    lostCopies: 0,
    fundingSource: "BOSP Kinerja",
    price: 98000,
    description: "Panduan praktis perancangan ERD, normalisasi data, SQL query tingkat lanjut, indexing, dan integrasi backend database modern.",
    copies: [
      ...Array.from({ length: 16 }, (_, i) => ({
        id: `bk-02-c${i + 1}`,
        barcode: `BK-RPL-002-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA' as const,
        condition: 'BAIK' as const,
        notes: 'Eksemplar baru pengadaan BOSP Kinerja'
      })),
      {
        id: "bk-02-c17",
        barcode: "BK-RPL-002-17",
        copyNumber: 17,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Rian Syahputra (XII RPL 2)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-16',
        dueDate: '2026-08-23'
      },
      {
        id: "bk-02-c18",
        barcode: "BK-RPL-002-18",
        copyNumber: 18,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Dina Maulida (XI RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-21',
        dueDate: '2026-08-28'
      },
      {
        id: "bk-02-c19",
        barcode: "BK-RPL-002-19",
        copyNumber: 19,
        status: 'DIPINJAM' as const,
        condition: 'RUSAK_RINGAN' as const,
        borrowerName: 'Hafizh Al-Farisi (XII RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-14',
        dueDate: '2026-08-21'
      },
      {
        id: "bk-02-c20",
        barcode: "BK-RPL-002-20",
        copyNumber: 20,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Zaki Mubarak (X RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-22',
        dueDate: '2026-08-29'
      }
    ]
  },
  {
    id: "bk-03",
    bookCode: "BK-BD-001",
    isbn: "978-623-244-118-0",
    title: "Strategi Digital Marketing & E-Commerce untuk SMK Bisnis Digital",
    author: "Dr. Danang Sunyoto & Tim Vokasi",
    publisher: "Erlangga",
    publishYear: 2023,
    category: "Kejuruan Bisnis Digital",
    rackLocation: "Rak B1 - Bisnis Digital",
    totalCopies: 30,
    availableCopies: 24,
    borrowedCopies: 6,
    lostCopies: 0,
    fundingSource: "BOSP Reguler",
    price: 92000,
    description: "Materi esensial optimasi SEO, Social Media Ads, Content Creation, Marketplace Management, Copywriting, dan Analitik Penjualan.",
    copies: [
      ...Array.from({ length: 24 }, (_, i) => ({
        id: `bk-03-c${i + 1}`,
        barcode: `BK-BD-001-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA' as const,
        condition: (i % 5 === 0 ? 'RUSAK_RINGAN' : 'BAIK') as ('BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT'),
        notes: i % 5 === 0 ? 'Ada lipatan kecil di halaman belakang' : 'Kondisi sangat baik'
      })),
      {
        id: "bk-03-c25",
        barcode: "BK-BD-001-25",
        copyNumber: 25,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Siti Rahma (XI Bisnis Digital)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-19',
        dueDate: '2026-08-26'
      },
      {
        id: "bk-03-c26",
        barcode: "BK-BD-001-26",
        copyNumber: 26,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Farhan Abdullah (XII Bisnis Digital)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-17',
        dueDate: '2026-08-24'
      },
      {
        id: "bk-03-c27",
        barcode: "BK-BD-001-27",
        copyNumber: 27,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Ustadzah Halimah, S.E.',
        borrowerRole: 'GURU',
        borrowDate: '2026-08-10',
        dueDate: '2026-08-24'
      },
      {
        id: "bk-03-c28",
        barcode: "BK-BD-001-28",
        copyNumber: 28,
        status: 'DIPINJAM' as const,
        condition: 'RUSAK_RINGAN' as const,
        borrowerName: 'Nabila Putri (X Bisnis Digital)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-21',
        dueDate: '2026-08-28'
      },
      {
        id: "bk-03-c29",
        barcode: "BK-BD-001-29",
        copyNumber: 29,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Dewi Lestari (XI Bisnis Digital)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-15',
        dueDate: '2026-08-22'
      },
      {
        id: "bk-03-c30",
        barcode: "BK-BD-001-30",
        copyNumber: 30,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Iqbal Pratama (XII Bisnis Digital)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-20',
        dueDate: '2026-08-27'
      }
    ]
  },
  {
    id: "bk-04",
    bookCode: "BK-ISL-001",
    isbn: "978-979-3536-82-9",
    title: "Riyadhus Shalihin & Syarah Lengkap (Edisi Pembinaan Karakter)",
    author: "Imam An-Nawawi (Tahqiq Syaikh Al-Albani)",
    publisher: "Pustaka Imam Asy-Syafi'i",
    publishYear: 2022,
    category: "Pendidikan Islam & Bahasa Arab",
    rackLocation: "Rak C1 - Syariah & Tahfidz",
    totalCopies: 40,
    availableCopies: 33,
    borrowedCopies: 7,
    lostCopies: 0,
    fundingSource: "Hibah",
    price: 180000,
    description: "Kitab induk rujukan pembinaan adab, fiqih ibadah, akhlak mulia, dan tazkiyatun nufus santri/siswa SMK IT Ibnul Qayyim.",
    copies: [
      ...Array.from({ length: 33 }, (_, i) => ({
        id: `bk-04-c${i + 1}`,
        barcode: `BK-ISL-001-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA' as const,
        condition: (i === 4 ? 'RUSAK_RINGAN' : 'BAIK') as ('BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT'),
        notes: i === 4 ? 'Pembatas pita kain lepas, jilid kuat' : 'Koleksi Hardcover rapi'
      })),
      {
        id: "bk-04-c34",
        barcode: "BK-ISL-001-34",
        copyNumber: 34,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Abdullah Azzam (X Tahfidz RPL)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-16',
        dueDate: '2026-08-23'
      },
      {
        id: "bk-04-c35",
        barcode: "BK-ISL-001-35",
        copyNumber: 35,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Usamah bin Zaid (XI RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-18',
        dueDate: '2026-08-25'
      },
      {
        id: "bk-04-c36",
        barcode: "BK-ISL-001-36",
        copyNumber: 36,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Ustadz Mansyur, Lc.',
        borrowerRole: 'GURU',
        borrowDate: '2026-08-12',
        dueDate: '2026-08-26'
      },
      {
        id: "bk-04-c37",
        barcode: "BK-ISL-001-37",
        copyNumber: 37,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Hamzah Thariq (XII RPL 2)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-19',
        dueDate: '2026-08-26'
      },
      {
        id: "bk-04-c38",
        barcode: "BK-ISL-001-38",
        copyNumber: 38,
        status: 'DIPINJAM' as const,
        condition: 'RUSAK_RINGAN' as const,
        borrowerName: 'Aisyah Humaira (XI BD)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-11',
        dueDate: '2026-08-18'
      },
      {
        id: "bk-04-c39",
        barcode: "BK-ISL-001-39",
        copyNumber: 39,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Thalhah bin Ubaidillah (X RPL 2)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-20',
        dueDate: '2026-08-27'
      },
      {
        id: "bk-04-c40",
        barcode: "BK-ISL-001-40",
        copyNumber: 40,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Ustadzah Maryam, S.Pd.I',
        borrowerRole: 'GURU',
        borrowDate: '2026-08-14',
        dueDate: '2026-08-28'
      }
    ]
  },
  {
    id: "bk-05",
    bookCode: "BK-UM-001",
    isbn: "978-602-244-367-4",
    title: "Bahasa Inggris Komunikasi Bisnis & Teknologi SMK Kelas XII",
    author: "Widiati, Utami & Zuliati Rohmah",
    publisher: "Pusat Kurikulum dan Perbukuan Kemendikbud",
    publishYear: 2023,
    category: "Mata Pelajaran Umum",
    rackLocation: "Rak D1 - Bahasa & Komunikasi",
    totalCopies: 35,
    availableCopies: 30,
    borrowedCopies: 4,
    lostCopies: 1,
    fundingSource: "BOSP Reguler",
    price: 65000,
    description: "Modul komunikasi bahasa Inggris untuk presentasi proyek teknologi, wawancara kerja industri IT, dan korespondensi bisnis internasional.",
    copies: [
      ...Array.from({ length: 30 }, (_, i) => ({
        id: `bk-05-c${i + 1}`,
        barcode: `BK-UM-001-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA' as const,
        condition: (i === 3 ? 'RUSAK_BERAT' : i % 7 === 0 ? 'RUSAK_RINGAN' : 'BAIK') as ('BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT'),
        notes: i === 3 ? 'Cover sobek separuh dan terkena tumpahan air' : 'Layak pakai'
      })),
      {
        id: "bk-05-c31",
        barcode: "BK-UM-001-31",
        copyNumber: 31,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Salma Salsabila (XII RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-19',
        dueDate: '2026-08-26'
      },
      {
        id: "bk-05-c32",
        barcode: "BK-UM-001-32",
        copyNumber: 32,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Raihan Pratama (XII BD)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-17',
        dueDate: '2026-08-24'
      },
      {
        id: "bk-05-c33",
        barcode: "BK-UM-001-33",
        copyNumber: 33,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Fitri Handayani (XII RPL 2)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-12',
        dueDate: '2026-08-19'
      },
      {
        id: "bk-05-c34",
        barcode: "BK-UM-001-34",
        copyNumber: 34,
        status: 'DIPINJAM' as const,
        condition: 'RUSAK_RINGAN' as const,
        borrowerName: 'Dimas Setiawan (XII BD)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-21',
        dueDate: '2026-08-28'
      },
      {
        id: "bk-05-c35",
        barcode: "BK-UM-001-35",
        copyNumber: 35,
        status: 'HILANG' as const,
        condition: 'RUSAK_BERAT' as const,
        notes: 'Buku tertinggal di angkutan umum, siswa mengurus penggantian'
      }
    ]
  },
  {
    id: "bk-06",
    bookCode: "BK-REF-001",
    isbn: "978-623-180-201-9",
    title: "Clean Code: Panduan Menulis Kode yang Rapi & Teruji untuk Programmer Vokasi",
    author: "Robert C. Martin (Terjemahan Komunitas IT Vokasi)",
    publisher: "Mitra Wacana Media",
    publishYear: 2024,
    category: "Literasi & Referensi",
    rackLocation: "Rak E1 - Buku Pegangan Guru & LKS",
    totalCopies: 10,
    availableCopies: 7,
    borrowedCopies: 3,
    lostCopies: 0,
    fundingSource: "Operasional Sekolah",
    price: 135000,
    description: "Koleksi referensi standar industri software engineering mengenai refactoring, unit testing, naming conventions, dan arsitektur kode bersih.",
    copies: [
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `bk-06-c${i + 1}`,
        barcode: `BK-REF-001-${String(i + 1).padStart(2, '0')}`,
        copyNumber: i + 1,
        status: 'TERSEDIA' as const,
        condition: 'BAIK' as const,
        notes: 'Koleksi istimewa pegangan praktikum'
      })),
      {
        id: "bk-06-c8",
        barcode: "BK-REF-001-08",
        copyNumber: 8,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Muhammad Rizki (Peserta LKS Web Tech)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-16',
        dueDate: '2026-08-30'
      },
      {
        id: "bk-06-c9",
        barcode: "BK-REF-001-09",
        copyNumber: 9,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Ustadz Anton, S.Kom',
        borrowerRole: 'GURU',
        borrowDate: '2026-08-15',
        dueDate: '2026-08-29'
      },
      {
        id: "bk-06-c10",
        barcode: "BK-REF-001-10",
        copyNumber: 10,
        status: 'DIPINJAM' as const,
        condition: 'BAIK' as const,
        borrowerName: 'Danang Tri Wicaksono (XII RPL 1)',
        borrowerRole: 'SISWA',
        borrowDate: '2026-08-18',
        dueDate: '2026-08-25'
      }
    ]
  }
];

export const initialBookLoans: BookLoan[] = [
  {
    id: "bl-01",
    loanCode: "PJM-BK-202608-001",
    bookId: "bk-01",
    bookTitle: "Pemrograman Web & Perangkat Bergerak SMK/MAK Kelas XI",
    bookCode: "BK-RPL-001",
    copyBarcode: "BK-RPL-001-20",
    copyNumber: 20,
    borrowerName: "Fajar Ramadhan",
    borrowerType: "SISWA",
    borrowerClass: "XII RPL 1",
    borrowerContact: "0812-4455-6677",
    borrowDate: "2026-08-18",
    dueDate: "2026-08-25",
    status: "DIPINJAM",
    borrowCondition: "BAIK",
    notes: "Dipinjam untuk tugas portofolio akhir pekan"
  },
  {
    id: "bl-02",
    loanCode: "PJM-BK-202608-002",
    bookId: "bk-01",
    bookTitle: "Pemrograman Web & Perangkat Bergerak SMK/MAK Kelas XI",
    bookCode: "BK-RPL-001",
    copyBarcode: "BK-RPL-001-23",
    copyNumber: 23,
    borrowerName: "Ahmad Fauzi",
    borrowerType: "SISWA",
    borrowerClass: "XII RPL 1",
    borrowerContact: "0852-1122-3344",
    borrowDate: "2026-08-10",
    dueDate: "2026-08-17",
    status: "TERLAMBAT",
    borrowCondition: "BAIK",
    penaltyAmount: 7000,
    notes: "Terlambat 7 hari, telah dikirimi notifikasi WA"
  },
  {
    id: "bl-03",
    loanCode: "PJM-BK-202608-003",
    bookId: "bk-04",
    bookTitle: "Riyadhus Shalihin & Syarah Lengkap (Edisi Pembinaan Karakter)",
    bookCode: "BK-ISL-001",
    copyBarcode: "BK-ISL-001-38",
    copyNumber: 38,
    borrowerName: "Aisyah Humaira",
    borrowerType: "SISWA",
    borrowerClass: "XI BD",
    borrowerContact: "0878-9988-7766",
    borrowDate: "2026-08-11",
    dueDate: "2026-08-18",
    status: "TERLAMBAT",
    borrowCondition: "RUSAK_RINGAN",
    penaltyAmount: 6000,
    notes: "Kajian keputrian pekanan"
  },
  {
    id: "bl-04",
    loanCode: "PJM-BK-202608-004",
    bookId: "bk-06",
    bookTitle: "Clean Code: Panduan Menulis Kode yang Rapi & Teruji untuk Programmer Vokasi",
    bookCode: "BK-REF-001",
    copyBarcode: "BK-REF-001-08",
    copyNumber: 8,
    borrowerName: "Muhammad Rizki",
    borrowerType: "SISWA",
    borrowerClass: "XII RPL 1 (Tim LKS)",
    borrowerContact: "0896-5544-3322",
    borrowDate: "2026-08-16",
    dueDate: "2026-08-30",
    status: "DIPINJAM",
    borrowCondition: "BAIK",
    notes: "Peminjaman durasi khusus persiapan LKS tingkat provinsi"
  },
  {
    id: "bl-05",
    loanCode: "PJM-BK-202608-005",
    bookId: "bk-03",
    bookTitle: "Strategi Digital Marketing & E-Commerce untuk SMK Bisnis Digital",
    bookCode: "BK-BD-001",
    copyBarcode: "BK-BD-001-27",
    copyNumber: 27,
    borrowerName: "Ustadzah Halimah, S.E.",
    borrowerType: "GURU",
    borrowerClass: "Guru Produktif Bisnis Digital",
    borrowerContact: "0813-7766-5544",
    borrowDate: "2026-08-10",
    dueDate: "2026-08-24",
    status: "DIPINJAM",
    borrowCondition: "BAIK",
    notes: "Penyusunan modul ajar project based learning"
  },
  {
    id: "bl-06",
    loanCode: "PJM-BK-202608-006",
    bookId: "bk-02",
    bookTitle: "Basis Data Relasional & PostgreSQL Terapan SMK Vokasi",
    bookCode: "BK-RPL-002",
    copyBarcode: "BK-RPL-002-15",
    copyNumber: 15,
    borrowerName: "Teguh Santoso",
    borrowerType: "SISWA",
    borrowerClass: "XI RPL 2",
    borrowDate: "2026-08-05",
    dueDate: "2026-08-12",
    returnDate: "2026-08-12",
    status: "DIKEMBALIKAN",
    borrowCondition: "BAIK",
    returnCondition: "BAIK",
    notes: "Dikembalikan tepat waktu dalam kondisi sangat baik"
  }
];

export interface MaintenanceRecord {
  id: string;
  ticketNumber: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  unitId?: string;
  unitCode?: string;
  unitNumber?: number;
  location: string;
  category: string;
  type: 'RUTIN' | 'PERBAIKAN' | 'DARURAT';
  title: string;
  serviceDate: string;
  nextDueDate?: string;
  intervalDays?: number;
  status: 'SELESAI' | 'SEDANG_DIKERJAKAN' | 'TERJADWAL' | 'DIBATALKAN';
  previousCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  resultCondition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  cost: number;
  technician: string;
  technicianPhone?: string;
  vendorCompany?: string;
  partsReplaced?: string;
  notes: string;
  documentedBy: string;
  createdAt: string;
}

export const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "m-01",
    ticketNumber: "SPK-2026-06-001",
    assetId: "4",
    assetCode: "INV-AC-001",
    assetName: "AC Split Daikin Inverter 2 PK",
    unitCode: "INV-AC-001-01",
    unitNumber: 1,
    location: "Lab Komputer 1",
    category: "Elektronik / AC",
    type: "RUTIN",
    title: "Cuci Steam AC & Pembersihan Filter Berkala",
    serviceDate: "2026-06-15",
    nextDueDate: "2026-09-15",
    intervalDays: 90,
    status: "SELESAI",
    previousCondition: "BAIK",
    resultCondition: "BAIK",
    cost: 150000,
    technician: "Pak Joko Widodo",
    technicianPhone: "0812-3456-7890",
    vendorCompany: "CV Berkah Sejuk AC",
    partsReplaced: "Pembersihan filter & penambahan freon R32 (20 psi)",
    notes: "Pembersihan total unit indoor, kondensor outdoor, pembersihan talang air buangan, dan cek kelistrikan normal.",
    documentedBy: "Bapak Sarpras",
    createdAt: "2026-06-15 10:30"
  },
  {
    id: "m-02",
    ticketNumber: "SPK-2026-08-002",
    assetId: "5",
    assetCode: "INV-AC-002",
    assetName: "AC Split Panasonic 1.5 PK",
    unitCode: "INV-AC-002-01",
    unitNumber: 1,
    location: "Studio Bisnis Digital",
    category: "Elektronik / AC",
    type: "PERBAIKAN",
    title: "Perbaikan AC Tidak Dingin & Ganti Kapasitor Fan Outdoor",
    serviceDate: "2026-08-10",
    nextDueDate: "2026-11-10",
    intervalDays: 90,
    status: "SELESAI",
    previousCondition: "RUSAK_RINGAN",
    resultCondition: "BAIK",
    cost: 320000,
    technician: "Heri Santoso",
    technicianPhone: "0857-9876-5432",
    vendorCompany: "Sejuk Abadi Service",
    partsReplaced: "Kapasitor Fan Outdoor 2.5 uF + Cuci Evaporator",
    notes: "Sebelumnya AC tidak dingin hanya keluar hembusan angin karena kipas outdoor macet. Setelah penggantian kapasitor dan dicuci bersih, AC kembali dingin maksimal 18°C. Status aset pulih menjadi BAIK.",
    documentedBy: "Admin Sekolah",
    createdAt: "2026-08-10 14:15"
  },
  {
    id: "m-03",
    ticketNumber: "SPK-2026-08-003",
    assetId: "3",
    assetCode: "INV-PR-001",
    assetName: "Proyektor Epson EB-X06",
    unitCode: "INV-PR-001-01",
    unitNumber: 1,
    location: "Aula",
    category: "Elektronik / Multimedia",
    type: "PERBAIKAN",
    title: "Perbaikan Modul Lampu Proyektor Mati & Penggantian Filter",
    serviceDate: "2026-08-20",
    intervalDays: 90,
    status: "SEDANG_DIKERJAKAN",
    previousCondition: "RUSAK_BERAT",
    resultCondition: "BAIK",
    cost: 1250000,
    technician: "Tim Teknisi Epson Center",
    technicianPhone: "0274-556677",
    vendorCompany: "Authorized Epson Service Partner",
    partsReplaced: "Original Lamp Bulb ELPLP97 (Indent)",
    notes: "Lampu proyektor mati karena umur pemakaian habis (>4000 jam). Unit sedang dalam pengerjaan di workshop resmi. Estimasi selesai 26 Agustus 2026.",
    documentedBy: "Bapak Sarpras",
    createdAt: "2026-08-20 09:00"
  },
  {
    id: "m-04",
    ticketNumber: "SPK-2026-08-004",
    assetId: "1",
    assetCode: "INV-PC-001",
    assetName: "Komputer Lab Dell OptiPlex",
    unitCode: "INV-PC-001-19",
    unitNumber: 19,
    location: "Lab Komputer 1",
    category: "Komputer & IT",
    type: "PERBAIKAN",
    title: "Perbaikan Kipas Heatsink CPU Bising & Penggantian Thermal Paste",
    serviceDate: "2026-08-18",
    intervalDays: 180,
    status: "SELESAI",
    previousCondition: "RUSAK_RINGAN",
    resultCondition: "BAIK",
    cost: 185000,
    technician: "Teknisi Sarpras IT",
    technicianPhone: "0813-1122-3344",
    vendorCompany: "Internal IT Lab SMK IT",
    partsReplaced: "Fan CPU Heatsink 90mm + Thermal Paste Arctic MX-4",
    notes: "Kipas pendingin CPU yang bising telah diganti baru dan dibersihkan dari debu. Suhu processor kembali stabil di 41°C. Unit PC #19 kembali BAIK.",
    documentedBy: "Admin Sekolah",
    createdAt: "2026-08-18 11:30"
  },
  {
    id: "m-05",
    ticketNumber: "SPK-2026-05-005",
    assetId: "6",
    assetCode: "INV-GEN-001",
    assetName: "Genset Silent Perkins 15 kVA",
    unitCode: "INV-GEN-001-01",
    unitNumber: 1,
    location: "Ruang Server / Sarpras",
    category: "Fasilitas Daya",
    type: "RUTIN",
    title: "Servis Berkala, Ganti Oli Mesin & Filter Solar Genset",
    serviceDate: "2026-05-20",
    nextDueDate: "2026-08-20",
    intervalDays: 90,
    status: "TERJADWAL",
    previousCondition: "BAIK",
    resultCondition: "BAIK",
    cost: 750000,
    technician: "Dedi Supriyadi",
    technicianPhone: "0819-7788-9900",
    vendorCompany: "PT Diesel Pratama Teknik",
    partsReplaced: "Oli Mesin Meditran SX 15W-40 (8 Liter) + Filter Oli",
    notes: "Jadwal servis rutin 3 bulanan berikutnya sudah jatuh tempo per 20 Agustus 2026. Perlu segera dipanggilkan teknisi untuk penggantian oli rutin.",
    documentedBy: "Bapak Sarpras",
    createdAt: "2026-05-20 13:00"
  },
  {
    id: "m-06",
    ticketNumber: "SPK-2026-08-006",
    assetId: "2",
    assetCode: "INV-MJ-001",
    assetName: "Meja Belajar Siswa",
    unitCode: "INV-MJ-001-35",
    unitNumber: 35,
    location: "Ruang Kelas X-A",
    category: "Furnitur",
    type: "PERBAIKAN",
    title: "Perbaikan & Penguatan Kaki Meja Siswa yang Patah",
    serviceDate: "2026-08-22",
    status: "SELESAI",
    previousCondition: "RUSAK_BERAT",
    resultCondition: "BAIK",
    cost: 120000,
    technician: "Pak Ahmad (Tukang Kayu)",
    technicianPhone: "0852-1100-2200",
    vendorCompany: "Bengkel Kayu Barokah",
    partsReplaced: "Braket Siku Besi Penguat + Sekrup Baja 3 inch",
    notes: "Kaki meja kayu yang patah telah disambung kuat dan dilapisi siku besi ganda serta divernis ulang. Kondisi meja kini kokoh dan aman digunakan siswa.",
    documentedBy: "Admin Sekolah",
    createdAt: "2026-08-22 15:45"
  }
];

export interface BhpCategoryInfo {
  code: string;
  name: string;
  shortName: string;
  description: string;
  defaultLocation: string;
  subcategories: string[];
  examples: string[];
}

export const BHP_CATEGORIES: BhpCategoryInfo[] = [
  {
    code: 'BHP-ADM',
    name: 'BHP Administrasi & Manajemen Kantor',
    shortName: 'Administrasi & Kantor',
    description: 'Kertas, percetakan, ATK, tinta printer, amplop resmi, map arsip, dan stiker QR inventaris.',
    defaultLocation: 'Gudang TU',
    subcategories: ['Kertas & Cetak', 'Alat Tulis Kantor (ATK)', 'Media Pembatasan & Arsip'],
    examples: ['Kertas HVS (A4, F4)', 'Kertas Folio Bergaris', 'Amplop Resmi', 'Tinta Printer Epson/Canon', 'Pulpen & Pensil', 'Map Stopmap & Sticky Notes']
  },
  {
    code: 'BHP-KBM',
    name: 'BHP Pembelajaran & Operasional Kelas',
    shortName: 'Kegiatan Belajar & KBM',
    description: 'Spidol whiteboard, tinta isi ulang, penghapus, lembar LJK, dan perlengkapan guru.',
    defaultLocation: 'Ruang Guru / Kelas',
    subcategories: ['Perlengkapan Papan Tulis', 'Ujian & Penilaian', 'Perlengkapan Guru'],
    examples: ['Spidol Whiteboard (Hitam/Biru/Merah)', 'Tinta Isi Ulang Spidol', 'Penghapus Papan Tulis', 'Lembar Jawaban Komputer (LJK)', 'Buku Agenda Guru']
  },
  {
    code: 'BHP-LAB',
    name: 'BHP Laboratorium & Praktik Komputer (IT)',
    shortName: 'Laboratorium & Komputer/IT',
    description: 'Kabel LAN/UTP, konektor RJ45, cable tie, pembersih hardware/layar, thermal paste, dan baterai.',
    defaultLocation: 'Lab Komputer',
    subcategories: ['Kabel & Konektor', 'Pembersih Hardware', 'Media Penyimpanan & Daya'],
    examples: ['Konektor RJ45 Cat6', 'Kabel LAN/UTP Cat6', 'Cable Tie', 'Thermal Paste CPU', 'Screen Cleaner Microfiber', 'Baterai CMOS & Remote AC']
  },
  {
    code: 'BHP-KBR',
    name: 'BHP Kebersihan & Sanitasi Lingkungan Sekolah',
    shortName: 'Kebersihan & Sanitasi',
    description: 'Sabun cuci tangan, cairan pembersih lantai, kantong sampah, tisu, karbol, dan pembersih kaca.',
    defaultLocation: 'Gudang Kebersihan',
    subcategories: ['Sanitasi Mandi & Cuci', 'Perlengkapan Kebersihan Fisik'],
    examples: ['Sabun Cuci Tangan Cair', 'Pembersih Lantai & Karbol', 'Kantong Sampah Hitam (Trash Bag)', 'Tisu Wajah / Roll', 'Cairan Pembersih Kaca']
  },
  {
    code: 'BHP-UKS',
    name: 'BHP Rumah Tangga, Konsumsi & Kesehatan (UKS)',
    shortName: 'Kesehatan & P3K',
    description: 'Konsumsi operasional (air galon, teh, gula) dan perlengkapan obat-obatan P3K UKS.',
    defaultLocation: 'Ruang UKS / Dapur',
    subcategories: ['Konsumsi Operasional', 'Perlengkapan UKS & P3K'],
    examples: ['Air Minum Galon 19L', 'Teh & Gula Operasional', 'Parasetamol & Minyak Kayu Putih', 'Kasa Steril & Plester', 'Alkohol 70% & Betadine']
  }
];

export const initialConsumables = [
  // 1. BHP-ADM : Administrasi & Kantor
  {
    id: "c-adm-01",
    itemCode: "BHP-ADM-01",
    name: "Kertas HVS A4 80gr PaperOne",
    category: "BHP-ADM",
    subcategory: "Kertas & Cetak",
    unit: "rim",
    stock: 15,
    reorderPoint: 5,
    location: "Gudang TU",
    history: [
      { id: "h-adm-1", type: "Masuk", qty: 25, finalStock: 25, actor: "Staf TU", notes: "Pengadaan awal semester", date: "10/8/2026 08:00:00" },
      { id: "h-adm-2", type: "Keluar", qty: 10, finalStock: 15, actor: "Bagian Administrasi", notes: "Cetak berkas akreditasi", date: "15/8/2026 10:30:00" }
    ]
  },
  {
    id: "c-adm-02",
    itemCode: "BHP-ADM-02",
    name: "Kertas Folio F4 75gr Sinar Dunia",
    category: "BHP-ADM",
    subcategory: "Kertas & Cetak",
    unit: "rim",
    stock: 8,
    reorderPoint: 4,
    location: "Gudang TU",
    history: [
      { id: "h-adm-3", type: "Masuk", qty: 15, finalStock: 15, actor: "Staf TU", notes: "Pengadaan rutin", date: "12/8/2026 09:00:00" }
    ]
  },
  {
    id: "c-adm-03",
    itemCode: "BHP-ADM-03",
    name: "Tinta Printer Epson 003 Black Original",
    category: "BHP-ADM",
    subcategory: "Alat Tulis Kantor (ATK)",
    unit: "botol",
    stock: 6,
    reorderPoint: 3,
    location: "Gudang TU",
    history: [
      { id: "h-adm-4", type: "Masuk", qty: 10, finalStock: 10, actor: "Admin", notes: "Restock tinta printer TU", date: "14/8/2026 11:00:00" }
    ]
  },
  {
    id: "c-adm-04",
    itemCode: "BHP-ADM-04",
    name: "Label Stiker QR Code Inventaris",
    category: "BHP-ADM",
    subcategory: "Media Pembatasan & Arsip",
    unit: "roll",
    stock: 12,
    reorderPoint: 4,
    location: "Gudang TU",
    history: [
      { id: "h-adm-5", type: "Masuk", qty: 15, finalStock: 15, actor: "Sarpras", notes: "Persiapan pelabelan aset", date: "16/8/2026 13:00:00" }
    ]
  },

  // 2. BHP-KBM : Kegiatan Belajar & Papan Tulis
  {
    id: "c-kbm-01",
    itemCode: "BHP-KBM-01",
    name: "Spidol Whiteboard Snowman Hitam",
    category: "BHP-KBM",
    subcategory: "Perlengkapan Papan Tulis",
    unit: "lusin",
    stock: 5,
    reorderPoint: 3,
    location: "Ruang Guru / Kelas",
    history: [
      { id: "h-kbm-1", type: "Masuk", qty: 10, finalStock: 10, actor: "Kurikulum", notes: "Distribusi awal semester", date: "11/8/2026 08:30:00" },
      { id: "h-kbm-2", type: "Keluar", qty: 5, finalStock: 5, actor: "Koordinator KBM", notes: "Pembagian ke guru mapel", date: "18/8/2026 09:15:00" }
    ]
  },
  {
    id: "c-kbm-02",
    itemCode: "BHP-KBM-02",
    name: "Tinta Refill Whiteboard Ink Hitam",
    category: "BHP-KBM",
    subcategory: "Perlengkapan Papan Tulis",
    unit: "botol",
    stock: 8,
    reorderPoint: 4,
    location: "Ruang Guru / Kelas",
    history: [
      { id: "h-kbm-3", type: "Masuk", qty: 12, finalStock: 12, actor: "Sarpras", notes: "Isi ulang spidol kelas", date: "13/8/2026 10:00:00" }
    ]
  },
  {
    id: "c-kbm-03",
    itemCode: "BHP-KBM-03",
    name: "Lembar Jawaban Komputer (LJK) Ujian",
    category: "BHP-KBM",
    subcategory: "Ujian & Penilaian",
    unit: "rim",
    stock: 4,
    reorderPoint: 2,
    location: "Ruang Kurikulum",
    history: [
      { id: "h-kbm-4", type: "Masuk", qty: 8, finalStock: 8, actor: "Panitia Ujian", notes: "Stok PTS/PAS", date: "15/8/2026 14:00:00" }
    ]
  },
  {
    id: "c-kbm-04",
    itemCode: "BHP-KBM-04",
    name: "Buku Agenda Mengajar & Presensi Siswa",
    category: "BHP-KBM",
    subcategory: "Perlengkapan Guru",
    unit: "buku",
    stock: 18,
    reorderPoint: 6,
    location: "Ruang Guru / Kelas",
    history: [
      { id: "h-kbm-5", type: "Masuk", qty: 25, finalStock: 25, actor: "Kurikulum", notes: "Cetakan resmi sekolah", date: "10/8/2026 08:00:00" }
    ]
  },

  // 3. BHP-LAB : Laboratorium & Komputer/IT
  {
    id: "c-lab-01",
    itemCode: "BHP-LAB-01",
    name: "Konektor RJ45 Cat6 Gold Plated",
    category: "BHP-LAB",
    subcategory: "Kabel & Konektor",
    unit: "kotak",
    stock: 4,
    reorderPoint: 2,
    location: "Lab Komputer",
    history: [
      { id: "h-lab-1", type: "Masuk", qty: 8, finalStock: 8, actor: "Kepala Lab", notes: "Praktikum Jaringan Dasar", date: "10/8/2026 10:00:00" }
    ]
  },
  {
    id: "c-lab-02",
    itemCode: "BHP-LAB-02",
    name: "Kabel LAN UTP Cat6 Belden (Meteran)",
    category: "BHP-LAB",
    subcategory: "Kabel & Konektor",
    unit: "meter",
    stock: 150,
    reorderPoint: 50,
    location: "Lab Komputer",
    history: [
      { id: "h-lab-2", type: "Masuk", qty: 305, finalStock: 305, actor: "Sarpras IT", notes: "1 Roll Cat6", date: "11/8/2026 11:30:00" },
      { id: "h-lab-3", type: "Keluar", qty: 155, finalStock: 150, actor: "Guru Jaringan", notes: "Pengkabelan Lab RPL", date: "17/8/2026 13:45:00" }
    ]
  },
  {
    id: "c-lab-03",
    itemCode: "BHP-LAB-03",
    name: "Thermal Paste CPU Arctic MX-4",
    category: "BHP-LAB",
    subcategory: "Pembersih Hardware",
    unit: "tube",
    stock: 5,
    reorderPoint: 2,
    location: "Lab Komputer",
    history: [
      { id: "h-lab-4", type: "Masuk", qty: 6, finalStock: 6, actor: "Teknisi", notes: "Perawatan berkala PC Lab", date: "12/8/2026 14:00:00" }
    ]
  },
  {
    id: "c-lab-04",
    itemCode: "BHP-LAB-04",
    name: "Baterai Kancing CMOS CR2032",
    category: "BHP-LAB",
    subcategory: "Media Penyimpanan & Daya",
    unit: "strip",
    stock: 8,
    reorderPoint: 3,
    location: "Lab Komputer",
    history: [
      { id: "h-lab-5", type: "Masuk", qty: 10, finalStock: 10, actor: "Teknisi", notes: "Cadangan motherboard PC", date: "13/8/2026 15:00:00" }
    ]
  },

  // 4. BHP-KBR : Kebersihan & Sanitasi
  {
    id: "c-kbr-01",
    itemCode: "BHP-KBR-01",
    name: "Sabun Cuci Tangan Cair (Hand Wash 4L)",
    category: "BHP-KBR",
    subcategory: "Sanitasi Mandi & Cuci",
    unit: "jerigen",
    stock: 4,
    reorderPoint: 2,
    location: "Gudang Kebersihan",
    history: [
      { id: "h-kbr-1", type: "Masuk", qty: 6, finalStock: 6, actor: "Staf Kebersihan", notes: "Stok wastafel sekolah", date: "12/8/2026 09:00:00" }
    ]
  },
  {
    id: "c-kbr-02",
    itemCode: "BHP-KBR-02",
    name: "Cairan Pembersih Lantai & Karbol 4L",
    category: "BHP-KBR",
    subcategory: "Sanitasi Mandi & Cuci",
    unit: "jerigen",
    stock: 3,
    reorderPoint: 2,
    location: "Gudang Kebersihan",
    history: [
      { id: "h-kbr-2", type: "Masuk", qty: 5, finalStock: 5, actor: "Staf Kebersihan", notes: "Pembersih toilet & lorong", date: "14/8/2026 08:30:00" }
    ]
  },
  {
    id: "c-kbr-03",
    itemCode: "BHP-KBR-03",
    name: "Kantong Sampah Hitam Tebal (Trash Bag Besar)",
    category: "BHP-KBR",
    subcategory: "Perlengkapan Kebersihan Fisik",
    unit: "pack",
    stock: 12,
    reorderPoint: 5,
    location: "Gudang Kebersihan",
    history: [
      { id: "h-kbr-3", type: "Masuk", qty: 20, finalStock: 20, actor: "Staf Kebersihan", notes: "Operasional tong sampah", date: "15/8/2026 10:00:00" }
    ]
  },

  // 5. BHP-UKS : Kesehatan & P3K
  {
    id: "c-uks-01",
    itemCode: "BHP-UKS-01",
    name: "Paracetamol 500mg Strip",
    category: "BHP-UKS",
    subcategory: "Perlengkapan UKS & P3K",
    unit: "strip",
    stock: 10,
    reorderPoint: 4,
    location: "Ruang UKS / Dapur",
    history: [
      { id: "h-uks-1", type: "Masuk", qty: 15, finalStock: 15, actor: "Petugas UKS", notes: "Stok obat dasar siswa", date: "11/8/2026 11:00:00" }
    ]
  },
  {
    id: "c-uks-02",
    itemCode: "BHP-UKS-02",
    name: "Minyak Kayu Putih Cap Lang 120ml",
    category: "BHP-UKS",
    subcategory: "Perlengkapan UKS & P3K",
    unit: "botol",
    stock: 6,
    reorderPoint: 2,
    location: "Ruang UKS / Dapur",
    history: [
      { id: "h-uks-2", type: "Masuk", qty: 8, finalStock: 8, actor: "Petugas UKS", notes: "Pertolongan pertama", date: "12/8/2026 13:00:00" }
    ]
  },
  {
    id: "c-uks-03",
    itemCode: "BHP-UKS-03",
    name: "Air Minum Galon 19 Liter",
    category: "BHP-UKS",
    subcategory: "Konsumsi Operasional",
    unit: "galon",
    stock: 8,
    reorderPoint: 3,
    location: "Ruang Guru & Dapur",
    history: [
      { id: "h-uks-3", type: "Masuk", qty: 12, finalStock: 12, actor: "Staf Umum", notes: "Restock mingguan dispenser", date: "16/8/2026 08:00:00" }
    ]
  }
];

export const initialRooms = [
  { id: "r1", name: "Ruang Kepala Sekolah", capacity: 8, description: "Lantai 1 Gedung A Bagian Belakang" },
  { id: "r2", name: "Kelas 10A", capacity: 30, description: "Lantai 1 Gedung A Bagian Depan" },
  { id: "r3", name: "Kelas 10B", capacity: 30, description: "Lantai 2 Gedung A" },
  { id: "r4", name: "Kelas 11B", capacity: 30, description: "Lantai 2 Gedung A" },
  { id: "r5", name: "Lab RPL", capacity: 36, description: "Laboratorium Rekayasa Perangkat Lunak Utama" },
  { id: "r6", name: "Studio Bisnis Digital", capacity: 20, description: "Studio Podcast dan Marketing" },
  { id: "r7", name: "Ruang Server", capacity: 2, description: "Pusat Data dan Jaringan" },
  { id: "r8", name: "Perpustakaan", capacity: 50, description: "Area Literasi dan Sumber Belajar" },
  { id: "r9", name: "Aula Utama", capacity: 150, description: "Lantai 3 Gedung Serbaguna" }
];

export const initialBookings = [
  {
    id: "b1",
    roomId: "r1",
    userName: "Ahmad Guru",
    date: "2026-08-21",
    timeSlot: "08:00 - 10:00",
    purpose: "Praktikum Database",
    status: "APPROVED"
  },
  {
    id: "b2",
    roomId: "r2",
    userName: "Siti Siswa",
    date: "2026-08-21",
    timeSlot: "13:00 - 15:00",
    purpose: "Rekaman Tugas Podcast",
    status: "PENDING"
  }
];

export const initialLoans = [
  {
    id: "l1",
    borrowerName: "Budi Santoso (Kelas XII RPL)",
    type: "Inventaris",
    itemId: "1",
    itemName: "Komputer Lab Dell OptiPlex",
    startDate: "2026-08-20",
    endDate: "2026-08-23",
    status: "DIPINJAM",
    notes: "Keperluan persiapan Lomba Kompetensi Siswa (LKS)"
  },
  {
    id: "l2",
    borrowerName: "Ustadz Anton, S.Kom",
    type: "Ruangan",
    itemId: "r2",
    itemName: "Studio Bisnis Digital",
    startDate: "2026-08-21",
    endDate: "2026-08-21",
    status: "DISETUJUI",
    notes: "Rekaman materi video pembelajaran daring"
  },
  {
    id: "l3",
    borrowerName: "Muhammad Rizki (OSIS)",
    type: "Inventaris",
    itemId: "3",
    itemName: "Proyektor Epson EB-X06",
    startDate: "2026-08-24",
    endDate: "2026-08-25",
    status: "MENUNGGU",
    notes: "Presentasi Rapat Kerja OSIS SMK IT Ibnul Qayyim"
  },
  {
    id: "l4",
    borrowerName: "Ustadzah Fatimah, M.Pd",
    type: "Ruangan",
    itemId: "r1",
    itemName: "Lab RPL",
    startDate: "2026-08-25",
    endDate: "2026-08-25",
    status: "MENUNGGU",
    notes: "Simulasi Ujian Berbasis Komputer Kelas X"
  }
];

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  niy?: string;
  position?: string;
  role: string;
  status: string;
  isSignatory?: boolean;
  signatoryTitle?: string;
  description?: string;
}

export const initialUsers: UserAccount[] = [
  { 
    id: '1', 
    name: 'Admin Utama (IT Admin)', 
    email: 'admin@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 201807 001',
    position: 'Kepala Unit IT & Database',
    role: 'Super Admin / IT Admin', 
    status: 'Aktif',
    isSignatory: false,
    signatoryTitle: 'Administrator Sistem',
    description: 'Mengelola konfigurasi sistem, database, manajemen user/akun, hak akses, dan log aktivitas sistem.'
  },
  { 
    id: '2', 
    name: 'Anto, S.E.I., M.E., Gr., MCF.', 
    email: 'kepsek@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 201503 001',
    position: 'Kepala Sekolah',
    role: 'Kepala Sekolah / Manajemen Eksekutif', 
    status: 'Aktif',
    isSignatory: true,
    signatoryTitle: 'Kepala Sekolah',
    description: 'Akses baca menyeluruh untuk dashboard analitik, nilai aset, depresiasi, serta approval pengadaan & disposal aset.'
  },
  { 
    id: '3', 
    name: 'Bapak Muh. Taufik, S.T', 
    email: 'sarpras@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 201807 042',
    position: 'Penanggung Jawab Sarana & Prasarana',
    role: 'Admin Sarpras / Pengelola Aset Sekolah', 
    status: 'Aktif',
    isSignatory: true,
    signatoryTitle: 'Penanggung Jawab / Pengelola Sarpras',
    description: 'Mengelola siklus penuh aset: katalogisasi QR/barcode, penempatan, mutasi, jadwal maintenance, & laporan audit.'
  },
  { 
    id: '4', 
    name: 'Ustadz Ahmad Fadhil, S.Kom', 
    email: 'kalab@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 201908 055',
    position: 'Kepala Laboratorium Komputer & RPL',
    role: 'Kepala Lab / Penanggung Jawab Ruangan & Unit', 
    status: 'Aktif',
    isSignatory: true,
    signatoryTitle: 'Koordinator Pemeliharaan & IT',
    description: 'Mengelola dan memvalidasi aset lab/unit, check-in/check-out inventaris lab, serta mengajukan perbaikan/mutasi.'
  },
  { 
    id: '5', 
    name: 'Ustadzah Nurul Hidayah, S.Pd', 
    email: 'guru@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 202001 078',
    position: 'Kepala Perpustakaan & Guru Produktif',
    role: 'Guru & Staf (User Umum)', 
    status: 'Aktif',
    isSignatory: true,
    signatoryTitle: 'Kepala Perpustakaan Vokasi',
    description: 'Mengajukan peminjaman aset harian, melihat riwayat pinjaman pribadi, dan mengelola koleksi perpustakaan.'
  },
  { 
    id: '6', 
    name: 'Ust. Ahmad Fauzan, S.Pd.', 
    email: 'tu@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 202102 090',
    position: 'Pengelola BHP & Tata Usaha',
    role: 'Guru & Staf (User Umum)', 
    status: 'Aktif',
    isSignatory: true,
    signatoryTitle: 'Petugas Pengelola BHP / Tata Usaha',
    description: 'Mengelola stok barang habis pakai (BHP), ATK, dan administrasi umum.'
  },
  { 
    id: '7', 
    name: 'User Nonaktif', 
    email: 'nonaktif@smkit.sch.id', 
    password: 'password123',
    niy: 'NIY. 202205 110',
    position: 'Staf Magang',
    role: 'Guru & Staf (User Umum)', 
    status: 'Nonaktif',
    isSignatory: false,
    signatoryTitle: '',
    description: 'Akun dinonaktifkan sementara.'
  }
];

export interface SignatorySettings {
  city: string;
  headmaster: {
    name: string;
    niy: string;
    title: string;
  };
  sarprasOfficer: {
    name: string;
    niy: string;
    title: string;
  };
  maintenanceCoordinator: {
    name: string;
    niy: string;
    title: string;
  };
  librarian: {
    name: string;
    niy: string;
    title: string;
  };
  bhpOfficer: {
    name: string;
    niy: string;
    title: string;
  };
}

export interface StockOpnameItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  location?: string;
  systemQty: number;
  physicalQty: number;
  difference: number; // physicalQty - systemQty
  unit: string;
  unitPrice?: number;
  condition?: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'HILANG';
  systemCondition?: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  status: 'SESUAI' | 'SELISIH' | 'BELUM_DIPERIKSA';
  checkedAt?: string;
  checkedBy?: string;
  notes?: string;
}

export interface StockOpnameSession {
  id: string;
  sessionCode: string;
  title: string;
  type: 'ALL' | 'ASSET' | 'BHP' | 'ROOM';
  targetLocation?: string;
  targetCategory?: string;
  startDate: string;
  endDate?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ADJUSTED';
  auditorName: string;
  notes: string;
  totalSystemItems: number;
  totalCheckedItems: number;
  totalMatchItems: number;
  totalDiscrepancyItems: number;
  totalMissingItems: number;
  items: StockOpnameItem[];
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const initialStockOpnames: StockOpnameSession[] = [
  {
    id: 'so-001',
    sessionCode: 'SO-2026-08-01',
    title: 'Audit Sensus Fisik & Stock Opname Lab Komputer 1 & 2',
    type: 'ROOM',
    targetLocation: 'Lab Komputer 1',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    status: 'COMPLETED',
    auditorName: 'Bapak Muh. Taufik, S.T & Ustadz Ahmad Fadhil',
    notes: 'Sensus berkala pra-semester ganjil TA 2026/2027. Seluruh PC dan perlengkapan diverifikasi.',
    totalSystemItems: 6,
    totalCheckedItems: 6,
    totalMatchItems: 5,
    totalDiscrepancyItems: 1,
    totalMissingItems: 0,
    completedAt: '2026-08-25',
    approvedBy: 'Anto, S.E.I., M.E., Gr., MCF.',
    approvedAt: '2026-08-26',
    items: [
      {
        id: 'so-item-1',
        itemId: '1',
        itemCode: 'INV-PC-001',
        itemName: 'Komputer Lab Dell OptiPlex',
        category: 'Elektronik',
        location: 'Lab Komputer 1',
        systemQty: 20,
        physicalQty: 20,
        difference: 0,
        unit: 'Unit',
        unitPrice: 7500000,
        condition: 'BAIK',
        systemCondition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-21 10:15',
        checkedBy: 'Ustadz Ahmad Fadhil',
        notes: '2 unit kipas bising sudah ditandai untuk diservis di modul pemeliharaan.'
      },
      {
        id: 'so-item-2',
        itemId: '3',
        itemCode: 'INV-PR-001',
        itemName: 'Proyektor Epson EB-X06',
        category: 'Elektronik',
        location: 'Lab Komputer 1',
        systemQty: 1,
        physicalQty: 1,
        difference: 0,
        unit: 'Unit',
        unitPrice: 6200000,
        condition: 'BAIK',
        systemCondition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-21 11:00',
        checkedBy: 'Ustadz Ahmad Fadhil',
        notes: 'Lampu dan resolusi display sangat tajam.'
      },
      {
        id: 'so-item-3',
        itemId: 'bhp-it-01',
        itemCode: 'BHP-IT-001',
        itemName: 'Kabel LAN UTP Cat6 Belden (Roll 305m)',
        category: 'Bahan Praktik IT & Jaringan',
        location: 'Lab Komputer 1',
        systemQty: 4,
        physicalQty: 4,
        difference: 0,
        unit: 'Roll',
        unitPrice: 1650000,
        condition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-22 09:30',
        checkedBy: 'Bapak Muh. Taufik, S.T',
        notes: 'Stok tersegel utuh di lemari alat.'
      },
      {
        id: 'so-item-4',
        itemId: 'bhp-it-02',
        itemCode: 'BHP-IT-002',
        itemName: 'Konektor RJ-45 Cat6 CommScope (Box 100 pcs)',
        category: 'Bahan Praktik IT & Jaringan',
        location: 'Lab Komputer 1',
        systemQty: 8,
        physicalQty: 7,
        difference: -1,
        unit: 'Box',
        unitPrice: 220000,
        condition: 'BAIK',
        status: 'SELISIH',
        checkedAt: '2026-08-22 10:00',
        checkedBy: 'Bapak Muh. Taufik, S.T',
        notes: '1 box terpakai saat uji kompetensi kejuruan TKJ belum terinput di log mutasi.'
      },
      {
        id: 'so-item-5',
        itemId: 'bhp-it-04',
        itemCode: 'BHP-IT-004',
        itemName: 'SSD Sata 256GB V-GeN Platinum',
        category: 'Bahan Praktik IT & Jaringan',
        location: 'Lab Komputer 1',
        systemQty: 10,
        physicalQty: 10,
        difference: 0,
        unit: 'Pcs',
        unitPrice: 285000,
        condition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-22 11:20',
        checkedBy: 'Ustadz Ahmad Fadhil',
        notes: 'Stok lengkap dan tersimpan aman.'
      },
      {
        id: 'so-item-6',
        itemId: '14',
        itemCode: 'INV-AP-001',
        itemName: 'Access Point Ruijie Reyee RG-RAP2200',
        category: 'Elektronik',
        location: 'Lab Komputer 1',
        systemQty: 2,
        physicalQty: 2,
        difference: 0,
        unit: 'Unit',
        unitPrice: 1250000,
        condition: 'BAIK',
        systemCondition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-23 14:00',
        checkedBy: 'Ustadz Ahmad Fadhil',
        notes: 'Terpasang di plafon lab dan berfungsi normal.'
      }
    ]
  },
  {
    id: 'so-002',
    sessionCode: 'SO-2026-08-02',
    title: 'Stock Opname Bahan Habis Pakai & ATK Bulan Agustus 2026',
    type: 'BHP',
    startDate: '2026-08-28',
    status: 'IN_PROGRESS',
    auditorName: 'Ust. Ahmad Fauzan, S.Pd.',
    notes: 'Pemeriksaan rutin akhir bulan untuk barang logistik, ATK, bahan praktik dan kebersihan.',
    totalSystemItems: 8,
    totalCheckedItems: 5,
    totalMatchItems: 4,
    totalDiscrepancyItems: 1,
    totalMissingItems: 0,
    items: [
      {
        id: 'so-item-201',
        itemId: '1',
        itemCode: 'BHP-ATK-001',
        itemName: 'Kertas HVS A4 75gr PaperOne (Rim)',
        category: 'Alat Tulis Kantor (ATK)',
        location: 'Ruang Tata Usaha & Guru',
        systemQty: 45,
        physicalQty: 45,
        difference: 0,
        unit: 'Rim',
        unitPrice: 52000,
        condition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-28 14:10',
        checkedBy: 'Ust. Ahmad Fauzan, S.Pd.',
        notes: 'Stok di rak gudang TU sesuai sistem.'
      },
      {
        id: 'so-item-202',
        itemId: '2',
        itemCode: 'BHP-ATK-002',
        itemName: 'Tinta Printer Epson 003 Black (Botol)',
        category: 'Alat Tulis Kantor (ATK)',
        location: 'Ruang Tata Usaha & Guru',
        systemQty: 12,
        physicalQty: 10,
        difference: -2,
        unit: 'Botol',
        unitPrice: 85000,
        condition: 'BAIK',
        status: 'SELISIH',
        checkedAt: '2026-08-28 14:30',
        checkedBy: 'Ust. Ahmad Fauzan, S.Pd.',
        notes: '2 botol terdistribusi ke printer ruang kepala sekolah dan waka.'
      },
      {
        id: 'so-item-203',
        itemId: '3',
        itemCode: 'BHP-ATK-003',
        itemName: 'Spidol Boardmarker Snowman Hitam (Lusin)',
        category: 'Alat Tulis Kantor (ATK)',
        location: 'Ruang Tata Usaha & Guru',
        systemQty: 8,
        physicalQty: 8,
        difference: 0,
        unit: 'Lusin',
        unitPrice: 110000,
        condition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-28 15:00',
        checkedBy: 'Ust. Ahmad Fauzan, S.Pd.',
        notes: 'Semua tersusun di loker ATK.'
      },
      {
        id: 'so-item-204',
        itemId: 'bhp-med-01',
        itemCode: 'BHP-MED-001',
        itemName: 'Minyak Kayu Putih Cap Lang 120ml',
        category: 'Kesehatan & Medis / UKS',
        location: 'Ruang UKS & Konseling',
        systemQty: 8,
        physicalQty: 8,
        difference: 0,
        unit: 'Botol',
        unitPrice: 48000,
        condition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-29 09:15',
        checkedBy: 'Ust. Ahmad Fauzan, S.Pd.',
        notes: 'Segel utuh di lemari P3K.'
      },
      {
        id: 'so-item-205',
        itemId: 'bhp-kbr-01',
        itemCode: 'BHP-KBR-001',
        itemName: 'Wipol Karbol Wangi Pine 780ml Pouch',
        category: 'Kebersihan & Sanitasi',
        location: 'Gudang Sarpras & Kebersihan',
        systemQty: 18,
        physicalQty: 18,
        difference: 0,
        unit: 'Pouch',
        unitPrice: 18500,
        condition: 'BAIK',
        status: 'SESUAI',
        checkedAt: '2026-08-29 10:30',
        checkedBy: 'Ust. Ahmad Fauzan, S.Pd.',
        notes: 'Stok mencukupi untuk operasional 1 bulan.'
      },
      {
        id: 'so-item-206',
        itemId: 'bhp-el-01',
        itemCode: 'BHP-EL-001',
        itemName: 'Lampu LED Philips 14W Putih (Pcs)',
        category: 'Listrik & Elektronik',
        location: 'Gudang Sarpras & Kebersihan',
        systemQty: 24,
        physicalQty: 24,
        difference: 0,
        unit: 'Pcs',
        unitPrice: 42000,
        condition: 'BAIK',
        status: 'BELUM_DIPERIKSA',
        notes: 'Belum dihitung fisik di gudang kelistrikan.'
      },
      {
        id: 'so-item-207',
        itemId: 'bhp-it-03',
        itemCode: 'BHP-IT-003',
        itemName: 'Tang Crimping RJ-45 & RJ-11 Proskit',
        category: 'Bahan Praktik IT & Jaringan',
        location: 'Lab Komputer 1',
        systemQty: 6,
        physicalQty: 6,
        difference: 0,
        unit: 'Pcs',
        unitPrice: 175000,
        condition: 'BAIK',
        status: 'BELUM_DIPERIKSA',
        notes: ''
      },
      {
        id: 'so-item-208',
        itemId: 'bhp-atk-04',
        itemCode: 'BHP-ATK-004',
        itemName: 'Stopmap Folio Kertas Diamond (Pack 50 pcs)',
        category: 'Alat Tulis Kantor (ATK)',
        location: 'Ruang Tata Usaha & Guru',
        systemQty: 12,
        physicalQty: 12,
        difference: 0,
        unit: 'Pack',
        unitPrice: 65000,
        condition: 'BAIK',
        status: 'BELUM_DIPERIKSA',
        notes: ''
      }
    ]
  }
];

export const initialSignatorySettings: SignatorySettings = {
  city: 'Makassar',
  headmaster: {
    name: 'Anto, S.E.I., M.E., Gr., MCF.',
    niy: 'NIY. 201503 001',
    title: 'Kepala Sekolah'
  },
  sarprasOfficer: {
    name: 'Bapak Muh. Taufik, S.T',
    niy: 'NIY. 201807 042',
    title: 'Penanggung Jawab / Pengelola Sarpras'
  },
  maintenanceCoordinator: {
    name: 'Ustadz Ahmad Fadhil, S.Kom',
    niy: 'NIY. 201908 055',
    title: 'Koordinator Pemeliharaan & IT'
  },
  librarian: {
    name: 'Ustadzah Nurul Hidayah, S.Pd',
    niy: 'NIY. 202001 078',
    title: 'Kepala Perpustakaan Vokasi'
  },
  bhpOfficer: {
    name: 'Ust. Ahmad Fauzan, S.Pd.',
    niy: 'NIY. 202102 090',
    title: 'Petugas Pengelola BHP / Tata Usaha'
  }
};

export const defaultCurrentUser: UserAccount | null = null;
