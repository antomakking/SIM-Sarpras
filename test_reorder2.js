import fs from 'fs';

let content = fs.readFileSync('src/pages/Facilities.tsx', 'utf-8');

const oldItem = '<Reorder.Item key={room.id} value={room} className="cursor-grab active:cursor-grabbing relative">';
const newItem = `<Reorder.Item 
            key={room.id} 
            value={room} 
            className="cursor-grab active:cursor-grabbing relative outline-none"
            whileDrag={{ scale: 1.05, zIndex: 50, rotate: 2 }}
            whileHover={{ scale: 1.01 }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >`;

content = content.replace(oldItem, newItem);

fs.writeFileSync('src/pages/Facilities.tsx', content);

