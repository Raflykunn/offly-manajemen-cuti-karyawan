"use server";

import { revalidatePath } from "next/cache";
import { jalankanKueri, jalankanTransaksi } from "@/lib/db";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import {
  apakahLayakCutiTahunan,
  formatTanggalIso,
  hitungHariKerjaCuti,
  validasiBatasWaktuPengajuan,
} from "@/lib/kalkulasi-cuti";

function normalisasiBarisPengajuan(baris) {
  return {
    ...baris,
    total_hari_cuti: Number(baris.total_hari_cuti),
    tanggal_pengajuan: formatTanggalIso(baris.tanggal_pengajuan),
    tanggal_mulai: formatTanggalIso(baris.tanggal_mulai),
    tanggal_selesai: formatTanggalIso(baris.tanggal_selesai),
    waktu_verifikasi_ketua: baris.waktu_verifikasi_ketua
      ? new Date(baris.waktu_verifikasi_ketua).toISOString()
      : null,
    waktu_verifikasi_hrd: baris.waktu_verifikasi_hrd
      ? new Date(baris.waktu_verifikasi_hrd).toISOString()
      : null,
    dibuat_pada: baris.dibuat_pada
      ? new Date(baris.dibuat_pada).toISOString()
      : null,
  };
}

export async function ambilDataHalamanPengajuan() {
  const sesi = await wajibSesiPengguna(["karyawan", "ketua_divisi"]);

  const [
    hasilPengguna,
    hasilJenisCuti,
    hasilRekanPengganti,
    hasilHariLibur,
    hasilBlackout,
    hasilPengajuanSaya,
  ] = await Promise.all([
    jalankanKueri(
      `SELECT p.id, p.nama_lengkap, p.peran, p.divisi_id, p.kuota_cuti_awal,
              p.sisa_kuota_cuti, p.tanggal_bergabung, d.nama_divisi
       FROM pengguna p
       LEFT JOIN divisi d ON d.id = p.divisi_id
       WHERE p.id = $1`,
      [sesi.id]
    ),
    jalankanKueri(
      `SELECT id, kode_cuti, nama_cuti, deskripsi, kuota_default,
              batas_hari_pengajuan, wajib_lampiran, potong_kuota_tahunan
       FROM jenis_cuti
       WHERE status_aktif = TRUE
       ORDER BY id ASC`
    ),
    jalankanKueri(
      `SELECT id, nama_lengkap, email, peran, divisi_id
       FROM pengguna
       WHERE status_aktif = TRUE
         AND id <> $1
         AND peran IN ('karyawan', 'ketua_divisi')
       ORDER BY (CASE WHEN divisi_id = $2 THEN 0 ELSE 1 END), nama_lengkap ASC`,
      [sesi.id, sesi.divisi_id ?? -1]
    ),
    jalankanKueri(
      `SELECT id, tanggal, nama_libur, jenis FROM hari_libur ORDER BY tanggal ASC`
    ),
    jalankanKueri(
      `SELECT id, nama_periode, tanggal_mulai, tanggal_selesai, alasan
       FROM periode_blackout
       WHERE status_aktif = TRUE
       ORDER BY tanggal_mulai ASC`
    ),
    jalankanKueri(
      `SELECT pc.*,
              jc.nama_cuti, jc.kode_cuti, jc.potong_kuota_tahunan,
              p.nama_lengkap AS nama_pemohon, p.peran AS peran_pemohon,
              d.nama_divisi,
              rp.nama_lengkap AS nama_rekan_pengganti,
              ka.nama_lengkap AS nama_ketua_approver,
              ha.nama_lengkap AS nama_hrd_approver
       FROM pengajuan_cuti pc
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       JOIN pengguna p ON p.id = pc.pengguna_id
       LEFT JOIN divisi d ON d.id = p.divisi_id
       LEFT JOIN pengguna rp ON rp.id = pc.rekan_pengganti_id
       LEFT JOIN pengguna ka ON ka.id = pc.ketua_approver_id
       LEFT JOIN pengguna ha ON ha.id = pc.hrd_approver_id
       WHERE pc.pengguna_id = $1
       ORDER BY pc.dibuat_pada DESC`,
      [sesi.id]
    ),
  ]);

  const infoPengguna = hasilPengguna.rows[0];
  return {
    pengguna: {
      ...infoPengguna,
      kuota_cuti_awal: Number(infoPengguna.kuota_cuti_awal),
      sisa_kuota_cuti: Number(infoPengguna.sisa_kuota_cuti),
      tanggal_bergabung: formatTanggalIso(infoPengguna.tanggal_bergabung),
    },
    daftarJenisCuti: hasilJenisCuti.rows,
    daftarRekanPengganti: hasilRekanPengganti.rows,
    hariLibur: hasilHariLibur.rows.map((h) => ({
      ...h,
      tanggal: formatTanggalIso(h.tanggal),
    })),
    periodeBlackout: hasilBlackout.rows.map((b) => ({
      ...b,
      tanggal_mulai: formatTanggalIso(b.tanggal_mulai),
      tanggal_selesai: formatTanggalIso(b.tanggal_selesai),
    })),
    daftarPengajuanSaya: hasilPengajuanSaya.rows.map(normalisasiBarisPengajuan),
  };
}

export async function ajukanCutiBaru(formData) {
  const sesi = await wajibSesiPengguna(["karyawan", "ketua_divisi"]);

  const jenisCutiId = Number(formData.get("jenis_cuti_id"));
  const opsiSetengahHari = formData.get("opsi_setengah_hari") === "on";
  const tanggalMulai = String(formData.get("tanggal_mulai") || "").trim();
  const tanggalSelesai = String(formData.get("tanggal_selesai") || "").trim();
  const alasanCuti = String(formData.get("alasan_cuti") || "").trim();
  const rekanMentah = String(formData.get("rekan_pengganti_id") || "");
  const rekanPenggantiId =
    rekanMentah && rekanMentah !== "kosong" ? Number(rekanMentah) : null;
  const catatanTugas = String(formData.get("catatan_tugas") || "").trim();
  const lampiranUrl = String(formData.get("lampiran_url") || "").trim();
  const alamatSelamaCuti = String(
    formData.get("alamat_selama_cuti") || ""
  ).trim();
  const nomorDarurat = String(formData.get("nomor_darurat") || "").trim();

  if (
    !jenisCutiId ||
    !tanggalMulai ||
    !tanggalSelesai ||
    !alasanCuti ||
    !alamatSelamaCuti ||
    !nomorDarurat
  ) {
    return {
      sukses: false,
      pesan:
        "Jenis cuti, tanggal mulai/selesai, alasan, alamat selama cuti, dan nomor darurat wajib diisi.",
    };
  }

  if (tanggalSelesai < tanggalMulai) {
    return {
      sukses: false,
      pesan: "Tanggal selesai cuti harus sama dengan atau setelah tanggal mulai.",
    };
  }

  try {
    const nomorBaru = await jalankanTransaksi(async (klien) => {
      const penggunaRes = await klien.query(
        `SELECT p.id, p.nama_lengkap, p.peran, p.divisi_id, p.sisa_kuota_cuti,
                p.tanggal_bergabung, d.ketua_divisi_id, d.batas_kapasitas_persen
         FROM pengguna p
         LEFT JOIN divisi d ON d.id = p.divisi_id
         WHERE p.id = $1 FOR UPDATE OF p`,
        [sesi.id]
      );
      const pengguna = penggunaRes.rows[0];
      if (!pengguna) {
        throw new Error("Akun pengguna tidak ditemukan.");
      }

      const jenisRes = await klien.query(
        `SELECT * FROM jenis_cuti WHERE id = $1 AND status_aktif = TRUE`,
        [jenisCutiId]
      );
      if (jenisRes.rows.length === 0) {
        throw new Error("Jenis cuti tidak tersedia atau tidak aktif.");
      }
      const jenisCuti = jenisRes.rows[0];

      if (
        jenisCuti.kode_cuti === "TAHUNAN" &&
        !apakahLayakCutiTahunan(pengguna.tanggal_bergabung)
      ) {
        throw new Error(
          "Karyawan dengan masa kerja di bawah 1 tahun belum memenuhi syarat untuk mengajukan Cuti Tahunan."
        );
      }

      const hariIniStr = formatTanggalIso(new Date());
      const cekBatasWaktu = validasiBatasWaktuPengajuan(
        jenisCuti,
        hariIniStr,
        tanggalMulai
      );
      if (!cekBatasWaktu.valid) {
        throw new Error(cekBatasWaktu.pesan);
      }

      if (jenisCuti.wajib_lampiran && !lampiranUrl) {
        throw new Error(
          `${jenisCuti.nama_cuti} wajib melampirkan berkas surat dokter atau dokumen pendukung.`
        );
      }

      const liburRes = await klien.query(
        `SELECT tanggal, nama_libur FROM hari_libur`
      );
      const hasilHitung = hitungHariKerjaCuti(
        tanggalMulai,
        tanggalSelesai,
        opsiSetengahHari,
        liburRes.rows
      );

      if (hasilHitung.totalHari <= 0) {
        throw new Error(
          "Rentang tanggal yang dipilih tidak mencakup hari kerja aktif."
        );
      }

      if (opsiSetengahHari && hasilHitung.rincianHariKerja.length !== 1) {
        throw new Error(
          "Opsi cuti setengah hari (0.5) hanya dapat dipilih untuk tepat 1 hari kerja."
        );
      }

      const blackoutRes = await klien.query(
        `SELECT nama_periode, alasan
         FROM periode_blackout
         WHERE status_aktif = TRUE
           AND daterange(tanggal_mulai, tanggal_selesai, '[]') && daterange($1::date, $2::date, '[]')
         LIMIT 1`,
        [tanggalMulai, tanggalSelesai]
      );
      if (blackoutRes.rows.length > 0) {
        throw new Error(
          `Tanggal pengajuan berada pada Blackout Period "${blackoutRes.rows[0].nama_periode}": ${blackoutRes.rows[0].alasan}`
        );
      }

      const overlapRes = await klien.query(
        `SELECT nomor_pengajuan, status
         FROM pengajuan_cuti
         WHERE pengguna_id = $1
           AND status IN ('Pending', 'Approved by Leader', 'Approved by HRD')
           AND daterange(tanggal_mulai, tanggal_selesai, '[]') && daterange($2::date, $3::date, '[]')
         LIMIT 1`,
        [sesi.id, tanggalMulai, tanggalSelesai]
      );
      if (overlapRes.rows.length > 0) {
        throw new Error(
          `Tanggal cuti bertabrakan dengan pengajuan ${overlapRes.rows[0].nomor_pengajuan} (${overlapRes.rows[0].status}).`
        );
      }

      if (pengguna.divisi_id) {
        const anggotaAktifRes = await klien.query(
          `SELECT COUNT(*)::int AS total
           FROM pengguna
           WHERE divisi_id = $1 AND status_aktif = TRUE`,
          [pengguna.divisi_id]
        );
        const disetujuiBersamaanRes = await klien.query(
          `SELECT COUNT(DISTINCT pc.pengguna_id)::int AS total
           FROM pengajuan_cuti pc
           JOIN pengguna p ON p.id = pc.pengguna_id
           WHERE p.divisi_id = $1
             AND p.id <> $2
             AND pc.status IN ('Approved by Leader', 'Approved by HRD')
             AND daterange(pc.tanggal_mulai, pc.tanggal_selesai, '[]') && daterange($3::date, $4::date, '[]')`,
          [pengguna.divisi_id, sesi.id, tanggalMulai, tanggalSelesai]
        );
        const totalAnggota = anggotaAktifRes.rows[0]?.total ?? 1;
        const sudahDisetujui = disetujuiBersamaanRes.rows[0]?.total ?? 0;
        const batasPersen = Number(pengguna.batas_kapasitas_persen ?? 30);
        const persenProyeksi =
          totalAnggota > 0
            ? Math.round(((sudahDisetujui + 1) / totalAnggota) * 100)
            : 0;
        if (totalAnggota >= 2 && persenProyeksi > batasPersen) {
          throw new Error(
            `Kapasitas cuti divisi pada tanggal tersebut telah penuh (${persenProyeksi}% melebihi batas maksimal ${batasPersen}%).`
          );
        }
      }

      const sisaKuotaSaatIni = Number(pengguna.sisa_kuota_cuti);
      if (jenisCuti.potong_kuota_tahunan) {
        if (sisaKuotaSaatIni < hasilHitung.totalHari) {
          throw new Error(
            `Sisa kuota cuti tahunan Anda (${sisaKuotaSaatIni} hari) tidak mencukupi untuk ${hasilHitung.totalHari} hari.`
          );
        }
        await klien.query(
          `UPDATE pengguna
           SET sisa_kuota_cuti = sisa_kuota_cuti - $1, diperbarui_pada = NOW()
           WHERE id = $2`,
          [hasilHitung.totalHari, sesi.id]
        );
      } else if (
        jenisCuti.kuota_default > 0 &&
        hasilHitung.totalHari > jenisCuti.kuota_default
      ) {
        throw new Error(
          `Durasi ${hasilHitung.totalHari} hari melebihi batas maksimal ${jenisCuti.nama_cuti} (${jenisCuti.kuota_default} hari).`
        );
      }

      const seqRes = await klien.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS berikutnya FROM pengajuan_cuti`
      );
      const tahunIni = new Date().getFullYear();
      const nomorPengajuan = `OFFLY-${tahunIni}-${String(
        seqRes.rows[0].berikutnya
      ).padStart(4, "0")}-${Math.floor(10 + Math.random() * 89)}`;

      await klien.query(
        `INSERT INTO pengajuan_cuti (
           nomor_pengajuan, pengguna_id, jenis_cuti_id, opsi_setengah_hari,
           tanggal_pengajuan, tanggal_mulai, tanggal_selesai, total_hari_cuti,
           alasan_cuti, rekan_pengganti_id, catatan_tugas, lampiran_url,
           alamat_selama_cuti, nomor_darurat, status
         ) VALUES (
           $1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending'
         )`,
        [
          nomorPengajuan,
          sesi.id,
          jenisCutiId,
          opsiSetengahHari,
          tanggalMulai,
          tanggalSelesai,
          hasilHitung.totalHari,
          alasanCuti,
          rekanPenggantiId,
          catatanTugas || null,
          lampiranUrl || null,
          alamatSelamaCuti,
          nomorDarurat,
        ]
      );

      if (rekanPenggantiId) {
        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            rekanPenggantiId,
            "Ditunjuk Sebagai Rekan Pengganti",
            `${pengguna.nama_lengkap} menunjuk Anda sebagai rekan pengganti untuk cuti ${nomorPengajuan} (${tanggalMulai} s.d. ${tanggalSelesai}).`,
            "/riwayat-cuti",
          ]
        );
      }

      if (pengguna.peran === "karyawan" && pengguna.ketua_divisi_id) {
        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            pengguna.ketua_divisi_id,
            "Pengajuan Cuti Divisi Baru",
            `${pengguna.nama_lengkap} mengajukan ${jenisCuti.nama_cuti} (${hasilHitung.totalHari} hari) dengan nomor ${nomorPengajuan}.`,
            "/verifikasi-divisi",
          ]
        );
      } else if (pengguna.peran === "ketua_divisi") {
        const daftarHrdRes = await klien.query(
          `SELECT id FROM pengguna WHERE peran = 'hrd' AND status_aktif = TRUE`
        );
        for (const hrd of daftarHrdRes.rows) {
          await klien.query(
            `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
             VALUES ($1, $2, $3, $4)`,
            [
              hrd.id,
              "Pengajuan Cuti Ketua Divisi",
              `Ketua Divisi ${pengguna.nama_lengkap} mengajukan ${jenisCuti.nama_cuti} (${hasilHitung.totalHari} hari) langsung ke HRD.`,
              "/persetujuan-hrd",
            ]
          );
        }
      }

      return nomorPengajuan;
    });

    revalidatePath("/pengajuan-cuti");
    revalidatePath("/dasbor");
    revalidatePath("/profil");
    revalidatePath("/riwayat-cuti");
    revalidatePath("/verifikasi-divisi");
    revalidatePath("/persetujuan-hrd");

    return {
      sukses: true,
      pesan: `Pengajuan cuti ${nomorBaru} berhasil dikirim dan menunggu persetujuan.`,
    };
  } catch (galat) {
    return {
      sukses: false,
      pesan: galat.message || "Gagal mengirimkan pengajuan cuti.",
    };
  }
}

export async function batalkanPengajuanCuti(pengajuanId, alasanPembatalan) {
  const sesi = await wajibSesiPengguna(["karyawan", "ketua_divisi"]);
  const alasan = String(alasanPembatalan || "").trim();

  if (!alasan) {
    return {
      sukses: false,
      pesan: "Alasan pembatalan wajib diisi.",
    };
  }

  try {
    const nomorDibatalkan = await jalankanTransaksi(async (klien) => {
      const hasil = await klien.query(
        `SELECT pc.id, pc.nomor_pengajuan, pc.pengguna_id, pc.total_hari_cuti,
                pc.status, jc.potong_kuota_tahunan
         FROM pengajuan_cuti pc
         JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
         WHERE pc.id = $1 FOR UPDATE OF pc`,
        [Number(pengajuanId)]
      );

      if (hasil.rows.length === 0) {
        throw new Error("Data pengajuan cuti tidak ditemukan.");
      }

      const pengajuan = hasil.rows[0];
      if (pengajuan.pengguna_id !== sesi.id) {
        throw new Error("Anda tidak berhak membatalkan pengajuan milik orang lain.");
      }

      if (pengajuan.status !== "Pending") {
        throw new Error(
          "Hanya pengajuan berstatus Pending yang dapat dibatalkan oleh pemohon."
        );
      }

      await klien.query(
        `UPDATE pengajuan_cuti
         SET status = 'Cancelled',
             alasan_pembatalan = $1,
             diperbarui_pada = NOW()
         WHERE id = $2`,
        [alasan, pengajuan.id]
      );

      if (pengajuan.potong_kuota_tahunan) {
        await klien.query(
          `UPDATE pengguna
           SET sisa_kuota_cuti = LEAST(kuota_cuti_awal, sisa_kuota_cuti + $1),
               diperbarui_pada = NOW()
           WHERE id = $2`,
          [Number(pengajuan.total_hari_cuti), sesi.id]
        );
      }

      return pengajuan.nomor_pengajuan;
    });

    revalidatePath("/pengajuan-cuti");
    revalidatePath("/dasbor");
    revalidatePath("/profil");
    revalidatePath("/riwayat-cuti");
    revalidatePath("/verifikasi-divisi");
    revalidatePath("/persetujuan-hrd");

    return {
      sukses: true,
      pesan: `Pengajuan ${nomorDibatalkan} berhasil dibatalkan dan kuota cuti telah dikembalikan.`,
    };
  } catch (galat) {
    return {
      sukses: false,
      pesan: galat.message || "Gagal membatalkan pengajuan cuti.",
    };
  }
}
