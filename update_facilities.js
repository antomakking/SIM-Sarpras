import fs from 'fs';

let content = fs.readFileSync('src/pages/Facilities.tsx', 'utf-8');

// 1. Update imports
content = content.replace(
  "import { Calendar, Plus, DoorOpen } from 'lucide-react';",
  "import { Calendar, Plus, DoorOpen, X } from 'lucide-react';"
);

// 2. Update state declarations
content = content.replace(
  "const [rooms] = useLocalStorage('iq-rooms', initialRooms);",
  "const [rooms, setRooms] = useLocalStorage('iq-rooms', initialRooms);"
);

const stateAndHandlers = `  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', description: '' });
  const [newBooking, setNewBooking] = useState({ roomId: '', userName: '', date: '', timeSlot: '', purpose: '' });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name || !newRoom.capacity) return;

    const roomData = {
      id: 'r' + Date.now().toString(),
      name: newRoom.name,
      capacity: parseInt(newRoom.capacity),
      description: newRoom.description
    };

    setRooms([...rooms, roomData]);
    setNewRoom({ name: '', capacity: '', description: '' });
    setIsAddRoomOpen(false);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.roomId || !newBooking.userName || !newBooking.date || !newBooking.timeSlot || !newBooking.purpose) return;

    const bookingData = {
      id: 'b' + Date.now().toString(),
      roomId: newBooking.roomId,
      userName: newBooking.userName,
      date: newBooking.date,
      timeSlot: newBooking.timeSlot,
      purpose: newBooking.purpose,
      status: 'PENDING'
    };

    setBookings([bookingData, ...bookings]);
    setNewBooking({ roomId: '', userName: '', date: '', timeSlot: '', purpose: '' });
    setIsBookingOpen(false);
  };

  return (`;

content = content.replace("  return (", stateAndHandlers);

// 3. Update button onClick handlers
content = content.replace(
  '<Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Tambah Ruangan</Button>',
  '<Button variant="outline" onClick={() => setIsAddRoomOpen(true)}><Plus className="h-4 w-4 mr-2" /> Tambah Ruangan</Button>'
);
content = content.replace(
  '<Button><Calendar className="h-4 w-4 mr-2" /> Booking Ruangan</Button>',
  '<Button onClick={() => setIsBookingOpen(true)}><Calendar className="h-4 w-4 mr-2" /> Booking Ruangan</Button>'
);

// 4. Add modals before the final closing tag
const modals = `
      {/* Modal Tambah Ruangan */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Tambah Ruangan Baru</CardTitle>
              <button onClick={() => setIsAddRoomOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Ruangan</label>
                  <input
                    type="text"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Contoh: Lab RPL 2"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Contoh: 36"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi / Fasilitas Utama</label>
                  <textarea
                    className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-[80px]"
                    placeholder="Contoh: 36 PC Core i5, Proyektor, AC"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddRoomOpen(false)}>Batal</Button>
                  <Button type="submit">Simpan Ruangan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Booking Ruangan */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Formulir Booking Ruangan</CardTitle>
              <button onClick={() => setIsBookingOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Ruangan</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    value={newBooking.roomId}
                    onChange={(e) => setNewBooking({...newBooking, roomId: e.target.value})}
                    required
                  >
                    <option value="" disabled>-- Pilih Ruangan --</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name} (Kapasitas: {r.capacity})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Peminjam / Guru</label>
                  <input
                    type="text"
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Nama Lengkap"
                    value={newBooking.userName}
                    onChange={(e) => setNewBooking({...newBooking, userName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
                    <input
                      type="date"
                      className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Waktu / Jam</label>
                    <input
                      type="text"
                      className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="08:00 - 10:00"
                      value={newBooking.timeSlot}
                      onChange={(e) => setNewBooking({...newBooking, timeSlot: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Keperluan</label>
                  <textarea
                    className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-[80px]"
                    placeholder="Contoh: Praktikum Pemrograman Web Kelas X-A"
                    value={newBooking.purpose}
                    onChange={(e) => setNewBooking({...newBooking, purpose: e.target.value})}
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>Batal</Button>
                  <Button type="submit">Ajukan Booking</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}`;

content = content.replace("    </div>\n  );\n}", modals);

fs.writeFileSync('src/pages/Facilities.tsx', content);

