//----------------------------ini peminjam.js-----------------------------
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

  const jam = new Date().getHours();
  const sapaan = jam < 12 ? "Selamat Pagi" : (jam < 18 ? "Selamat Siang" : "Selamat Malam");

  document.getElementById("greeting").innerText = `${sapaan}, ${username}`;
  document.getElementById("usernameDisplay").innerHTML = `Halo, <strong>${username}</strong>`;

  // Panggil loadAllBarang() saat halaman dimuat
  loadAllBarang();
}

// Fungsi untuk filterDeskripsi
function filterDeskripsi(keyword) {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  if (!Array.isArray(items)) {
      console.error("Data items dari localStorage bukan array untuk filterDeskripsi:", items);
      alert("Terjadi kesalahan memuat data barang. Coba refresh halaman.");
      return;
  }
  const hasil = items.filter(item =>
    item.deskripsi.toLowerCase().includes(keyword.toLowerCase())
  );
  renderBarang(hasil);

  // Catatan: Bagian HTML ini di fungsi filterDeskripsi akan menimpa renderBarang
  // Sebaiknya hanya panggil renderBarang(hasil) dan biarkan renderBarang membangun HTML sepenuhnya
  // atau hapus baris berikut jika renderBarang sudah cukup.
  // Jika ini diperlukan, pastikan juga ada harga dan tombol "Pinjam Sekarang" yang sesuai
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
              <p>Harga: <strong>Rp. ${item.harga ? item.harga.toLocaleString('id-ID') : 'N/A'}</strong></p>
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

// Fungsi untuk tampilkanKategori (tetap sama)
function tampilkanKategori(kategori) {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  if (!Array.isArray(items)) {
      console.error("Data items dari localStorage bukan array untuk tampilkanKategori:", items);
      alert("Terjadi kesalahan memuat data barang. Coba refresh halaman.");
      return;
  }
  const hasil = items.filter(item => item.kategori === kategori);
  renderBarang(hasil);
}

// Logout: hapus data lokal dan arahkan ke halaman login
function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = "login.html";
}


// Fungsi pinjamBarang yang DIMODIFIKASI untuk menampilkan No. Telepon di Invoice
async function pinjamBarang(id) {
  const username = localStorage.getItem("username");
  const tanggal_mulai_input = document.getElementById(`start-${id}`);
  const tanggal_selesai_input = document.getElementById(`end-${id}`);

  const tanggal_mulai = tanggal_mulai_input ? tanggal_mulai_input.value : '';
  const tanggal_selesai = tanggal_selesai_input ? tanggal_selesai_input.value : '';

  // Validasi Tanggal di sisi klien
  if (!tanggal_mulai || !tanggal_selesai) {
    alert("Tanggal mulai dan tanggal selesai harus diisi!");
    return;
  }

  const tglMulai = new Date(tanggal_mulai);
  const tglSelesai = new Date(tanggal_selesai);

  if (tglSelesai <= tglMulai) {
    alert("Tanggal selesai harus lebih besar dari tanggal mulai!");
    return;
  }

  const durasiHari = Math.ceil((tglSelesai - tglMulai) / (1000 * 60 * 60 * 24));

  // Ambil data barang dari localStorage untuk mendapatkan harga, penyedia_id, dan NO. TELEPON PENYEDIA
  const items = JSON.parse(localStorage.getItem("items")) || [];
  const barang = items.find(b => b.id === id);

  if (!barang) {
    alert("Detail barang tidak ditemukan. Silakan refresh halaman.");
    return;
  }

  const hargaPerHari = barang.harga;
  if (hargaPerHari === undefined || hargaPerHari === null) {
      alert("Harga barang tidak tersedia. Peminjaman dibatalkan.");
      return;
  }
  const totalHarga = durasiHari * hargaPerHari;

  try {
    const res = await fetch('/api/pinjam', { // Asumsi endpoint ini menerima total_harga dan barang_id
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          user: username,
          barang_id: id,
          tanggal_mulai,
          tanggal_selesai,
          total_harga: totalHarga // Kirim total harga ke backend
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Peminjaman berhasil!');

      // Ambil data barang dari localStorage (ulang, untuk stok terbaru)
      let currentItems = JSON.parse(localStorage.getItem("items")) || [];
      if (!Array.isArray(currentItems)) { currentItems = []; }

      // Kurangi stok barang di localStorage (jika backend berhasil mengurangi stok)
      currentItems = currentItems.map(item => {
        if (item.id === id && item.jumlah > 0) {
          item.jumlah -= 1;
        }
        return item;
      });
      localStorage.setItem("items", JSON.stringify(currentItems));
      renderBarang(currentItems); // Tampilkan ulang daftar barang

      // Tampilkan invoice dengan nomor telepon penyedia
      const barangUntukInvoice = currentItems.find(b => b.id === id);
      const htmlInvoice = `
        <table style="width:100%; font-size:16px;">
          <tr><td><strong>Nama Barang</strong></td><td>: ${barangUntukInvoice.nama_barang}</td></tr>
          <tr><td><strong>Penyedia</strong></td><td>: ${barangUntukInvoice.nama_penyedia || 'N/A'}</td></tr>
          <tr><td><strong>Nomor Telepon Penyedia</strong></td><td>: <strong>${barangUntukInvoice.no_telepon_penyedia || 'Tidak Tersedia'}</strong></td></tr> <tr><td><strong>Peminjam</strong></td><td>: ${username}</td></tr>
          <tr><td><strong>Tanggal Mulai</strong></td><td>: ${tanggal_mulai}</td></tr>
          <tr><td><strong>Tanggal Selesai</strong></td><td>: ${tanggal_selesai}</td></tr>
          <tr><td><strong>Durasi</strong></td><td>: ${durasiHari} hari</td></tr>
          <tr><td><strong>Harga per Hari</strong></td><td>: Rp. ${barangUntukInvoice.harga ? barangUntukInvoice.harga.toLocaleString('id-ID') : 'N/A'}</td></tr>
          <tr><td><strong>Total Harga</strong></td><td>: <strong>Rp. ${totalHarga.toLocaleString('id-ID')}</strong></td></tr>
          <tr><td colspan="2"><br/></td></tr>
          <tr><td colspan="2">Silakan hubungi penyedia di nomor di atas untuk pembayaran via E-wallet.</td></tr> </table>
      `;
      document.getElementById("invoiceBody").innerHTML = htmlInvoice;
      document.getElementById("invoiceModal").style.display = "block";

      // Tidak ada pemanggilan modal pembayaran terpisah lagi di sini

    } else {
      alert(data.message || 'Peminjaman gagal');
    }
  } catch (err) {
    console.error("Error saat peminjaman:", err);
    alert('Terjadi kesalahan saat memproses peminjaman.');
  }
}

async function kembalikanBarang(buttonElement) {
  const id_barang = buttonElement.getAttribute('data-barang_id');
  const pinjaman_id = buttonElement.getAttribute('data-pinjaman_id');
  const username = localStorage.getItem('username');

  try {
    const res = await fetch('/api/pinjam/kembalikan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_barang, pinjaman_id, username })
    });

    const data = await res.json();
    alert(data.message || "Barang berhasil dikembalikan.");
    tampilkanBarangDipinjam();
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
        console.error("Data pinjaman dari server bukan array untuk tampilkanBarangDipinjam:", data);
        alert('Gagal memuat data pinjaman. Format data tidak sesuai.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Terjadi kesalahan saat memuat data pinjaman.');
    });
}


function renderBarang(items, mode = 'semua') {
  if (!Array.isArray(items)) {
    console.error("renderBarang menerima non-array:", items);
    document.getElementById("barangContainer").innerHTML = '<p style="padding:20px;">Gagal menampilkan barang. Data tidak valid.</p>';
    return;
  }

  const username = localStorage.getItem("username");

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
            <p>Harga: <strong>Rp. ${item.harga ? item.harga.toLocaleString('id-ID') : 'N/A'}</strong></p>
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

// FUNGSI INI TIDAK DIGUNAKAN LAGI UNTUK ALUR PEMBAYARAN UTAMA
/*
function showPaymentModal(paymentDetail) {
    document.getElementById('paymentItemName').innerText = paymentDetail.barang_nama;
    document.getElementById('paymentItemPrice').innerText = `Rp. ${paymentDetail.total_harga.toLocaleString('id-ID')}`;
    document.getElementById('paymentProviderName').innerText = paymentDetail.nama_penyedia;
    document.getElementById('paymentProviderPhone').innerText = paymentDetail.no_telepon_penyedia || 'Nomor tidak tersedia';

    document.getElementById('paymentModal').style.display = 'flex';
    document.getElementById('barangContainer').style.filter = 'blur(5px)';
    document.getElementById('invoiceModal').style.display = 'none';
}
*/

// FUNGSI INI TIDAK DIGUNAKAN LAGI UNTUK ALUR PEMBAYARAN UTAMA
/*
function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
  document.getElementById('barangContainer').style.filter = 'none';
}
*/

// Fungsi tutupInvoice (tidak perlu ada perubahan karena tidak ada modal pembayaran terpisah)
function tutupInvoice() {
  document.getElementById("invoiceModal").style.display = "none";
  // Tidak ada pemanggilan fungsi pembayaran di sini lagi
}

// Fungsi untuk memuat semua barang saat halaman dimuat
async function loadAllBarang() {
  try {
    const res = await fetch(`http://localhost:3000/api/barang`); // Mengambil semua barang dari rute /api/barang
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Gagal mengambil semua data barang dari server: " + errorText);
    }

    const data = await res.json();

    if (Array.isArray(data)) {
        localStorage.setItem("items", JSON.stringify(data));
        renderBarang(data);
    } else {
        console.error("Data barang dari server bukan array:", data);
        alert("Format data barang dari server tidak valid.");
        document.getElementById("barangContainer").innerHTML = '<p style="padding:20px;">Gagal memuat barang. Data tidak valid.</p>';
    }

  } catch (err) {
    console.error('Error fetching initial barang data:', err);
    alert('Gagal memuat data barang awal: ' + err.message);
    document.getElementById("barangContainer").innerHTML = '<p style="padding:20px;">Gagal memuat barang. Silakan cek koneksi server.</p>';
  }
}

// Navigasi kembali ke halaman utama
function kembaliKeBeranda() {
  window.location.href = "index.html";
}