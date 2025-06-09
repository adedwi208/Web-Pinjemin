// D:\my-web-main\emailServis.js
require('dotenv').config(); // Memuat variabel lingkungan dari .env

const nodemailer = require('nodemailer');

// Konfigurasi transporter email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Menggunakan layanan Gmail
    // Jika ada masalah dengan 'service: 'gmail'', coba konfigurasi manual ini:
    // host: 'smtp.gmail.com',
    // port: 465,
    // secure: true,
    auth: {
        user: process.env.EMAIL_USER, // Alamat email pengirim dari .env
        pass: process.env.EMAIL_PASS  // Kata Sandi Aplikasi dari .env
    },
    // logger: true, // Dinonaktifkan untuk menghindari output di terminal
    // debug: true   // Dinonaktifkan untuk menghindari output di terminal
});

/**
 * Mengirim notifikasi email untuk barang yang jatuh tempo.
 * @param {string} recipientEmail - Alamat email penerima.
 * @param {string} itemName - Nama barang yang jatuh tempo.
 * @param {string} returnDate - Tanggal jatuh tempo barang.
 */
const sendOverdueNotification = (recipientEmail, itemName, returnDate) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Pemberitahuan: Barang Pinjaman Anda Telah Jatuh Tempo!',
        html: `
            <!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Notifikasi Jatuh Tempo</title>
              <style type="text/css">
                /* Gaya dasar untuk kompatibilitas lebih luas */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #FF6347; /* Merah tomat */
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                    margin: -20px -20px 20px -20px; /* Sesuaikan padding container */
                }
                .content p {
                    line-height: 1.6;
                    color: #333333;
                }
                .item-name {
                    font-weight: bold;
                    color: #4CAF50; /* Hijau */
                }
                .overdue-date {
                    font-weight: bold;
                    color: #FF6347; /* Merah tomat */
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #eeeeee;
                    font-size: 0.9em;
                    color: #888888;
                    text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>⚠️ Pemberitahuan Jatuh Tempo ⚠️</h2>
                </div>
                <div class="content">
                  <p>Halo,</p>
                  <p>Kami ingin memberitahukan bahwa barang pinjaman Anda <strong class="item-name">${itemName}</strong> telah jatuh tempo.</p>
                  <p>Mohon segera kembalikan barang tersebut. Tanggal jatuh tempo adalah: <span class="overdue-date">${returnDate}</span>.</p>
                  <p>Terima kasih atas perhatiannya.</p>
                </div>
                <div class="footer">
                  <p>Salam,</p>
                  <p>Tim Web Pinjemin</p>
                  <p>Ini adalah email otomatis, mohon jangan balas.</p>
                </div>
              </div>
            </body>
            </html>
        `
    };

    // Mengirim email menggunakan transporter
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // console.error('ERROR saat mengirim email:', error); // Dinonaktifkan
        } else {
            console.log('Email berhasil dikirim:', info.response); // Dinonaktifkan
            // console.log('Informasi tambahan email:', info); // Dinonaktifkan
        }
    });
};

module.exports = {
    sendOverdueNotification
};