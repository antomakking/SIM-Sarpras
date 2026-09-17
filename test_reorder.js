import fs from 'fs';

let content = fs.readFileSync('src/pages/Facilities.tsx', 'utf-8');

if (!content.includes('import { Reorder } from "motion/react"')) {
    content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { Reorder } from 'motion/react';");
}

const oldGrid = `<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room: any) => (
          <Card key={room.id} className="hover:border-emerald-200 transition-colors cursor-pointer">`;

const newGrid = `<Reorder.Group axis="y" values={rooms} onReorder={setRooms} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room: any) => (
          <Reorder.Item key={room.id} value={room} className="cursor-grab active:cursor-grabbing relative">
            <Card className="hover:border-emerald-200 transition-colors h-full">`;

const oldCardEnd = `            </CardContent>
          </Card>
        ))}
      </div>`;

const newCardEnd = `            </CardContent>
            </Card>
          </Reorder.Item>
        ))}
      </Reorder.Group>`;

content = content.replace(oldGrid, newGrid).replace(oldCardEnd, newCardEnd);

fs.writeFileSync('src/pages/Facilities.tsx', content);

