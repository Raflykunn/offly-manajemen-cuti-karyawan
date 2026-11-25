<p align="center">
  <img width="96" height="96" alt="Logo Offly" src="public/logo-512.png" />
</p>

<h1 align="center">Offly: Sistem Manajemen Cuti Karyawan</h1>

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

**Offly** adalah aplikasi web manajemen cuti karyawan untuk menangani pengajuan, verifikasi berjenjang, dan persetujuan akhir HRD. Seluruh aturan bisnis, mulai dari perhitungan hari kerja efektif, pengecekan periode larangan cuti, kapasitas divisi, pengembalian kuota otomatis, sampai penerbitan Surat Cuti PDF, dijalankan langsung di server dan transaksi PostgreSQL.

Sistem ini melayani empat peran utama (Karyawan, Ketua Divisi, HRD, dan Admin) dengan hak akses yang selalu diperiksa di sisi server.

### 🎯 Tujuan
- 📅 Menghilangkan rekap cuti manual dengan perhitungan hari kerja dan kuota otomatis
- 🛡️ Menjaga alur persetujuan berjenjang (`Karyawan → Ketua Divisi → HRD` dan `Ketua Divisi → HRD`)
- 👥 Memastikan tugas tetap berjalan lewat mekanisme rekan pengganti dan batas kapasitas divisi
- 📄 Menerbitkan surat izin cuti resmi berformat PDF secara otomatis setelah disetujui HRD

### ⭐ Nilai Inti
- ✅ **Satu Sistem Desain:** Warna OKLCH, tipografi, radius, dan bayangan dikelola terpusat di [globals.css](src/app/globals.css)
- ✅ **Otorisasi di Server:** Setiap Server Action dan Route Handler memverifikasi sesi JWT HTTP-Only serta peran pengguna di PostgreSQL
- ✅ **Transaksi Aman:** Pengajuan, pembatalan, dan persetujuan memakai transaksi `BEGIN/COMMIT` dengan penguncian baris `FOR UPDATE`
- ✅ **Lampiran Privat:** Berkas lampiran divalidasi sebagai PDF (`%PDF-`, maks. 5 MB), disimpan di `storage/lampiran/`, dan diakses lewat `/api/lampiran/[nama]` setelah cek autentikasi
- ✅ **Notifikasi Terarah:** Setiap notifikasi pengajuan cuti langsung membuka detail surat terkait (`?detail=<id>`)

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
- 📝 **Pengajuan Cuti & Simulasi Kuota:** Hitung hari kerja otomatis (mengecualikan akhir pekan, libur nasional, dan cuti bersama), mendukung cuti setengah hari (`0.5`), dan jenis **Cuti Lainnya** kustom
- 🔔 **Wajib Ketua Divisi Aktif:** Jika belum ditempatkan di divisi berketua aktif, tersedia tombol 1-klik untuk mengirim notifikasi penempatan ke Admin
- 🔁 **Ajukan Ulang & Batalkan:** Pengajuan `Pending` dapat dibatalkan dengan pengembalian kuota otomatis; pengajuan ditolak bisa langsung diajukan ulang dengan data terisi otomatis
- 📄 **Surat Cuti PDF:** Unduh surat resmi setelah status **Disetujui HRD**

### 🧑‍💼 Ketua Divisi
- ✅ **Verifikasi Cuti:** Tinjau antrean pengajuan anggota divisi lengkap dengan alasan, rekan pengganti, catatan tugas, dan lampiran PDF, lalu **Setujui** atau **Tolak** (catatan wajib)
- 📆 **Pengajuan Pribadi:** Pengajuan cuti Ketua Divisi langsung diteruskan ke antrean HRD

### 🏢 HRD
- 🏛️ **Persetujuan Akhir (Satuan & Massal):** Proses pengajuan yang lolos verifikasi ketua maupun pengajuan langsung Ketua Divisi dengan peringatan otomatis jika melampaui batas kapasitas divisi
- 🗓️ **Kalender, Larangan Cuti & Kapasitas:** Kelola hari libur nasional, cuti bersama, periode larangan cuti, dan persentase batas kapasitas per divisi
- ⏰ **Pengingat Kuota Hangus:** Pantau karyawan yang jarang mengambil cuti menjelang akhir tahun dan kirim notifikasi pengingat

### 🛠️ Admin
- 👥 **Manajemen Pengguna & Divisi:** CRUD pengguna, atur ulang kuota tahunan, kelola divisi beserta anggota dan Ketua Divisi
- 📑 **Manajemen Jenis Cuti:** Konfigurasi dinamis kuota default, batas hari pengajuan, syarat lampiran PDF, dan aturan pemotongan kuota tahunan

### 🎨 Profil & Umum
- 🖼️ **Ganti Avatar Sekali Klik:** Klik avatar pada halaman profil untuk memilih gambar (`JPG`, `PNG`, `WEBP`, maks. 1 MB) yang langsung tersimpan
- 🔒 **Keamanan Kata Sandi:** Mengganti kata sandi mewajibkan verifikasi kata sandi lama dan konfirmasi kata sandi baru
- 🌓 **Mode Terang & Gelap:** Pengalih tema dengan penyimpanan preferensi lokal

---

## 🧰 Teknologi yang Digunakan

| Lapisan | Teknologi |
| :--- | :--- |
| **Kerangka & Antarmuka** | Next.js `16.4.6` (App Router), React `19.3`, Tailwind CSS `v4`, `@base-ui/react`, `lucide-react` |
| **Backend** | Next.js Server Actions (`src/actions/*.js`) & Route Handlers (`src/app/api/*/route.js`) |
| **Database** | PostgreSQL dengan kueri Raw SQL (`pg`) |
| **Autentikasi & PDF** | `jose` (JWT cookie `httpOnly`), `bcryptjs`, `pdf-lib` |

---

## 💻 Persyaratan Sistem

- **Node.js** v20+ dan **npm**
- **PostgreSQL** v14+
- **pgAdmin 4** ([unduh di pgadmin.org/download](https://www.pgadmin.org/download/)) atau `psql` untuk menjalankan skrip SQL awal

---

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/Raflykunn/offly-manajemen-cuti-karyawan.git
   cd offly-manajemen-cuti-karyawan
   ```

2. **Siapkan database PostgreSQL**
   - **Via pgAdmin 4:** buat database baru bernama `offly_db`, klik kanan `offly_db` lalu pilih **Query Tool**, kemudian jalankan skrip [database/offly_database.sql](database/offly_database.sql).
   - **Atau via terminal (`psql`):**
     ```bash
     psql -U postgres -c "CREATE DATABASE offly_db;"
     psql -U postgres -d offly_db -f database/offly_database.sql
     ```

3. **Pasang dependensi**
   ```bash
   npm install
   ```

4. **Konfigurasi lingkungan** (lihat bagian [Konfigurasi](#-konfigurasi)), lalu jalankan server pengembangan:
   ```bash
   npm run dev
   ```

5. Buka `http://localhost:3000` di browser.

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
│   └── offly_database.sql              # Skema 7 tabel dan data awal PostgreSQL
├── docs/
│   └── screenshots/                    # Screenshot halaman untuk dokumentasi
│       ├── beranda.png
│       ├── dasbor_karyawan.png
│       ├── masuk.png
│       ├── pengajuan_cuti.png
│       ├── persetujuan_hrd.png
│       ├── riwayat_cuti.png
│       └── verifikasi_cuti.png
├── public/                             # Aset publik, logo, dan ikon aplikasi
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── icon-192.png
│   ├── icon.svg
│   ├── logo-512.png
│   └── logo.svg
├── src/
│   ├── actions/                        # Server Actions (mutasi & transaksi database)
│   │   ├── autentikasi-aksi.js         # Masuk, keluar, dan validasi akun
│   │   ├── cuti-aksi.js                # Ajukan, batalkan, verifikasi, dan riwayat cuti
│   │   ├── dasbor-aksi.js              # Statistik dasbor & pengingat kuota hangus
│   │   ├── divisi-aksi.js              # CRUD divisi dan anggota divisi
│   │   ├── konfigurasi-aksi.js         # Jenis cuti, hari libur, dan periode larangan cuti
│   │   └── pengguna-aksi.js            # Manajemen pengguna, profil, dan notifikasi
│   ├── app/                            # Halaman Next.js App Router & API Routes
│   │   ├── (dasbor)/                   # Grup rute terproteksi setelah login
│   │   │   ├── dasbor/                 # Dasbor dinamis sesuai peran
│   │   │   ├── manajemen-divisi/[id]/  # Daftar & detail anggota divisi
│   │   │   ├── manajemen-jenis-cuti/   # Konfigurasi jenis cuti
│   │   │   ├── manajemen-pengguna/     # Kelola akun & reset kuota tahunan
│   │   │   ├── pengajuan-cuti/         # Formulir pengajuan cuti & simulasi
│   │   │   ├── pengaturan-kalender/    # Hari libur, larangan cuti, & kapasitas
│   │   │   ├── persetujuan-hrd/        # Persetujuan akhir HRD (satuan & massal)
│   │   │   ├── profil/                 # Data pribadi, avatar, & ubah sandi
│   │   │   ├── riwayat-cuti/           # Riwayat, detail surat, & ajukan ulang
│   │   │   ├── verifikasi-divisi/      # Antrean verifikasi Ketua Divisi
│   │   │   ├── layout.js               # Kerangka sidebar & header dasbor
│   │   │   └── loading.js              # Skeleton loading rute dasbor
│   │   ├── api/                        # Route Handlers REST
│   │   │   ├── cuti/
│   │   │   │   ├── [id]/surat/route.js # Cetak Surat Izin Cuti PDF (pdf-lib)
│   │   │   │   └── simulasi/route.js   # Simulasi hari kerja, kuota, & validasi
│   │   │   ├── lampiran/[nama]/route.js# Unduh lampiran PDF terproteksi
│   │   │   └── unggah/route.js         # Unggah lampiran PDF (maks. 5 MB)
│   │   ├── masuk/                      # Halaman login tunggal
│   │   ├── apple-icon.png              # Ikon perangkat Apple
│   │   ├── error.js                    # Halaman error 500 per rute
│   │   ├── favicon.ico                 # Favicon tab browser
│   │   ├── global-error.js             # Halaman error 500 tingkat root
│   │   ├── globals.css                 # Token warna OKLCH & tema Tailwind v4
│   │   ├── layout.js                   # Root layout & font Roboto / JetBrains Mono
│   │   ├── loading.js                  # Loading global
│   │   ├── not-found.js                # Halaman 404
│   │   └── page.js                     # Halaman beranda publik
│   ├── components/                     # Komponen UI per fitur
│   │   ├── beranda/                    # Navbar, ilustrasi hero, & alur verifikasi
│   │   ├── cms/                        # Komponen manajemen pengguna, divisi, & kalender
│   │   ├── cuti/                       # Form pengajuan, simulasi, verifikasi, & riwayat
│   │   ├── dasbor/                     # Dasbor 4 peran & widget kuota hangus
│   │   ├── masuk/                      # Formulir login
│   │   ├── profil/                     # Formulir profil, avatar, & sandi
│   │   ├── tata-letak/                 # Sidebar, notifikasi, tema, error, & 404
│   │   └── ui/                         # Komponen dasar UI (@base-ui/react)
│   ├── lib/                            # Utilitas inti server & klien
│   │   ├── autentikasi.js              # Hash sandi (bcryptjs) & cek sesi
│   │   ├── db.js                       # Pool koneksi & transaksi PostgreSQL
│   │   ├── kalkulasi-cuti.js           # Hitung hari kerja, label status, & aturan
│   │   ├── token.js                    # Buat & verifikasi JWT (jose)
│   │   └── utils.js                    # Helper penggabung kelas CSS
│   └── proxy.js                        # Proteksi rute & redirect ke /masuk
├── storage/
│   └── lampiran/                       # Penyimpanan privat PDF (di luar public/)
│       └── contoh-surat-dokter.pdf
├── components.json                     # Konfigurasi komponen shadcn
├── eslint.config.mjs                   # Aturan ESLint Next.js
├── jsconfig.json                       # Alias path (@/*)
├── next.config.mjs                     # Konfigurasi Next.js
├── package.json                        # Dependensi & skrip npm
└── README.md                           # Dokumentasi utama proyek
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
