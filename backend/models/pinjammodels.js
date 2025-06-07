const db = require('./db');

const PinjamModel = {
  pinjamBarang: (data, callback) => {
    const query = `
      INSERT INTO peminjaman (username, barang_id, tanggal_mulai, tanggal_selesai)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [data.username, data.barang_id, data.tanggal_mulai, data.tanggal_selesai], callback);
  },

  kurangiStokBarang: (barang_id, callback) => {
  const query = `
    UPDATE barang
    SET jumlah = jumlah - 1
    WHERE id = ? AND jumlah > 0
  `;
  db.query(query, [barang_id], callback);
}

};

module.exports = PinjamModel;
