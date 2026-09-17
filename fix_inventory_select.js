import fs from 'fs';

let content = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

const oldSelect = `<select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-emerald-500"
                    required 
                    value={newAsset.location} 
                    onChange={e => setNewAsset({...newAsset, location: e.target.value})}
                  >
                    <option value="" disabled>-- Pilih Lokasi Ruangan --</option>
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.name}>{room.name}</option>
                    ))}
                    <option value="Gudang">Gudang Utama</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>`;

const newSelect = `<select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-emerald-500"
                    required 
                    value={newAsset.location} 
                    onChange={e => setNewAsset({...newAsset, location: e.target.value})}
                  >
                    <option value="" disabled>-- Pilih Lokasi Ruangan --</option>
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.name}>{room.name}</option>
                    ))}
                    {newAsset.location && !rooms.some((r: any) => r.name === newAsset.location) && newAsset.location !== 'Gudang' && newAsset.location !== 'Lainnya' && (
                      <option value={newAsset.location}>{newAsset.location} (Data Lama)</option>
                    )}
                    <option value="Gudang">Gudang Utama</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>`;

content = content.replace(oldSelect, newSelect);
fs.writeFileSync('src/pages/Inventory.tsx', content);

