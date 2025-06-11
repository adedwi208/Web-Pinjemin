require('dotenv').config();
const express = require('express'); // Pindahkan ke atas
const app = express(); // Pindahkan ke atas
const cors = require('cors');
const cron = require('node-cron');
const pinjamController = require('./backend/controllers/pinjamcontroller');
const db = require('./backend/models/db');
const path = require('path');
const fs = require('fs');

// console.log("Aplikasi dimulai.");
// console.log("Mencoba menjadwalkan tugas cron...");

const authRoutes = require('./backend/routers/authrouters');
const barangRoutes = require('./backend/routers/barang');
const pinjamRoutes = require('./backend/routers/pinjam');
const adminRoutes = require('./backend/routers/admin');
const penyediaRoutes = require('./backend/routers/penyedia');

// PENTING: Hapus baris duplikat ini
// app.use('/api', require('./routes/barang')); // HAPUS BARIS INI


const PORT = process.env.PORT || 3000;

cron.schedule('*/1 * * * *', () => {
  // console.log('Tugas cron dipicu: ' + new Date().toLocaleTimeString());
  pinjamController.checkAndSendOverdueNotifications();
});
// console.log("Tugas cron berhasil dijadwalkan.");

app.use(cors());
app.use(express.json());

// ✅ Serve static files DULUAN (public berisi HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes); // Rute barang yang benar
app.use('/api/pinjam', pinjamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/penyedia', penyediaRoutes);


// ✅ Uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Optional: Root path kirim index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Buat folder uploads kalau belum ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});