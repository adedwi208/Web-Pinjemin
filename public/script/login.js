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

        const result = await response.json();

        if (response.ok) {
          alert(`Login berhasil sebagai ${result.role}`);

          localStorage.setItem("token", result.token);
          localStorage.setItem("username", result.username);
          localStorage.setItem("role", result.role);
          localStorage.setItem("user_id", result.users_id);

          if (result.role === "peminjam") {
            window.location.href = "peminjam.html";
          } else if (result.role === "penyedia") {
            window.location.href = "penyedia.html";
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