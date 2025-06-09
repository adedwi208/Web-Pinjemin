const express = require('express');
const router = express.Router(); // Define a new router instance
const adminController = require('../controllers/adminController'); // Ensure the path is correct

// 1. Ambil semua user
router.get('/pengguna', adminController.getAllUsers);

// 2. Ambil semua barang + nama penyedianya
router.get('/barang', adminController.getAllBarangWithPenyedia);

// 3. Ambil riwayat peminjaman
router.get('/laporan', adminController.getLaporanPeminjaman);

module.exports = router; // Export the router