window.loadData = async function () {
  const name = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");

  if (!name || role !== "penyedia" || !userId) {
    alert("Anda harus login sebagai penyedia.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("usernameDisplay").innerHTML = `Halo, <strong>${name}</strong>`;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";
  document.getElementById("greeting").innerText = `${greet}, ${name}`;

  await tampilkanBarang();
};

window.tampilkanBarang = async function () {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  try {
    const res = await fetch(`http://localhost:3000/api/barang/penyedia/${userId}`);
    if (!res.ok) throw new Error("Gagal ambil data barang");

    const items = await res.json();

    const htmlContent = items.length
      ? `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .items {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
            }
            .item {
              width: 220px;
              padding: 10px;
              background: #f9f9f9;
              border: 1px solid #ccc;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              text-align: center;
            }
            .item img {
              max-width: 150px;
              max-height: 150px;
              object-fit: cover;
              border-radius: 8px;
            }
            .item h3 {
              font-size: 16px;
              margin: 10px 0 5px;
            }
            .item p {
              font-size: 14px;
              margin: 0 0 5px;
            }
            .qty, .price-display { /* Tetap ada untuk menampilkan harga */
              font-size: 13px;
              color: #666;
            }
            .stok-input { /* Hanya stok-input, price-input dihapus */
              width: 60px;
              padding: 4px;
              margin-top: 6px;
            }
            .update-btn {
              margin-top: 6px;
              padding: 4px 8px;
              font-size: 12px;
              cursor: pointer;
            }
          </style>
          <script>
            function updateStok(id) {
              const jumlah = parseInt(document.getElementById('stok-' + id).value);
              if (isNaN(jumlah) || jumlah < 0) {
                alert('Jumlah stok tidak valid');
                return;
              }

              fetch('http://localhost:3000/api/barang/update-stok/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jumlah })
              })
                .then(res => res.json())
                .then(data => {
                  alert(data.message);
                  location.reload(); // reload iframe setelah update
                })
                .catch(err => {
                  console.error(err);
                  alert('Gagal memperbarui stok');
                });
            }
            // --- FUNGSI updateHarga DIHAPUS DARI SINI ---
          </script>
        </head>
        <body>
          <div class="items">
            ${items.map(i => `
              <div class="item">
                <img src="http://localhost:3000/uploads/${i.foto}" alt="${i.nama_barang}" />
                <h3>${i.nama_barang}</h3>
                <p>${i.deskripsi}</p>
                <div class="qty">Jumlah: ${i.jumlah}</div>
                <input type="number" id="stok-${i.id}" class="stok-input" value="${i.jumlah}" min="0" />
                <button class="update-btn" onclick="updateStok(${i.id})">Update Stok</button>

                <div class="price-display">Harga: Rp. ${i.harga ? i.harga.toLocaleString('id-ID') : 'N/A'}</div>
              </div>
            `).join("")}
          </div>
        </body>
        </html>
      `
      : '<p style="padding: 20px;">Belum ada barang ditambahkan.</p>';

    document.getElementById("frameBarang").srcdoc = htmlContent;

  } catch (err) {
    console.error("Error ambil barang:", err);
    alert("Gagal mengambil data barang dari server.");
  }
};

window.tambahBarang = async function () {
  const name = document.getElementById("itemName").value.trim();
  const desc = document.getElementById("itemDesc").value.trim();
  const qty = document.getElementById("itemQty").value.trim();
  const price = document.getElementById("itemPrice").value.trim(); // Tetap ambil harga dari input
  const imageInput = document.getElementById("itemImage");

  if (!name || !desc || !qty || !price || imageInput.files.length === 0) { // Validasi harga tetap ada
    alert("Semua kolom termasuk foto dan harga harus diisi.");
    return;
  }

  const penyedia_id = localStorage.getItem("user_id");
  if (!penyedia_id) {
    alert("ID penyedia tidak ditemukan. Silakan login ulang.");
    return;
  }

  const formData = new FormData();
  formData.append("nama_barang", name);
  formData.append("deskripsi", desc);
  formData.append("jumlah", qty);
  formData.append("harga", price); // Tetap tambahkan harga ke form data
  formData.append("penyedia_id", penyedia_id);
  formData.append("foto", imageInput.files[0]);

  try {
    const res = await fetch("http://localhost:3000/api/barang/penyedia", {
      method: "POST",
      body: formData
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const htmlText = await res.text();
      throw new Error("Respons bukan JSON:\n" + htmlText);
    }

    const result = await res.json();

    if (res.ok) {
      alert("Barang berhasil ditambahkan!");
      document.getElementById("itemName").value = "";
      document.getElementById("itemDesc").value = "";
      document.getElementById("itemQty").value = "";
      document.getElementById("itemPrice").value = ""; // Bersihkan input harga
      document.getElementById("itemImage").value = "";
      await tampilkanBarang();
    } else {
      alert("Gagal menambahkan barang: " + result.message);
    }
  } catch (err) {
    console.error("Tambah barang error:", err);
    alert("Gagal menambahkan barang: " + err.message);
  }
};

function lihatPinjaman() {
  const penyediaId = localStorage.getItem("user_id");
  if (!penyediaId) {
    alert("ID penyedia tidak ditemukan.");
    return;
  }

  fetch(`/api/penyedia/pinjaman/${penyediaId}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("barangContainer");
      if (!container) {
        alert("Kontainer tampilan tidak ditemukan di HTML.");
        return;
      }

      if (!data.length) {
        container.innerHTML = "<p>Belum ada barang yang sedang dipinjam.</p>";
        return;
      }

      const html = `
        <h3>Barang yang Dipinjam</h3>
        <table border="1" cellspacing="0" cellpadding="6">
          <tr>
            <th>Nama Barang</th>
            <th>Dipinjam oleh</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
          </tr>
          ${data.map(item => `
            <tr>
              <td>${item.nama_barang}</td>
              <td>${item.peminjam}</td>
              <td>${item.tanggal_mulai}</td>
              <td>${item.tanggal_selesai}</td>
            </tr>
          `).join('')}
        </table>
      `;

      container.innerHTML = html;
    })
    .catch(err => {
      console.error("Gagal mengambil data pinjaman:", err);
      alert("Terjadi kesalahan saat mengambil data pinjaman.");
    });
}

window.logout = function () {
  localStorage.clear();
  window.location.href = "login.html";
};

window.kembaliKeBeranda = function () {
  window.location.href = "index.html";
};