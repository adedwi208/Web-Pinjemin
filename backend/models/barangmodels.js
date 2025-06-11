const db = require('./db');

const BarangModel = {
  tambahBarang: (data, callback) => {
    const query = `
      INSERT INTO barang (nama_barang, deskripsi, jumlah, penyedia_id, foto, harga)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.nama_barang,
      data.deskripsi || '',
      data.jumlah,
      data.penyedia_id,
      data.foto,
      data.harga
    ];
    db.query(query, values, callback);
  },

  getAllBarang: (callback) => {
    const query = `
      SELECT
        barang.id,
        barang.nama_barang,
        barang.deskripsi,
        barang.jumlah,
        barang.foto,
        barang.harga,
        users.username AS nama_penyedia,
        users.phone AS no_telepon_penyedia -- UBAH DARI users.no_telepon KE users.phone
      FROM barang
      JOIN users ON barang.penyedia_id = users.id
    `;
    db.query(query, callback);
  },

  getBarangByPenyedia: (penyedia_id, callback) => {
    const query = `
      SELECT id, nama_barang, deskripsi, jumlah, foto, harga
      FROM barang
      WHERE penyedia_id = ?
    `;
    db.query(query, [penyedia_id], callback);
  },

  updateStok: (id, jumlah) => {
    return new Promise((resolve, reject) => {
      db.query("UPDATE barang SET jumlah = ? WHERE id = ?", [jumlah, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  kurangiStokBarang: (barang_id, callback) => {
    const sql = 'UPDATE barang SET jumlah = jumlah - 1 WHERE id = ? AND jumlah > 0';
    db.query(sql, [barang_id], callback);
  },

  // Fungsi baru/modifikasi: getBarangById untuk detail dengan nomor telepon penyedia
 getBarangById: (id, callback) => {
    const query = `
      SELECT
        b.id,
        b.nama_barang,
        b.deskripsi,
        b.jumlah,
        b.foto,
        b.harga,
        u.username AS nama_penyedia,
        u.phone AS no_telepon_penyedia, -- UBAH DARI u.no_telepon KE u.phone
        b.penyedia_id
      FROM barang b
      JOIN users u ON b.penyedia_id = u.id
      WHERE b.id = ?
    `;
    db.query(query, [id], callback);
  }
};

module.exports = BarangModel;