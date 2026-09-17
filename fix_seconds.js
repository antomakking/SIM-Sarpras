import fs from 'fs';

// 1. Update Consumables.tsx
let content = fs.readFileSync('src/pages/Consumables.tsx', 'utf-8');

// Update the new history generation in handleRestock and handleOut
const oldDateStr = "const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;";
const newDateStr = "const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;";
content = content.replaceAll(oldDateStr, newDateStr);

// Update useEffect to fix existing records without seconds
const oldUseEffect = `  React.useEffect(() => {
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
  }, []);`;

const newUseEffect = `  React.useEffect(() => {
    // Seed initial history if missing for backward compatibility and fix missing times/seconds
    let needsUpdate = false;
    const seeded = consumables.map((item: any) => {
      let updatedItem = { ...item };
      
      if (!updatedItem.history) {
        needsUpdate = true;
        updatedItem.history = [
          { id: "h1_"+item.id, type: "Masuk", qty: item.stock, finalStock: item.stock, actor: "Sistem Awal", notes: "Stok awal sistem", date: "10/8/2026 08:00:00" }
        ];
      } else {
        let historyUpdated = false;
        const newHistory = updatedItem.history.map((h: any) => {
          if (h.date) {
            const parts = h.date.split(':');
            if (parts.length === 1) { // No time at all
              historyUpdated = true;
              const dummyTime = h.type === 'Masuk' ? '08:00:00' : '14:30:00';
              return { ...h, date: \`\${h.date} \${dummyTime}\` };
            } else if (parts.length === 2) { // Has HH:mm, but no seconds
              historyUpdated = true;
              return { ...h, date: \`\${h.date}:00\` };
            }
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
  }, []);`;

content = content.replace(/React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, newUseEffect);

fs.writeFileSync('src/pages/Consumables.tsx', content);

// 2. Update data.ts
let dataContent = fs.readFileSync('src/store/data.ts', 'utf-8');
dataContent = dataContent.replaceAll('10/8/2026 08:00', '10/8/2026 08:00:00');
dataContent = dataContent.replaceAll('15/8/2026 14:30', '15/8/2026 14:30:00');
fs.writeFileSync('src/store/data.ts', dataContent);

