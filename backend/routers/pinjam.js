// routes/pinjam.js
const express = require('express');
const router = express.Router();
const pinjamController = require('../controllers/pinjamcontroller');

router.post('/', pinjamController.pinjamBarang);
router.post('/kembalikan', pinjamController.kembalikanBarang);
router.get('/user/:username', pinjamController.getBarangDipinjamUser); // Tambahkan baris ini

module.exports = router;