<p align="center">
  <img width="96" height="96" alt="Logo Offly" src="public/logo-512.png" />
</p>

<h1 align="center">Offly — Sistem Manajemen Cuti Karyawan</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/JavaScript-JSX-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/PostgreSQL-Raw%20SQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<h3 align="center">
Satu pintu pengajuan, saldo, dan persetujuan cuti tim tanpa rekap manual.
</h3>

<p align="center">
  <a href="#-fitur">📋 Fitur</a> ·
  <a href="#-instalasi">🚀 Instalasi</a> ·
  <a href="#-dokumentasi">📚 Dokumentasi</a> ·
  <a href="#-kontribusi">🤝 Kontribusi</a>
</p>

---

## 📋 Daftar Isi

- [🎯 Tentang Proyek](#-tentang-proyek)
- [🖼️ Tampilan](#-tampilan)
- [✨ Fitur](#-fitur)
- [🧰 Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [💻 Persyaratan Sistem](#-persyaratan-sistem)
- [🚀 Instalasi](#-instalasi)
- [🔧 Konfigurasi](#-konfigurasi)
- [🔐 Akun Demo](#-akun-demo)
- [📁 Struktur Proyek](#-struktur-proyek)
- [📚 Dokumentasi](#-dokumentasi)
- [🧪 Pengujian](#-pengujian)
- [🆘 Masalah Umum](#-masalah-umum)
- [🤝 Kontribusi](#-kontribusi)
- [👤 Kontak](#-kontak)

---

## 🎯 Tentang Proyek

**Offly** adalah platform manajemen cuti karyawan berbasis web yang mendigitalisasi proses pengajuan, verifikasi berjenjang, dan persetujuan akhir HRD. Seluruh aturan bisnis—mulai dari perhitungan hari kerja efektif, pengecekan periode larangan cuti, kapasitas divisi, pengembalian kuota otomatis, hingga penerbitan Surat Cuti PDF—dijalankan langsung di server dan transaksi PostgreSQL.

Sistem ini melayani empat peran utama (**Karyawan**, **Ketua Divisi**, **HRD**, dan **Admin**) dengan otorisasi yang selalu diverifikasi di sisi server.

### 🎯 Tujuan
- 📅 Menghilangkan rekap cuti manual dengan perhitungan hari kerja dan kuota otomatis
- 🛡️ Menjaga alur persetujuan berjenjang (`Karyawan → Ketua Divisi → HRD` dan `Ketua Divisi → HRD`)
- 👥 Memastikan tugas tetap berjalan lewat mekanisme rekan pengganti dan batas kapasitas divisi
- 📄 Menerbitkan surat izin cuti resmi berformat PDF secara otomatis setelah disetujui HRD

### ⭐ Nilai Inti
- ✅ **Satu Design System** — Warna OKLCH, tipografi, radius, dan bayangan dikelola terpusat di [globals.css](src/app/globals.css) ([DESIGN_WARNA.md](DESIGN_WARNA.md))
- ✅ **Otorisasi di Server** — Setiap Server Action dan Route Handler memverifikasi sesi JWT HTTP-Only serta peran pengguna di PostgreSQL
- ✅ **Transaksi Aman** — Pengajuan, pembatalan, dan persetujuan memakai transaksi `BEGIN/COMMIT` dengan penguncian baris `FOR UPDATE`
- ✅ **Lampiran Privat** — Berkas lampiran divalidasi sebagai PDF (`%PDF-`, maks. 5 MB), disimpan di `storage/lampiran/`, dan diakses lewat `/api/lampiran/[nama]` setelah cek autentikasi
- ✅ **Notifikasi Terarah** — Setiap notifikasi pengajuan cuti langsung membuka detail surat terkait (`?detail=<id>`)

---

## 🖼️ Tampilan

### Beranda
<img alt="Halaman Beranda Offly" src="docs/screenshots/beranda.png" />

---

### Masuk
<img alt="Halaman Masuk Offly" src="docs/screenshots/masuk.png" />

---

### Dasbor Karyawan
<img alt="Dasbor Karyawan Offly" src="docs/screenshots/dasbor_karyawan.png" />

---

### Pengajuan Cuti
<img alt="Halaman Pengajuan Cuti Offly" src="docs/screenshots/pengajuan_cuti.png" />

---

### Riwayat Cuti
<img alt="Halaman Riwayat Cuti Offly" src="docs/screenshots/riwayat_cuti.png" />

---

### Verifikasi Cuti (Ketua Divisi)
<img alt="Halaman Verifikasi Cuti Ketua Divisi" src="docs/screenshots/verifikasi_cuti.png" />

---

### Persetujuan Akhir (HRD)
<img alt="Halaman Persetujuan Akhir HRD" src="docs/screenshots/persetujuan_hrd.png" />

---

## ✨ Fitur

### 👤 Karyawan
- 📝 **Pengajuan Cuti & Simulasi Kuota** — Hitung hari kerja otomatis (mengecualikan akhir pekan, libur nasional, dan cuti bersama), mendukung cuti setengah hari (`0.5`), dan jenis **Cuti Lainnya** kustom
- 🔔 **Wajib Ketua Divisi Aktif** — Jika belum ditempatkan di divisi berketua aktif, tersedia tombol 1-klik untuk mengirim notifikasi penempatan ke Admin
- 🔁 **Ajukan Ulang & Batalkan** — Pengajuan `Pending` dapat dibatalkan dengan pengembalian kuota otomatis; pengajuan ditolak bisa langsung diajukan ulang dengan data terisi otomatis
- 📄 **Surat Cuti PDF** — Unduh surat resmi setelah status **Disetujui HRD**

### 🧑‍💼 Ketua Divisi
- ✅ **Verifikasi Cuti** — Tinjau antrean pengajuan anggota divisi lengkap dengan alasan, rekan pengganti, catatan tugas, dan lampiran PDF, lalu **Setujui** atau **Tolak** (catatan wajib)
- 📆 **Pengajuan Pribadi** — Pengajuan cuti Ketua Divisi langsung diteruskan ke antrean HRD

### 🏢 HRD
- 🏛️ **Persetujuan Akhir (Satuan & Massal)** — Proses pengajuan yang lolos verifikasi ketua maupun pengajuan langsung Ketua Divisi dengan peringatan otomatis bila melampaui batas kapasitas divisi
- 🗓️ **Kalender, Larangan Cuti & Kapasitas** — Kelola hari libur nasional, cuti bersama, periode larangan cuti, dan persentase batas kapasitas per divisi
- ⏰ **Pengingat Kuota Hangus** — Pantau karyawan yang jarang mengambil cuti menjelang akhir tahun dan kirim notifikasi pengingat

### 🛠️ Admin
- 👥 **Manajemen Pengguna & Divisi** — CRUD pengguna, atur ulang kuota tahunan, kelola divisi beserta anggota dan Ketua Divisi
- 📑 **Manajemen Jenis Cuti** — Konfigurasi dinamis kuota default, batas hari pengajuan, syarat lampiran PDF, dan aturan pemotongan kuota tahunan

### 🎨 Profil & Umum
- 🖼️ **Ganti Avatar Sekali Klik** — Klik avatar pada halaman profil untuk memilih gambar (`JPG`, `PNG`, `WEBP`, maks. 1 MB) yang langsung tersimpan
- 🔒 **Keamanan Kata Sandi** — Mengganti kata sandi mewajibkan verifikasi kata sandi lama dan konfirmasi kata sandi baru
- 🌓 **Mode Terang & Gelap** — Pengalih tema dengan penyimpanan preferensi lokal

---

## 🧰 Teknologi yang Digunakan

| Lapisan | Teknologi |
| :--- | :--- |
| **Framework & UI** | Next.js `16.4.6` (App Router), React `19.3`, Tailwind CSS `v4`, `@base-ui/react`, `lucide-react` |
| **Backend** | Next.js Server Actions (`src/actions/*.js`) & Route Handlers (`src/app/api/*/route.js`) |
| **Database** | PostgreSQL dengan kueri Raw SQL (`pg`) |
| **Autentikasi & PDF** | `jose` (JWT cookie `httpOnly`), `bcryptjs`, `pdf-lib` |

---

## 💻 Persyaratan Sistem

- **Node.js** v20+ dan **npm**
- **PostgreSQL** v14+
- **pgAdmin 4** (atau `psql`) untuk menjalankan skrip SQL awal

---

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/Raflykunn/offly-manajemen-cuti-karyawan.git
   cd offly-manajemen-cuti-karyawan
   ```

2. **Siapkan database PostgreSQL**
   - Buat database baru bernama `offly_db` di **pgAdmin 4**.
   - Buka **Query Tool** pada `offly_db`, lalu jalankan seluruh isi berkas [database/offly_database.sql](database/offly_database.sql).

3. **Pasang dependensi**
   ```bash
   npm install
   ```

4. **Konfigurasi lingkungan** (lihat bagian [Konfigurasi](#-konfigurasi)), lalu jalankan server pengembangan:
   ```bash
   npm run dev
   ```

5. Buka `http://localhost:3000` di peramban.

---

## 🔧 Konfigurasi

Salin `.env.example` menjadi `.env.local` pada root proyek (sejajar dengan `package.json`), lalu isi nilai berikut:

```env
DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/offly_db
AUTH_SECRET=kunci-rahasia-offly-minimal-32-karakter
```

---

## 🔐 Akun Demo

Seluruh akun bawaan dari [database/offly_database.sql](database/offly_database.sql) memakai kata sandi **`password123`**:

| Peran | Email | Username |
| :--- | :--- | :--- |
| **Admin** | `admin@offly.id` | `admin` |
| **HRD** | `hrd@offly.id` | `hrd_sari` |
| **Ketua Divisi** | `budi.ketua@offly.id` | `ketua_budi` |
| **Karyawan** | `rafly@offly.id` | `rafly_dev` |

---

## 📁 Struktur Proyek

```text
database/
  offly_database.sql      Skema 7 tabel dan data awal PostgreSQL
public/
  logo.svg                Logo vektor utama Offly
src/
  actions/                Server Actions (autentikasi, cuti, pengguna, divisi, konfigurasi, dasbor)
  app/                    Halaman App Router, favicon/apple-icon, dan Route Handlers API
  components/             Komponen antarmuka per modul (beranda, dasbor, cuti, cms, profil, tata-letak)
  lib/                    Koneksi database, token sesi JWT, dan kalkulasi cuti
  proxy.js                Proteksi rute per peran
storage/
  lampiran/               Penyimpanan privat berkas lampiran PDF pengajuan cuti
```

<details>
<summary>Lihat struktur lengkap berkas</summary>

```text
offly-manajemen-cuti-karyawan/
├── database/
│   └── offly_database.sql
├── docs/
│   └── screenshots/
│       ├── beranda.png
│       ├── dasbor_karyawan.png
│       ├── masuk.png
│       ├── pengajuan_cuti.png
│       ├── persetujuan_hrd.png
│       ├── riwayat_cuti.png
│       └── verifikasi_cuti.png
├── public/
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── icon-192.png
│   ├── icon.svg
│   ├── logo-512.png
│   └── logo.svg
├── src/
│   ├── actions/
│   │   ├── autentikasi-aksi.js
│   │   ├── cuti-aksi.js
│   │   ├── dasbor-aksi.js
│   │   ├── divisi-aksi.js
│   │   ├── konfigurasi-aksi.js
│   │   └── pengguna-aksi.js
│   ├── app/
│   │   ├── (dasbor)/
│   │   │   ├── dasbor/
│   │   │   ├── manajemen-divisi/[id]/
│   │   │   ├── manajemen-jenis-cuti/
│   │   │   ├── manajemen-pengguna/
│   │   │   ├── pengajuan-cuti/
│   │   │   ├── pengaturan-kalender/
│   │   │   ├── persetujuan-hrd/
│   │   │   ├── profil/
│   │   │   ├── riwayat-cuti/
│   │   │   ├── verifikasi-divisi/
│   │   │   ├── layout.js
│   │   │   └── loading.js
│   │   ├── api/
│   │   │   ├── cuti/
│   │   │   │   ├── [id]/surat/route.js
│   │   │   │   └── simulasi/route.js
│   │   │   ├── lampiran/[nama]/route.js
│   │   │   └── unggah/route.js
│   │   ├── masuk/
│   │   ├── apple-icon.png
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── loading.js
│   │   ├── not-found.js
│   │   └── page.js
│   ├── components/
│   │   ├── beranda/
│   │   ├── cms/
│   │   ├── cuti/
│   │   ├── dasbor/
│   │   ├── masuk/
│   │   ├── profil/
│   │   ├── tata-letak/
│   │   └── ui/
│   ├── lib/
│   │   ├── autentikasi.js
│   │   ├── db.js
│   │   ├── kalkulasi-cuti.js
│   │   ├── token.js
│   │   └── utils.js
│   └── proxy.js
├── storage/
│   └── lampiran/
│       └── contoh-surat-dokter.pdf
├── components.json
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
└── README.md
```

</details>

---

## 📚 Dokumentasi

Aplikasi ini memakai arsitektur **Next.js App Router** berlapis: **Proxy & Autentikasi** (`src/proxy.js`, `src/lib/autentikasi.js`) → **Halaman & Komponen UI** (`src/app/`, `src/components/`) → **Server Actions & Route Handlers** (`src/actions/`, `src/app/api/`) → **PostgreSQL Raw SQL & Storage Lokal** (`src/lib/db.js`, `storage/lampiran/`).

### 🔌 Ringkasan API

| Endpoint | Metode | Fungsi |
| :--- | :--- | :--- |
| `/api/cuti/simulasi` | `POST` | Simulasi hari kerja, sisa kuota, kapasitas divisi, larangan cuti, dan validasi overlap |
| `/api/cuti/[id]/surat` | `GET` | Menerbitkan dan mengunduh Surat Izin Cuti resmi berformat PDF |
| `/api/unggah` | `POST` | Mengunggah lampiran PDF (maks. 5 MB) ke `storage/lampiran/` |
| `/api/lampiran/[nama]` | `GET` | Menyajikan berkas lampiran PDF secara aman untuk pengguna terautentikasi |

---

## 🧪 Pengujian

```bash
# Memeriksa aturan ESLint di seluruh kode
npm run lint

# Membangun bundel produksi Next.js
npm run build
```

---

## 🆘 Masalah Umum

| Pesan | Penyebab & Solusi |
| :--- | :--- |
| `password authentication failed` | Kata sandi pada `DATABASE_URL` di `.env.local` tidak sesuai dengan PostgreSQL lokal |
| `ECONNREFUSED` | Layanan PostgreSQL belum berjalan atau menggunakan port selain `5432` |
| `database "offly_db" does not exist` | Database belum dibuat atau skrip `database/offly_database.sql` belum dijalankan |
| `Cannot find module 'pg'` | Jalankan `npm install` terlebih dahulu |

---

## 🤝 Kontribusi

1. 🍴 **Fork** repository ini
2. 🌿 **Buat** branch fitur baru (`git checkout -b feat/FiturBaru`)
3. 💾 **Commit** perubahan Anda (`git commit -m "feat: tambah FiturBaru"`)
4. 📤 **Push** ke branch (`git push origin feat/FiturBaru`)
5. 🔄 **Buka** Pull Request

> ⚠️ Jangan pernah meng-commit `.env.local` atau `.env`. Keduanya sudah dikecualikan di `.gitignore`.

---

## 👤 Kontak

[![GitHub](https://img.shields.io/badge/GitHub-Raflykunn-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Raflykunn)
[![Repository](https://img.shields.io/badge/Project-Offly-a32f00?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Raflykunn/offly-manajemen-cuti-karyawan)
