<div align="center">

# Offly

**Sistem Manajemen Cuti Karyawan**

![Next.js](https://img.shields.io/badge/Next.js_16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

[Tentang Proyek](#tentang-proyek) · [Fitur Utama](#fitur-utama) · [Mulai Cepat](#mulai-cepat) · [Akun Demo](#akun-demo) · [Struktur Proyek](#struktur-proyek)

</div>

---

<details>
<summary>Daftar Isi</summary>

1. [Tentang Proyek](#tentang-proyek)
2. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
3. [Fitur Utama](#fitur-utama)
4. [Mulai Cepat](#mulai-cepat)
5. [Akun Demo](#akun-demo)
6. [Struktur Proyek](#struktur-proyek)
7. [Perintah Proyek](#perintah-proyek)

</details>

## Tentang Proyek

Offly menangani pengajuan cuti, verifikasi berjenjang, dan persetujuan HRD secara terstruktur dalam satu aplikasi web. Seluruh aturan bisnis dijalankan di server dan transaksi database PostgreSQL, mulai dari perhitungan hari kerja, pengembalian kuota otomatis, penguncian kapasitas divisi, hingga penerbitan surat cuti PDF.

### Teknologi yang Digunakan

| Lapisan | Teknologi |
| :--- | :--- |
| Kerangka Kerja | Next.js 16.4.6 (App Router, Turbopack), React 19.3 |
| Antarmuka | Tailwind CSS v4, `@base-ui/react`, Lucide Icons |
| Database | PostgreSQL dengan kueri SQL mentah (`pg`) |
| Autentikasi & PDF | `jose` (JWT cookie `httpOnly`), `bcryptjs`, `pdf-lib` |

## Fitur Utama

### Hak Akses per Peran

| Peran | Cakupan Utama |
| :--- | :--- |
| **Karyawan** | Mengajukan cuti, menyimulasikan kuota (*what-if*), membatalkan pengajuan `Pending`, memantau riwayat, dan mengunduh surat cuti PDF |
| **Ketua Divisi** | Memverifikasi pengajuan anggota divisinya serta mengajukan cuti pribadi langsung ke antrean HRD |
| **HRD** | Memberikan persetujuan final (satuan atau massal), mengelola hari libur, periode *blackout*, kapasitas divisi, dan pengingat kuota hangus |
| **Admin** | Mengelola akun pengguna, mereset kuota tahunan, mengatur divisi beserta anggotanya, serta mengonfigurasi jenis cuti dinamis |

### Aturan Bisnis dan Keamanan

- **Perhitungan Hari Kerja Otomatis:** Cuti tahunan (12 hari kerja per tahun, syarat masa kerja minimal 1 tahun, pengajuan minimal H-3) mendukung cuti setengah hari (`0.5` hari) dan mengecualikan Sabtu, Minggu, serta hari libur nasional.
- **Jenis Cuti Dinamis:** Cuti sakit dapat diajukan H-0 hingga 3 hari setelah mulai sakit dengan lampiran surat dokter; jenis cuti lain dapat ditambah atau dinonaktifkan langsung oleh Admin di database.
- **Proteksi Kapasitas dan Bentrok:** Pengajuan otomatis ditolak jika bertabrakan dengan pengajuan aktif lain, jatuh pada periode *blackout*, atau melewati batas kapasitas divisi.
- **Penyimpanan Lampiran Privat:** Berkas unggahan dicek berdasarkan *magic bytes* (PDF, PNG, JPEG), disimpan di luar folder `public` (`storage/lampiran/`), dan hanya dibuka lewat `/api/lampiran/[nama]` setelah pengecekan sesi serta hak akses.
- **Perlindungan Sesi dan Akses Masuk:** Cookie sesi diverifikasi ulang ke status aktif di database melalui `src/proxy.js`, dilengkapi pembatasan percobaan gagal masuk.

## Mulai Cepat

### Prasyarat

- **Node.js** (disarankan v20 ke atas) dan **npm**
- **PostgreSQL**
- **pgAdmin 4** (unduh di [pgadmin.org/download](https://www.pgadmin.org/download/))

### Langkah Instalasi

1. **Siapkan database di pgAdmin 4**
   - Buka **pgAdmin 4**, lalu buat database baru bernama `offly_db`.
   - Klik kanan `offly_db` dan pilih **Query Tool**.
   - Buka berkas `database/offly_database.sql`, lalu jalankan kuerinya (**Execute / F5**).

2. **Konfigurasi variabel lingkungan**
   Salin `.env.example` menjadi `.env.local`, lalu sesuaikan koneksi database dan kunci rahasia sesi:
   ```env
   DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/offly_db
   AUTH_SECRET=kunci-rahasia-offly-ganti-di-produksi-minimal-32-karakter
   ```

3. **Pasang dependensi dan jalankan aplikasi**
   ```bash
   npm install
   npm run dev
   ```

4. Buka `http://localhost:3000` di peramban.

## Akun Demo

Seluruh akun bawaan dari `database/offly_database.sql` memakai kata sandi **`password123`**:

| Peran | Email | Username |
| :--- | :--- | :--- |
| Admin | `admin@offly.id` | `admin` |
| HRD | `hrd@offly.id` | `hrd_sari` |
| Ketua Divisi | `budi.ketua@offly.id` | `ketua_budi` |
| Karyawan | `rafly@offly.id` | `rafly_dev` |

## Struktur Proyek

```text
database/
  offly_database.sql      Skema tabel dan data awal PostgreSQL
src/
  actions/                Server Actions (autentikasi, cuti, pengguna, divisi, konfigurasi, dasbor)
  app/                    Halaman App Router dan Route Handlers (/api/unggah, /api/lampiran, /api/cuti)
  components/             Komponen antarmuka per modul
  lib/                    Koneksi database, token sesi, dan kalkulasi cuti
  proxy.js                Proteksi rute per peran
storage/
  lampiran/               Penyimpanan privat berkas lampiran pengajuan cuti
```

## Perintah Proyek

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js |
| `npm run build` | Membangun bundel produksi |
| `npm run start` | Menjalankan server produksi setelah `build` |
| `npm run lint` | Memeriksa aturan ESLint pada kode |

<p align="right">(<a href="#offly">kembali ke atas</a>)</p>
