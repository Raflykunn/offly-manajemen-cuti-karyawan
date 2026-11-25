"use server";

import { revalidatePath } from "next/cache";
import { jalankanKueri } from "@/lib/db";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import { formatTanggalIso } from "@/lib/kalkulasi-cuti";

async function ambilKandidatKuotaHangus() {
  const hasil = await jalankanKueri(
    `SELECT p.id, p.nama_lengkap, p.email, p.peran, p.kuota_cuti_awal,
            p.sisa_kuota_cuti, p.tanggal_bergabung, d.nama_divisi
     FROM pengguna p
     LEFT JOIN divisi d ON d.id = p.divisi_id
     WHERE p.status_aktif = TRUE
       AND p.peran IN ('karyawan', 'ketua_divisi')
       AND p.tanggal_bergabung <= (CURRENT_DATE - INTERVAL '1 year')
       AND p.sisa_kuota_cuti >= 8
     ORDER BY p.sisa_kuota_cuti DESC, p.nama_lengkap ASC`
  );

  return hasil.rows.map((baris) => ({
    ...baris,
    kuota_cuti_awal: Number(baris.kuota_cuti_awal),
    sisa_kuota_cuti: Number(baris.sisa_kuota_cuti),
    tanggal_bergabung: formatTanggalIso(baris.tanggal_bergabung),
  }));
}

export async function ambilDataDasborAdmin() {
  await wajibSesiPengguna(["admin"]);

  const [
    hasilStatPengguna,
    hasilPengajuanBulanIni,
    hasilPending,
    hasilTotalDivisi,
    hasilBelumLayak,
    kandidatKuotaHangus,
  ] = await Promise.all([
    jalankanKueri(
      `SELECT
         COUNT(*) FILTER (WHERE status_aktif = TRUE AND peran IN ('karyawan', 'ketua_divisi'))::int AS karyawan_aktif,
         COUNT(*) FILTER (WHERE status_aktif = FALSE AND peran IN ('karyawan', 'ketua_divisi'))::int AS karyawan_nonaktif,
         COUNT(*) FILTER (WHERE status_aktif = TRUE)::int AS total_pengguna_aktif,
         COUNT(*) FILTER (WHERE status_aktif = FALSE)::int AS total_pengguna_nonaktif
       FROM pengguna`
    ),
    jalankanKueri(
      `SELECT COUNT(*)::int AS total
       FROM pengajuan_cuti
       WHERE DATE_TRUNC('month', tanggal_pengajuan) = DATE_TRUNC('month', CURRENT_DATE)`
    ),
    jalankanKueri(
      `SELECT COUNT(*)::int AS total
       FROM pengajuan_cuti
       WHERE status IN ('Pending', 'Approved by Leader')`
    ),
    jalankanKueri(`SELECT COUNT(*)::int AS total FROM divisi`),
    jalankanKueri(
      `SELECT p.id, p.nama_lengkap, p.email, p.peran, p.tanggal_bergabung, p.status_aktif,
              d.nama_divisi,
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.tanggal_bergabung))::int AS tahun_kerja,
              EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.tanggal_bergabung))::int AS bulan_kerja
       FROM pengguna p
       LEFT JOIN divisi d ON d.id = p.divisi_id
       WHERE p.tanggal_bergabung > (CURRENT_DATE - INTERVAL '1 year')
         AND p.peran IN ('karyawan', 'ketua_divisi')
       ORDER BY p.tanggal_bergabung DESC`
    ),
    ambilKandidatKuotaHangus(),
  ]);

  return {
    statistik: {
      karyawanAktif: hasilStatPengguna.rows[0]?.karyawan_aktif ?? 0,
      karyawanNonaktif: hasilStatPengguna.rows[0]?.karyawan_nonaktif ?? 0,
      totalPenggunaAktif: hasilStatPengguna.rows[0]?.total_pengguna_aktif ?? 0,
      totalPenggunaNonaktif: hasilStatPengguna.rows[0]?.total_pengguna_nonaktif ?? 0,
      pengajuanBulanIni: hasilPengajuanBulanIni.rows[0]?.total ?? 0,
      pendingApproval: hasilPending.rows[0]?.total ?? 0,
      totalDivisi: hasilTotalDivisi.rows[0]?.total ?? 0,
    },
    karyawanBelumLayak: hasilBelumLayak.rows.map((baris) => ({
      ...baris,
      tanggal_bergabung: formatTanggalIso(baris.tanggal_bergabung),
    })),
    kandidatKuotaHangus,
  };
}

export async function ambilDataDasborKaryawan(penggunaId) {
  await wajibSesiPengguna(["karyawan"]);

  const [
    hasilPengguna,
    hasilRingkasanCuti,
    hasilPengajuanTerbaru,
    hasilTugasHandover,
  ] = await Promise.all([
    jalankanKueri(
      `SELECT p.id, p.nama_lengkap, p.kuota_cuti_awal, p.sisa_kuota_cuti, p.tanggal_bergabung,
              d.nama_divisi, k.nama_lengkap AS nama_ketua_divisi
       FROM pengguna p
       LEFT JOIN divisi d ON d.id = p.divisi_id
       LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
       WHERE p.id = $1`,
      [penggunaId]
    ),
    jalankanKueri(
      `SELECT
         COUNT(*)::int AS total_pengajuan,
         COUNT(*) FILTER (WHERE jc.kode_cuti = 'SAKIT')::int AS jumlah_cuti_sakit,
         COUNT(*) FILTER (WHERE pc.status IN ('Pending', 'Approved by Leader'))::int AS sedang_diproses
       FROM pengajuan_cuti pc
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       WHERE pc.pengguna_id = $1`,
      [penggunaId]
    ),
    jalankanKueri(
      `SELECT pc.id, pc.nomor_pengajuan, pc.tanggal_mulai, pc.tanggal_selesai,
              pc.total_hari_cuti, pc.status,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti
       FROM pengajuan_cuti pc
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       WHERE pc.pengguna_id = $1
       ORDER BY pc.dibuat_pada DESC
       LIMIT 5`,
      [penggunaId]
    ),
    jalankanKueri(
      `SELECT pc.id, pc.nomor_pengajuan, pc.tanggal_mulai, pc.tanggal_selesai,
              pc.catatan_tugas, pc.status, p.nama_lengkap AS nama_pemohon
       FROM pengajuan_cuti pc
       JOIN pengguna p ON p.id = pc.pengguna_id
       WHERE pc.rekan_pengganti_id = $1
         AND pc.status IN ('Pending', 'Approved by Leader', 'Approved by HRD')
         AND pc.tanggal_selesai >= CURRENT_DATE
       ORDER BY pc.tanggal_mulai ASC
       LIMIT 5`,
      [penggunaId]
    ),
  ]);

  const infoPengguna = hasilPengguna.rows[0] || {};
  return {
    infoPengguna: {
      ...infoPengguna,
      kuota_cuti_awal: Number(infoPengguna.kuota_cuti_awal ?? 12),
      sisa_kuota_cuti: Number(infoPengguna.sisa_kuota_cuti ?? 0),
      tanggal_bergabung: infoPengguna.tanggal_bergabung
        ? formatTanggalIso(infoPengguna.tanggal_bergabung)
        : "",
    },
    ringkasan: hasilRingkasanCuti.rows[0] || {
      total_pengajuan: 0,
      jumlah_cuti_sakit: 0,
      sedang_diproses: 0,
    },
    pengajuanTerbaru: hasilPengajuanTerbaru.rows.map((baris) => ({
      ...baris,
      total_hari_cuti: Number(baris.total_hari_cuti),
      tanggal_mulai: formatTanggalIso(baris.tanggal_mulai),
      tanggal_selesai: formatTanggalIso(baris.tanggal_selesai),
    })),
    tugasHandover: hasilTugasHandover.rows.map((baris) => ({
      ...baris,
      tanggal_mulai: formatTanggalIso(baris.tanggal_mulai),
      tanggal_selesai: formatTanggalIso(baris.tanggal_selesai),
    })),
  };
}

export async function ambilDataDasborKetuaDivisi(penggunaId) {
  await wajibSesiPengguna(["ketua_divisi"]);

  const hasilDivisi = await jalankanKueri(
    `SELECT id, nama_divisi, deskripsi, batas_kapasitas_persen
     FROM divisi
     WHERE ketua_divisi_id = $1
     LIMIT 1`,
    [penggunaId]
  );

  const divisi = hasilDivisi.rows[0] || null;
  if (!divisi) {
    return {
      divisi: null,
      statistik: { totalMasuk: 0, pendingVerifikasi: 0, jumlahAnggota: 0, cutiMingguIni: 0 },
      anggotaDivisi: [],
      pengajuanMenunggu: [],
    };
  }

  const [
    hasilStatistik,
    hasilAnggota,
    hasilCutiMingguIni,
    hasilAntrean,
  ] = await Promise.all([
    jalankanKueri(
      `SELECT
         COUNT(pc.id)::int AS total_masuk,
         COUNT(pc.id) FILTER (WHERE pc.status = 'Pending')::int AS pending_verifikasi
       FROM pengajuan_cuti pc
       JOIN pengguna p ON p.id = pc.pengguna_id
       WHERE p.divisi_id = $1 AND p.peran = 'karyawan'`,
      [divisi.id]
    ),
    jalankanKueri(
      `SELECT id, nama_lengkap, email, peran, sisa_kuota_cuti, status_aktif
       FROM pengguna
       WHERE divisi_id = $1
       ORDER BY peran DESC, nama_lengkap ASC`,
      [divisi.id]
    ),
    jalankanKueri(
      `SELECT DISTINCT pc.pengguna_id, pc.tanggal_mulai, pc.tanggal_selesai,
              pc.status,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti
       FROM pengajuan_cuti pc
       JOIN pengguna p ON p.id = pc.pengguna_id
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       WHERE p.divisi_id = $1
         AND pc.status IN ('Approved by Leader', 'Approved by HRD')
         AND daterange(pc.tanggal_mulai, pc.tanggal_selesai, '[]') &&
             daterange(
               DATE_TRUNC('week', CURRENT_DATE)::date,
               (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::date,
               '[]'
             )`,
      [divisi.id]
    ),
    jalankanKueri(
      `SELECT pc.id, pc.nomor_pengajuan, pc.tanggal_mulai, pc.tanggal_selesai,
              pc.total_hari_cuti, pc.status, p.nama_lengkap,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti
       FROM pengajuan_cuti pc
       JOIN pengguna p ON p.id = pc.pengguna_id
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       WHERE p.divisi_id = $1 AND p.peran = 'karyawan' AND pc.status = 'Pending'
       ORDER BY pc.dibuat_pada ASC
       LIMIT 5`,
      [divisi.id]
    ),
  ]);

  const petaCutiMingguIni = new Map();
  for (const item of hasilCutiMingguIni.rows) {
    petaCutiMingguIni.set(item.pengguna_id, {
      nama_cuti: item.nama_cuti,
      tanggal_mulai: formatTanggalIso(item.tanggal_mulai),
      tanggal_selesai: formatTanggalIso(item.tanggal_selesai),
      status: item.status,
    });
  }

  const anggotaDivisi = hasilAnggota.rows.map((anggota) => ({
    ...anggota,
    sisa_kuota_cuti: Number(anggota.sisa_kuota_cuti),
    cutiMingguIni: petaCutiMingguIni.get(anggota.id) || null,
  }));

  return {
    divisi,
    statistik: {
      totalMasuk: hasilStatistik.rows[0]?.total_masuk ?? 0,
      pendingVerifikasi: hasilStatistik.rows[0]?.pending_verifikasi ?? 0,
      jumlahAnggota: anggotaDivisi.length,
      cutiMingguIni: hasilCutiMingguIni.rows.length,
    },
    anggotaDivisi,
    pengajuanMenunggu: hasilAntrean.rows.map((baris) => ({
      ...baris,
      total_hari_cuti: Number(baris.total_hari_cuti),
      tanggal_mulai: formatTanggalIso(baris.tanggal_mulai),
      tanggal_selesai: formatTanggalIso(baris.tanggal_selesai),
    })),
  };
}

export async function ambilDataDasborHrd() {
  await wajibSesiPengguna(["hrd"]);

  const [
    hasilPengajuanBulanIni,
    hasilPendingFinal,
    hasilSedangCutiBulanIni,
    hasilDaftarDivisi,
    kandidatKuotaHangus,
  ] = await Promise.all([
    jalankanKueri(
      `SELECT COUNT(*)::int AS total
       FROM pengajuan_cuti
       WHERE DATE_TRUNC('month', tanggal_pengajuan) = DATE_TRUNC('month', CURRENT_DATE)`
    ),
    jalankanKueri(
      `SELECT COUNT(*)::int AS total
       FROM pengajuan_cuti pc
       JOIN pengguna p ON p.id = pc.pengguna_id
       WHERE (p.peran = 'karyawan' AND pc.status = 'Approved by Leader')
          OR (p.peran = 'ketua_divisi' AND pc.status = 'Pending')`
    ),
    jalankanKueri(
      `SELECT pc.id, pc.nomor_pengajuan, pc.tanggal_mulai, pc.tanggal_selesai,
              pc.total_hari_cuti, p.nama_lengkap, p.peran, d.nama_divisi,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti
       FROM pengajuan_cuti pc
       JOIN pengguna p ON p.id = pc.pengguna_id
       LEFT JOIN divisi d ON d.id = p.divisi_id
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       WHERE pc.status = 'Approved by HRD'
         AND daterange(pc.tanggal_mulai, pc.tanggal_selesai, '[]') &&
             daterange(
               DATE_TRUNC('month', CURRENT_DATE)::date,
               (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,
               '[]'
             )
       ORDER BY pc.tanggal_mulai ASC`
    ),
    jalankanKueri(
      `SELECT d.id, d.nama_divisi, d.batas_kapasitas_persen,
              k.nama_lengkap AS nama_ketua_divisi,
              COUNT(p.id) FILTER (WHERE p.status_aktif = TRUE)::int AS jumlah_anggota
       FROM divisi d
       LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
       LEFT JOIN pengguna p ON p.divisi_id = d.id
       GROUP BY d.id, k.nama_lengkap
       ORDER BY d.nama_divisi ASC`
    ),
    ambilKandidatKuotaHangus(),
  ]);

  return {
    statistik: {
      pengajuanBulanIni: hasilPengajuanBulanIni.rows[0]?.total ?? 0,
      pendingFinal: hasilPendingFinal.rows[0]?.total ?? 0,
      sedangCutiBulanIni: hasilSedangCutiBulanIni.rows.length,
      totalDivisi: hasilDaftarDivisi.rows.length,
    },
    karyawanCutiBulanIni: hasilSedangCutiBulanIni.rows.map((baris) => ({
      ...baris,
      total_hari_cuti: Number(baris.total_hari_cuti),
      tanggal_mulai: formatTanggalIso(baris.tanggal_mulai),
      tanggal_selesai: formatTanggalIso(baris.tanggal_selesai),
    })),
    daftarDivisi: hasilDaftarDivisi.rows,
    kandidatKuotaHangus,
  };
}

export async function kirimPengingatKuotaHangus(targetPenggunaId) {
  await wajibSesiPengguna(["admin", "hrd"]);

  const hasilTarget = await jalankanKueri(
    `SELECT id, nama_lengkap, sisa_kuota_cuti FROM pengguna WHERE id = $1 LIMIT 1`,
    [Number(targetPenggunaId)]
  );

  if (hasilTarget.rows.length === 0) {
    return { sukses: false, pesan: "Karyawan tidak ditemukan." };
  }

  const target = hasilTarget.rows[0];
  await jalankanKueri(
    `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
     VALUES ($1, $2, $3, $4)`,
    [
      target.id,
      "Pengingat Sisa Kuota Cuti Tahunan",
      `Halo ${target.nama_lengkap}, Anda masih memiliki sisa kuota cuti tahunan sebanyak ${Number(target.sisa_kuota_cuti)} hari. Manfaatkan sebelum periode akhir tahun berakhir.`,
      "/pengajuan-cuti",
    ]
  );

  revalidatePath("/dasbor");
  return {
    sukses: true,
    pesan: `Notifikasi pengingat kuota hangus berhasil dikirim ke ${target.nama_lengkap}.`,
  };
}
