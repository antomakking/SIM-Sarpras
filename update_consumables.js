import fs from 'fs';

let content = fs.readFileSync('src/pages/Consumables.tsx', 'utf-8');

// Update imports
content = content.replace(
  "import { ArrowDownToLine, ArrowUpFromLine, Search, AlertTriangle, X } from 'lucide-react';",
  "import { ArrowDownToLine, ArrowUpFromLine, Search, AlertTriangle, X, Upload, Plus, History, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react';"
);

// We need to replace the section starting at <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> up to </Card>

const oldSection = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bahan Habis Pakai</h1>
          <p className="text-slate-500 mt-1">Manajemen Stok & Logistik</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOutOpen(true)}>
            <ArrowDownToLine className="h-4 w-4 mr-2" /> Barang Keluar
          </Button>
          <Button onClick={() => setIsRestockOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowUpFromLine className="h-4 w-4 mr-2" /> Restock
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari BHP..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-10">Kode Item</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-10">Nama Barang</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-10">Kategori</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-10">Stok</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-10">Reorder Point</TableHead>
                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 h-10">Status Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">Tidak ada data ditemukan.</TableCell>
                </TableRow>
              ) : filtered.map((item: any) => {
                const isLowStock = item.stock <= item.reorderPoint;
                return (
                  <TableRow key={item.id} className={\`\${isLowStock ? "bg-red-50/30 dark:bg-red-900/10" : ""} border-b border-slate-100 dark:border-slate-800 transition-colors\`}>
                    <TableCell className="font-mono text-xs">{item.itemCode}</TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">{item.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{item.category}</TableCell>
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                      {item.stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{item.reorderPoint} {item.unit}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <div className="flex items-center text-red-600 text-sm font-medium">
                          <AlertTriangle className="h-4 w-4 mr-1" /> Kritis
                        </div>
                      ) : (
                        <Badge variant="success" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 hover:bg-emerald-200 font-semibold border-none">Aman</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>`;

const newSection = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Barang Habis Pakai</h1>
          <p className="text-slate-500 mt-1">Kelola stok masuk, keluar, dan pemakaian per unit/kelas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOutOpen(true)} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
            <Upload className="h-4 w-4 mr-2" /> Impor Excel
          </Button>
          <Button onClick={() => setIsRestockOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Tambah Barang
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:w-[400px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Cari nama, kode, atau kategori..." 
          className="pl-10 border-emerald-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-emerald-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-b border-emerald-100 dark:border-slate-800">
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Kode</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Nama Barang</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Kategori</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Stok</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Lokasi</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12">Status</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400 h-12 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-slate-500">Tidak ada data ditemukan.</TableCell>
                </TableRow>
              ) : filtered.map((item: any) => {
                const isLowStock = item.stock <= item.reorderPoint;
                
                let location = 'Gudang TU';
                if (item.category === 'Tinta' || item.category === 'Jaringan') location = 'Lab Komputer';
                if (item.category === 'Kebersihan') location = 'Gudang Kebersihan';
                if (item.name.toLowerCase().includes('sarung tangan')) location = 'Lab IPA';
                
                return (
                  <TableRow key={item.id} className="border-b border-emerald-50 dark:border-slate-800 hover:bg-emerald-50/30 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-mono text-[11px] text-slate-500 tracking-wider uppercase">{item.itemCode}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{item.category}</TableCell>
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                      {item.stock} <span className="text-[11px] font-normal text-slate-400 ml-1">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{location}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          Aman
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="History"><History className="w-4 h-4" /></button>
                        <button className="text-emerald-500 hover:text-emerald-600 transition-colors" title="Pengeluaran"><ArrowDownCircle className="w-4 h-4" /></button>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button className="text-rose-400 hover:text-rose-500 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>`;

content = content.replace(oldSection, newSection);

fs.writeFileSync('src/pages/Consumables.tsx', content);
