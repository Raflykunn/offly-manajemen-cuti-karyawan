"use server";

import { revalidatePath } from "next/cache";
import { jalankanKueri } from "@/lib/db";
import { wajibSesiPengguna } from "@/lib/autentikasi";

export async function ambilSemuaJenisCuti() {
  await wajibSesiPengguna(["admin"]);
  const hasil = await jalankanKueri(
    `SELECT id, kode_cuti, nama_cuti, deskripsi, kuota_default,
            batas_hari_pengajuan, wajib_lampiran, potong_kuota_tahunan, status_aktif
     FROM jenis_cuti
     ORDER BY id ASC`
  );
  return hasil.rows;
}

export async function tambahJenisCutiBaru(formData) {
  await wajibSesiPengguna(["admin"]);

  const kodeCuti = String(formData.get("kode_cuti") || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  const namaCuti = String(formData.get("nama_cuti") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const kuotaDefault = Number(formData.get("kuota_default") || 0);
  const batasHariPengajuan = Number(formData.get("batas_hari_pengajuan") || 0);
  const wajibLampiran = formData.get("wajib_lampiran") === "on";
  const potongKuotaTahunan = formData.get("potong_kuota_tahunan") === "on";

  if (!kodeCuti || !namaCuti) {
    return {
      sukses: false,
      pesan: "Kode cuti dan nama jenis cuti wajib diisi.",
    };
  }

  try {
    await jalankanKueri(
      `INSERT INTO jenis_cuti (
         kode_cuti, nama_cuti, deskripsi, kuota_default,
         batas_hari_pengajuan, wajib_lampiran, potong_kuota_tahunan, status_aktif
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
      [
        kodeCuti,
        namaCuti,
        deskripsi || null,
        kuotaDefault,
        batasHariPengajuan,
        wajibLampiran,
        potongKuotaTahunan,
      ]
    );

    revalidatePath("/manajemen-jenis-cuti");
    revalidatePath("/pengajuan-cuti");
    return {
      sukses: true,
      pesan: `Jenis cuti "${namaCuti}" berhasil ditambahkan.`,
    };
  } catch (galat) {
    if (galat.code === "23505") {
      return {
        sukses: false,
        pesan: "Kode atau nama jenis cuti sudah ada di database.",
      };
    }
    return { sukses: false, pesan: "Gagal menambahkan jenis cuti baru." };
  }
}

export async function ubahJenisCuti(formData) {
  await wajibSesiPengguna(["admin"]);

  const id = Number(formData.get("id"));
  const kodeCuti = String(formData.get("kode_cuti") || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  const namaCuti = String(formData.get("nama_cuti") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const kuotaDefault = Number(formData.get("kuota_default") || 0);
  const batasHariPengajuan = Number(formData.get("batas_hari_pengajuan") || 0);
  const wajibLampiran = formData.get("wajib_lampiran") === "on";
  const potongKuotaTahunan = formData.get("potong_kuota_tahunan") === "on";
  const statusAktif = formData.get("status_aktif") === "on";

  if (!id || !kodeCuti || !namaCuti) {
    return { sukses: false, pesan: "Data wajib tidak boleh kosong." };
  }

  try {
    await jalankanKueri(
      `UPDATE jenis_cuti
       SET kode_cuti = $1,
           nama_cuti = $2,
           deskripsi = $3,
           kuota_default = $4,
           batas_hari_pengajuan = $5,
           wajib_lampiran = $6,
           potong_kuota_tahunan = $7,
           status_aktif = $8
       WHERE id = $9`,
      [
        kodeCuti,
        namaCuti,
        deskripsi || null,
        kuotaDefault,
        batasHariPengajuan,
        wajibLampiran,
        potongKuotaTahunan,
        statusAktif,
        id,
      ]
    );

    revalidatePath("/manajemen-jenis-cuti");
    revalidatePath("/pengajuan-cuti");
    return {
      sukses: true,
      pesan: `Jenis cuti "${namaCuti}" berhasil diperbarui.`,
    };
  } catch (galat) {
    if (galat.code === "23505") {
      return {
        sukses: false,
        pesan: "Kode atau nama jenis cuti sudah digunakan.",
      };
    }
    return { sukses: false, pesan: "Gagal memperbarui jenis cuti." };
  }
}

export async function hapusJenisCuti(id) {
  await wajibSesiPengguna(["admin"]);
  try {
    await jalankanKueri(`DELETE FROM jenis_cuti WHERE id = $1`, [Number(id)]);
    revalidatePath("/manajemen-jenis-cuti");
    revalidatePath("/pengajuan-cuti");
    return { sukses: true, pesan: "Jenis cuti berhasil dihapus." };
  } catch {
    return {
      sukses: false,
      pesan: "Jenis cuti tidak dapat dihapus karena sudah dipakai pada riwayat pengajuan. Nonaktifkan statusnya melalui tombol Edit.",
    };
  }
}

export async function ambilDataKalenderDanKapasitas() {
  await wajibSesiPengguna(["admin", "hrd"]);

  const [hasilLibur, hasilBlackout, hasilDivisi] = await Promise.all([
    jalankanKueri(
      `SELECT id, tanggal, nama_libur, jenis
       FROM hari_libur
       ORDER BY tanggal ASC`
    ),
    jalankanKueri(
      `SELECT id, nama_periode, tanggal_mulai, tanggal_selesai, alasan, status_aktif
       FROM periode_blackout
       ORDER BY tanggal_mulai DESC`
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
  ]);

  return {
    hariLibur: hasilLibur.rows.map((baris) => ({
      ...baris,
      tanggal: new Date(baris.tanggal).toISOString().slice(0, 10),
    })),
    periodeBlackout: hasilBlackout.rows.map((baris) => ({
      ...baris,
      tanggal_mulai: new Date(baris.tanggal_mulai).toISOString().slice(0, 10),
      tanggal_selesai: new Date(baris.tanggal_selesai).toISOString().slice(0, 10),
    })),
    daftarDivisi: hasilDivisi.rows,
  };
}

export async function tambahHariLibur(formData) {
  await wajibSesiPengguna(["admin", "hrd"]);

  const tanggal = String(formData.get("tanggal") || "").trim();
  const namaLibur = String(formData.get("nama_libur") || "").trim();
  const jenis = String(formData.get("jenis") || "Libur Nasional").trim();

  if (!tanggal || !namaLibur) {
    return {
      sukses: false,
      pesan: "Tanggal dan nama hari libur wajib diisi.",
    };
  }

  try {
    await jalankanKueri(
      `INSERT INTO hari_libur (tanggal, nama_libur, jenis) VALUES ($1, $2, $3)`,
      [tanggal, namaLibur, jenis]
    );
    revalidatePath("/pengaturan-kalender");
    revalidatePath("/pengajuan-cuti");
    return { sukses: true, pesan: "Hari libur berhasil ditambahkan." };
  } catch (galat) {
    if (galat.code === "23505") {
      return { sukses: false, pesan: "Tanggal libur tersebut sudah terdaftar." };
    }
    return { sukses: false, pesan: "Gagal menambahkan hari libur." };
  }
}

export async function hapusHariLibur(id) {
  await wajibSesiPengguna(["admin", "hrd"]);
  await jalankanKueri(`DELETE FROM hari_libur WHERE id = $1`, [Number(id)]);
  revalidatePath("/pengaturan-kalender");
  revalidatePath("/pengajuan-cuti");
  return { sukses: true, pesan: "Hari libur berhasil dihapus." };
}

export async function tambahPeriodeBlackout(formData) {
  await wajibSesiPengguna(["admin", "hrd"]);

  const namaPeriode = String(formData.get("nama_periode") || "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") || "").trim();
  const tanggalSelesai = String(formData.get("tanggal_selesai") || "").trim();
  const alasan = String(formData.get("alasan") || "").trim();

  if (!namaPeriode || !tanggalMulai || !tanggalSelesai || !alasan) {
    return {
      sukses: false,
      pesan: "Seluruh kolom periode blackout wajib diisi.",
    };
  }

  if (tanggalSelesai < tanggalMulai) {
    return {
      sukses: false,
      pesan: "Tanggal selesai harus lebih besar atau sama dengan tanggal mulai.",
    };
  }

  try {
    await jalankanKueri(
      `INSERT INTO periode_blackout (nama_periode, tanggal_mulai, tanggal_selesai, alasan, status_aktif)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [namaPeriode, tanggalMulai, tanggalSelesai, alasan]
    );
    revalidatePath("/pengaturan-kalender");
    revalidatePath("/pengajuan-cuti");
    return { sukses: true, pesan: "Periode blackout berhasil ditambahkan." };
  } catch {
    return { sukses: false, pesan: "Gagal menyimpan periode blackout." };
  }
}

export async function ubahStatusBlackout(id, statusAktif) {
  await wajibSesiPengguna(["admin", "hrd"]);
  await jalankanKueri(
    `UPDATE periode_blackout SET status_aktif = $1 WHERE id = $2`,
    [Boolean(statusAktif), Number(id)]
  );
  revalidatePath("/pengaturan-kalender");
  revalidatePath("/pengajuan-cuti");
  return { sukses: true, pesan: "Status periode blackout diperbarui." };
}

export async function hapusPeriodeBlackout(id) {
  await wajibSesiPengguna(["admin", "hrd"]);
  await jalankanKueri(`DELETE FROM periode_blackout WHERE id = $1`, [
    Number(id),
  ]);
  revalidatePath("/pengaturan-kalender");
  revalidatePath("/pengajuan-cuti");
  return { sukses: true, pesan: "Periode blackout berhasil dihapus." };
}

export async function perbaruiBatasKapasitasDivisi(divisiId, batasPersen) {
  await wajibSesiPengguna(["admin", "hrd"]);
  const nilai = Number(batasPersen);
  if (Number.isNaN(nilai) || nilai < 5 || nilai > 100) {
    return {
      sukses: false,
      pesan: "Batas kapasitas harus berada di antara 5% hingga 100%.",
    };
  }

  await jalankanKueri(
    `UPDATE divisi SET batas_kapasitas_persen = $1, diperbarui_pada = NOW() WHERE id = $2`,
    [nilai, Number(divisiId)]
  );
  revalidatePath("/pengaturan-kalender");
  revalidatePath("/persetujuan-hrd");
  revalidatePath("/dasbor");
  return {
    sukses: true,
    pesan: "Batas maksimal kapasitas cuti divisi berhasil diperbarui.",
  };
}
