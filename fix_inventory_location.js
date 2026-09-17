import fs from 'fs';

let content = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

// 1. Import initialRooms
content = content.replace(
  "import { initialAssets } from '../store/data';",
  "import { initialAssets, initialRooms } from '../store/data';"
);

// 2. Add rooms state
content = content.replace(
  "  const [assets, setAssets] = useLocalStorage('iq-assets', initialAssets);",
  "  const [assets, setAssets] = useLocalStorage('iq-assets', initialAssets);\n  const [rooms] = useLocalStorage('iq-rooms', initialRooms);"
);

// 3. Replace Input with select
const oldInput = '<Input required value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} />';
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
                    <option value="Gudang">Gudang Utama</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>`;

content = content.replace(oldInput, newSelect);

fs.writeFileSync('src/pages/Inventory.tsx', content);

