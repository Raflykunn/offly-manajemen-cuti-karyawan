"use server";

import { revalidatePath } from "next/cache";
import { jalankanKueri } from "@/lib/db";
import {
  ambilSesiPengguna,
  buatHashKataSandi,
  wajibSesiPengguna,
} from "@/lib/autentikasi";

export async function ambilProfilLengkap() {
  const sesi = await ambilSesiPengguna();
  if (!sesi) return null;

  const hasilPengguna = await jalankanKueri(
    `SELECT p.id, p.username, p.email, p.nama_lengkap, p.peran, p.divisi_id,
            p.kuota_cuti_awal, p.sisa_kuota_cuti, p.telepon, p.alamat, p.foto_profil,
            p.tanggal_bergabung, p.status_aktif,
            d.nama_divisi, d.batas_kapasitas_persen,
            k.nama_lengkap AS nama_ketua_divisi
     FROM pengguna p
     LEFT JOIN divisi d ON d.id = p.divisi_id
     LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
     WHERE p.id = $1
     LIMIT 1`,
    [sesi.id]
  );

  if (hasilPengguna.rows.length === 0) {
    return null;
  }

  const hasilNotifikasi = await jalankanKueri(
    `SELECT id, judul, pesan, tautan, sudah_dibaca, dibuat_pada
     FROM notifikasi
     WHERE pengguna_id = $1
     ORDER BY dibuat_pada DESC
     LIMIT 15`,
    [sesi.id]
  );

  const hasilBelumDibaca = await jalankanKueri(
    `SELECT COUNT(*)::int AS total
     FROM notifikasi
     WHERE pengguna_id = $1 AND sudah_dibaca = FALSE`,
    [sesi.id]
  );

  const profil = hasilPengguna.rows[0];
  return {
    pengguna: {
      ...profil,
      kuota_cuti_awal: Number(profil.kuota_cuti_awal),
      sisa_kuota_cuti: Number(profil.sisa_kuota_cuti),
      tanggal_bergabung: profil.tanggal_bergabung
        ? new Date(profil.tanggal_bergabung).toISOString().slice(0, 10)
        : "",
    },
    notifikasi: hasilNotifikasi.rows.map((item) => ({
      ...item,
      dibuat_pada: item.dibuat_pada
        ? new Date(item.dibuat_pada).toISOString()
        : "",
    })),
    jumlahBelumDibaca: hasilBelumDibaca.rows[0]?.total ?? 0,
  };
}

export async function ubahProfilSendiri(statusSebelumnya, formData) {
  const sesi = await wajibSesiPengguna();

  const namaLengkap = String(formData.get("nama_lengkap") || "").trim();
  const telepon = String(formData.get("telepon") || "").trim();
  const alamat = String(formData.get("alamat") || "").trim();
  const fotoProfil = String(formData.get("foto_profil") || "").trim();
  const kataSandiBaru = String(formData.get("kata_sandi_baru") || "");

  if (!namaLengkap) {
    return {
      sukses: false,
      pesan: "Nama lengkap wajib diisi.",
    };
  }

  if (kataSandiBaru && kataSandiBaru.length < 6) {
    return {
      sukses: false,
      pesan: "Kata sandi baru minimal terdiri dari 6 karakter.",
    };
  }

  try {
    if (kataSandiBaru) {
      const hashBaru = await buatHashKataSandi(kataSandiBaru);
      await jalankanKueri(
        `UPDATE pengguna
         SET nama_lengkap = $1,
             telepon = $2,
             alamat = $3,
             foto_profil = $4,
             kata_sandi_hash = $5,
             diperbarui_pada = NOW()
         WHERE id = $6`,
        [
          namaLengkap,
          telepon || null,
          alamat || null,
          fotoProfil || null,
          hashBaru,
          sesi.id,
        ]
      );
    } else {
      await jalankanKueri(
        `UPDATE pengguna
         SET nama_lengkap = $1,
             telepon = $2,
             alamat = $3,
             foto_profil = $4,
             diperbarui_pada = NOW()
         WHERE id = $5`,
        [
          namaLengkap,
          telepon || null,
          alamat || null,
          fotoProfil || null,
          sesi.id,
        ]
      );
    }

    revalidatePath("/profil");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: "Data profil Anda berhasil diperbarui.",
    };
  } catch (galat) {
    return {
      sukses: false,
      pesan: "Terjadi kesalahan saat menyimpan perubahan profil.",
    };
  }
}

export async function tandaiSemuaNotifikasiDibaca() {
  const sesi = await wajibSesiPengguna();
  await jalankanKueri(
    `UPDATE notifikasi SET sudah_dibaca = TRUE WHERE pengguna_id = $1`,
    [sesi.id]
  );
  revalidatePath("/dasbor");
  revalidatePath("/profil");
}

export async function tandaiSatuNotifikasiDibaca(idNotifikasi) {
  const sesi = await wajibSesiPengguna();
  await jalankanKueri(
    `UPDATE notifikasi SET sudah_dibaca = TRUE WHERE id = $1 AND pengguna_id = $2`,
    [Number(idNotifikasi), sesi.id]
  );
  revalidatePath("/dasbor");
}
