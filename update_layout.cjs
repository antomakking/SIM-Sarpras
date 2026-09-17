const fs = require('fs');
const content = fs.readFileSync('src/layout/MainLayout.tsx', 'utf-8');

let newContent = content.replace(
  "import { useTheme } from '../components/ThemeProvider';",
  "import { useTheme } from '../components/ThemeProvider';\nimport { useLocalStorage } from '../hooks/useLocalStorage';\nimport { initialAssets, initialConsumables, initialRooms } from '../store/data';"
);

newContent = newContent.replace(
  "export default function MainLayout() {\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const navigate = useNavigate();\n  const { theme, setTheme } = useTheme();",
  `export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [assets] = useLocalStorage('iq-assets', initialAssets);
  const [consumables] = useLocalStorage('iq-consumables', initialConsumables);
  const [rooms] = useLocalStorage('iq-rooms', initialRooms);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];
    assets.forEach((a) => {
      if (a.name.toLowerCase().includes(query) || (a.assetCode && a.assetCode.toLowerCase().includes(query))) {
        results.push({ id: a.id, title: a.name, subtitle: a.assetCode || a.category, type: 'Inventaris', link: '/inventory' });
      }
    });
    consumables.forEach((c) => {
      if (c.name.toLowerCase().includes(query) || (c.itemCode && c.itemCode.toLowerCase().includes(query))) {
        results.push({ id: c.id, title: c.name, subtitle: c.itemCode || c.category, type: 'BHP', link: '/consumables' });
      }
    });
    rooms.forEach((r) => {
      if (r.name.toLowerCase().includes(query)) {
        results.push({ id: r.id, title: r.name, subtitle: 'Fasilitas & Ruangan', type: 'Fasilitas', link: '/facilities' });
      }
    });
    return results.slice(0, 5);
  }, [searchQuery, assets, consumables, rooms]);
`
);

const searchInputJSX = `<div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="search" 
                placeholder="Cari aset, buku, ruangan..." 
                className="w-full pl-9 bg-slate-50 dark:bg-slate-900 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <ul className="py-2">
                      {searchResults.map((res, i) => (
                        <li 
                          key={i} 
                          className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                            navigate(res.link);
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{res.title}</p>
                            <p className="text-xs text-slate-500">{res.subtitle}</p>
                          </div>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-2 py-1 rounded">
                            {res.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Tidak ditemukan hasil untuk "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>`;

newContent = newContent.replace(
  '<div className="relative w-full">\n              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />\n              <Input type="search" placeholder="Cari aset, buku, ruangan..." className="w-full pl-9 bg-slate-50 dark:bg-slate-900 border-none" />\n            </div>',
  searchInputJSX
);

fs.writeFileSync('src/layout/MainLayout.tsx', newContent);
