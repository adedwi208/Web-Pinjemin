const BarangModel = require('../models/barangmodels');

const barangController = {
  tambahBarang: (req, res) => {
    const { nama_barang, deskripsi, jumlah, penyedia_id } = req.body;
    const file = req.file;

    if (!nama_barang || !jumlah || !penyedia_id || !file) {
      return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    const dataBarang = {
      nama_barang,
      deskripsi,
      jumlah,
      penyedia_id,
      foto: file.filename
    };

    BarangModel.tambahBarang(dataBarang, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal menyimpan barang', error: err.message });
      }

      res.status(201).json({ message: 'Barang berhasil disimpan' });
    });
  },

  getBarangByPenyedia: (req, res) => {
    const penyedia_id = req.params.id;

    BarangModel.getBarangByPenyedia(penyedia_id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengambil data barang', error: err.message });
      }

      res.json(results);
    });
  },

  getAllBarang: (req, res) => {
    BarangModel.getAllBarang((err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengambil semua data barang', error: err.message });
      }

      res.json(results);
    });
  },

  updateStok: async (req, res) => {
    const { id } = req.params;
    const { jumlah } = req.body;

    if (!id || jumlah === undefined) {
      return res.status(400).json({ message: "ID atau jumlah tidak valid" });
    }

    try {
      await BarangModel.updateStok(id, jumlah);
      res.json({ message: "Stok berhasil diperbarui" });
    } catch (err) {
      console.error("Error update stok:", err);
      res.status(500).json({ message: "Gagal update stok di server" });
    }
  }
};

module.exports = barangController;
