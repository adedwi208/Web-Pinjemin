//----------------------------ini peminjam.html-----------------------------
// Inisialisasi halaman saat dimuat
function initPage() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  // Redirect jika belum login sebagai peminjam
  if (!username || role !== "peminjam") {
    alert("Anda harus login sebagai peminjam.");
    window.location.href = "login.html";
    return;
  }

  // (Opsional) Terapkan mode tampilan tersimpan, misal dark mode
//   applySavedMode?.();

  // Sapaan berdasarkan jam
  const jam = new Date().getHours();
  const sapaan = jam < 12 ? "Selamat Pagi" : (jam < 18 ? "Selamat Siang" : "Selamat Malam");

  // Tampilkan sapaan & nama user
  document.getElementById("greeting").innerText = `${sapaan}, ${username}`;

  document.getElementById("usernameDisplay").innerHTML = `Halo, <strong>${username}</strong>`;
}

// Tampilkan daftar barang berdasarkan kategori (perkakas / elektronik)
function tampilkanKategori(kategori) {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  const hasil = items.filter(item => item.kategori === kategori);
  renderBarang(hasil);

  // Gambar default dari Unsplash
  const getImageUrl = (name) => 
  `https://source.unsplash.com/250x180/?${encodeURIComponent(name.replace(/\s+/g, '-'))}`;


  // Bangun HTML untuk daftar barang
  // Bangun HTML untuk daftar barang
  const html = `
  <div class="items-container">
    ${
      hasil.length
        ? hasil.map(item => `
            <div class="item-card">
              <img src="${getImageUrl(item.nama_barang)}" alt="${item.nama_barang}">
              <h3>${item.nama_barang}</h3>
              <p>${item.deskripsi}</p>
              <p>Disediakan oleh: <strong>${item.nama_penyedia || 'Tidak diketahui'}</strong></p>
              <button class="item-button" onclick="alert('Pinjam ${item.nama_barang}')">Pinjam Sekarang</button>
            </div>
          `).join('')
        : '<p style="padding:20px;">Tidak ada barang.</p>'
    }
  </div>
`;
  document.getElementById("barangContainer").innerHTML = html;
}


function filterDeskripsi(keyword) {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  const hasil = items.filter(item =>
    item.deskripsi.toLowerCase().includes(keyword.toLowerCase())
  );
  renderBarang(hasil);

  const html = `
  <div class="items-container">
    ${
      hasil.length
        ? hasil.map(item => `
            <div class="item-card">
              <img src="${item.foto ? '/uploads/' + item.foto : 'https://via.placeholder.com/150'}" alt="${item.nama_barang}">
              <h3>${item.nama_barang}</h3>
              <p>${item.deskripsi}</p>
              <p>Disediakan oleh: <strong>${item.nama_penyedia}</strong></p>
              <label>Tanggal Mulai: <input type="date" id="start-${item.id}"></label>
              <label>Tanggal Selesai: <input type="date" id="end-${item.id}"></label>
              ${item.jumlah > 0
              ? `<button class="item-button" onclick="pinjamBarang(${item.id})">Pinjam Sekarang</button>`
              : `<button class="item-button" disabled>Tidak Tersedia</button>`}
            </div>
          `).join('')
        : '<p style="padding:20px;">Tidak ada barang yang cocok.</p>'
    }
  </div>
  `;
  document.getElementById("barangContainer").innerHTML = html;
}


// Logout: hapus data lokal dan arahkan ke halaman login
function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = "login.html";
  }
  // redirect sesuai role

  


// Simulasi data barang awal (bisa diambil dari server nantinya)
document.addEventListener("DOMContentLoaded", () => {
  fetch('/api/barang')
    .then(res => res.json())
    .then(data => {
      // Simpan data ke localStorage untuk digunakan saat tombol diklik
      localStorage.setItem("items", JSON.stringify(data));
      renderBarang(data);

      // Jangan tampilkan apapun dulu — tunggu tombol diklik
      document.getElementById("barangContainer").innerHTML = '';
    });
});



function pinjamBarang(id) {
  const username = localStorage.getItem("username");
  const tanggal_mulai = document.getElementById(`start-${id}`).value;
  const tanggal_selesai = document.getElementById(`end-${id}`).value;

  // Validasi Tanggal di sisi klien
  if (!tanggal_mulai || !tanggal_selesai) {
    alert("Tanggal mulai dan tanggal selesai harus diisi!");
    return; // Menghentikan eksekusi jika tanggal kosong
  }

  // Mengubah operator '<' menjadi '<=' untuk memastikan tanggal selesai harus LEBIH BESAR
  // Jika tanggal selesai sama dengan atau lebih kecil dari tanggal mulai, maka tidak valid.
  if (new Date(tanggal_selesai) <= new Date(tanggal_mulai)) {
    alert("Tanggal selesai harus lebih besar dari tanggal mulai!");
    return; // Menghentikan eksekusi fungsi jika validasi gagal
  }

  fetch('/api/pinjam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: username, barang_id: id, tanggal_mulai, tanggal_selesai })
  })
  
  
  .then(res => res.json()) // parsing response JSON dulu
  .then(data => {
    if (data.message === 'Peminjaman berhasil!') {
      // Ambil data barang dari localStorage
      let items = JSON.parse(localStorage.getItem("items")) || [];

      // Kurangi stok barang di localStorage
      items = items.map(item => {
        if (item.id === id && item.jumlah > 0) {
          item.jumlah -= 1;
        }
        return item;
      });

      localStorage.setItem("items", JSON.stringify(items));

      // Tampilkan ulang daftar barang
      renderBarang(items);

      // Tampilkan invoice
      const barang = items.find(b => b.id === id);
      const html = `
        <table style="width:100%; font-size:16px;">
          <tr><td><strong>Nama Barang</strong></td><td>: ${barang.nama_barang}</td></tr>
          <tr><td><strong>Penyedia</strong></td><td>: ${barang.nama_penyedia}</td></tr>
          <tr><td><strong>Peminjam</strong></td><td>: ${username}</td></tr>
          <tr><td><strong>Tanggal Mulai</strong></td><td>: ${tanggal_mulai}</td></tr>
          <tr><td><strong>Tanggal Selesai</strong></td><td>: ${tanggal_selesai}</td></tr>
        </table>
      `;
      document.getElementById("invoiceBody").innerHTML = html;
      document.getElementById("invoiceModal").style.display = "block";

    } else {
      alert(data.message || 'Peminjaman gagal');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Terjadi kesalahan.');
  });
}

async function kembalikanBarang(buttonElement) {
  const id_barang = buttonElement.getAttribute('data-barang_id');
  const pinjaman_id = buttonElement.getAttribute('data-pinjaman_id');
  const username = localStorage.getItem('username'); // ambil dari localStorage/login

  try {
    const res = await fetch('/api/pinjam/kembalikan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_barang, pinjaman_id, username })
    });

    /* if (!res.ok) {
      alert("Gagal mengembalikan barang.");
      return;
    } */

    const data = await res.json();
    alert(data.message || "Barang berhasil dikembalikan.");
    // initPage(); // refresh daftar barang
    tampilkanBarangDipinjam()
  } catch (error) {
    console.error('Error:', error);
    alert("Terjadi kesalahan saat mengembalikan barang.");
  }
}

function tampilkanBarangDipinjam() {
  const username = localStorage.getItem('username');
  

  fetch(`/api/pinjam/user/${username}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        renderBarang(data, 'dipinjam');
      } else {
        alert('Gagal memuat data pinjaman.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Terjadi kesalahan saat memuat data pinjaman.');
    });
}




function renderBarang(items, mode = 'semua') {
  const username = localStorage.getItem("username");

  // CSS styling untuk kartu barang, cukup sekali saja, jadi pindahkan di luar fungsi kalau mau optimasi
  const html = `
    <div class="items-container">
      ${items.map(item => {
        const sedangDipinjamOlehUser = item.status === 'dipinjam' && item.peminjam_username === username;

        return `
          <div class="item-card">
            <img src="${item.foto ? '/uploads/' + item.foto : 'https://via.placeholder.com/250x180?text=No+Image'}">
            <h3>${item.nama_barang}</h3>
            <p>${item.deskripsi}</p>
            <p>Disediakan oleh: <strong>${item.nama_penyedia || 'Tidak diketahui'}</strong></p>
            ${mode === 'dipinjam' && sedangDipinjamOlehUser
              ? `<button class="item-button" onclick="kembalikanBarang(this)" data-barang_id="${item.barang_id}" data-pinjaman_id="${item.pinjaman_id}">Kembalikan</button>`
              : `
                <label>Tanggal Mulai: <input type="date" id="start-${item.id}"></label>
                <label>Tanggal Selesai: <input type="date" id="end-${item.id}"></label>
                ${item.jumlah > 0
                  ? `<button class="item-button" onclick="pinjamBarang(${item.id})">Pinjam Sekarang</button>`
                  : `<button class="item-button" disabled>Tidak Tersedia</button>`} 
              `}
          </div>
        `;
      }).join('')}
    </div>
  `;

  document.getElementById("barangContainer").innerHTML = html;
}




function tutupInvoice() {
  document.getElementById("invoiceModal").style.display = "none";
}




// Navigasi kembali ke halaman utama
function kembaliKeBeranda() {
  window.location.href = "index.html";
}
//ini peminjam.html