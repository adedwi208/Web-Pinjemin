const db = require('../models/db');

const penyediaController = {
  getBarangDipinjam: (req, res) => {
    const penyediaId = req.params.penyedia_id;

    const query = `
      SELECT
        barang.nama_barang,
        peminjaman.username AS peminjam,
        peminjaman.tanggal_mulai,
        peminjaman.tanggal_selesai
      FROM peminjaman
      JOIN barang ON peminjaman.barang_id = barang.id
      WHERE barang.penyedia_id = ? AND peminjaman.status = 'dipinjam'
    `;

    db.query(query, [penyediaId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  }
};

module.exports = penyediaController;