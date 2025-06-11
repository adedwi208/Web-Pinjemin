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
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f8f9fa; /* Latar belakang yang lebih bersih */
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }

                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                        overflow: hidden;
                        border: 1px solid #e0e0e0; /* Border tipis untuk kesan rapi */
                    }

                    .header {
                        background-color: #2c3e50; /* Biru gelap keabu-abuan yang sangat elegan */
                        color: white;
                        padding: 18px 25px; /* Padding sedikit disesuaikan agar pas */
                        text-align: center;
                        font-size: 20px; /* Ukuran font header yang pas */
                        font-weight: bold;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }

                    .content {
                        padding: 25px 30px;
                        color: #343a40;
                        font-size: 15px;
                        line-height: 1.7;
                    }

                    .content p {
                        margin-bottom: 15px;
                    }

                    .item-details {
                        background-color: #f2f7fa; /* Latar belakang detail item yang lebih terang */
                        border-left: 4px solid #34495e; /* Biru gelap yang senada dengan header */
                        padding: 15px 20px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }

                    .item-details p {
                        margin: 5px 0;
                    }

                    .item-name {
                        font-weight: bold;
                        color: #0056b3;
                        font-size: 16px;
                    }

                    .overdue-date {
                        font-weight: bold;
                        color: #dc3545; /* Tetap merah untuk penekanan */
                        font-size: 16px;
                    }

                    .call-to-action {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e9ecef;
                    }

                    .button {
                        display: inline-block;
                        background-color: #3498db; /* Biru cerah namun profesional */
                        color: white;
                        padding: 12px 25px;
                        border-radius: 5px;
                        text-decoration: none;
                        font-weight: bold;
                        font-size: 16px;
                        transition: background-color 0.3s ease;
                        border: none;
                    }

                    .button:hover {
                        background-color: #217dbb;
                    }

                    .footer {
                        margin-top: 20px;
                        padding: 20px 30px;
                        border-top: 1px solid #e9ecef;
                        font-size: 13px;
                        color: #6c757d;
                        text-align: center;
                        background-color: #f1f3f5;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                    }

                    .footer p {
                        margin: 5px 0;
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