// main.js (sudah diperbaiki dan modular, ditambahkan fungsi ekspor)

// Variabel global untuk melacak menu saat ini
let currentMenu = '';

// --- Fungsi Umum ---
function showForm(form) {
  const formLogin = document.getElementById("formLogin");
  const formDaftar = document.getElementById("formDaftar");
  const btnLogin = document.getElementById("btnLogin");
  const btnDaftar = document.getElementById("btnDaftar");

  if (formLogin && formDaftar && btnLogin && btnDaftar) {
    formLogin.style.display = form === "login" ? "block" : "none";
    formDaftar.style.display = form === "daftar" ? "block" : "none";

    btnLogin.classList.toggle("active", form === "login");
    btnDaftar.classList.toggle("active", form === "daftar");
  }
}

// --- Script untuk index.html ---
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("index.html")) {
    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
      showForm("login");
      formLogin.addEventListener("submit", async function (e) {
        e.preventDefault();
        // Tambahkan logika jika diperlukan
      });
    } else {
      console.warn("formLogin tidak ditemukan di DOM.");
    }
  }
});

// --- Script untuk login.html ---
if (window.location.pathname.includes("login.html")) {
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        console.log("Response login:", result);

        if (response.ok) {
          const role = result.role?.trim().toLowerCase();
          alert(`Login berhasil sebagai ${result.role}`);

          localStorage.setItem("token", result.token);
          localStorage.setItem("username", result.username);
          localStorage.setItem("role", role);
          localStorage.setItem("user_id", result.users_id);

          if (role === "peminjam") {
            window.location.href = "peminjam.html";
          } else if (role === "penyedia") {
            window.location.href = "penyedia.html";
          } else if (role === "admin") {
            window.location.href = "admin.html";
          } else {
            alert("Role tidak dikenali, tidak bisa redirect.");
          }
        } else {
          alert(result.message || "Login gagal");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Terjadi kesalahan saat login");
      }
    });
  }

  const formDaftar = document.getElementById("formDaftar");
  if (formDaftar) {
    formDaftar.addEventListener("submit", async function (e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
          alert("Pendaftaran berhasil! Silakan login.");
          form.reset();
          showForm("login");
        } else {
          alert(result.message || "Pendaftaran gagal");
        }
      } catch (err) {
        console.error("Register error:", err);
        alert("Terjadi kesalahan saat daftar");
      }
    });
  }
}

// --- Fungsi untuk admin.html ---
// Fungsi ini dipanggil dari admin.html untuk memuat konten ke dalam iframe
// Menambahkan parameter filterRole, sortByDirection, dan isManagedByUser
function loadContent(menu, sortBy = '', filterRole = '', sortByDirection = 'asc', isManagedByUser = false) {
  currentMenu = menu; // Simpan menu saat ini

  // Sembunyikan semua kontrol filter dan tombol "Semua Data" secara default
  const roleFilterContainer = document.getElementById('roleFilterContainer');
  const managedByUserButton = document.getElementById('managedByUserButton');
  const showAllDataButton = document.getElementById('showAllDataButton');

  if (roleFilterContainer) roleFilterContainer.style.display = 'none';
  if (managedByUserButton) managedByUserButton.style.display = 'none';
  if (showAllDataButton) showAllDataButton.style.display = 'none';

  let url = '';
  if (menu === 'pengguna') {
      url = 'http://localhost:3000/api/admin/pengguna';
      if (roleFilterContainer) roleFilterContainer.style.display = 'block'; // Tampilkan filter role untuk pengguna
      if (showAllDataButton) showAllDataButton.style.display = 'block'; // Tampilkan tombol "Semua Data"
  } else if (menu === 'barang') {
      url = 'http://localhost:3000/api/admin/barang';
      if (managedByUserButton) managedByUserButton.style.display = 'block'; // Tampilkan tombol "Dikelola Pengguna" untuk barang
      if (showAllDataButton) showAllDataButton.style.display = 'block'; // Tampilkan tombol "Semua Data"
  } else if (menu === 'laporan') {
      url = 'http://localhost:3000/api/admin/laporan';
      if (showAllDataButton) showAllDataButton.style.display = 'block'; // Tampilkan tombol "Semua Data"
  }

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      let htmlContent = `
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px; /* Tambah margin atas agar tidak terlalu dekat tombol */
            font-family: Arial, sans-serif; /* Ganti font agar lebih standar di PDF */
            font-size: 10pt; /* Ukuran font agar lebih rapi di PDF A4 */
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px; /* Padding yang cukup */
            text-align: left;
            vertical-align: top; /* Pastikan teks di bagian atas sel */
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
          }
          /* Tambahkan styling untuk judul tabel */
          h3 {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-bottom: 15px;
            color: #333;
          }
          /* Styling untuk memastikan tombol tidak ikut tercetak jika tidak diinginkan */
          .export-buttons {
            margin-bottom: 15px;
            text-align: right;
            /* @media print { display: none; } */ /* Ini bisa ditambahkan jika Anda ingin menyembunyikan tombol saat dicetak/di-PDF */
          }
          .export-buttons button {
            background-color: #28a745;
            margin-left: 10px;
            padding: 8px 15px;
            font-size: 14px;
          }
          .export-buttons button:hover {
            background-color: #218838;
          }
          /* Atur ukuran font untuk button sort agar tidak terlalu kecil di PDF */
          th button {
              font-size: 10px; /* Sesuaikan ukuran font tombol sort */
              padding: 2px 5px;
              margin-left: 5px; /* Spasi antara teks header dan tombol */
              cursor: pointer;
          }
        </style>
      `;

      let tableHtml = ''; // Variabel untuk menyimpan HTML tabel saja

      if (menu === 'pengguna') {
        if (Array.isArray(data)) {
          // Filter data berdasarkan filterRole sebelum sorting
          if (filterRole && filterRole !== '') {
            data = data.filter(user => user.role.toLowerCase() === filterRole.toLowerCase());
            // Sembunyikan tombol "Dikelola Pengguna" dan "Semua Data" setelah filter dipilih
            if (managedByUserButton) managedByUserButton.style.display = 'none';
            if (showAllDataButton) showAllDataButton.style.display = 'none';
          }
          // Logika sorting
          if (sortBy === 'role') {
            data.sort((a, b) => a.role.localeCompare(b.role));
          } else if (sortBy === 'username') {
            data.sort((a, b) => a.username.localeCompare(b.username));
          } else if (sortBy === 'nama') {
            data.sort((a, b) => a.nama.localeCompare(b.nama));
          }
        } else {
            console.warn("Data pengguna bukan array:", data);
            data = []; // Set ke array kosong untuk menghindari error
        }

        tableHtml += `
          <h3>Daftar Pengguna</h3>
          <table id="dataTable">
              <thead>
                  <tr>
                      <th>Nama</th>
                      <th>Username</th>
                      <th>Role</th>
                  </tr>
              </thead>
              <tbody>
        `;

        if (data.length === 0) {
            tableHtml += `<tr><td colspan="4" style="text-align: center;">Tidak ada pengguna ditemukan untuk filter ini.</td></tr>`;
        } else {
            data.forEach(user => {
              tableHtml += `
                <tr>
                  <td>${user.nama}</td>
                  <td>${user.username}</td>
                  <td>${user.role}</td>
                </tr>
              `;
            });
        }
        tableHtml += '</tbody></table>';

      } else if (menu === 'barang') {
          if (Array.isArray(data)) {
              // Filter untuk "Dikelola Pengguna" (yaitu barang yang memiliki nama_penyedia)
              if (isManagedByUser) {
                  data = data.filter(barang => barang.nama_penyedia && barang.nama_penyedia !== 'N/A');
                  // Sembunyikan tombol "Dikelola Pengguna" dan "Semua Data"
                  if (managedByUserButton) managedByUserButton.style.display = 'none';
                  if (showAllDataButton) showAllDataButton.style.display = 'none';
              }

              // Sorting for 'barang' by 'deskripsi'
              if (sortBy === 'deskripsi') {
                  data.sort((a, b) => {
                      const descA = (a.deskripsi || '').toLowerCase();
                      const descB = (b.deskripsi || '').toLowerCase();
                      return sortByDirection === 'asc' ? descA.localeCompare(descB) : descB.localeCompare(descA);
                  });
              } else if (sortBy === 'nama_barang') { // Added sort by nama_barang
                  data.sort((a, b) => {
                      const nameA = (a.nama_barang || '').toLowerCase();
                      const nameB = (b.nama_barang || '').toLowerCase();
                      return sortByDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                  });
              }
          } else {
              console.warn("Data barang bukan array:", data);
              data = [];
          }

          tableHtml += `
              <h3>Daftar Barang</h3>
              <table id="dataTable">
                  <thead>
                      <tr>
                          <th>Nama Barang ${isManagedByUser ? '' : `<button onclick="window.parent.loadContent('barang', 'nama_barang', '', this.dataset.direction = (this.dataset.direction === 'asc' ? 'desc' : 'asc'))">&#x2195;</button>`}</th>
                          <th>Penyedia</th>
                          <th>Deskripsi ${isManagedByUser ? '' : `<button onclick="window.parent.loadContent('barang', 'deskripsi', '', this.dataset.direction = (this.dataset.direction === 'asc' ? 'desc' : 'asc'))">&#x2195;</button>`}</th>
                      </tr>
                  </thead>
                  <tbody>
          `;
          if (data.length === 0) {
              tableHtml += `<tr><td colspan="3" style="text-align: center;">${isManagedByUser ? 'Tidak ada barang yang dikelola pengguna.' : 'Tidak ada barang ditemukan.'}</td></tr>`;
          } else {
              data.forEach(barang => {
                  tableHtml += `<tr><td>${barang.nama_barang}</td><td>${barang.nama_penyedia || 'N/A'}</td><td>${barang.deskripsi || 'Tidak ada deskripsi'}</td></tr>`;
              });
          }
          tableHtml += '</tbody></table>';

      } else if (menu === 'laporan') {
          if (Array.isArray(data)) {
              // Sorting for 'laporan' by 'tanggal_mulai'
              if (sortBy === 'tanggal_terbaru') {
                  data.sort((a, b) => new Date(b.tanggal_mulai) - new Date(a.tanggal_mulai));
              } else if (sortBy === 'tanggal_terlama') {
                  data.sort((a, b) => new Date(a.tanggal_mulai) - new Date(b.tanggal_mulai));
              }
          } else {
              console.warn("Data laporan bukan array:", data);
              data = [];
          }

          tableHtml += `
              <h3>Riwayat Peminjaman</h3>
              <table id="dataTable">
                  <thead>
                      <tr>
                          <th>Barang</th>
                          <th>Peminjam</th>
                          <th>Tanggal Mulai ${isManagedByUser ? '' : `<button onclick="window.parent.loadContent('laporan', 'tanggal_terbaru')">Terbaru</button><button onclick="window.parent.loadContent('laporan', 'tanggal_terlama')">Terlama</button>`}</th>
                          <th>Tanggal Selesai</th>
                      </tr>
                  </thead>
                  <tbody>
          `;
          if (data.length === 0) {
              tableHtml += `<tr><td colspan="4" style="text-align: center;">Tidak ada laporan ditemukan.</td></tr>`;
          } else {
              data.forEach(item => {
                  tableHtml += `<tr><td>${item.nama_barang || 'N/A'}</td><td>${item.peminjam || 'N/A'}</td><td>${item.tanggal_mulai || 'N/A'}</td><td>${item.tanggal_selesai || 'N/A'}</td></tr>`;
              });
          }
          tableHtml += '</tbody></table>';
      }

      // Tambahkan tombol ekspor di atas tabel
      htmlContent += `
        <div class="export-buttons">
          <button onclick="window.parent.exportTableToPdf('${menu}')">Ekspor ke PDF</button>
          <button onclick="window.parent.exportTableToExcel('${menu}')">Ekspor ke Excel</button>
        </div>
        ${tableHtml}
      `;

      document.getElementById("contentFrame").srcdoc = htmlContent;
    })
    .catch(err => {
      document.getElementById("contentFrame").srcdoc = `<p style="color:red;">Gagal memuat data: ${err.message}. Pastikan server berjalan dan API tersedia.</p>`;
      console.error("Error fetching data for admin panel:", err);
    });
}


// --- Fungsi Ekspor PDF & Excel (ditambahkan di luar loadContent) ---
// Pastikan script library html2pdf.js dan xlsx.full.min.js dimuat di admin.html
// Untuk PDF
function exportTableToPdf(menuName) {
    const iframe = document.getElementById('contentFrame');
    if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
        alert('Konten iframe belum dimuat sepenuhnya.');
        return;
    }
    const table = iframe.contentWindow.document.getElementById('dataTable');

    if (!table) {
        alert('Tabel data tidak ditemukan di iframe.');
        return;
    }

    const filename = `${menuName}_data_${new Date().toLocaleDateString()}.pdf`;

    // Pastikan html2pdf sudah dimuat di admin.html
    if (typeof html2pdf === 'undefined') {
        alert('html2pdf.js belum dimuat. Pastikan Anda telah menambahkannya di admin.html.');
        return;
    }

 html2pdf().from(table).set({
        margin: [10, 10, 10, 10], // top, left, bottom, right (dalam mm)
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // Meningkatkan resolusi render HTML ke gambar (lebih baik untuk teks & garis)
            logging: true, // Untuk debugging di konsol
            useCORS: true // Penting jika ada gambar dari domain lain
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4', // Ukuran halaman (a4, letter, etc.)
            orientation: 'portrait' // Orientasi (portrait atau landscape)
        },
        pagebreak: { mode: ['css', 'avoid-all', 'always'] } // Kontrol pemisahan halaman
    }).save();
}


// Untuk Excel
function exportTableToExcel(menuName) {
    const iframe = document.getElementById('contentFrame');
    if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
        alert('Konten iframe belum dimuat sepenuhnya.');
        return;
    }
    const table = iframe.contentWindow.document.getElementById('dataTable');

    if (!table) {
        alert('Tabel data tidak ditemukan di iframe.');
        return;
    }

    const filename = `${menuName}_data_${new Date().toLocaleDateString()}.xlsx`;

    // Pastikan SheetJS (XLSX) sudah dimuat di admin.html
    if (typeof XLSX === 'undefined') {
        alert('SheetJS (xlsx.full.min.js) belum dimuat. Pastikan Anda telah menambahkannya di admin.html.');
        return;
    }

    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
}

// Fungsi logout
function logout() {
    localStorage.clear(); // Hapus semua item dari local storage
    window.location.href = 'login.html'; // Redirect ke halaman login
}