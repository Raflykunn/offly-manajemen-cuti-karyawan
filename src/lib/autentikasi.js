import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jalankanKueri } from "@/lib/db";
import {
  NAMA_COOKIE_SESI,
  buatTokenSesi,
  verifikasiTokenSesi,
} from "@/lib/token";

export async function buatHashKataSandi(kataSandi) {
  return bcrypt.hash(kataSandi, 10);
}

export async function verifikasiKataSandi(kataSandi, hashKataSandi) {
  return bcrypt.compare(kataSandi, hashKataSandi);
}

export async function ambilSesiPengguna() {
  const penyimpananCookie = await cookies();
  const token = penyimpananCookie.get(NAMA_COOKIE_SESI)?.value;
  if (!token) return null;

  const muatan = await verifikasiTokenSesi(token);
  if (!muatan?.id) return null;

  const hasil = await jalankanKueri(
    `SELECT id, username, email, nama_lengkap, peran, divisi_id
     FROM pengguna
     WHERE id = $1 AND status_aktif = TRUE`,
    [muatan.id]
  );
  const pengguna = hasil.rows[0];
  if (!pengguna) return null;

  return {
    id: pengguna.id,
    username: pengguna.username,
    email: pengguna.email,
    nama_lengkap: pengguna.nama_lengkap,
    peran: pengguna.peran,
    divisi_id: pengguna.divisi_id,
  };
}

export async function wajibSesiPengguna(daftarPeranDiizinkan = null) {
  const sesi = await ambilSesiPengguna();
  if (!sesi) {
    redirect("/masuk");
  }
  if (
    Array.isArray(daftarPeranDiizinkan) &&
    !daftarPeranDiizinkan.includes(sesi.peran)
  ) {
    redirect("/dasbor");
  }
  return sesi;
}

export { buatTokenSesi, verifikasiTokenSesi, NAMA_COOKIE_SESI };
