import fs from 'fs';

let content = fs.readFileSync('src/pages/Consumables.tsx', 'utf-8');
content = content.replace(
  "const [consumables, setConsumables] = useLocalStorage('iq-consumables', initialConsumables);",
  `const [consumables, setConsumables] = useLocalStorage('iq-consumables', initialConsumables);
  
  React.useEffect(() => {
    // Seed initial history if missing for backward compatibility
    let needsUpdate = false;
    const seeded = consumables.map((item: any) => {
      if (!item.history) {
        needsUpdate = true;
        return {
          ...item,
          history: [
            { id: "h1_"+item.id, type: "Masuk", qty: item.stock, finalStock: item.stock, actor: "Sistem Awal", notes: "Stok awal sistem", date: "10/8/2026" }
          ]
        }
      }
      return item;
    });
    if (needsUpdate) {
      setConsumables(seeded);
    }
  }, []);`
);

fs.writeFileSync('src/pages/Consumables.tsx', content);
