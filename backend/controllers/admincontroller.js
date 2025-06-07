const db = require('../models/db');

const adminController = {
  // 1. Ambil semua user
  getAllUsers: (req, res) => {
    const query = 'SELECT name AS nama, username, role FROM users';

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

  // 4. Hapus pengguna
  hapusPengguna: (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ message: 'Gagal menghapus pengguna' });
      res.json({ message: 'Pengguna berhasil dihapus' });
    });
  },

  // 5. Edit pengguna
  editPengguna: (req, res) => {
    const id = req.params.id;
    const { nama, username, role } = req.body;

    db.query(
      'UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?',
      [nama, username, role, id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Gagal mengedit pengguna' });
        res.json({ message: 'Pengguna berhasil diupdate' });
      }
    );
  }
};

module.exports = adminController;
