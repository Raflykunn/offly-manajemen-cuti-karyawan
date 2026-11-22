"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jalankanKueri } from "@/lib/db";
import {
  NAMA_COOKIE_SESI,
  buatTokenSesi,
  verifikasiKataSandi,
} from "@/lib/autentikasi";

const percobaanGagalMasuk = new Map();
const BATAS_GAGAL_MASUK = 10;
const JENDELA_BLOKIR_MS = 15 * 60 * 1000;

function cekBatasMasuk(kunci) {
  const entri = percobaanGagalMasuk.get(kunci);
  if (!entri) return false;
  if (Date.now() > entri.kadaluarsa) {
    percobaanGagalMasuk.delete(kunci);
    return false;
  }
  return entri.jumlah >= BATAS_GAGAL_MASUK;
}

function catatGagalMasuk(kunci) {
  const sekarang = Date.now();
  const entri = percobaanGagalMasuk.get(kunci);
  if (!entri || sekarang > entri.kadaluarsa) {
    percobaanGagalMasuk.set(kunci, { jumlah: 1, kadaluarsa: sekarang + JENDELA_BLOKIR_MS });
    return;
  }
  entri.jumlah += 1;
}

export async function masukAkun(statusSebelumnya, formData) {
  const identitas = String(formData.get("identitas") || "").trim();
  const kataSandi = String(formData.get("kata_sandi") || "");
  const ingatSaya = formData.get("ingat_saya") === "on";

  if (!identitas || !kataSandi) {
    return {
      sukses: false,
      pesan: "Email/Username dan kata sandi wajib diisi.",
    };
  }

  const kunciBatas = identitas.toLowerCase();
  if (cekBatasMasuk(kunciBatas)) {
    return {
      sukses: false,
      pesan: "Terlalu banyak percobaan masuk gagal. Coba lagi dalam 15 menit.",
    };
  }

  let hasil;
  try {
    hasil = await jalankanKueri(
      `SELECT id, username, email, kata_sandi_hash, nama_lengkap, peran, divisi_id, status_aktif
       FROM pengguna
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
       LIMIT 1`,
      [identitas]
    );
  } catch (kesalahan) {
    return {
      sukses: false,
      pesan:
        "Tidak dapat terhubung ke database PostgreSQL. Pastikan layanan database aktif dan konfigurasi .env sudah sesuai.",
    };
  }

  if (hasil.rows.length === 0) {
    catatGagalMasuk(kunciBatas);
    return {
      sukses: false,
      pesan: "Email/username atau kata sandi salah.",
    };
  }

  const pengguna = hasil.rows[0];
  const kataSandiCocok = await verifikasiKataSandi(
    kataSandi,
    pengguna.kata_sandi_hash
  );
  if (!kataSandiCocok) {
    catatGagalMasuk(kunciBatas);
    return {
      sukses: false,
      pesan: "Email/username atau kata sandi salah.",
    };
  }

  percobaanGagalMasuk.delete(kunciBatas);

  if (!pengguna.status_aktif) {
    return {
      sukses: false,
      pesan: "Akun Anda sedang berstatus nonaktif. Silakan hubungi Admin.",
    };
  }

  const token = await buatTokenSesi(pengguna, ingatSaya);
  const penyimpananCookie = await cookies();
  const opsiCookie = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };

  if (ingatSaya) {
    opsiCookie.maxAge = 60 * 60 * 24 * 30;
  } else {
    opsiCookie.maxAge = 60 * 60 * 24;
  }

  penyimpananCookie.set(NAMA_COOKIE_SESI, token, opsiCookie);
  redirect("/dasbor");
}

export async function keluarAkun() {
  const penyimpananCookie = await cookies();
  penyimpananCookie.delete(NAMA_COOKIE_SESI);
  redirect("/masuk");
}
