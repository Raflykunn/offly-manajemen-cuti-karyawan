DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS periode_blackout CASCADE;
DROP TABLE IF EXISTS hari_libur CASCADE;
DROP TABLE IF EXISTS pengajuan_cuti CASCADE;
DROP TABLE IF EXISTS jenis_cuti CASCADE;
DROP TABLE IF EXISTS pengguna CASCADE;
DROP TABLE IF EXISTS divisi CASCADE;

CREATE TABLE divisi (
    id SERIAL PRIMARY KEY,
    nama_divisi VARCHAR(120) NOT NULL UNIQUE,
    deskripsi TEXT,
    ketua_divisi_id INTEGER UNIQUE,
    batas_kapasitas_persen INTEGER NOT NULL DEFAULT 30 CHECK (batas_kapasitas_persen BETWEEN 1 AND 100),
    tanggal_dibentuk DATE NOT NULL DEFAULT CURRENT_DATE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pengguna (
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    kata_sandi_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    peran VARCHAR(30) NOT NULL CHECK (peran IN ('admin', 'karyawan', 'ketua_divisi', 'hrd')),
    divisi_id INTEGER REFERENCES divisi(id) ON DELETE SET NULL,
    kuota_cuti_awal NUMERIC(4,1) NOT NULL DEFAULT 12.0,
    sisa_kuota_cuti NUMERIC(4,1) NOT NULL DEFAULT 12.0,
    telepon VARCHAR(30),
    alamat TEXT,
    foto_profil TEXT,
    tanggal_bergabung DATE NOT NULL DEFAULT CURRENT_DATE,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE divisi
    ADD CONSTRAINT fk_divisi_ketua
    FOREIGN KEY (ketua_divisi_id) REFERENCES pengguna(id) ON DELETE SET NULL;

CREATE TABLE jenis_cuti (
    id SERIAL PRIMARY KEY,
    kode_cuti VARCHAR(40) NOT NULL UNIQUE,
    nama_cuti VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    kuota_default INTEGER NOT NULL DEFAULT 12 CHECK (kuota_default >= 0),
    batas_hari_pengajuan INTEGER NOT NULL DEFAULT 3,
    wajib_lampiran BOOLEAN NOT NULL DEFAULT FALSE,
    potong_kuota_tahunan BOOLEAN NOT NULL DEFAULT TRUE,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pengajuan_cuti (
    id SERIAL PRIMARY KEY,
    nomor_pengajuan VARCHAR(40) NOT NULL UNIQUE,
    pengguna_id INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    jenis_cuti_id INTEGER NOT NULL REFERENCES jenis_cuti(id) ON DELETE RESTRICT,
    opsi_setengah_hari BOOLEAN NOT NULL DEFAULT FALSE,
    tanggal_pengajuan DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    total_hari_cuti NUMERIC(4,1) NOT NULL CHECK (total_hari_cuti > 0),
    alasan_cuti TEXT NOT NULL,
    rekan_pengganti_id INTEGER REFERENCES pengguna(id) ON DELETE SET NULL,
    catatan_tugas TEXT,
    lampiran_url TEXT,
    alamat_selama_cuti TEXT NOT NULL,
    nomor_darurat VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (
        status IN (
            'Pending',
            'Approved by Leader',
            'Approved by HRD',
            'Rejected by Leader',
            'Rejected by HRD',
            'Cancelled'
        )
    ),
    ketua_approver_id INTEGER REFERENCES pengguna(id) ON DELETE SET NULL,
    catatan_ketua TEXT,
    waktu_verifikasi_ketua TIMESTAMPTZ,
    hrd_approver_id INTEGER REFERENCES pengguna(id) ON DELETE SET NULL,
    catatan_hrd TEXT,
    waktu_verifikasi_hrd TIMESTAMPTZ,
    alasan_pembatalan TEXT,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hari_libur (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL UNIQUE,
    nama_libur VARCHAR(150) NOT NULL,
    jenis VARCHAR(40) NOT NULL CHECK (jenis IN ('Libur Nasional', 'Cuti Bersama')),
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE periode_blackout (
    id SERIAL PRIMARY KEY,
    nama_periode VARCHAR(150) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    alasan TEXT NOT NULL,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifikasi (
    id SERIAL PRIMARY KEY,
    pengguna_id INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    judul VARCHAR(160) NOT NULL,
    pesan TEXT NOT NULL,
    tautan VARCHAR(255),
    sudah_dibaca BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pengguna_divisi ON pengguna(divisi_id);
CREATE INDEX idx_pengguna_peran ON pengguna(peran);
CREATE INDEX idx_pengajuan_pengguna ON pengajuan_cuti(pengguna_id);
CREATE INDEX idx_pengajuan_status ON pengajuan_cuti(status);
CREATE INDEX idx_pengajuan_tanggal ON pengajuan_cuti(tanggal_mulai, tanggal_selesai);
CREATE INDEX idx_notifikasi_pengguna ON notifikasi(pengguna_id, sudah_dibaca);

INSERT INTO divisi (id, nama_divisi, deskripsi, batas_kapasitas_persen, tanggal_dibentuk) VALUES
    (1, 'Teknologi Informasi', 'Pengembangan aplikasi, infrastruktur cloud, dan keamanan sistem perusahaan.', 40, '2023-01-10'),
    (2, 'Operasional & Layanan', 'Pengelolaan operasional harian, logistik, dan kualitas layanan pelanggan.', 30, '2023-01-10');

INSERT INTO pengguna (
    id, username, email, kata_sandi_hash, nama_lengkap, peran, divisi_id,
    kuota_cuti_awal, sisa_kuota_cuti, telepon, alamat, tanggal_bergabung, status_aktif
) VALUES
    (1, 'admin', 'admin@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Ahmad Fajar (Admin)', 'admin', NULL, 12.0, 12.0, '081234560001', 'Jl. Perintis Kemerdekaan KM 10, Makassar', '2022-01-05', TRUE),
    (2, 'hrd_sari', 'hrd@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Sari Wulandari', 'hrd', NULL, 12.0, 12.0, '081234560002', 'Jl. Pettarani No. 24, Makassar', '2022-03-14', TRUE),
    (3, 'ketua_budi', 'budi.ketua@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Budi Santoso', 'ketua_divisi', 1, 12.0, 10.0, '081234560003', 'Jl. Boulevard Panakkukang No. 8, Makassar', '2022-06-01', TRUE),
    (4, 'ketua_rina', 'rina.ketua@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Rina Kartika', 'ketua_divisi', 2, 12.0, 11.0, '081234560004', 'Jl. Hertasning Baru No. 15, Makassar', '2022-08-20', TRUE),
    (5, 'ketua_andi', 'andi.ketua@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Andi Pratama', 'ketua_divisi', NULL, 12.0, 12.0, '081234560005', 'Jl. Alauddin No. 41, Makassar', '2023-02-11', TRUE),
    (6, 'rafly_dev', 'rafly@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Muh. Rafly Nurramadhan', 'karyawan', 1, 12.0, 10.5, '081234560006', 'Jl. Tamalanrea Raya Blok B No. 12, Makassar', '2024-02-10', TRUE),
    (7, 'nadia_dev', 'nadia@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Nadia Putri Lestari', 'karyawan', 1, 12.0, 10.0, '081234560007', 'Jl. Sunu Kompleks Unhas No. 5, Makassar', '2024-05-20', TRUE),
    (8, 'dimas_jr', 'dimas@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Dimas Aditya Saputra', 'karyawan', 1, 12.0, 12.0, '081234560008', 'Jl. Antang Raya No. 89, Makassar', '2026-07-01', TRUE),
    (9, 'citra_ops', 'citra@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Citra Dewi Anggraini', 'karyawan', 2, 12.0, 9.0, '081234560009', 'Jl. Veteran Selatan No. 32, Makassar', '2023-11-05', TRUE),
    (10, 'bagus_ops', 'bagus@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Bagus Setiawan', 'karyawan', 2, 12.0, 12.0, '081234560010', 'Jl. Urip Sumoharjo No. 70, Makassar', '2023-08-14', TRUE),
    (11, 'farah_nonaktif', 'farah@offly.id', '$2b$10$qke5pfLTqYgxVm9NPooqke1IrnMWGTzkr4TE18WqQ9UAM6GP7bjwS', 'Farah Nabila', 'karyawan', 2, 12.0, 12.0, '081234560011', 'Jl. Cenderawasih No. 18, Makassar', '2026-08-10', FALSE);

UPDATE divisi SET ketua_divisi_id = 3 WHERE id = 1;
UPDATE divisi SET ketua_divisi_id = 4 WHERE id = 2;

INSERT INTO jenis_cuti (
    id, kode_cuti, nama_cuti, deskripsi, kuota_default, batas_hari_pengajuan,
    wajib_lampiran, potong_kuota_tahunan, status_aktif
) VALUES
    (1, 'TAHUNAN', 'Cuti Tahunan', 'Cuti reguler karyawan sebanyak 12 hari kerja per tahun di luar akhir pekan dan hari libur nasional.', 12, 3, FALSE, TRUE, TRUE),
    (2, 'SAKIT', 'Cuti Sakit', 'Cuti karena gangguan kesehatan dengan lampiran wajib surat keterangan dokter.', 14, -3, TRUE, FALSE, TRUE),
    (3, 'MENIKAH', 'Cuti Menikah', 'Cuti khusus pernikahan karyawan dengan melampirkan surat keterangan atau undangan resmi.', 3, 7, TRUE, FALSE, TRUE),
    (4, 'MELAHIRKAN', 'Cuti Melahirkan', 'Cuti persalinan bagi karyawati dengan lampiran surat keterangan dokter atau bidan.', 90, 14, TRUE, FALSE, TRUE),
    (5, 'DUKA', 'Cuti Duka Keluarga', 'Cuti kedukaan anggota keluarga inti yang dapat diajukan mendadak.', 2, -3, FALSE, FALSE, TRUE),
    (6, 'TANPA_GAJI', 'Cuti Tanpa Gaji', 'Cuti di luar tanggungan perusahaan setelah melalui persetujuan khusus manajemen.', 30, 3, FALSE, FALSE, TRUE);

INSERT INTO hari_libur (id, tanggal, nama_libur, jenis) VALUES
    (1, '2026-01-01', 'Tahun Baru 2026 Masehi', 'Libur Nasional'),
    (2, '2026-03-19', 'Hari Suci Nyepi Tahun Baru Saka 1948', 'Libur Nasional'),
    (3, '2026-03-20', 'Hari Raya Idul Fitri 1447 H', 'Libur Nasional'),
    (4, '2026-05-01', 'Hari Buruh Internasional', 'Libur Nasional'),
    (5, '2026-08-17', 'Hari Kemerdekaan Republik Indonesia', 'Libur Nasional'),
    (6, '2026-11-26', 'Cuti Bersama Menjelang Akhir Tahun', 'Cuti Bersama'),
    (7, '2026-12-25', 'Hari Raya Natal', 'Libur Nasional');

INSERT INTO periode_blackout (id, nama_periode, tanggal_mulai, tanggal_selesai, alasan, status_aktif) VALUES
    (1, 'Tutup Buku & Audit Akhir Tahun 2026', '2026-12-28', '2026-12-31', 'Seluruh personel inti diperlukan selama proses tutup buku dan audit keuangan tahunan.', TRUE);

INSERT INTO pengajuan_cuti (
    id, nomor_pengajuan, pengguna_id, jenis_cuti_id, opsi_setengah_hari, tanggal_pengajuan,
    tanggal_mulai, tanggal_selesai, total_hari_cuti, alasan_cuti, rekan_pengganti_id,
    catatan_tugas, lampiran_url, alamat_selama_cuti, nomor_darurat, status,
    ketua_approver_id, catatan_ketua, waktu_verifikasi_ketua,
    hrd_approver_id, catatan_hrd, waktu_verifikasi_hrd, alasan_pembatalan
) VALUES
    (1, 'OFFLY-2026-0001', 6, 1, TRUE, '2026-11-02', '2026-11-18', '2026-11-18', 0.5, 'Mengurus perpanjangan dokumen kependudukan pagi hari.', 7, 'Monitoring deploy staging dialihkan ke Nadia.', NULL, 'Makassar', '081234560099', 'Approved by HRD', 3, 'Disetujui, pekerjaan sprint aman.', '2026-11-03 09:15:00+08', 2, 'Disetujui sesuai aturan cuti setengah hari.', '2026-11-04 11:00:00+08', NULL),
    (2, 'OFFLY-2026-0002', 6, 1, FALSE, '2026-10-10', '2026-10-20', '2026-10-20', 1.0, 'Keperluan acara wisuda keluarga di luar kota.', 7, 'Handle tiket bug prioritas rendah.', NULL, 'Gowa, Sulawesi Selatan', '081234560099', 'Approved by HRD', 3, 'Oke silakan.', '2026-10-11 10:00:00+08', 2, 'Cuti tahunan disetujui.', '2026-10-12 14:20:00+08', NULL),
    (3, 'OFFLY-2026-0003', 7, 1, FALSE, '2026-11-14', '2026-11-24', '2026-11-25', 2.0, 'Menghadiri acara keluarga besar di Surabaya.', 6, 'Dokumentasi API layanan cuti sudah diunggah ke repo.', NULL, 'Surabaya', '081344556677', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (4, 'OFFLY-2026-0004', 9, 1, FALSE, '2026-11-12', '2026-11-18', '2026-11-20', 3.0, 'Istirahat dan liburan bersama keluarga.', 10, 'Laporan harian operasional ditangani Bagus.', NULL, 'Malino, Kab. Gowa', '081988776655', 'Approved by Leader', 4, 'Operasional sudah di-backup Bagus, silakan diproses HRD.', '2026-11-13 13:30:00+08', NULL, NULL, NULL, NULL),
    (5, 'OFFLY-2026-0005', 3, 1, FALSE, '2026-11-15', '2026-11-23', '2026-11-24', 2.0, 'Keperluan pemeriksaan kesehatan rutin keluarga di Jakarta.', 6, 'Koordinasi sprint harian diwakili Rafly sementara.', NULL, 'Jakarta Selatan', '081122334455', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (6, 'OFFLY-2026-0006', 4, 1, FALSE, '2026-11-01', '2026-11-19', '2026-11-19', 1.0, 'Menghadiri undangan pernikahan kerabat dekat.', 9, 'Koordinasi operasional harian dilimpahkan ke Citra.', NULL, 'Makassar', '081223344556', 'Approved by HRD', NULL, NULL, NULL, 2, 'Disetujui langsung oleh HRD.', '2026-11-02 15:00:00+08', NULL),
    (7, 'OFFLY-2026-0007', 6, 2, FALSE, '2026-11-10', '2026-11-10', '2026-11-10', 1.0, 'Demam tinggi dan perlu istirahat sesuai saran dokter.', 7, 'Bug hotfix sudah selesai sebelum izin sakit.', '/api/lampiran/contoh-surat-dokter.pdf', 'Makassar', '081234560099', 'Approved by HRD', 3, 'Semoga lekas sembuh.', '2026-11-10 10:05:00+08', 2, 'Surat dokter terverifikasi.', '2026-11-10 13:45:00+08', NULL),
    (8, 'OFFLY-2026-0008', 9, 1, FALSE, '2026-10-01', '2026-10-15', '2026-10-16', 2.0, 'Rencana perjalanan pribadi yang kemudian dijadwal ulang.', 10, 'Tidak jadi berangkat karena agenda rapat mendadak.', NULL, 'Makassar', '081988776655', 'Cancelled', NULL, NULL, NULL, NULL, NULL, NULL, 'Jadwal perjalanan ditunda bulan berikutnya.');

INSERT INTO notifikasi (id, pengguna_id, judul, pesan, tautan, sudah_dibaca) VALUES
    (1, 6, 'Pengajuan Cuti Disetujui HRD', 'Pengajuan OFFLY-2026-0001 (0.5 hari) telah disetujui HRD. Anda dapat mengunduh surat cuti PDF.', '/riwayat-cuti', FALSE),
    (2, 6, 'Ditunjuk Sebagai Rekan Pengganti', 'Nadia Putri Lestari menunjuk Anda sebagai rekan pengganti untuk pengajuan OFFLY-2026-0003.', '/riwayat-cuti', FALSE),
    (3, 3, 'Verifikasi Cuti Baru Menunggu', 'Nadia Putri Lestari mengajukan Cuti Tahunan (OFFLY-2026-0003) yang menunggu verifikasi Anda.', '/verifikasi-divisi', FALSE),
    (4, 2, 'Persetujuan Final HRD Menunggu', 'Terdapat 2 pengajuan cuti (Citra Dewi Anggraini & Budi Santoso) yang siap ditinjau.', '/persetujuan-hrd', FALSE);

SELECT setval(pg_get_serial_sequence('divisi', 'id'), COALESCE((SELECT MAX(id) FROM divisi), 1));
SELECT setval(pg_get_serial_sequence('pengguna', 'id'), COALESCE((SELECT MAX(id) FROM pengguna), 1));
SELECT setval(pg_get_serial_sequence('jenis_cuti', 'id'), COALESCE((SELECT MAX(id) FROM jenis_cuti), 1));
SELECT setval(pg_get_serial_sequence('pengajuan_cuti', 'id'), COALESCE((SELECT MAX(id) FROM pengajuan_cuti), 1));
SELECT setval(pg_get_serial_sequence('hari_libur', 'id'), COALESCE((SELECT MAX(id) FROM hari_libur), 1));
SELECT setval(pg_get_serial_sequence('periode_blackout', 'id'), COALESCE((SELECT MAX(id) FROM periode_blackout), 1));
SELECT setval(pg_get_serial_sequence('notifikasi', 'id'), COALESCE((SELECT MAX(id) FROM notifikasi), 1));
