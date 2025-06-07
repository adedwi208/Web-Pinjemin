const express = require('express');
const router = express.Router();
const penyediaController = require('../controllers/penyediacontroller');

router.get('/pinjaman/:penyedia_id', penyediaController.getBarangDipinjam);

module.exports = router;
