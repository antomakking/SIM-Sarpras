import fs from 'fs';
let content = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

content = content.replace(
  "  const [rooms] = useLocalStorage('iq-rooms', initialRooms);\n  const [rooms] = useLocalStorage('iq-rooms', initialRooms);",
  "  const [rooms] = useLocalStorage('iq-rooms', initialRooms);"
);

fs.writeFileSync('src/pages/Inventory.tsx', content);
