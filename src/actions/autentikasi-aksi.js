"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jalankanKueri } from "@/lib/db";
import {
  NAMA_COOKIE_SESI,
  buatTokenSesi,
  verifikasiKataSandi,
} from "@/lib/autentikasi";

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

  let hasil;
  try {
    hasil = await jalankanKueri(
      `SELECT id, username, email, kata_sandi_hash, nama_lengkap, peran, divisi_id, status_aktif
       FROM pengguna
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
       LIMIT 1`,
      [identitas]
    );
  } catch (galat) {
    return {
      sukses: false,
      pesan:
        "Tidak dapat terhubung ke database PostgreSQL. Pastikan layanan database aktif dan konfigurasi .env sudah sesuai.",
    };
  }

  if (hasil.rows.length === 0) {
    return {
      sukses: false,
      pesan: "Akun tidak ditemukan. Periksa kembali email atau username Anda.",
    };
  }

  const pengguna = hasil.rows[0];

  if (!pengguna.status_aktif) {
    return {
      sukses: false,
      pesan: "Akun Anda sedang berstatus nonaktif. Silakan hubungi Admin.",
    };
  }

  const kataSandiCocok = await verifikasiKataSandi(
    kataSandi,
    pengguna.kata_sandi_hash
  );
  if (!kataSandiCocok) {
    return {
      sukses: false,
      pesan: "Kata sandi yang Anda masukkan salah.",
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
