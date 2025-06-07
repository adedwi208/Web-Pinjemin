const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/pengguna', adminController.getAllUsers);
router.get('/barang', adminController.getAllBarangWithPenyedia);
router.get('/laporan', adminController.getLaporanPeminjaman);
router.delete('/pengguna/:id', adminController.hapusPengguna);
router.put('/pengguna/:id', adminController.editPengguna);

module.exports = router;
