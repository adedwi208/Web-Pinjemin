const db = require('./db');

const UserModel = {
  findByUsernameOrEmail: (identifier, callback) => {
    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(sql, [identifier, identifier], callback);
  },

  createUser: (data, callback) => {
    const sql = 'INSERT INTO users SET ?';
    db.query(sql, data, callback);
  }
};

module.exports = UserModel;
