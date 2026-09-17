import fs from 'fs';

let content = fs.readFileSync('src/pages/Facilities.tsx', 'utf-8');

// 1. Add Pencil import
content = content.replace(
  "import { Calendar, Plus, DoorOpen, X } from 'lucide-react';",
  "import { Calendar, Plus, DoorOpen, X, Pencil } from 'lucide-react';"
);

// 2. Add state
const stateDeclarations = `  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', description: '' });
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newBooking, setNewBooking] = useState({ roomId: '', userName: '', date: '', timeSlot: '', purpose: '' });`;

content = content.replace(
  /  const \[isAddRoomOpen.*?newBooking, setNewBooking.*?;/s,
  stateDeclarations
);

// 3. Add handleEditRoom
const handleEditRoom = `  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name || !editingRoom.capacity) return;

    setRooms((prevRooms: any[]) => prevRooms.map((r: any) => 
      r.id === editingRoom.id ? { ...r, ...editingRoom, capacity: parseInt(editingRoom.capacity) } : r
    ));
    setIsEditRoomOpen(false);
    setEditingRoom(null);
  };

  const handleBooking =`;

content = content.replace("  const handleBooking =", handleEditRoom);

// 4. Add Pencil button to card
const cardHeaderOld = `<div className="flex justify-between items-start">
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <DoorOpen className="h-4 w-4" />
                </div>
              </div>`;
const cardHeaderNew = `<div className="flex justify-between items-start">
                <CardTitle className="text-lg pr-4">{room.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingRoom(room); setIsEditRoomOpen(true); }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <DoorOpen className="h-4 w-4" />
                  </div>
                </div>
              </div>`;
content = content.replace(cardHeaderOld, cardHeaderNew);

// 5. Add edit modal
const editModal = `
      {/* Modal Edit Ruangan */}
      {isEditRoomOpen && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Edit Ruangan</CardTitle>
              <button onClick={() => { setIsEditRoomOpen(false); setEditingRoom(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleEditRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Ruangan</label>
                  <input
                    type="text"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={editingRoom.name}
                    onChange={(e) => setEditingRoom({...editingRoom, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={editingRoom.capacity}
                    onChange={(e) => setEditingRoom({...editingRoom, capacity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi / Fasilitas Utama</label>
                  <textarea
                    className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-[80px]"
                    value={editingRoom.description}
                    onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setIsEditRoomOpen(false); setEditingRoom(null); }}>Batal</Button>
                  <Button type="submit">Simpan Perubahan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Booking Ruangan */}`;
content = content.replace("      {/* Modal Booking Ruangan */}", editModal);

fs.writeFileSync('src/pages/Facilities.tsx', content);

