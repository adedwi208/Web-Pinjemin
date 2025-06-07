// pinjamcontroller.js
const PinjamModel = require('../models/pinjammodels'); //
const BarangModel = require('../models/barangmodels'); //
const db = require('../models/db'); // Pastikan ini mengarah ke koneksi database yang benar

const pinjamController = {

  pinjamBarang: (req, res) => { //
    const { user, barang_id, tanggal_mulai, tanggal_selesai } = req.body; //

    if (!user || !barang_id || !tanggal_mulai || !tanggal_selesai) { //
      return res.status(400).json({ message: 'Data peminjaman tidak lengkap.' }); //
    }

    const data = { username: user, barang_id, tanggal_mulai, tanggal_selesai }; //

    PinjamModel.pinjamBarang(data, (err, result) => { //
      if (err) return res.status(500).json({ message: 'Gagal meminjam', error: err.message }); //

      BarangModel.kurangiStokBarang(barang_id, (err2) => { //
        if (err2) console.error("Gagal mengurangi stok:", err2.message); //
        res.json({ message: 'Peminjaman berhasil!' }); //
      });
    });
  },

  kembalikanBarang: async (req, res) => { //
    try {
      const { id_barang, pinjaman_id, username } = req.body; //

      if (!id_barang || !pinjaman_id || !username) { //
        return res.status(400).json({ error: 'ID barang dan username diperlukan' }); //
      }

      const rows = await new Promise((resolve, reject) => {
        db.query(
          `SELECT * FROM peminjaman
         WHERE id = ? AND username = ? AND status = 'dipinjam'`, //
          [pinjaman_id, username],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          })
      });

      if (rows.length === 0) { //
        return res.status(400).json({ error: 'Barang ini belum Anda pinjam atau sudah dikembalikan' }); //
      }

      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE peminjaman SET status = 'dikembalikan'
         WHERE id = ? AND username = ? AND status = 'dipinjam'`, //
          [pinjaman_id, username],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          })
      });

      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE barang SET jumlah = jumlah + 1 WHERE id = ?`, //
          [id_barang],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          })
      });

      res.json({ message: 'Barang berhasil dikembalikan.' }); //
    } catch (err) {
      console.error(err); //
      res.status(500).json({ error: 'Terjadi kesalahan saat mengembalikan barang.' }); //
    }
  },

  getBarangDipinjamUser: async (req, res) => {
    try {
      const username = req.params.username;

      const rows = await new Promise((resolve, reject) => {
        db.query(
          `SELECT
           p.id AS pinjaman_id,
           p.barang_id,
           b.nama_barang,
           b.deskripsi,
           b.foto,
           p.tanggal_mulai,
           p.tanggal_selesai,
           p.status,
           p.username AS peminjam_username,
           COALESCE(u.username, 'Tidak diketahui') AS nama_penyedia,
           b.jumlah
         FROM peminjaman p
         JOIN barang b ON p.barang_id = b.id
         LEFT JOIN users u ON b.penyedia_id = u.id
         WHERE p.username = ? AND p.status = "dipinjam"`,
          [username],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        )
      });

      res.json(rows);
    } catch (err) {
      console.error("Error dalam getBarangDipinjamUser (SQL Error):", err); // Log lebih detail
      res.status(500).json({ error: 'Gagal mengambil data peminjaman.' });
    }
  }

};

module.exports = pinjamController; //