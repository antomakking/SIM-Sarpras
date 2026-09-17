import fs from 'fs';

let content = fs.readFileSync('src/pages/Facilities.tsx', 'utf-8');

// Remove motion/react Reorder import
content = content.replace("import { Reorder } from 'motion/react';", "");

// Add dnd-kit imports
const dndImports = `import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';`;
content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\n" + dndImports);

// Create SortableRoomCard component
const sortableCardComponent = `
function SortableRoomCard({ room, onEdit }: { room: any, onEdit: (room: any) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full touch-none outline-none">
      <Card className={\`hover:border-emerald-200 transition-colors h-full cursor-grab active:cursor-grabbing \${isDragging ? 'shadow-xl scale-105 border-emerald-300' : ''}\`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg pr-4">{room.name}</CardTitle>
            <div className="flex items-center gap-2">
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onEdit(room); }}
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <DoorOpen className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-2">{room.description}</p>
          <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 w-fit px-2 py-1 rounded">
            Kapasitas: {room.capacity} orang
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;

content = content.replace("export default function Facilities() {", sortableCardComponent + "\nexport default function Facilities() {");

// Add sensors and state
const dndSetup = `  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRooms((items: any[]) => {
        const oldIndex = items.findIndex((i: any) => i.id === active.id);
        const newIndex = items.findIndex((i: any) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const activeRoom = activeId ? rooms.find((r: any) => r.id === activeId) : null;
`;

content = content.replace("  const [bookings, setBookings] = useLocalStorage('iq-bookings', initialBookings);", "  const [bookings, setBookings] = useLocalStorage('iq-bookings', initialBookings);\n" + dndSetup);

// Replace Reorder with DndContext
const reorderRegex = /<Reorder\.Group[\s\S]*?<\/Reorder\.Group>/;

const newGrid = `<DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={rooms.map((r: any) => r.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room: any) => (
              <SortableRoomCard 
                key={room.id} 
                room={room} 
                onEdit={(room) => {
                  setEditingRoom(room);
                  setIsEditRoomOpen(true);
                }} 
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
          {activeRoom ? (
            <div className="h-full">
              <Card className="shadow-2xl scale-105 border-emerald-300 h-full cursor-grabbing">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg pr-4">{activeRoom.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="p-2 text-slate-400">
                        <Pencil className="h-4 w-4" />
                      </div>
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                        <DoorOpen className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-2">{activeRoom.description}</p>
                  <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded">
                    Kapasitas: {activeRoom.capacity} orang
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>`;

content = content.replace(reorderRegex, newGrid);

fs.writeFileSync('src/pages/Facilities.tsx', content);

