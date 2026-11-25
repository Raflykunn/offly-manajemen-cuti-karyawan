"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { jalankanKueri, jalankanTransaksi } from "@/lib/db";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import {
  apakahLayakCutiTahunan,
  formatTanggalIso,
  hitungHariKerjaCuti,
  hitungKapasitasCutiDivisi,
  pesanTanpaHariKerja,
  validasiBatasWaktuPengajuan,
} from "@/lib/kalkulasi-cuti";

function apakahLayakDiprosesHrd(data) {
  const tanpaKetuaAktif =
    !data.divisi_id || !data.ketua_divisi_id || data.ketua_aktif !== true;
  if (data.peran_pemohon === "karyawan") {
    return (
      data.status === "Approved by Leader" ||
      (data.status === "Pending" && tanpaKetuaAktif)
    );
  }
  return data.peran_pemohon === "ketua_divisi" && data.status === "Pending";
}

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
         AND peran = 'karyawan'
         AND divisi_id = $2
       ORDER BY nama_lengkap ASC`,
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
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti,
              jc.kode_cuti, jc.potong_kuota_tahunan,
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
  const ulangiMentah = String(formData.get("ulangi_dari_id") || "").trim();
  const ulangiDariId = ulangiMentah ? Number(ulangiMentah) : null;
  const namaCutiKustom = String(formData.get("nama_cuti_kustom") || "").trim();
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

  if (!/^\d{12,13}$/.test(nomorDarurat)) {
    return {
      sukses: false,
      pesan: "Nomor darurat harus berupa 12–13 digit angka.",
    };
  }

  if (ulangiMentah) {
    if (!Number.isInteger(ulangiDariId) || ulangiDariId <= 0) {
      return {
        sukses: false,
        pesan: "Referensi pengajuan ulang tidak valid.",
      };
    }
    const cekUlangiRes = await jalankanKueri(
      `SELECT id FROM pengajuan_cuti
       WHERE id = $1 AND pengguna_id = $2
         AND status IN ('Rejected by Leader', 'Rejected by HRD')
       LIMIT 1`,
      [ulangiDariId, sesi.id]
    );
    if (cekUlangiRes.rows.length === 0) {
      return {
        sukses: false,
        pesan: "Referensi pengajuan ulang tidak ditemukan atau tidak berstatus ditolak.",
      };
    }
  }

  if (tanggalSelesai < tanggalMulai) {
    return {
      sukses: false,
      pesan: "Tanggal selesai cuti harus sama dengan atau setelah tanggal mulai.",
    };
  }

  if (
    lampiranUrl &&
    !/^\/api\/lampiran\/[a-zA-Z0-9._-]+$/.test(lampiranUrl)
  ) {
    return {
      sukses: false,
      pesan: "URL berkas lampiran tidak valid.",
    };
  }

  try {
    const nomorBaru = await jalankanTransaksi(async (klien) => {
      const penggunaRes = await klien.query(
        `SELECT p.id, p.nama_lengkap, p.peran, p.divisi_id, p.sisa_kuota_cuti,
                p.tanggal_bergabung, d.ketua_divisi_id, d.batas_kapasitas_persen,
                k.status_aktif AS ketua_aktif
         FROM pengguna p
         LEFT JOIN divisi d ON d.id = p.divisi_id
         LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
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

      const waktuDbRes = await klien.query(
        `SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS hari_ini,
                EXTRACT(YEAR FROM CURRENT_DATE)::int AS tahun_ini`
      );
      const hariIniStr = waktuDbRes.rows[0].hari_ini;
      const tahunIni = waktuDbRes.rows[0].tahun_ini;
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
        `SELECT tanggal, nama_libur, jenis FROM hari_libur`
      );
      const hasilHitung = hitungHariKerjaCuti(
        tanggalMulai,
        tanggalSelesai,
        opsiSetengahHari,
        liburRes.rows
      );

      if (hasilHitung.totalHari <= 0) {
        throw new Error(pesanTanpaHariKerja(hasilHitung));
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
          `Anda sudah mengajukan surat cuti untuk tanggal tersebut (${overlapRes.rows[0].nomor_pengajuan}, ${overlapRes.rows[0].status}).`
        );
      }

      if (rekanPenggantiId === null) {
        if (pengguna.divisi_id) {
          const adaKandidatRes = await klien.query(
            `SELECT 1 FROM pengguna
             WHERE status_aktif = TRUE AND id <> $1 AND peran = 'karyawan' AND divisi_id = $2
             LIMIT 1`,
            [sesi.id, pengguna.divisi_id]
          );
          if (adaKandidatRes.rows.length > 0) {
            throw new Error("Rekan pengganti satu divisi wajib dipilih.");
          }
        }
      } else {
        if (!Number.isInteger(rekanPenggantiId) || rekanPenggantiId <= 0 || rekanPenggantiId === sesi.id) {
          throw new Error("Rekan pengganti tidak valid atau tidak boleh diri sendiri.");
        }
        const rekanRes = await klien.query(
          `SELECT id, peran, divisi_id, status_aktif FROM pengguna WHERE id = $1`,
          [rekanPenggantiId]
        );
        const rekan = rekanRes.rows[0];
        if (
          !rekan ||
          !rekan.status_aktif ||
          rekan.peran !== "karyawan" ||
          rekan.divisi_id !== pengguna.divisi_id
        ) {
          throw new Error("Rekan pengganti harus karyawan aktif dari divisi yang sama.");
        }
        const rekanCutiRes = await klien.query(
          `SELECT 1 FROM pengajuan_cuti
           WHERE pengguna_id = $1
             AND status IN ('Pending', 'Approved by Leader', 'Approved by HRD')
             AND daterange(tanggal_mulai, tanggal_selesai, '[]') && daterange($2::date, $3::date, '[]')
           LIMIT 1`,
          [rekanPenggantiId, tanggalMulai, tanggalSelesai]
        );
        if (rekanCutiRes.rows.length > 0) {
          throw new Error("Rekan pengganti yang dipilih sedang memiliki jadwal cuti pada tanggal tersebut.");
        }
      }

      if (pengguna.divisi_id) {
        await klien.query(`SELECT id FROM divisi WHERE id = $1 FOR UPDATE`, [
          pengguna.divisi_id,
        ]);
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
             AND pc.status IN ('Pending', 'Approved by Leader', 'Approved by HRD')
             AND daterange(pc.tanggal_mulai, pc.tanggal_selesai, '[]') && daterange($3::date, $4::date, '[]')`,
          [pengguna.divisi_id, sesi.id, tanggalMulai, tanggalSelesai]
        );
        const totalAnggota = anggotaAktifRes.rows[0]?.total ?? 1;
        const sudahDisetujui = disetujuiBersamaanRes.rows[0]?.total ?? 0;
        const batasPersen = Number(pengguna.batas_kapasitas_persen ?? 30);
        const kapasitas = hitungKapasitasCutiDivisi(
          totalAnggota,
          sudahDisetujui + 1,
          batasPersen
        );
        if (kapasitas.melebihiBatas) {
          throw new Error(
            `Kapasitas cuti divisi pada tanggal tersebut telah penuh (${sudahDisetujui + 1}/${totalAnggota} anggota atau ${kapasitas.persenBeban}%, maksimal ${kapasitas.maksOrang} orang sesuai batas ${batasPersen}%).`
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
      } else if (jenisCuti.kuota_default > 0) {
        const akumulasiRes = await klien.query(
          `SELECT COALESCE(SUM(total_hari_cuti), 0) AS total_terpakai
           FROM pengajuan_cuti
           WHERE pengguna_id = $1
             AND jenis_cuti_id = $2
             AND EXTRACT(YEAR FROM tanggal_mulai) = EXTRACT(YEAR FROM $3::date)
             AND status IN ('Pending', 'Approved by Leader', 'Approved by HRD')`,
          [sesi.id, jenisCutiId, tanggalMulai]
        );
        const sudahDipakai = Number(akumulasiRes.rows[0]?.total_terpakai ?? 0);
        if (sudahDipakai + hasilHitung.totalHari > jenisCuti.kuota_default) {
          throw new Error(
            `Total durasi ${jenisCuti.nama_cuti} pada tahun tersebut (${sudahDipakai + hasilHitung.totalHari} hari) melebihi batas maksimal ${jenisCuti.kuota_default} hari per tahun.`
          );
        }
      }

      const nomorSementara = `TMP-${crypto.randomUUID()}`;
      const namaKustomTersimpan =
        jenisCuti.kode_cuti === "LAINNYA" ? namaCutiKustom : null;
      if (jenisCuti.kode_cuti === "LAINNYA") {
        if (namaCutiKustom.length < 3 || namaCutiKustom.length > 120) {
          throw new Error(
            "Nama atau keperluan Cuti Lainnya wajib diisi (3–120 karakter)."
          );
        }
      }

      const insertRes = await klien.query(
        `INSERT INTO pengajuan_cuti (
           nomor_pengajuan, pengguna_id, jenis_cuti_id, nama_cuti_kustom,
           opsi_setengah_hari, tanggal_pengajuan, tanggal_mulai, tanggal_selesai,
           total_hari_cuti, alasan_cuti, rekan_pengganti_id, catatan_tugas,
           lampiran_url, alamat_selama_cuti, nomor_darurat, status
         ) VALUES (
           $1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Pending'
         )
         RETURNING id`,
        [
          nomorSementara,
          sesi.id,
          jenisCutiId,
          namaKustomTersimpan,
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

      const idBaru = insertRes.rows[0].id;
      const nomorPengajuan = `OFFLY-${tahunIni}-${String(idBaru).padStart(
        4,
        "0"
      )}`;
      await klien.query(
        `UPDATE pengajuan_cuti SET nomor_pengajuan = $1 WHERE id = $2`,
        [nomorPengajuan, idBaru]
      );

      if (rekanPenggantiId) {
        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            rekanPenggantiId,
            "Ditunjuk Sebagai Rekan Pengganti",
            `${pengguna.nama_lengkap} menunjuk Anda sebagai rekan pengganti untuk cuti ${nomorPengajuan} (${tanggalMulai} s.d. ${tanggalSelesai}).`,
            `/riwayat-cuti?detail=${idBaru}`,
          ]
        );
      }

      if (
        pengguna.peran === "karyawan" &&
        pengguna.divisi_id &&
        pengguna.ketua_divisi_id &&
        pengguna.ketua_aktif === true
      ) {
        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            pengguna.ketua_divisi_id,
            "Pengajuan Cuti Divisi Baru",
            `${pengguna.nama_lengkap} mengajukan ${jenisCuti.nama_cuti} (${hasilHitung.totalHari} hari) dengan nomor ${nomorPengajuan}.`,
            `/verifikasi-divisi?detail=${idBaru}`,
          ]
        );
      } else {
        const daftarHrdRes = await klien.query(
          `SELECT id FROM pengguna WHERE peran = 'hrd' AND status_aktif = TRUE`
        );
        const judulNotif =
          pengguna.peran === "ketua_divisi"
            ? "Pengajuan Cuti Ketua Divisi"
            : "Pengajuan Cuti Karyawan (Langsung HRD)";
        const pesanNotif =
          pengguna.peran === "ketua_divisi"
            ? `Ketua Divisi ${pengguna.nama_lengkap} mengajukan ${jenisCuti.nama_cuti} (${hasilHitung.totalHari} hari) langsung ke HRD.`
            : `Karyawan ${pengguna.nama_lengkap} mengajukan ${jenisCuti.nama_cuti} (${hasilHitung.totalHari} hari) langsung ke HRD karena belum memiliki Ketua Divisi aktif.`;
        for (const hrd of daftarHrdRes.rows) {
          await klien.query(
            `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
             VALUES ($1, $2, $3, $4)`,
            [hrd.id, judulNotif, pesanNotif, `/persetujuan-hrd?detail=${idBaru}`]
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
  } catch (kesalahan) {
    return {
      sukses: false,
      pesan: kesalahan.message || "Gagal mengirimkan pengajuan cuti.",
    };
  }
}

async function kirimNotifRekanBatalAtauTolak(klien, rekanId, pengajuanId, nomorPengajuan, keterangan) {
  if (!rekanId) return;
  await klien.query(
    `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
     VALUES ($1, $2, $3, $4)`,
    [
      rekanId,
      "Pembaruan Tugas Pengganti Cuti",
      `Pengajuan cuti ${nomorPengajuan} yang menunjuk Anda sebagai pengganti telah ${keterangan}.`,
      `/riwayat-cuti?detail=${pengajuanId}`,
    ]
  );
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
        `SELECT pc.id, pc.nomor_pengajuan, pc.pengguna_id, pc.rekan_pengganti_id,
                pc.total_hari_cuti, pc.status, jc.potong_kuota_tahunan
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

      await kirimNotifRekanBatalAtauTolak(
        klien,
        pengajuan.rekan_pengganti_id,
        pengajuan.id,
        pengajuan.nomor_pengajuan,
        "dibatalkan oleh pemohon"
      );

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
  } catch (kesalahan) {
    return {
      sukses: false,
      pesan: kesalahan.message || "Gagal membatalkan pengajuan cuti.",
    };
  }
}

export async function ambilDaftarVerifikasiKetuaDivisi() {
  const sesi = await wajibSesiPengguna(["ketua_divisi"]);

  const hasilDivisi = await jalankanKueri(
    `SELECT id, nama_divisi, batas_kapasitas_persen
     FROM divisi
     WHERE ketua_divisi_id = $1
     LIMIT 1`,
    [sesi.id]
  );

  const divisi = hasilDivisi.rows[0] || null;
  if (!divisi) {
    return { divisi: null, daftarMenunggu: [], daftarRiwayatDivisi: [] };
  }

  const [hasilMenunggu, hasilRiwayat] = await Promise.all([
    jalankanKueri(
      `SELECT pc.*,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti,
              jc.kode_cuti, jc.potong_kuota_tahunan,
              p.nama_lengkap AS nama_pemohon, p.email AS email_pemohon,
              p.foto_profil AS foto_pemohon, p.peran AS peran_pemohon,
              p.sisa_kuota_cuti, p.kuota_cuti_awal,
              d.nama_divisi,
              rp.nama_lengkap AS nama_rekan_pengganti
       FROM pengajuan_cuti pc
       JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
       JOIN pengguna p ON p.id = pc.pengguna_id
       LEFT JOIN divisi d ON d.id = p.divisi_id
       LEFT JOIN pengguna rp ON rp.id = pc.rekan_pengganti_id
       WHERE p.divisi_id = $1
         AND p.peran = 'karyawan'
         AND pc.pengguna_id <> $2
         AND pc.status = 'Pending'
       ORDER BY pc.dibuat_pada ASC`,
      [divisi.id, sesi.id]
    ),
    jalankanKueri(
      `SELECT pc.*,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti,
              jc.kode_cuti,
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
       WHERE p.divisi_id = $1
         AND p.peran = 'karyawan'
         AND pc.status <> 'Pending'
       ORDER BY pc.diperbarui_pada DESC
       LIMIT 20`,
      [divisi.id]
    ),
  ]);

  return {
    divisi,
    daftarMenunggu: hasilMenunggu.rows.map((b) => ({
      ...normalisasiBarisPengajuan(b),
      sisa_kuota_cuti: Number(b.sisa_kuota_cuti),
      kuota_cuti_awal: Number(b.kuota_cuti_awal),
    })),
    daftarRiwayatDivisi: hasilRiwayat.rows.map(normalisasiBarisPengajuan),
  };
}

export async function verifikasiCutiKetuaDivisi(
  pengajuanId,
  keputusan,
  catatanKetua
) {
  const sesi = await wajibSesiPengguna(["ketua_divisi"]);
  const catatan = String(catatanKetua || "").trim();
  const idPengajuan = Number(pengajuanId);

  if (!Number.isInteger(idPengajuan) || idPengajuan <= 0) {
    return { sukses: false, pesan: "ID pengajuan tidak valid." };
  }

  if (!["setuju", "tolak"].includes(keputusan)) {
    return { sukses: false, pesan: "Keputusan verifikasi tidak valid." };
  }

  if (keputusan === "tolak" && !catatan) {
    return {
      sukses: false,
      pesan: "Catatan penolakan wajib diisi jika menolak pengajuan.",
    };
  }

  try {
    const info = await jalankanTransaksi(async (klien) => {
      const hasil = await klien.query(
        `SELECT pc.id, pc.nomor_pengajuan, pc.pengguna_id, pc.rekan_pengganti_id,
                pc.total_hari_cuti, pc.status, jc.potong_kuota_tahunan, jc.nama_cuti,
                p.nama_lengkap AS nama_pemohon, p.peran AS peran_pemohon,
                d.ketua_divisi_id
         FROM pengajuan_cuti pc
         JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
         JOIN pengguna p ON p.id = pc.pengguna_id
         JOIN divisi d ON d.id = p.divisi_id
         WHERE pc.id = $1 FOR UPDATE OF pc`,
        [idPengajuan]
      );

      if (hasil.rows.length === 0) {
        throw new Error("Pengajuan cuti tidak ditemukan.");
      }

      const data = hasil.rows[0];
      if (data.pengguna_id === sesi.id || data.peran_pemohon !== "karyawan") {
        throw new Error(
          "Pengajuan milik Ketua Divisi atau diri sendiri harus diproses langsung oleh HRD."
        );
      }
      if (data.ketua_divisi_id !== sesi.id) {
        throw new Error(
          "Anda hanya dapat memverifikasi pengajuan anggota divisi Anda sendiri."
        );
      }
      if (data.status !== "Pending") {
        throw new Error("Pengajuan ini sudah pernah diproses sebelumnya.");
      }

      if (keputusan === "setuju") {
        await klien.query(
          `UPDATE pengajuan_cuti
           SET status = 'Approved by Leader',
               ketua_approver_id = $1,
               catatan_ketua = $2,
               waktu_verifikasi_ketua = NOW(),
               diperbarui_pada = NOW()
           WHERE id = $3`,
          [sesi.id, catatan || null, data.id]
        );

        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            data.pengguna_id,
            "Disetujui Ketua Divisi",
            `Pengajuan ${data.nomor_pengajuan} telah disetujui Ketua Divisi dan diteruskan ke HRD.`,
            `/riwayat-cuti?detail=${data.id}`,
          ]
        );

        const hrdRes = await klien.query(
          `SELECT id FROM pengguna WHERE peran = 'hrd' AND status_aktif = TRUE`
        );
        for (const hrd of hrdRes.rows) {
          await klien.query(
            `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
             VALUES ($1, $2, $3, $4)`,
            [
              hrd.id,
              "Verifikasi Atasan Selesai - Menunggu HRD",
              `Pengajuan ${data.nomor_pengajuan} atas nama ${data.nama_pemohon} telah disetujui Ketua Divisi.`,
              `/persetujuan-hrd?detail=${data.id}`,
            ]
          );
        }

        return { nomor: data.nomor_pengajuan, aksi: "disetujui" };
      }

      await klien.query(
        `UPDATE pengajuan_cuti
         SET status = 'Rejected by Leader',
             ketua_approver_id = $1,
             catatan_ketua = $2,
             waktu_verifikasi_ketua = NOW(),
             diperbarui_pada = NOW()
         WHERE id = $3`,
        [sesi.id, catatan, data.id]
      );

      if (data.potong_kuota_tahunan) {
        await klien.query(
          `UPDATE pengguna
           SET sisa_kuota_cuti = LEAST(kuota_cuti_awal, sisa_kuota_cuti + $1),
               diperbarui_pada = NOW()
           WHERE id = $2`,
          [Number(data.total_hari_cuti), data.pengguna_id]
        );
      }

      await klien.query(
        `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
         VALUES ($1, $2, $3, $4)`,
        [
          data.pengguna_id,
          "Pengajuan Cuti Ditolak Ketua Divisi",
          `Pengajuan ${data.nomor_pengajuan} ditolak Ketua Divisi dengan alasan: ${catatan}`,
          `/riwayat-cuti?detail=${data.id}`,
        ]
      );

      await kirimNotifRekanBatalAtauTolak(
        klien,
        data.rekan_pengganti_id,
        data.id,
        data.nomor_pengajuan,
        "ditolak oleh Ketua Divisi"
      );

      return { nomor: data.nomor_pengajuan, aksi: "ditolak" };
    });

    revalidatePath("/verifikasi-divisi");
    revalidatePath("/persetujuan-hrd");
    revalidatePath("/pengajuan-cuti");
    revalidatePath("/riwayat-cuti");
    revalidatePath("/dasbor");
    revalidatePath("/profil");

    return {
      sukses: true,
      pesan: `Pengajuan ${info.nomor} berhasil ${info.aksi}.`,
    };
  } catch (kesalahan) {
    return {
      sukses: false,
      pesan: kesalahan.message || "Gagal memproses verifikasi pengajuan cuti.",
    };
  }
}

export async function ambilDaftarPersetujuanHrd() {
  await wajibSesiPengguna(["hrd"]);

  const hasilMenunggu = await jalankanKueri(
    `SELECT pc.*,
            jc.nama_cuti, jc.kode_cuti, jc.potong_kuota_tahunan,
            p.nama_lengkap AS nama_pemohon, p.email AS email_pemohon,
            p.foto_profil AS foto_pemohon, p.peran AS peran_pemohon,
            p.divisi_id, p.sisa_kuota_cuti, p.kuota_cuti_awal,
            d.nama_divisi, d.batas_kapasitas_persen,
            rp.nama_lengkap AS nama_rekan_pengganti,
            ka.nama_lengkap AS nama_ketua_approver,
            (
              SELECT COUNT(*)::int
              FROM pengguna p2
              WHERE p2.divisi_id = p.divisi_id AND p2.status_aktif = TRUE
            ) AS total_anggota_divisi,
            (
              SELECT COUNT(DISTINCT pc2.pengguna_id)::int
              FROM pengajuan_cuti pc2
              JOIN pengguna p3 ON p3.id = pc2.pengguna_id
              WHERE p3.divisi_id = p.divisi_id
                AND pc2.status IN ('Approved by Leader', 'Approved by HRD')
                AND daterange(pc2.tanggal_mulai, pc2.tanggal_selesai, '[]') && daterange(pc.tanggal_mulai, pc.tanggal_selesai, '[]')
            ) AS jumlah_cuti_bersamaan
     FROM pengajuan_cuti pc
     JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
     JOIN pengguna p ON p.id = pc.pengguna_id
     LEFT JOIN divisi d ON d.id = p.divisi_id
     LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
     LEFT JOIN pengguna rp ON rp.id = pc.rekan_pengganti_id
     LEFT JOIN pengguna ka ON ka.id = pc.ketua_approver_id
     WHERE (
       p.peran = 'karyawan'
       AND (
         pc.status = 'Approved by Leader'
         OR (
           pc.status = 'Pending'
           AND (p.divisi_id IS NULL OR d.ketua_divisi_id IS NULL OR k.status_aktif IS NOT TRUE)
         )
       )
     )
        OR (p.peran = 'ketua_divisi' AND pc.status = 'Pending')
     ORDER BY pc.tanggal_mulai ASC, pc.dibuat_pada ASC`
  );

  return hasilMenunggu.rows.map((baris) => {
    const totalAnggota = Number(baris.total_anggota_divisi || 1);
    const jumlahCuti = Number(baris.jumlah_cuti_bersamaan || 0);
    const tambahanDiri = baris.status === "Pending" ? 1 : 0;
    const batasPersen = Number(baris.batas_kapasitas_persen ?? 30);
    const kapasitas = hitungKapasitasCutiDivisi(
      totalAnggota,
      jumlahCuti + tambahanDiri,
      batasPersen
    );

    return {
      ...normalisasiBarisPengajuan(baris),
      sisa_kuota_cuti: Number(baris.sisa_kuota_cuti),
      kuota_cuti_awal: Number(baris.kuota_cuti_awal),
      total_anggota_divisi: totalAnggota,
      jumlah_cuti_bersamaan: jumlahCuti + tambahanDiri,
      persen_beban_divisi: baris.divisi_id ? kapasitas.persenBeban : 0,
      batas_kapasitas_persen: batasPersen,
      melebihi_kapasitas: Boolean(baris.divisi_id) && kapasitas.melebihiBatas,
    };
  });
}

export async function verifikasiFinalHrd(pengajuanId, keputusan, catatanHrd) {
  const sesi = await wajibSesiPengguna(["hrd"]);
  const catatan = String(catatanHrd || "").trim();

  if (!["setuju", "tolak"].includes(keputusan)) {
    return { sukses: false, pesan: "Keputusan tidak valid." };
  }

  if (keputusan === "tolak" && !catatan) {
    return {
      sukses: false,
      pesan: "Catatan penolakan wajib diisi jika menolak pengajuan.",
    };
  }

  try {
    const info = await jalankanTransaksi(async (klien) => {
      const hasil = await klien.query(
        `SELECT pc.id, pc.nomor_pengajuan, pc.pengguna_id, pc.rekan_pengganti_id,
                pc.total_hari_cuti, pc.status, jc.potong_kuota_tahunan, p.peran AS peran_pemohon,
                p.divisi_id, d.ketua_divisi_id, k.status_aktif AS ketua_aktif
         FROM pengajuan_cuti pc
         JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
         JOIN pengguna p ON p.id = pc.pengguna_id
         LEFT JOIN divisi d ON d.id = p.divisi_id
         LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
         WHERE pc.id = $1 FOR UPDATE OF pc`,
        [Number(pengajuanId)]
      );

      if (hasil.rows.length === 0) {
        throw new Error("Pengajuan cuti tidak ditemukan.");
      }

      const data = hasil.rows[0];
      if (!apakahLayakDiprosesHrd(data)) {
        throw new Error(
          "Status pengajuan ini tidak lagi menunggu persetujuan final HRD."
        );
      }

      if (keputusan === "setuju") {
        await klien.query(
          `UPDATE pengajuan_cuti
           SET status = 'Approved by HRD',
               hrd_approver_id = $1,
               catatan_hrd = $2,
               waktu_verifikasi_hrd = NOW(),
               diperbarui_pada = NOW()
           WHERE id = $3`,
          [sesi.id, catatan || null, data.id]
        );

        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            data.pengguna_id,
            "Pengajuan Cuti Disetujui HRD",
            `Pengajuan ${data.nomor_pengajuan} telah mendapatkan persetujuan final HRD. Anda dapat mengunduh Surat Cuti (PDF) sekarang.`,
            `/riwayat-cuti?detail=${data.id}`,
          ]
        );

        return { nomor: data.nomor_pengajuan, aksi: "disetujui final" };
      }

      await klien.query(
        `UPDATE pengajuan_cuti
         SET status = 'Rejected by HRD',
             hrd_approver_id = $1,
             catatan_hrd = $2,
             waktu_verifikasi_hrd = NOW(),
             diperbarui_pada = NOW()
         WHERE id = $3`,
        [sesi.id, catatan, data.id]
      );

      if (data.potong_kuota_tahunan) {
        await klien.query(
          `UPDATE pengguna
           SET sisa_kuota_cuti = LEAST(kuota_cuti_awal, sisa_kuota_cuti + $1),
               diperbarui_pada = NOW()
           WHERE id = $2`,
          [Number(data.total_hari_cuti), data.pengguna_id]
        );
      }

      await klien.query(
        `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
         VALUES ($1, $2, $3, $4)`,
        [
          data.pengguna_id,
          "Pengajuan Cuti Ditolak HRD",
          `Pengajuan ${data.nomor_pengajuan} ditolak HRD dengan alasan: ${catatan}`,
          `/riwayat-cuti?detail=${data.id}`,
        ]
      );

      await kirimNotifRekanBatalAtauTolak(
        klien,
        data.rekan_pengganti_id,
        data.id,
        data.nomor_pengajuan,
        "ditolak oleh HRD"
      );

      return { nomor: data.nomor_pengajuan, aksi: "ditolak final" };
    });

    revalidatePath("/persetujuan-hrd");
    revalidatePath("/verifikasi-divisi");
    revalidatePath("/pengajuan-cuti");
    revalidatePath("/riwayat-cuti");
    revalidatePath("/dasbor");
    revalidatePath("/profil");

    return {
      sukses: true,
      pesan: `Pengajuan ${info.nomor} berhasil ${info.aksi}.`,
    };
  } catch (kesalahan) {
    return {
      sukses: false,
      pesan: kesalahan.message || "Gagal memproses persetujuan HRD.",
    };
  }
}

export async function setujuiBanyakCutiHrd(daftarPengajuanId, catatanHrd) {
  const sesi = await wajibSesiPengguna(["hrd"]);
  const catatan = String(catatanHrd || "").trim();
  const ids = (daftarPengajuanId || []).map(Number).filter(Boolean);

  if (ids.length === 0) {
    return {
      sukses: false,
      pesan: "Pilih minimal satu pengajuan cuti untuk disetujui massal.",
    };
  }

  try {
    const jumlahDisetujui = await jalankanTransaksi(async (klien) => {
      const hasil = await klien.query(
        `SELECT pc.id, pc.nomor_pengajuan, pc.pengguna_id, pc.status,
                p.peran AS peran_pemohon, p.divisi_id,
                d.ketua_divisi_id, k.status_aktif AS ketua_aktif
         FROM pengajuan_cuti pc
         JOIN pengguna p ON p.id = pc.pengguna_id
         LEFT JOIN divisi d ON d.id = p.divisi_id
         LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
         WHERE pc.id = ANY($1::int[]) FOR UPDATE OF pc`,
        [ids]
      );

      let total = 0;
      for (const data of hasil.rows) {
        if (!apakahLayakDiprosesHrd(data)) continue;

        await klien.query(
          `UPDATE pengajuan_cuti
           SET status = 'Approved by HRD',
               hrd_approver_id = $1,
               catatan_hrd = $2,
               waktu_verifikasi_hrd = NOW(),
               diperbarui_pada = NOW()
           WHERE id = $3`,
          [sesi.id, catatan || "Disetujui secara massal oleh HRD.", data.id]
        );

        await klien.query(
          `INSERT INTO notifikasi (pengguna_id, judul, pesan, tautan)
           VALUES ($1, $2, $3, $4)`,
          [
            data.pengguna_id,
            "Pengajuan Cuti Disetujui HRD",
            `Pengajuan ${data.nomor_pengajuan} telah disetujui HRD. Surat cuti PDF sudah dapat diunduh.`,
            `/riwayat-cuti?detail=${data.id}`,
          ]
        );
        total += 1;
      }

      return total;
    });

    revalidatePath("/persetujuan-hrd");
    revalidatePath("/riwayat-cuti");
    revalidatePath("/dasbor");
    revalidatePath("/pengajuan-cuti");

    return {
      sukses: true,
      pesan: `${jumlahDisetujui} pengajuan cuti berhasil disetujui sekaligus.`,
    };
  } catch (kesalahan) {
    return {
      sukses: false,
      pesan: kesalahan.message || "Gagal memproses persetujuan massal.",
    };
  }
}

export async function ambilRiwayatCutiLengkap() {
  const sesi = await wajibSesiPengguna();

  let kondisiPeran = "";
  let parameter = [];

  if (sesi.peran === "karyawan") {
    parameter = [sesi.id];
    kondisiPeran = `WHERE (pc.pengguna_id = $1 OR pc.rekan_pengganti_id = $1)`;
  } else if (sesi.peran === "ketua_divisi") {
    parameter = [sesi.id];
    kondisiPeran = `WHERE (pc.pengguna_id = $1 OR d.ketua_divisi_id = $1)`;
  }

  const [hasilRiwayat, hasilJenis, hasilDivisi] = await Promise.all([
    jalankanKueri(
      `SELECT pc.*,
              CASE
                WHEN NULLIF(TRIM(pc.nama_cuti_kustom), '') IS NOT NULL
                  THEN jc.nama_cuti || ' — ' || TRIM(pc.nama_cuti_kustom)
                ELSE jc.nama_cuti
              END AS nama_cuti,
              jc.kode_cuti,
              p.nama_lengkap AS nama_pemohon, p.email AS email_pemohon,
              p.peran AS peran_pemohon, p.divisi_id,
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
       ${kondisiPeran}
       ORDER BY pc.dibuat_pada DESC`,
      parameter
    ),
    jalankanKueri(`SELECT id, nama_cuti FROM jenis_cuti ORDER BY id ASC`),
    jalankanKueri(`SELECT id, nama_divisi FROM divisi ORDER BY nama_divisi ASC`),
  ]);

  return {
    sesiPeran: sesi.peran,
    sesiPenggunaId: sesi.id,
    daftarRiwayat: hasilRiwayat.rows.map((baris) => {
      const normal = normalisasiBarisPengajuan(baris);
      if (
        sesi.peran === "karyawan" &&
        normal.rekan_pengganti_id === sesi.id &&
        normal.pengguna_id !== sesi.id
      ) {
        return {
          ...normal,
          alasan_cuti: "Disembunyikan (privasi pemohon)",
          alamat_selama_cuti: "-",
          nomor_darurat: "-",
          lampiran_url: null,
        };
      }
      return normal;
    }),
    daftarJenisCuti: hasilJenis.rows,
    daftarDivisi: hasilDivisi.rows,
  };
}
