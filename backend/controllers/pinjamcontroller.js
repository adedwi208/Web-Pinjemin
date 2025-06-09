// pinjamcontroller.js
const PinjamModel = require('../models/pinjammodels'); //
const BarangModel = require('../models/barangmodels'); //
const db = require('../models/db'); // Pastikan ini mengarah ke koneksi database yang benar
const emailService = require('../../emailServis'); 

const pinjamController = {

  // Contoh: app/controllers/PinjamController.js atau routes/pinjam.js

pinjamBarang: (req, res) => {
    const { user, barang_id, tanggal_mulai, tanggal_selesai } = req.body;

    // 1. Validasi Keberadaan Data (sudah ada)
    if (!user || !barang_id || !tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({ message: 'Data peminjaman tidak lengkap.' });
    }

    // 2. Validasi Tanggal di sisi Server (TAMBAHKAN INI)
    const dateMulai = new Date(tanggal_mulai);
    const dateSelesai = new Date(tanggal_selesai);

    // Cek apakah tanggal valid (bukan NaN)
    if (isNaN(dateMulai.getTime()) || isNaN(dateSelesai.getTime())) {
        return res.status(400).json({ message: 'Format tanggal tidak valid.' });
    }

    // Pastikan tanggal selesai LEBIH BESAR dari tanggal mulai
    if (dateSelesai <= dateMulai) {
        return res.status(400).json({ message: 'Tanggal selesai harus lebih besar dari tanggal mulai.' });
    }

    // 3. Lanjutkan Proses Peminjaman jika validasi lolos
    const data = { username: user, barang_id, tanggal_mulai, tanggal_selesai };

    PinjamModel.pinjamBarang(data, (err, result) => {
      if (err) {
        // Log error server yang lebih detail
        console.error("Error PinjamModel.pinjamBarang:", err);
        return res.status(500).json({ message: 'Gagal meminjam. Terjadi kesalahan server.' });
      }

      // Pastikan ada validasi stok di model juga jika belum ada
      BarangModel.kurangiStokBarang(barang_id, (err2) => {
        if (err2) {
            console.error("Gagal mengurangi stok:", err2.message);
            // Anda mungkin ingin melakukan rollback peminjaman jika stok gagal dikurangi
            return res.status(500).json({ message: 'Peminjaman berhasil dicatat, tetapi gagal mengurangi stok barang.' });
        }
        res.json({ message: 'Peminjaman berhasil!' });
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
  },

  checkAndSendOverdueNotifications: async () => {
    try {
      // console.log("--- Memulai Pemeriksaan Barang Jatuh Tempo ---"); // Dinonaktifkan

      if (!emailService || typeof emailService.sendOverdueNotification !== 'function') {
          // console.error("ERROR: emailService tidak dimuat dengan benar atau sendOverdueNotification bukan fungsi."); // Dinonaktifkan
          return;
      }

      // Mengambil daftar barang yang jatuh tempo dari database
      // Kueri ini akan memilih barang yang:
      // 1. Statusnya 'dipinjam'
      // 2. Tanggal selesainya sudah lewat (jatuh tempo)
      // 3. BELUM PERNAH diberitahu (last_notified_at IS NULL)
      // ATAU sudah diberitahu TAPI sudah lebih dari 3 hari sejak notifikasi terakhir
      const query = `
        SELECT
            p.id AS pinjaman_id, -- Tambahkan pinjaman_id untuk update
            p.username,
            b.nama_barang,
            p.tanggal_selesai,
            u.email,
            p.last_notified_at
        FROM peminjaman p
        JOIN barang b ON p.barang_id = b.id
        JOIN users u ON p.username = u.username
        WHERE p.status = 'dipinjam'
          AND p.tanggal_selesai < CURDATE()
          AND (
                p.last_notified_at IS NULL
                OR DATEDIFF(CURDATE(), p.last_notified_at) >= 3
              );
      `;
      // console.log("Menjalankan Kueri SQL untuk barang jatuh tempo:", query); // Dinonaktifkan

      const overdueItems = await new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) {
            // console.error("ERROR Kueri SQL:", err); // Dinonaktifkan
            return reject(err);
          }
          // console.log("Hasil Kueri Barang Jatuh Tempo:", results); // Dinonaktifkan
          resolve(results);
        });
      });

      if (overdueItems.length === 0) {
        // console.log("Tidak ada barang yang jatuh tempo ditemukan saat ini."); // Dinonaktifkan
      } else {
        // console.log(`Ditemukan ${overdueItems.length} barang jatuh tempo. Akan mengirim notifikasi.`); // Dinonaktifkan
      }

      for (const item of overdueItems) {
        // console.log(`Mencoba mengirim notifikasi untuk barang "${item.nama_barang}" (${item.username}) ke email "${item.email}" dengan tanggal selesai ${item.tanggal_selesai}.`); // Dinonaktifkan
        await emailService.sendOverdueNotification(item.email, item.nama_barang, item.tanggal_selesai);
        // console.log(`Notifikasi berhasil dipicu untuk "${item.nama_barang}".`); // Dinonaktifkan

        // Setelah email berhasil dikirim, perbarui last_notified_at di database
        await new Promise((resolve, reject) => {
            const updateQuery = `
                UPDATE peminjaman
                SET last_notified_at = NOW(),
                    notification_count = COALESCE(notification_count, 0) + 1
                WHERE id = ?;
            `;
            db.query(updateQuery, [item.pinjaman_id], (err, results) => {
                if (err) {
                    // console.error(`ERROR memperbarui last_notified_at untuk pinjaman ID ${item.pinjaman_id}:`, err); // Dinonaktifkan
                    return reject(err);
                }
                // console.log(`last_notified_at diperbarui untuk pinjaman ID ${item.pinjaman_id}`); // Dinonaktifkan
                resolve(results);
            });
        });
      }
      // console.log("--- Pemeriksaan Barang Jatuh Tempo Selesai ---"); // Dinonaktifkan

    } catch (err) {
      // console.error("ERROR Umum di checkAndSendOverdueNotifications:", err); // Dinonaktifkan
    }
  },

};

module.exports = pinjamController; //