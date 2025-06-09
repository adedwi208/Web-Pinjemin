const db = require('../models/db');

const adminController = {
  // 1. Ambil semua user
  getAllUsers: (req, res) => {
    // Pastikan Anda memilih kolom 'id' di sini!
    const query = 'SELECT id, name AS nama, username, role FROM users'; // <-- TAMBAHKAN id,

    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  // 2. Ambil semua barang + nama penyedianya
  getAllBarangWithPenyedia: (req, res) => {
    const query = `
      SELECT 
        barang.nama_barang,
        barang.deskripsi,
        users.username AS nama_penyedia
      FROM barang
      JOIN users ON barang.penyedia_id = users.id
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  // 3. Ambil riwayat peminjaman
  getLaporanPeminjaman: (req, res) => {
    const query = `
      SELECT 
        barang.nama_barang,
        peminjaman.username AS peminjam,
        peminjaman.tanggal_mulai,
        peminjaman.tanggal_selesai
      FROM peminjaman
      JOIN barang ON peminjaman.barang_id = barang.id
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },
};

module.exports = adminController;
