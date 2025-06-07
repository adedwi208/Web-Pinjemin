// main.js (sudah diperbaiki dan modular)

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

        const result = await response.json();  // <-- wajib parsing JSON dulu

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

// main.js (lanjutan, tambahkan di luar fungsi loadContent)

// ... (kode yang sudah ada) ...

function editPengguna(id, nama, username, role) {
    alert(`Edit Pengguna: ID ${id}, Nama: ${nama}, Username: ${username}, Role: ${role}`);
    // Implementasikan logika edit Anda di sini.
    // Ini bisa melibatkan pembukaan modal, mengisi formulir, dll.
}

function hapusPengguna(id) {
    if (confirm(`Anda yakin ingin menghapus pengguna dengan ID: ${id}?`)) {
        alert(`Hapus Pengguna: ID ${id}`);
        // Implementasikan logika hapus Anda di sini.
        // Ini biasanya melibatkan pemanggilan API untuk menghapus pengguna.
        // Setelah penghapusan, Anda mungkin ingin menyegarkan daftar pengguna:
        // loadContent('pengguna');
    }
}

// ... (sisa kode Anda yang sudah ada) ...

function loadContent(menu) {
  let url = '';
  if (menu === 'pengguna') url = '/api/admin/pengguna';
  else if (menu === 'barang') url = '/api/admin/barang';
  else if (menu === 'laporan') url = '/api/admin/laporan';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let html = '<style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}</style>';
      
      if (menu === 'pengguna') {
  html += `
    <h3>Daftar Pengguna</h3>
    <style>
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      button {
        padding: 5px 10px;
        margin-right: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
      }
      button.edit-btn { background-color: #4CAF50; color: white; }
      button.edit-btn:hover { background-color: #45a049; }
      button.delete-btn { background-color: #f44336; color: white; }
      button.delete-btn:hover { background-color: #da190b; }
    </style>
    <table>
      <tr><th>Nama</th><th>Username</th><th>Role</th><th>Aksi</th></tr>
  `;

  data.forEach(user => {
    html += `
      <tr>
        <td>${user.nama}</td>
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td>
          <button class="edit-btn" onclick="window.parent.editPengguna(${user.id}, '${user.nama}', '${user.username}', '${user.role}')">Edit</button>
          <button class="delete-btn" onclick="window.parent.hapusPengguna(${user.id})">Hapus</button>
        </td>
      </tr>
    `;
        });
      } else if (menu === 'barang') {
        html += '<h3>Daftar Barang</h3><table><tr><th>Nama Barang</th><th>Penyedia</th><th>Deskripsi</th></tr>';
        data.forEach(barang => {
          html += `<tr><td>${barang.nama_barang}</td><td>${barang.nama_penyedia}</td><td>${barang.deskripsi}</td></tr>`;
        });
      } else if (menu === 'laporan') {
        html += '<h3>Riwayat Peminjaman</h3><table><tr><th>Barang</th><th>Peminjam</th><th>Tanggal Mulai</th><th>Tanggal Selesai</th></tr>';
        data.forEach(item => {
          html += `<tr><td>${item.nama_barang}</td><td>${item.peminjam}</td><td>${item.tanggal_mulai}</td><td>${item.tanggal_selesai}</td></tr>`;
        });
      }

      html += '</table>';
      document.getElementById("contentFrame").srcdoc = html;
    })
    .catch(err => {
      document.getElementById("contentFrame").srcdoc = `<p style="color:red;">Gagal memuat data: ${err.message}</p>`;
    });
}
