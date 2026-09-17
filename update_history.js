import fs from 'fs';

let content = fs.readFileSync('src/pages/Consumables.tsx', 'utf-8');

// Update handleRestock
content = content.replace(
  `    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        return { ...item, stock: item.stock + qty };
      }
      return item;
    }));`,
  `    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        const newStock = item.stock + qty;
        const today = new Date();
        const dateStr = \`\${today.getDate()}/\${today.getMonth() + 1}/\${today.getFullYear()}\`;
        const newHistory = {
          id: Date.now().toString(),
          type: 'Masuk',
          qty: qty,
          finalStock: newStock,
          actor: 'Admin', // Or currently logged in user
          notes: notes || 'Restock',
          date: dateStr
        };
        return { ...item, stock: newStock, history: [newHistory, ...(item.history || [])] };
      }
      return item;
    }));`
);

// Update handleOut
content = content.replace(
  `    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        return { ...item, stock: Math.max(0, item.stock - qty) };
      }
      return item;
    }));`,
  `    setConsumables((prev: any[]) => prev.map(item => {
      if (item.id === selectedItem) {
        const newStock = Math.max(0, item.stock - qty);
        const today = new Date();
        const dateStr = \`\${today.getDate()}/\${today.getMonth() + 1}/\${today.getFullYear()}\`;
        const newHistory = {
          id: Date.now().toString(),
          type: 'Keluar',
          qty: qty,
          finalStock: newStock,
          actor: 'Admin', // Or currently logged in user
          notes: notes || 'Pengeluaran',
          date: dateStr
        };
        return { ...item, stock: newStock, history: [newHistory, ...(item.history || [])] };
      }
      return item;
    }));`
);


const oldModal = `<div className="space-y-4">
                <div className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex gap-3">
                    <ArrowDownToLine className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">Keluar (2 {currentItemData.unit})</span>
                  </div>
                  <span className="text-slate-500">2 hari yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex gap-3">
                    <ArrowUpFromLine className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Restock (10 {currentItemData.unit})</span>
                  </div>
                  <span className="text-slate-500">1 minggu yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-2">
                  <div className="flex gap-3">
                    <ArrowDownToLine className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">Keluar (5 {currentItemData.unit})</span>
                  </div>
                  <span className="text-slate-500">1 bulan yang lalu</span>
                </div>
              </div>`;

const newModal = `<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {(!currentItemData.history || currentItemData.history.length === 0) ? (
                  <div className="text-center py-8 text-slate-500">Belum ada riwayat aktivitas untuk barang ini.</div>
                ) : (
                  currentItemData.history.map((h: any) => (
                    <div key={h.id} className="flex flex-col gap-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {h.type === 'Keluar' ? (
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-full text-rose-600 dark:text-rose-400">
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full text-emerald-600 dark:text-emerald-400">
                              <ArrowUpFromLine className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {h.type} ({h.qty} {currentItemData.unit})
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{h.date}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1 ml-9">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Sisa Stok</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{h.finalStock} {currentItemData.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Oleh</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{h.actor}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Keterangan</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{h.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>`;

content = content.replace(oldModal, newModal);
fs.writeFileSync('src/pages/Consumables.tsx', content);

// Now let's update data.ts to have initial history
let dataContent = fs.readFileSync('src/store/data.ts', 'utf-8');
const historyStr = `history: [
      { id: "h1", type: "Masuk", qty: 20, finalStock: 25, actor: "Admin", notes: "Pembelian awal", date: "10/8/2026" },
      { id: "h2", type: "Keluar", qty: 20, finalStock: 5, actor: "Guru IT", notes: "Praktikum siswa", date: "15/8/2026" }
    ],
    `;

dataContent = dataContent.replace('reorderPoint: 10\n  },', 'reorderPoint: 10,\n    ' + historyStr + '},');

fs.writeFileSync('src/store/data.ts', dataContent);

