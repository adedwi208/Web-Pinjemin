const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/usermodel');

const authController = {
  register: (req, res) => {
    const { name, phone, address, nik, email, username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    // Cek apakah username atau email sudah dipakai
    UserModel.findByUsernameOrEmail(username, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });

      const emailUsed = results.find(user => user.email === email);
      const usernameUsed = results.find(user => user.username === username);

      if (usernameUsed) {
        return res.status(409).json({ message: 'Username sudah digunakan' });
      }

      if (emailUsed) {
        return res.status(409).json({ message: 'Email sudah digunakan' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const userData = {
        name,
        phone,
        address,
        nik,
        email,
        username,
        password: hashedPassword,
        role
      };

      UserModel.createUser(userData, (err2) => {
        if (err2) {
          return res.status(500).json({ message: 'Gagal mendaftarkan user', error: err2.message });
        }
        else res.status(201).json({ message: 'Registrasi berhasil' });
      });
    });
  },

  login: (req, res) => {
    const { usernameOrEmail, password } = req.body;

    UserModel.findByUsernameOrEmail(usernameOrEmail, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (results.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

      const user = results[0];
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Password salah' });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });

      res.json({
      success: true,
      message: "Login berhasil",
      users_id: user.id,
      username: user.username,
      role: user.role, // Pastikan ini dikirim
      token: token // jika kamu menggunakan token
    });
    });
  }
};

module.exports = authController