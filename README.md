# Offly — Sistem Manajemen Cuti Karyawan

Aplikasi manajemen pengajuan, verifikasi berjenjang, dan persetujuan cuti karyawan berbasis **Next.js 16 (App Router)**, **PostgreSQL (Raw SQL via `pg`)**, serta **Tailwind CSS v4 + shadcn/ui (`amber-minimal`)**.

## Fitur Utama

1. **Autentikasi & Otorisasi 4 Peran**:
   - **Admin**, **Karyawan**, **Ketua Divisi**, dan **HRD** dengan deteksi peran otomatis setelah login, dukungan *Remember Me*, dan proteksi rute berbasis Next.js 16 `proxy.js`.
2. **Alur Persetujuan Berjenjang**:
   - **Alur 1 (Karyawan)**: Karyawan → Verifikasi Ketua Divisi (`Approved by Leader` / `Rejected by Leader`) → Persetujuan Final HRD (`Approved by HRD` / `Rejected by HRD`).
   - **Alur 2 (Ketua Divisi)**: Ketua Divisi mengajukan cuti langsung ke HRD → Persetujuan Final HRD.
3. **Jenis Cuti Dinamis & Aturan Bisnis**:
   - **Cuti Tahunan**: Kuota 12 hari kerja/tahun (mengecualikan Sabtu, Minggu, & Hari Libur Nasional), minimal H-3, mendukung cuti setengah hari (`0.5` hari), syarat masa kerja ≥ 1 tahun, dan pengembalian kuota otomatis jika dibatalkan atau ditolak.
   - **Cuti Sakit**: Wajib lampiran surat dokter, dapat diajukan H-0 hingga H+3 susulan, tidak memotong kuota tahunan.
   - **Cuti Lainnya Dinamis**: Disimpan dan dikonfigurasi oleh Admin langsung di database (Menikah, Melahirkan, Duka, Tanpa Gaji, dan jenis baru lainnya).
4. **Modul Lengkap & Fitur Lanjutan**:
   - Dasbor statistik agregasi SQL untuk 4 peran + daftar karyawan masa kerja < 1 tahun.
   - Manajemen Pengguna, Manajemen Divisi (konfirmasi hapus 2 tahap & proteksi ketua tidak merangkap), serta Manajemen Anggota Divisi.
   - Simulasi Kuota & Sinkronisasi Kalender (*What-If*) secara *real-time*.
   - Pengaturan Hari Libur Nasional, Cuti Bersama, Periode Blackout, dan Batas Kapasitas Tim per Divisi.
   - *Multi-Approve Checkbox* pada persetujuan HRD dan Peringatan Kuota Hangus dengan notifikasi pengingat.
   - Penerbitan dan unduh **Surat Cuti Resmi (PDF)** untuk pengajuan yang telah disetujui HRD.

## Pengaturan Database (PostgreSQL Raw SQL)

1. Buat database baru di PostgreSQL / pgAdmin (contoh: `offly_db`).
2. Jalankan berkas SQL yang tersedia di luar folder aplikasi:
   ```text
   database/offly_database.sql
   ```
   (Dapat dijalankan lewat **pgAdmin Query Tool** atau perintah terminal `psql -U postgres -d offly_db -f database/offly_database.sql`).
3. Buat file `.env` pada root proyek (mengacu pada `.env.example`):
   ```env
   DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/offly_db
   AUTH_SECRET=kunci-rahasia-offly-minimal-32-karakter
   ```

## Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di peramban.

## Akun Uji Awal

Kata sandi untuk seluruh akun demo bawaan adalah **`password123`**:

| Peran | Email | Username |
| :--- | :--- | :--- |
| **Admin** | `admin@offly.id` | `admin` |
| **HRD** | `hrd@offly.id` | `hrd_sari` |
| **Ketua Divisi (Teknologi)** | `budi.ketua@offly.id` | `ketua_budi` |
| **Ketua Divisi (Operasional)** | `rina.ketua@offly.id` | `ketua_rina` |
| **Karyawan (Teknologi)** | `rafly@offly.id` | `rafly_dev` |
| **Karyawan (< 1 Tahun)** | `dimas@offly.id` | `dimas_jr` |
