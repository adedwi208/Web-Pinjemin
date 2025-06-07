// routes/barang.js
const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangcontroller');
const multer = require('multer');
const path = require('path');
const penyediaController = require('../controllers/penyediacontroller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Tambah barang
router.post('/penyedia', upload.single('foto'), barangController.tambahBarang);

// Ambil barang milik penyedia
router.get('/penyedia/:id', barangController.getBarangByPenyedia);

router.get('/', barangController.getAllBarang);

router.get('/pinjaman/:penyedia_id', penyediaController.getBarangDipinjam);

router.put('/update-stok/:id', barangController.updateStok);



module.exports = router;
