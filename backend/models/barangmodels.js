const db = require('./db');
const BarangModel = {
  tambahBarang: (data, callback) => {
    const query = `
      INSERT INTO barang (nama_barang, deskripsi, jumlah, penyedia_id, foto)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      data.nama_barang,
      data.deskripsi || '',
      data.jumlah,
      data.penyedia_id,
      data.foto
    ];
    db.query(query, values, callback);
  },

  getAllBarang: (callback) => {
  const query = `
      SELECT 
      barang.id,
      barang.nama_barang AS nama_barang,
      barang.deskripsi,
      barang.jumlah,
      barang.foto,
      users.username AS nama_penyedia
    FROM barang
    JOIN users ON barang.penyedia_id = users.id
  `;
  db.query(query, callback);
},
 // <=== Koma penting di sini

  getBarangByPenyedia: (penyedia_id, callback) => {
    const query = 'SELECT * FROM barang WHERE penyedia_id = ?';
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
  }
};


module.exports = BarangModel;
