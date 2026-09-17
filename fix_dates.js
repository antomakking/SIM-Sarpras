import fs from 'fs';
let content = fs.readFileSync('src/pages/Consumables.tsx', 'utf-8');

const newUseEffect = `  React.useEffect(() => {
    // Seed initial history if missing for backward compatibility and fix missing times
    let needsUpdate = false;
    const seeded = consumables.map((item: any) => {
      let updatedItem = { ...item };
      
      // 1. If no history at all
      if (!updatedItem.history) {
        needsUpdate = true;
        updatedItem.history = [
          { id: "h1_"+item.id, type: "Masuk", qty: item.stock, finalStock: item.stock, actor: "Sistem Awal", notes: "Stok awal sistem", date: "10/8/2026 08:00" }
        ];
      } else {
        // 2. Fix old histories that lack time
        let historyUpdated = false;
        const newHistory = updatedItem.history.map((h: any) => {
          if (h.date && !h.date.includes(':')) {
            historyUpdated = true;
            // append dummy time for existing history
            const dummyTime = h.type === 'Masuk' ? '08:00' : '14:30';
            return { ...h, date: \`\${h.date} \${dummyTime}\` };
          }
          return h;
        });
        
        if (historyUpdated) {
          needsUpdate = true;
          updatedItem.history = newHistory;
        }
      }
      return updatedItem;
    });
    if (needsUpdate) {
      setConsumables(seeded);
    }
  }, []); // Run once on mount (with current consumables from localStorage)`

content = content.replace(/React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, newUseEffect);

fs.writeFileSync('src/pages/Consumables.tsx', content);
